'use strict';

let public_tags = [];

function CleanUsername(username) {
  username = username.trim();
  const username_parts = username.split('/');
  username = username_parts[username_parts.length - 1].toLowerCase();
  return username;
}

function CleanTags(tags) {
  var cleaned_tags = [];
  for (let tag of tags) {
    tag = tag.replace("[", "").replace("]", "").replace("u'", "").replace("'", "");
    if (!tag.includes("#")) {
      tag = "#" + tag;
    }
    cleaned_tags.push(tag.trim());
  }
  return cleaned_tags;
}

function GetBanTags(username) {
  username = CleanUsername(username);
  const tags = user_map.get('/u/' + username);
  if (typeof tags === 'undefined') {
    document.getElementById('userStatus').innerHTML = '/u/' + username + ' is not banned';
    document.getElementById('userStatusWrapper').classList.remove('banned');
    document.getElementById('userStatusWrapper').classList.remove('scammer');
  } else {
    document.getElementById('userStatus').innerHTML =
      '/u/' + username + ' is BANNED with the following tags: ' + tags.join(' ');
    if (tags.includes("#scammer")) {
      document.getElementById('userStatusWrapper').classList.add('scammer');
    } else {
      document.getElementById('userStatusWrapper').classList.add('banned');
    }
  }

  show('userStatusWrapper');
  document.getElementById('copyURL').innerHTML = 'Copy URL';

  let ul = document.getElementById('userHistory');
  ul.innerHTML = '';
  const context_lines = context_map.get(username);
  if (typeof context_lines !== 'undefined') {
    for (let context_line of context_lines.reverse()) {
      console.log(context_line);
      let tags = [];
      if (context_line.includes("Tags Added: ")){
        tags = context_line.split("Tags Added: ")[1].split(", ");
      } else if (context_line.includes("Tags Removed: ")){
        tags = context_line.split("Tags Removed: ")[1].split(", ");
      }
      tags = CleanTags(tags);
      console.log(tags);
      let valid_tags = [];
      for (const tag of tags) {
        if (public_tags.includes(tag)) {
          valid_tags.push(tag);
        } else {
          context_line = context_line.replace(tag, '');
        }
      }
      if (valid_tags.length == 0) {
        continue;
      }
      if (context_line.includes("Tags Added: ")){
        context_line = context_line.split("Tags Added: ")[0] + "Tags Added: " + valid_tags.join(", ");
      } else if (context_line.includes("Tags Removed: ")){
        context_line = context_line.split("Tags Removed: ")[0] + "Tags Removed: " + valid_tags.join(", ");
      } else {
        context_line = context_line;
      }
      let action = context_line.split(' ')[0];
      let date = context_line.split(' on ')[1].split( 'from ')[0];
      let sub = context_line.split(' from ')[1].split(' with ')[0];
      var context = context_line.split(' with context - ')[1].split(' - Tags ')[0];
      context = context.trim();
      if (context.startsWith('Tags ')) {context_line = '';}
      if (context == '') {context = 'NO CONTEXT';}
      let tags_added = valid_tags.join(", ");
      let li = document.createElement('li');
      li.innerHTML = '<b>Action</b>: ' + action.toUpperCase();
      ul.appendChild(li);

      let sub_ul = document.createElement('ul');

      let date_li = document.createElement('li');
      date_li.innerHTML = '<b>Action Date</b>: ' + date;
      let sub_li = document.createElement('li');
      sub_li.innerHTML = '<b>From</b>: <a href=https://www.reddit.com/' + sub + '>' + sub + '</a>';
      let context_li = document.createElement('li');
      context_li.innerHTML = '<b>Context</b>: ' + context;
      let tags_li = document.createElement('li');
      if (action == 'unbanned') {tags_li.innerHTML = '<b>Tags Removed</b>: ' + tags_added;}
      else {tags_li.innerHTML = '<b>Tags Added</b>: ' + tags_added;}

      sub_ul.appendChild(tags_li);
      sub_ul.appendChild(context_li);
      sub_ul.appendChild(sub_li);
      sub_ul.appendChild(date_li);

      ul.appendChild(sub_ul);
    }
  }

  document.title = 'UniversalScammerList - /u/' + username;
  //also push to history
  history.pushState({}, '', '/?username=' + username);
}

