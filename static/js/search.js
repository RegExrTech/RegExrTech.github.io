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

function RemovePrivateTags(tags) {
  let to_return = [];
  for (let tag of tags) {
    if (public_tags.includes(tag)) {
      to_return.push(tag);
    }
  }
  return to_return;
}

async function redirect(username) {
  let url = window.location.href.split("?")[0]
  window.location.href = url + "?username=" + username;
}

async function GetBanTags(username) {
  username = CleanUsername(username);
  let ban_data = await fetchAndSplit(
    'https://api.reddit.com/r/UniversalScammerList/wiki/database/' + username + '.json'
  );
  if (ban_data == null) {
    ban_data = ["tags:"];
  }
  if (ban_data[0] == 'error') {
    hide("userConfirmations");
    hide("userHistory");
    return;
  }

  Promise.all([loadConfirmations(username)]).then(function (){
    let tags = ban_data[0].split(":")[1].split(",").map(function(e) { 
      e = e.trim();
      if (e != '' && !e.startsWith('#')) {
        e = '#' + e;
      }
      return e;
    });
    tags = CleanTags(tags);
    tags = RemovePrivateTags(tags);

    if (typeof tags === 'undefined' || tags.length == 0 || tags[0] == '') {
      document.getElementById('userStatus').innerHTML = '/u/' + username + ' is not on the Universal Scammer List';
      document.getElementById('userStatusWrapper').classList = [];
      show("userConfirmations");
      hide("userHistory");
    } else {
      hide("userConfirmations");
      show("userHistory");
      document.getElementById('userStatus').innerHTML =
        '/u/' + username + ' is BANNED with the following tags: ' + tags.join(' ');
      if (tags.includes("#scammer")) {
        document.getElementById('userStatusWrapper').classList = ['scammer'];
      } else {
        document.getElementById('userStatusWrapper').classList = ['banned'];
      }
    }

    document.getElementById('copyURL').innerHTML = 'Copy URL';

    let ul = document.getElementById('userHistory');
    ul.innerHTML = '';
    const context_lines = ban_data.slice(1, ban_data.length);
    if (typeof context_lines !== 'undefined') {
      for (let context_line of context_lines.reverse()) {
        context_line = context_line.split(' was ').slice(1).join(' was ');
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
  })
}

// Copy the USL URL
function copyURL(username) {
  username = CleanUsername(username);
  navigator.clipboard.writeText('https://www.universalscammerlist.com?username=' + username);
  document.getElementById('copyURL').innerHTML = 'Copied!';
}

async function loadConfirmations(username) {
  let userConfirmations = document.getElementById('userConfirmations');
  userConfirmations.innerHTML = '';
  const conf_data = await fetchAndSplit(
    'https://api.reddit.com/r/RegExrSwapBot/wiki/confirmations/' + username + '.json'
  );
  if (conf_data == null) {
    return;
  }
  for (const line of conf_data) {
    if (line == "") {
      continue;
    }
    const content = line.split('* ')[1].split('\n')[0];
    const count = content.split('[')[1].split(']')[0];
    const sub = content.split(' on r/')[1];
    var linkText = document.createTextNode(count);
    var a = document.createElement('a');
    a.appendChild(linkText);
    a.title = count;
    a.href = 'https://www.reddit.com/r/' + sub + "/wiki/confirmations/" + username;
    a.target = '_blank';
    var li = document.createElement('li');
    li.appendChild(a);
    var sub_text = document.createTextNode(" on r/" + sub);
    li.appendChild(sub_text);
    userConfirmations.appendChild(li);
  }
  console.log("Loaded confirmations.")
}

///////////////////
// ON LOAD BELOW //
///////////////////

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
    handleSearchURL();
});
