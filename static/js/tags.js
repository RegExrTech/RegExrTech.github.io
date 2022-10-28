function Get(yourUrl) {
	var Httpreq = new XMLHttpRequest();
	Httpreq.open("GET",yourUrl,false);
	Httpreq.send(null);
	return Httpreq.responseText;
}

///////////////////
// ON LOAD BELOW //
///////////////////
taglist = document.getElementById('taglist');
const tags = JSON.parse(Get('https://www.reddit.com/r/UniversalScammerList/wiki/public_tags.json')).data.content_md.split("\n\n");
for (const tag of tags) {
	const content = tag.split("* ")[1].split("\n")[0]
	var text = document.createTextNode(content);
	var li = document.createElement("li");
	li.appendChild(text);
	taglist.appendChild(li);
}

taglist.style.visibility = "visible";
document.getElementById('loadingmessage').style.visibility = "hidden";