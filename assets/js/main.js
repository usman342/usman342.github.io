"use strict";

(function () {
  var GITHUB_USER = "usman342";
  var PROFILE_URL = "https://github.com/" + GITHUB_USER;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var themeButton = document.getElementById("theme-toggle");
  var themeText = document.getElementById("theme-text");
  var themeColor = document.getElementById("theme-color");
  var nav = document.getElementById("site-nav");
  var navToggle = document.getElementById("nav-toggle");
  var navLabel = document.getElementById("nav-toggle-label");
  var header = document.querySelector(".site-header");
  var navQuery = window.matchMedia("(max-width: 979px)");

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeColor) themeColor.setAttribute("content", theme === "light" ? "#f6f8fb" : "#0c1219");
    if (persist) {
      try {
        localStorage.setItem("theme", theme);
      } catch (e) {}
    }
    if (themeButton && themeText) {
      var dark = theme !== "light";
      themeButton.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
      themeText.textContent = dark ? "Dark" : "Light";
    }
  }

  applyTheme(currentTheme(), false);

  if (themeButton) {
    themeButton.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem("theme");
  } catch (e) {}

  if (storedTheme !== "light" && storedTheme !== "dark" && window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (event) {
      var choice = null;
      try {
        choice = localStorage.getItem("theme");
      } catch (e) {}
      if (choice !== "light" && choice !== "dark") {
        applyTheme(event.matches ? "light" : "dark", false);
      }
    });
  }

  function setMenu(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (navLabel) navLabel.textContent = open ? "Close menu" : "Open menu";
  }

  function closeMenu() {
    setMenu(false);
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", function (event) {
    if (!header || !navQuery.matches) return;
    if (!header.contains(event.target)) closeMenu();
  });

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = (link.getAttribute("href") || "").slice(1);
        var target = id ? document.getElementById(id) : null;
        var mobile = navQuery.matches;
        closeMenu();
        navLinks.forEach(function (item) {
          item.removeAttribute("aria-current");
        });
        link.setAttribute("aria-current", "true");
        if (!target) return;
        target.setAttribute("tabindex", "-1");
        if (mobile) {
          event.preventDefault();
          target.scrollIntoView({ block: "start" });
          if (window.history && window.history.pushState) {
            window.history.pushState(null, "", "#" + id);
          }
          function focusTarget() {
            target.focus({ preventScroll: true });
          }
          if ("onscrollend" in window) {
            document.addEventListener("scrollend", focusTarget, { once: true });
          } else {
            window.setTimeout(focusTarget, 700);
          }
          return;
        }
        target.focus({ preventScroll: true });
      });
    });
  }

  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];
  var sections = navLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var activeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          var match = navLinks.find(function (link) {
            return link.getAttribute("href") === "#" + entry.target.id;
          });
          if (match) match.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -48% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      activeObserver.observe(section);
    });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-in");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  function getJson(url, headers) {
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, 12000);
    return fetch(url, { headers: headers || {}, signal: controller.signal }).then(function (response) {
      clearTimeout(timer);
      if (!response.ok) {
        var error = new Error("Request failed");
        error.status = response.status;
        throw error;
      }
      return response.json();
    }).catch(function (error) {
      clearTimeout(timer);
      throw error;
    });
  }

  function failureMessage(error) {
    var limited = error && (error.status === 403 || error.status === 429 || error.name === "AbortError");
    if (limited && error.status !== 404) {
      return "GitHub did not return this data. The public API may be rate-limited or temporarily unavailable. That is not a statement about activity.";
    }
    return "This could not be loaded. That is not a statement about activity, and private work is not included here.";
  }

  function profileLink(label) {
    var link = document.createElement("a");
    link.href = PROFILE_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label || "Open the GitHub profile";
    return link;
  }

  function showNotice(container, message) {
    var note = document.createElement("p");
    note.className = "notice";
    note.append(document.createTextNode(message + " "));
    note.append(profileLink());
    note.append(document.createTextNode("."));
    container.replaceChildren(note);
    container.setAttribute("aria-busy", "false");
  }

  function repoAnchor(name) {
    if (!name || !/^[\w.-]+\/[\w.-]+$/.test(name)) {
      var plain = document.createElement("span");
      plain.textContent = name || "a repository";
      return plain;
    }
    var link = document.createElement("a");
    link.href = "https://github.com/" + name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = name;
    return link;
  }

  function formatDate(iso) {
    var date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function branchName(ref) {
    if (!ref) return "";
    return ref.indexOf("refs/heads/") === 0 ? ref.slice(11) : ref;
  }

  function clip(text, max) {
    if (!text) return "";
    var clean = String(text).replace(/\s+/g, " ").trim();
    return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
  }

  function activityLine(event) {
    var repo = event.repo && event.repo.name;
    var payload = event.payload || {};
    var line = document.createElement("p");
    var extra = "";

    function add(text) {
      line.append(document.createTextNode(text));
    }

    function action(value, fallback) {
      var word = value || fallback;
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    switch (event.type) {
      case "PushEvent":
        add("Pushed");
        if (payload.ref) {
          add(" to " + branchName(payload.ref));
        }
        add(" on ");
        line.append(repoAnchor(repo));
        if (payload.commits && payload.commits[0] && payload.commits[0].message) {
          extra = clip(payload.commits[0].message, 140);
        }
        break;
      case "PullRequestEvent":
        add(action(payload.action, "Updated") + " a pull request on ");
        line.append(repoAnchor(repo));
        if (payload.pull_request && payload.pull_request.title) extra = clip(payload.pull_request.title, 140);
        break;
      case "IssuesEvent":
        add(action(payload.action, "Updated") + " an issue on ");
        line.append(repoAnchor(repo));
        if (payload.issue && payload.issue.title) extra = clip(payload.issue.title, 140);
        break;
      case "IssueCommentEvent":
        add("Commented on an issue on ");
        line.append(repoAnchor(repo));
        break;
      case "PullRequestReviewEvent":
        add("Reviewed a pull request on ");
        line.append(repoAnchor(repo));
        break;
      case "PullRequestReviewCommentEvent":
        add("Commented on a pull request on ");
        line.append(repoAnchor(repo));
        break;
      case "WatchEvent":
        add("Starred ");
        line.append(repoAnchor(repo));
        break;
      case "ForkEvent":
        add("Forked ");
        line.append(repoAnchor(repo));
        break;
      case "CreateEvent":
        add("Created " + (payload.ref_type || "a reference") + (payload.ref ? " " + payload.ref : "") + " on ");
        line.append(repoAnchor(repo));
        break;
      case "DeleteEvent":
        add("Deleted " + (payload.ref_type || "a reference") + (payload.ref ? " " + payload.ref : "") + " on ");
        line.append(repoAnchor(repo));
        break;
      case "ReleaseEvent":
        add("Published a release on ");
        line.append(repoAnchor(repo));
        break;
      case "PublicEvent":
        add("Made ");
        line.append(repoAnchor(repo));
        add(" public");
        break;
      case "CommitCommentEvent":
        add("Commented on a commit on ");
        line.append(repoAnchor(repo));
        break;
      default:
        add("Public activity on ");
        line.append(repoAnchor(repo));
    }

    return { line: line, extra: extra };
  }

  function loadCalendar() {
    var container = document.getElementById("gh-calendar");
    if (!container) return;
    getJson("https://github-contributions-api.jogruber.de/v4/" + GITHUB_USER + "?y=last")
      .then(function (data) {
        var days = data && Array.isArray(data.contributions) ? data.contributions : [];
        if (!days.length) {
          showNotice(container, "GitHub returned no public contributions for the last year. Private work is not part of this graph, so an empty result is not inactivity.");
          return;
        }
        renderCalendar(container, days, data.total || {});
      })
      .catch(function (error) {
        showNotice(container, failureMessage(error));
      });
  }

  function renderCalendar(container, days, total) {
    var summary = document.createElement("p");
    summary.className = "gh-summary";
    var count = total && typeof total.lastYear === "number" ? total.lastYear : null;
    var countText = count === null ? "Public contributions" : new Intl.NumberFormat("en-US").format(count) + " public contributions";
    summary.textContent = countText + " in the last year, as reported by GitHub. Private repositories are not included. ";
    summary.append(profileLink("View the profile"));
    summary.append(document.createTextNode("."));

    var first = new Date(days[0].date + "T00:00:00Z");
    var cells = [];
    var pad = first.getUTCDay();
    for (var i = 0; i < pad; i += 1) cells.push(null);
    days.forEach(function (day) {
      cells.push(day);
    });
    var weeks = [];
    for (var c = 0; c < cells.length; c += 7) weeks.push(cells.slice(c, c + 7));

    var chart = document.createElement("div");
    chart.className = "cal-scroll";
    chart.setAttribute("aria-hidden", "true");
    var grid = document.createElement("div");
    grid.className = "cal";
    var lastLabel = "";

    weeks.forEach(function (week, index) {
      var col = document.createElement("div");
      col.className = "cal-col";
      var present = week.filter(Boolean);
      var marker = present.find(function (day) {
        return Number(day.date.slice(8, 10)) <= 7;
      }) || (index === 0 ? present[0] : null);
      var label = "";
      if (marker) {
        var name = MONTHS[new Date(marker.date + "T00:00:00Z").getUTCMonth()];
        if (name !== lastLabel) {
          label = name;
          lastLabel = name;
        }
      }
      var labelNode = document.createElement("span");
      labelNode.className = "cal-label";
      labelNode.textContent = label;
      col.append(labelNode);

      for (var d = 0; d < 7; d += 1) {
        var day = week[d];
        if (!day) {
          var empty = document.createElement("span");
          empty.className = "cal-pad";
          col.append(empty);
          continue;
        }
        var cell = document.createElement("span");
        var level = String(day.level == null ? (day.count > 0 ? 1 : 0) : day.level);
        cell.className = "cal-day";
        cell.setAttribute("data-level", level);
        col.append(cell);
      }
      grid.append(col);
    });

    var legend = document.createElement("div");
    legend.className = "cal-legend";
    legend.append(document.createTextNode("Less"));
    ["0", "1", "2", "3", "4"].forEach(function (level) {
      var swatch = document.createElement("span");
      swatch.className = "cal-day";
      swatch.setAttribute("data-level", level);
      legend.append(swatch);
    });
    legend.append(document.createTextNode("More"));

    chart.append(grid);
    container.replaceChildren(summary, chart, legend);
    container.setAttribute("aria-busy", "false");
  }

  function loadActivity() {
    var container = document.getElementById("gh-activity");
    if (!container) return;
    getJson("https://api.github.com/users/" + GITHUB_USER + "/events/public?per_page=8", {
      Accept: "application/vnd.github+json"
    })
      .then(function (events) {
        if (!Array.isArray(events) || !events.length) {
          showNotice(container, "No recent public events were returned. Activity in private repositories does not appear here and is not treated as inactivity.");
          return;
        }
        var list = document.createElement("ul");
        list.className = "activity";
        events.slice(0, 6).forEach(function (event) {
          var item = document.createElement("li");
          var time = document.createElement("time");
          if (event.created_at) time.dateTime = event.created_at;
          time.textContent = formatDate(event.created_at);
          var described = activityLine(event);
          item.append(time, described.line);
          if (described.extra) {
            var detail = document.createElement("small");
            detail.textContent = described.extra;
            item.append(detail);
          }
          list.append(item);
        });
        container.replaceChildren(list);
        container.setAttribute("aria-busy", "false");
      })
      .catch(function (error) {
        showNotice(container, failureMessage(error));
      });
  }

  function loadRepos() {
    var container = document.getElementById("gh-repos");
    if (!container) return;
    getJson("https://api.github.com/users/" + GITHUB_USER + "/repos?per_page=30&sort=updated&type=owner", {
      Accept: "application/vnd.github+json"
    })
      .then(function (repos) {
        if (!Array.isArray(repos) || !repos.length) {
          showNotice(container, "No public repositories were returned. Private repositories are not listed.");
          return;
        }
        var ordered = repos.slice().sort(function (a, b) {
          if (!!a.fork !== !!b.fork) return a.fork ? 1 : -1;
          return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0);
        }).slice(0, 6);

        var list = document.createElement("ul");
        list.className = "repo-list";
        ordered.forEach(function (repo) {
          var item = document.createElement("li");
          var title = document.createElement("p");
          var link = document.createElement("a");
          link.href = repo.html_url || PROFILE_URL;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = repo.name || "Repository";
          title.append(link);
          if (repo.fork) {
            var tag = document.createElement("span");
            tag.className = "fork-tag";
            tag.textContent = "Fork";
            title.append(tag);
          }
          item.append(title);
          if (repo.description) {
            var desc = document.createElement("p");
            desc.className = "repo-desc";
            desc.textContent = clip(repo.description, 140);
            item.append(desc);
          }
          if (repo.language) {
            var lang = document.createElement("span");
            lang.className = "repo-lang";
            lang.textContent = repo.language;
            item.append(lang);
          }
          list.append(item);
        });
        container.replaceChildren(list);
        container.setAttribute("aria-busy", "false");
      })
      .catch(function (error) {
        showNotice(container, failureMessage(error));
      });
  }

  loadCalendar();
  loadActivity();
  loadRepos();
})();
