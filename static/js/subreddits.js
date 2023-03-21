"use strict";

async function loadSubreddits() {
  sublist = document.getElementById('sublist');
  const subreddits = await fetchAndSplit('https://www.reddit.com/r/UniversalScammerList/wiki/participating_subreddits.json');
  for (const subreddit of subreddits) {

    if (subreddit == "") {
      //due to formatting issues, list has empty items that need to be skipped.
      continue;
    }
    
    const content = subreddit.split('* ')[1].split('\n')[0];
    var linkText = document.createTextNode(content);
    var a = document.createElement('a');
    a.appendChild(linkText);
    a.title = content;
    a.href = 'https://www.reddit.com/' + content;
    var li = document.createElement('li');
    li.appendChild(a);
    sublist.appendChild(li);
  }
}

Promise.all([loadSubreddits(), pageLoadPromise]).then(function () {
  sublist.style.visibility = 'visible';
  document.getElementById('loadingMessage').style.visibility = 'hidden';
})


