//Old URLs look like https://universalscammerlist.com/search.php?username=foobar
//New URLS look like https://www.universalscammerlist.com?username=foobar

if (window.location.pathname == "/search.php") {
    //on an old-style search URL
    document.location.href = window.location.origin + '/' + document.location.search;
}