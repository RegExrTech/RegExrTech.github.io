function Get(yourUrl) {
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;
}

// Load in the ban list
user_map = new Map();
const users = JSON.parse(Get('https://www.reddit.com/r/UniversalScammerList/wiki/banlist.json')).data.content_md.split("\n");
for (const user of users) {
    const parts = user.split(" ");
    const username = parts[1];
    const tags = parts.slice(2, parts.length);
    user_map.set(username, tags);
}

function GetBanTags(username) {
    const username_parts = username.split("/");
    username = username_parts[username_parts.length-1].toLowerCase();
    const tags = user_map.get("/u/"+username);
    if (typeof tags === 'undefined') {
        text = "/u/" + username + " is not banned";
        document.getElementById('userStatus').style = "color:green;";
    }
    else {
        text = "/u/" + username + " is banned with the following tags: " + tags.join(" ");
        document.getElementById('userStatus').style = "color:red;";
    }
    document.getElementById('userStatus').innerHTML = text;

}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
for (const [key, value] of urlParams.entries()) {
    urlParams.set(key.toLowerCase(), value);
}
if (urlParams.get("username")) {
    GetBanTags(urlParams.get("username"));
}
