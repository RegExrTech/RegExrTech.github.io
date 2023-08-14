'use strict';

async function loadSubreddits() {
  let writeSublist = document.getElementById('writeSublist');
  let readSublist = document.getElementById('readSublist');
  const subreddits = await fetchAndSplit(
    'https://api.reddit.com/r/UniversalScammerList/wiki/participating_subreddits.json'
  );
  let inFirstList = false;
  for (const subreddit of subreddits) {
    if (subreddit == '') {
      // Ignore spacing lines
      continue;
    }
    if (subreddit.includes('===')) {
      inFirstList = !inFirstList;
      continue;
    }

    const content = subreddit.split('* ')[1].split('\n')[0];
    var linkText = document.createTextNode(content);
    var a = document.createElement('a');
    a.appendChild(linkText);
    a.title = content;
    a.href = 'https://www.reddit.com/' + content;
    a.target = '_blank';
    var li = document.createElement('li');
    li.appendChild(a);
    if (inFirstList) {
      writeSublist.appendChild(li);
    } else {
      readSublist.appendChild(li);
    }
  }
}

Promise.all([loadSubreddits(), pageLoadPromise]).then(function () {
  hideLoadingMessageAndShowUI();
});
