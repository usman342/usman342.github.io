# usman342.github.io

Personal portfolio for Muhammad Usman, technical lead and software and infrastructure engineer. Static HTML, CSS, and JavaScript, hosted on GitHub Pages.

**Live site:** [https://usman342.github.io](https://usman342.github.io)

## Preview locally

From the repository root:

```bash
npm start
```

Or, without npm:

```bash
python3 -m http.server 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000). There is no build step. Edit `index.html`, `assets/css/styles.css`, and `assets/js/main.js`, then refresh.

## Deploy

This repository is the GitHub Pages site. Pushing the default branch publishes the repository root at `https://usman342.github.io`. `.nojekyll` tells Pages to serve the files as-is and skip Jekyll.

## Checks

```bash
npm test
```

`scripts/check_site.py` checks landmarks, the document title and description, canonical and social metadata, JSON-LD, image alt text, in-page anchors, local assets, `target="_blank"` relationships, and that verified profile content is still present. It does not call the network.

## Theme

The first visit follows the operating system appearance. If the system is not set to light, the site uses the dark theme. Choosing the theme button saves that choice in `localStorage` and keeps it until it is changed again.

## GitHub section

The page reads public data only. It does not embed an access token.

- Recent events and repositories come from `https://api.github.com`.
- The contribution graph comes from `https://github-contributions-api.jogruber.de`, which exposes GitHub's public contribution calendar. If that request fails, the section says so and links to the profile.

An empty result is not presented as inactivity. Private repositories are outside this view. Unauthenticated GitHub API calls are rate-limited per IP address.

## Content notes

Work dates are copied from the previous version of this site and were not reconciled:

- Dixeam is listed as 2015–2016. Gosign is January 2016–June 2016. VinAudit starts July 2016. Those ranges overlap and need confirmation.
- The VinAudit senior engineer role ends December 2025 and the technical lead role starts December 2025.

Practice-area cards under Selected engineering work are qualitative. They do not include unpublished metrics or client-confidential detail. Review that wording before treating it as final.

The application stack for Sadaat Quran Center and Soma Vine Village was not recorded on the previous site, so no framework is named.

## Licenses

This page does not load the libraries stored under `assets/plugins` and `assets/fontawesome`. They remain in the repository under their own licenses, including Bootstrap, Font Awesome, GitHub Calendar, GitHub Activity, Vanilla RSS, Mustache, Popper, and Dark Mode Switch. The previous visual design was the Developer template by Xiaoying Riley (3rd Wave Media). This version replaces that layout.

Profile and project photos are served as AVIF and WebP, with the original PNG kept as a fallback.
