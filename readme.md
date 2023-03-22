# Universal Scammer List Frontend

https://www.universalscammerlist.com/

This is a frontend for the Universal Scammer List. It is designed to be as simple as possible to serve so it can be run off of a plain GH pages instance. All dynamic data is either cached to GitHub, or pulled from Reddit.

## Building

HTML pages are built using a moustache template system. To regenerate them run `npm run build`.

## Dev Server

There's no magic here, any simple http server will work. For example `npx http-server -c-1`.