// Copy the USL URL
function copyURL(username) {
  username = CleanUsername(username);
  navigator.clipboard.writeText('https://www.universalscammerlist.com?username=' + username);
  document.getElementById('copyURL').innerHTML = 'Copied!';
}

///////////////////
// ON LOAD BELOW //
///////////////////

var user_map = new Map();
var context_map = new Map();
var loadStatus = {
  userPagesLoaded: 0,
  userPagesNeeded: '?',
  botActionPagesLoaded: 0,
  botActionPagesNeeded: '?',
};

function updateLoadText() {
  document.getElementById('loadingMessageDetails').innerHTML =
    (
      (loadStatus.userPagesLoaded / loadStatus.userPagesNeeded) * 65 +
      (loadStatus.botActionPagesLoaded / loadStatus.botActionPagesNeeded) * 35
    ).toFixed(0) + '%';
  //35 65 weighting split is arbitrary
}

async function loadUsers() {
  /* LOAD USERS */
  const ban_list_pages = await fetchAndSplit(
    'https://api.reddit.com/r/UniversalScammerList/wiki/banlist.json'
  );

  loadStatus.userPagesNeeded = ban_list_pages.length;
  updateLoadText();

  for (const page_context of ban_list_pages) {
    const page_number = page_context.split(' ')[2].split(']')[0];
    const users = await fetchAndSplit(
      'https://api.reddit.com/r/UniversalScammerList/wiki/banlist/' + page_number + '.json'
    );

    loadStatus.userPagesLoaded++;
    updateLoadText();

    for (const user of users) {
      const parts = user.split(' ');
      const username = parts[1].toLowerCase();
      const tags = parts.slice(2, parts.length);
      user_map.set(username, tags);
    }
  }

  console.log('Done loading users');
}

async function loadBotActions() {
  /* LOAD BOT ACTIONS */
  const wiki_bot_action_pages = await fetchAndSplit(
    'https://api.reddit.com/r/UniversalScammerList/wiki/bot_actions.json'
  );
  // We only want to get the last page from reddit as the rest are cached
  // so just get the number of the latest page on reddit
  const last_wiki_page_split = wiki_bot_action_pages[wiki_bot_action_pages.length - 1].split('/');
  const last_wiki_page_number = parseInt(last_wiki_page_split[last_wiki_page_split.length - 1]);

  loadStatus.botActionPagesNeeded = last_wiki_page_number;
  updateLoadText();

  // Collect all bot action pages
  const bot_action_pages = [];
  var current_page = 1;
  while (current_page < last_wiki_page_number) {
    bot_action_pages.push(
      'https://www.universalscammerlist.com/static/data/bot_actions_' +
        String(current_page) +
        '.json'
    );
    current_page++;
  }
  bot_action_pages.push(
    wiki_bot_action_pages[wiki_bot_action_pages.length - 1].split('* ')[1].replace('www', 'api') + '.json'
  );

  // Read data from pages
  for (const context_page of bot_action_pages) {
    var context = await fetchAndSplit(context_page);

    loadStatus.botActionPagesLoaded++;
    updateLoadText();

    context.reverse();
    for (const context_line of context) {
      if (!context_line.includes('* u/')) {
        continue;
      }
      const username = context_line.split(' ')[1].split('u/')[1].toLowerCase();
      if (!context_map.get(username)) {
        context_map.set(username, []);
      }
      context_map.get(username).push(context_line.split(' was ')[1]);
    }
  }

  console.log('Done loading bot actions');
}

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
    public_tags.push("#" + content);
  }
  console.log("Loaded tags.")
}

function handleSearchURL() {
  //run a search if a user has a search in their URL i.e., /?username=foobar
  const urlParams = new URLSearchParams(window.location.search);
  for (const [key, value] of urlParams.entries()) {
    urlParams.set(key.toLowerCase(), value);
  }
  if (urlParams.get('username')) {
    const username = CleanUsername(urlParams.get('username'));
    GetBanTags(username);
    document.getElementById('username').value = username;
  }
}

// loading tags needs to be done first so we can use it when creating user history.
Promise.all([loadTags()]).then(function (){
  Promise.all([loadUsers(), loadBotActions(), pageLoadPromise]).then(function () {
    handleSearchURL();
    hideLoadingMessageAndShowUI();
  })
});
