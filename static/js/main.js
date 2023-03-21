"use strict";

function CleanUsername(username) {
  username = username.trim();
  const username_parts = username.split('/');
  username = username_parts[username_parts.length - 1].toLowerCase();
  return username
}

function GetBanTags(username) {
  username = CleanUsername(username);
  const tags = user_map.get('/u/' + username);
  if (typeof tags === 'undefined') {
    text = '/u/' + username + ' is not banned';
    document.getElementById('userStatus').style.color = 'green';
  } else {
    text = '/u/' + username + ' is banned with the following tags: ' + tags.join(' ');
    document.getElementById('userStatus').style.color = 'red';
  }
  document.getElementById('userStatus').innerHTML = text;
  document.getElementById('userStatusAndButton').style.visibility = 'visible';
  document.getElementById('copyStatus').style.visibility = 'hidden';
  let ul = document.getElementById('userHistory');
  ul.innerHTML = '';
  const context_lines = context_map.get(username);
  if (typeof context_lines !== 'undefined') {
    for (context_line of context_lines) {
      let li = document.createElement('li');
      li.innerHTML = context_line;
      ul.appendChild(li);
    }
  }
  document.getElementById('detailsButton').style.visibility = 'visible';
}

// Copy the USL URL
function copyURL(username) {
  username = CleanUsername(username);
  navigator.clipboard.writeText('https://www.universalscammerlist.com?username=' + username);
  document.getElementById('copyStatus').style.visibility = 'visible';
}

function showDetails() {
  historyElem = document.getElementById('userHistory');
  buttonElem = document.getElementById('detailsButton');
  if (historyElem.style.visibility == 'visible') {
    historyElem.style.visibility = 'hidden';
    buttonElem.innerHTML = "Show Details";
  } else {
    historyElem.style.visibility = 'visible';
    buttonElem.innerHTML = "Hide Details";
  }
}

///////////////////
// ON LOAD BELOW //
///////////////////

user_map = new Map();
context_map = new Map();
load_status = { actions: false, users: false };

async function loadUsers() {
  /* LOAD USERS */
  const ban_list_pages = await fetchAndSplit("https://www.reddit.com/r/UniversalScammerList/wiki/banlist.json");

  for (const page_context of ban_list_pages) {
    page_number = page_context.split(' ')[2].split(']')[0];
    const users = await fetchAndSplit('https://www.reddit.com/r/UniversalScammerList/wiki/banlist/' + page_number + '.json');

    for (const user of users) {
      const parts = user.split(' ');
      const username = parts[1].toLowerCase();
      const tags = parts.slice(2, parts.length);
      user_map.set(username, tags);
    }
  }

  load_status.users = true;
  console.log("Done loading users");
}

async function loadBotActions() {
  /* LOAD BOT ACTIONS */
  const wiki_bot_action_pages = await fetchAndSplit('https://www.reddit.com/r/UniversalScammerList/wiki/bot_actions.json');
  // We only want to get the last page from reddit as the rest are cached
  // so just get the number of the latest page on reddit
  last_wiki_page_split = wiki_bot_action_pages[wiki_bot_action_pages.length - 1].split("/");
  last_wiki_page_number = parseInt(last_wiki_page_split[last_wiki_page_split.length - 1]);
  // Collect all bot action pages
  bot_action_pages = [];
  current_page = 1;
  while (current_page < last_wiki_page_number) {
    bot_action_pages.push("https://www.universalscammerlist.com/static/data/bot_actions_" + String(current_page) + ".json");
    current_page++;
  }
  bot_action_pages.push(wiki_bot_action_pages[wiki_bot_action_pages.length - 1].split('* ')[1] + '.json');

  // Read data from pages
  for (const context_page of bot_action_pages) {
    context = await fetchAndSplit(context_page);
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

  load_status.actions = true;
  console.log("Done loading bot actions");
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

Promise.all([loadUsers(), loadBotActions(), pageLoadPromise]).then(function(){
  handleSearchURL();
  document.getElementById('databaseLoadStatus').style.visibility = 'hidden';
  document.getElementById('inputBox').style.visibility = 'visible';
})