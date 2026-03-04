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
    // Prefer active class match
    var activeIdx = desktopMenuLinks.findIndex(function (link) {
      return link.classList.contains('active');
    });
    if (activeIdx !== -1) return activeIdx;
    // Fall back to URL match
    return getMenuIndex(window.location.href);
  }

  function isRTL() {
    return document.body.classList.contains('rtl');
  }

  // Clean up data-page-enter after the entrance transition completes
  var enterDir = document.documentElement.getAttribute('data-page-enter');
  if (enterDir) {
    setTimeout(function () {
      document.documentElement.removeAttribute('data-page-enter');
    }, 450);
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
        // If either page is not in the menu (e.g. a post page), fall back to crossfade
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
