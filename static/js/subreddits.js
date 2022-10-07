function Get(yourUrl) {
	var Httpreq = new XMLHttpRequest();
	Httpreq.open("GET",yourUrl,false);
	Httpreq.send(null);
	return Httpreq.responseText;
}

///////////////////
// ON LOAD BELOW //
///////////////////
sublist = document.getElementById('sublist');
const subreddits = JSON.parse(Get('https://www.reddit.com/r/UniversalScammerList/wiki/participating_subreddits.json')).data.content_md.split("\n\n");
for (const subreddit of subreddits) {
	const content = subreddit.split("* ")[1].split("\n")[0]
	var linkText = document.createTextNode(content);
	var a = document.createElement('a');
	a.appendChild(linkText);
	a.title = content;
  	a.href = "https://www.reddit.com/" + content;
	var li = document.createElement("li");
	li.appendChild(a);
	sublist.appendChild(li);
}

sublist.style.visibility = "visible";
document.getElementById('loadingmessage').style.visibility = "hidden";