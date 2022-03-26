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
	const username = parts[1].toLowerCase();
	const tags = parts.slice(2, parts.length);
	user_map.set(username, tags);
}

// Load the context list
context_map = new Map();
const context = JSON.parse(Get('https://www.reddit.com/r/UniversalScammerList/wiki/bot_actions.json')).data.content_md.split("\n");
for (const context_line of context) {
	if (!context_line.includes("* u/")) {
		continue;
	}
	const username = context_line.split(" ")[1].split("u/")[1].toLowerCase();
	if (!context_map.get(username)) {
		context_map.set(username, []);
	}
	context_map.get(username).push(context_line.split(" was ")[1]);
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
	let ul = document.getElementById('userHistory');
	ul.innerHTML = "";
	const context_lines = context_map.get(username);
	if (typeof context_lines !== 'undefined') {
		for (context_line of context_lines) {
			let li = document.createElement("li");
			li.innerHTML = context_line;
			ul.appendChild(li);
		}
	}
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
for (const [key, value] of urlParams.entries()) {
	urlParams.set(key.toLowerCase(), value);
}
if (urlParams.get("username")) {
	GetBanTags(urlParams.get("username"));
}
