'use strict';

function fetchAndSplit(url) {
  let headers = new Headers({
    "Accept": "application/JSON",
    "Content-Type": "application/JSON",
    "User-Agent": "USL SITE ACCESS for " + url
  })
  return fetch('https://corsproxy.io/?url=' + url)
    .then((res) => {
      hide('loadingMessage');
      if (res.status == '404') {
        throw new Error("HTTP status 404 for url " + url);
      }
      return res.json();
    })
    .then((res) => res.data.content_md.split('\n'))
    .catch((error) => {
      console.error('[' + url + '] fetchAndSplit saw error:', error);
      if (!error.message.includes('404')) {
        document.getElementById(
          'loadingMessage'
        ).innerHTML = `Error loading data from Reddit: <i>"${error}"</i>.<br>
              If you're using Firefox, try disabling enhanced tracking protection for this site using the little shield icon to the left of your URL bar.
              (The USL is not tracking you, but Reddit gets detected as a tracker by Firefox).`;
        show('loadingMessage');
        return ['error'];
      }
    });
}

const pageLoadPromise = new Promise((resolve, reject) => {
  //this is a dumb promise that just gives the page load status.
  window.addEventListener('load', (event) => {
    resolve();
  });
});

function hide(id) {
  document.getElementById(id).classList.add('hidden');
}

function show(id) {
  document.getElementById(id).classList.remove('hidden');
}

//setup hamburger
window.addEventListener('load', function (event) {
  document.getElementById('hamburger').addEventListener('click', function (event) {
    const headerLinks = document.getElementById('header-links');
    if (headerLinks.classList.contains('expanded')) {
      headerLinks.classList.remove('expanded');
    } else {
      headerLinks.classList.add('expanded');
    }
    event.preventDefault;
    return false;
  });
});
