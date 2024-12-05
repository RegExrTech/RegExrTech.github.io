'use strict';

async function loadTags() {
  let taglist = document.getElementById('taglist');
  const tags = await fetchAndSplit(
    'https://api.reddit.com/r/UniversalScammerList/wiki/public_tags.json'
  );
  for (const tag of tags) {
    if (tag == '') {
      //due to formatting issues, list has empty items that need to be skipped.
      continue;
    }

    const content = tag.split('* ')[1].split('\n')[0];
    var text = document.createTextNode(content);
    var li = document.createElement('li');
    li.appendChild(text);
    taglist.appendChild(li);
  }
}

loadTags();