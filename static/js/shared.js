"use strict";

function fetchAndSplit(url) {
    return fetch(url)
        .then((res) => res.json())
        .then((res) => res.data.content_md.split('\n'))
}

const pageLoadPromise = new Promise((resolve, reject) => {
    //this is a dumb promise that just gives the page load status.
    window.onload = resolve;
});