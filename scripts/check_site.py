#!/usr/bin/env python3
"""Static checks for the portfolio: markup, links, assets, and key content."""

from html.parser import HTMLParser
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
REQUIRED_TEXT = [
    "Muhammad Usman",
    "Technical Lead | Software & Infrastructure Engineer",
    "Building scalable software. Engineering reliable infrastructure. Leading teams that deliver.",
    "usman34226@gmail.com",
    "Sargodha, Pakistan",
    "Nina Anciano",
    "VinAudit.com, Inc.",
    "Gosign",
    "Dixeam",
    "University of Sargodha",
    "Pakistan Steel Cadet College",
    "Sadaat Quran Center",
    "Soma Vine Village",
    "December 2025",
    "Aug 2022",
    "July 2016",
    "Jan 2016",
    "2015 – 2016",
    "BS Computer Science",
    "Professional proficiency",
    "Native speaker",
]
FORBIDDEN = [
    "favourite coding music",
    "xiaoying riley",
    "progressbar",
    "level-bar",
]


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.attrs = []
        self.text = []
        self.ids = set()
        self.skip = False

    def handle_starttag(self, tag, attrs):
        self._start(tag, attrs)

    def handle_startendtag(self, tag, attrs):
        self._start(tag, attrs)

    def _start(self, tag, attrs):
        attr = {key: value for key, value in attrs}
        self.tags.append(tag)
        self.attrs.append((tag, attr))
        if attr.get("id"):
            self.ids.add(attr["id"])
        if tag in {"script", "style"}:
            self.skip = True

    def handle_endtag(self, tag):
        if tag in {"script", "style"}:
            self.skip = False

    def handle_data(self, data):
        if not self.skip:
            self.text.append(data)


def main():
    errors = []
    html = INDEX.read_text(encoding="utf-8")
    doc = Document()
    doc.feed(html)
    text = " ".join(doc.text)
    folded = text.lower()

    if doc.tags.count("h1") != 1:
        errors.append(f"expected exactly one h1, found {doc.tags.count('h1')}")
    if not any(tag == "html" and attrs.get("lang") == "en" for tag, attrs in doc.attrs):
        errors.append("html element is missing lang='en'")
    for landmark in ("header", "nav", "main", "footer"):
        if landmark not in doc.tags:
            errors.append(f"missing <{landmark}> landmark")

    metas = {attrs.get("name") or attrs.get("property"): attrs.get("content", "") for tag, attrs in doc.attrs if tag == "meta"}
    title = ""
    if "<title>" in html:
        title = html.split("<title>", 1)[1].split("</title>", 1)[0]
    if "Muhammad Usman" not in title:
        errors.append("title is missing the name")
    description = metas.get("description", "")
    if not (70 <= len(description) <= 170):
        errors.append(f"meta description length {len(description)} is outside 70–170")
    for key in ("og:title", "og:description", "og:url", "og:image", "twitter:card", "twitter:title"):
        if not metas.get(key):
            errors.append(f"missing meta {key}")

    canonical = [attrs.get("href") for tag, attrs in doc.attrs if tag == "link" and attrs.get("rel") == "canonical"]
    if canonical != ["https://usman342.github.io/"]:
        errors.append(f"canonical URL is {canonical!r}")

    ld_blocks = []
    parts = html.split('<script type="application/ld+json">')
    for part in parts[1:]:
        raw = part.split("</script>", 1)[0]
        try:
            ld_blocks.append(json.loads(raw))
        except json.JSONDecodeError as exc:
            errors.append(f"JSON-LD is invalid: {exc}")
    if not any(block.get("@type") == "Person" and block.get("name") == "Muhammad Usman" for block in ld_blocks):
        errors.append("JSON-LD Person named Muhammad Usman is missing")

    for tag, attrs in doc.attrs:
        if attrs.get("target") == "_blank":
            rel = attrs.get("rel") or ""
            if "noopener" not in rel or "noreferrer" not in rel:
                errors.append(f"{tag} target=_blank is missing rel='noopener noreferrer' ({attrs.get('href')})")
        if tag == "img" and not (attrs.get("alt") or "").strip():
            errors.append(f"img missing alt text ({attrs.get('src')})")
        href = attrs.get("href") or ""
        if href.startswith("#") and href != "#" and href[1:] not in doc.ids:
            errors.append(f"broken anchor {href}")
        for source in (attrs.get("src"), attrs.get("href"), attrs.get("srcset")):
            if not source or source.startswith(("http://", "https://", "mailto:", "#", "data:")):
                continue
            path = source.split()[0]
            if path.endswith(".ico") or path.startswith("assets/"):
                if not (ROOT / path).exists():
                    errors.append(f"missing local asset {path}")

    buttons = [attrs for tag, attrs in doc.attrs if tag == "button"]
    for attrs in buttons:
        named = (attrs.get("aria-label") or "").strip()
        if not named and "nav-toggle" not in (attrs.get("id") or "") and "theme-toggle" not in (attrs.get("id") or ""):
            errors.append(f"button may lack an accessible name: {attrs}")

    for snippet in REQUIRED_TEXT:
        if snippet not in text and snippet not in html:
            errors.append(f"missing verified content: {snippet}")
    for snippet in FORBIDDEN:
        if snippet in folded:
            errors.append(f"found content that should be gone: {snippet}")

    for filename in ("robots.txt", "sitemap.xml", "assets/css/styles.css", "assets/js/main.js"):
        if not (ROOT / filename).exists():
            errors.append(f"missing {filename}")
    if "Sitemap:" not in (ROOT / "robots.txt").read_text(encoding="utf-8"):
        errors.append("robots.txt is missing a sitemap reference")
    if "usman342.github.io" not in (ROOT / "sitemap.xml").read_text(encoding="utf-8"):
        errors.append("sitemap.xml is missing the canonical host")

    if errors:
        print(f"{len(errors)} check(s) failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print("Portfolio checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
