// Page Transition Animations
// Swipe for menu navigation, crossfade (default) for all other navigations.
// Uses the CSS View Transitions API (MPA mode via @view-transition { navigation: auto }).

(function () {
  function normalizePathname(p) {
    var prefixes = (window.MANA_LANG_PREFIXES || []).join('|');
    if (prefixes) p = p.replace(new RegExp('^/(' + prefixes + ')/'), '/');
    return p.replace(/\/?$/, '/').replace('//', '/');
  }

  function getMenuIndex(url) {
    try {
      var normalized = normalizePathname(new URL(url).pathname);
      var desktopMenuLinks = Array.from(document.querySelectorAll('.header-menu .menu-link'));
      return desktopMenuLinks.findIndex(function (link) {
        return normalizePathname(new URL(link.href).pathname) === normalized;
      });
    } catch (e) {
      return -1;
    }
  }

  function getCurrentMenuIndex() {
    var desktopMenuLinks = Array.from(document.querySelectorAll('.header-menu .menu-link'));
    // 1. Prefer active class match (Hugo marks the exact current menu page)
    var activeIdx = desktopMenuLinks.findIndex(function (link) {
      return link.classList.contains('active');
    });
    if (activeIdx !== -1) return activeIdx;
    // 2. Exact URL match
    var exactIdx = getMenuIndex(window.location.href);
    if (exactIdx !== -1) return exactIdx;
    // 3. Section prefix match — e.g. /posts/my-post/ resolves to the Posts section.
    // Uses the longest matching menu prefix (excludes root "/" which matches everything).
    try {
      var currentNorm = normalizePathname(new URL(window.location.href).pathname);
      var bestIdx = -1;
      var bestLen = 0;
      desktopMenuLinks.forEach(function (link, i) {
        try {
          var linkNorm = normalizePathname(new URL(link.href).pathname);
          if (linkNorm === '/') return;
          if (currentNorm.startsWith(linkNorm) && linkNorm.length > bestLen) {
            bestLen = linkNorm.length;
            bestIdx = i;
          }
        } catch (e) {}
      });
      return bestIdx;
    } catch (e) {
      return -1;
    }
  }

  function isRTL() {
    return document.body.classList.contains('rtl');
  }

  // Clean up data-page-enter after the entrance transition completes.
  // Primary: pagereveal + viewTransition.finished (Chrome 123+) fires exactly when
  // the animation ends and cancels the fallback timer.
  // Fallback: a 500 ms timer covers environments where pagereveal doesn't fire
  // (e.g. Playwright headless, older browsers without view-transition support).
  var enterDir = document.documentElement.getAttribute('data-page-enter');
  if (enterDir) {
    var cleanup = function () {
      document.documentElement.removeAttribute('data-page-enter');
    };
    var fallbackTimer = setTimeout(cleanup, 500);
    if ('onpagereveal' in window) {
      window.addEventListener('pagereveal', function (e) {
        clearTimeout(fallbackTimer);
        if (e.viewTransition) {
          e.viewTransition.finished.then(cleanup);
        } else {
          cleanup();
        }
      }, { once: true });
    }
  }

  // Guard against bfcache restoration with a stale data-page-enter attribute.
  // pageshow fires with persisted === true on bfcache restore; no transition is
  // occurring at that point, so the attribute must be cleared immediately.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      document.documentElement.removeAttribute('data-page-enter');
      sessionStorage.removeItem('mana_pt');
    }
  });

  // Failsafe: remove the attribute the moment the tab goes hidden, before the
  // browser can freeze the cleanup timer and bfcache the page with it still set.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      document.documentElement.removeAttribute('data-page-enter');
    }
  });

  // Attach click listeners to both desktop and mobile menu links
  function initPageTransitions() {
    var allMenuLinks = document.querySelectorAll('.header-menu .menu-link, .mobile-menu-nav .menu-link');
    allMenuLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var currentIdx = getCurrentMenuIndex();
        var targetIdx = getMenuIndex(link.href);
        // If either index is unresolvable, fall back to crossfade
        if (currentIdx === -1 || targetIdx === -1 || currentIdx === targetIdx) return;
        var goingForward = targetIdx > currentIdx;
        var rtl = isRTL();
        // LTR forward → swipe-left (new enters from right)
        // LTR backward → swipe-right (new enters from left)
        // RTL reverses the visual direction
        var dir = (goingForward !== rtl) ? 'swipe-left' : 'swipe-right';
        sessionStorage.setItem('mana_pt', dir);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTransitions);
  } else {
    initPageTransitions();
  }
})();
