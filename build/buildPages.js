const Mustache = require('mustache');
const fs = require('fs');

const pageWrap = fs.readFileSync('build/pageWrap.mustache').toString();

//ignore the warning on the line following this one, it is a comment inserted into the generated pages. This file (buildPages.js) is safe to edit.
const warningComment = "<!------------ Please don't edit this file: this is the result of an automated build script. Please edit the files in /build/ instead, and run the build script. ------------>"

const views = [
  {
    title: 'About',
    page: 'about.html',
    ogurl: 'about',
  },
  {
    title: 'Getting Started with the USL',
    page: 'start.html',
    ogurl: 'start',
  },
  {
    title: 'Participating Subreddits',
    page: 'subreddits.html',
    ogurl: 'subreddits',
    additionalScript: 'subreddits.js',
  },
  {
    title: 'Search the USL',
    page: 'index.html',
    ogurl: '',
    additionalScript: 'search.js',
  },
  {
    title: 'Available Tags',
    page: 'tags.html',
    ogurl: 'tags',
    additionalScript: 'tags.js',
  },
  {
    title: '404 File Not Found',
    page: '404.html',
    additionalScript: '404.js',
  },
];

for (const view of views) {
  view.pageContent = fs.readFileSync('build/fragments/' + view.page).toString();
  view.warningComment = warningComment;
  const output = Mustache.render(pageWrap, view);
  console.log(view.page);
  fs.writeFileSync('./' + view.page, output);
}
