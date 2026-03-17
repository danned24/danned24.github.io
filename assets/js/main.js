/**
 * VendSmart – Main JavaScript
 *
 * LANGUAGE TOGGLE APPROACH:
 * We use Approach 1: data-lang="en" / data-lang="fr" attributes on HTML elements.
 * JavaScript shows elements matching the active language and hides the rest.
 * To add French translations, add an element with the same structure but
 * data-lang="fr" immediately after every data-lang="en" element, or wrap
 * both inside a common container.
 *
 * EXAMPLE:
 *   <h1>
 *     <span data-lang="en">Smart vending machines that sell 24/7</span>
 *     <span data-lang="fr">Des distributrices intelligentes qui vendent 24h/24</span>
 *   </h1>
 *
 * The active language is stored in localStorage so it persists across pages.
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  1. Language Toggle                                                   */
  /* ------------------------------------------------------------------ */
  const LANG_KEY = 'vendsmart-lang';
  const DEFAULT_LANG = 'en';

  function getLang() {
    return localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  }

  function applyLang(lang) {
    // Show/hide all [data-lang] elements
    document.querySelectorAll('[data-lang]').forEach(function (el) {
      if (el.dataset.lang === lang) {
        el.classList.add('lang-active');
      } else {
        el.classList.remove('lang-active');
      }
    });

    // Update lang-btn active state
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.langTarget === lang);
      btn.setAttribute('aria-pressed', btn.dataset.langTarget === lang ? 'true' : 'false');
    });

    // Update <html lang> attribute for accessibility
    document.documentElement.lang = lang;

    // Persist
    localStorage.setItem(LANG_KEY, lang);
  }

  function initLangToggle() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.dataset.langTarget);
      });
    });
    // Apply saved or default language on load
    applyLang(getLang());
  }

  /* ------------------------------------------------------------------ */
  /*  2. Sticky Header Shadow                                              */
  /* ------------------------------------------------------------------ */
  function initStickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /*  3. Mobile Navigation Drawer                                          */
  /* ------------------------------------------------------------------ */
  function initMobileNav() {
    var hamburger = document.getElementById('nav-hamburger');
    var drawer    = document.getElementById('nav-drawer');
    if (!hamburger || !drawer) return;

    function closeDrawer() {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      var isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        hamburger.classList.add('open');
        drawer.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    });

    // Close drawer on link click
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    // Close drawer on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) closeDrawer();
    }, { passive: true });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ------------------------------------------------------------------ */
  /*  4. Active Nav Link (highlight current page)                          */
  /* ------------------------------------------------------------------ */
  function initActiveNavLink() {
    var path = window.location.pathname.replace(/\/$/, '') || '/index.html';
    document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      // Normalize: strip leading ./
      var normalized = href.replace(/^\.\//, '');
      if (
        path.endsWith(normalized) ||
        (path === '/' && normalized === 'index.html') ||
        (normalized === 'index.html' && path === '')
      ) {
        link.classList.add('active');
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  5. FAQ Accordion                                                     */
  /* ------------------------------------------------------------------ */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var answer    = document.getElementById(btn.getAttribute('aria-controls'));
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Close all
        document.querySelectorAll('.faq-question').forEach(function (b) {
          b.setAttribute('aria-expanded', 'false');
          var a = document.getElementById(b.getAttribute('aria-controls'));
          if (a) a.classList.remove('open');
        });

        // Open clicked (toggle)
        if (!isExpanded) {
          btn.setAttribute('aria-expanded', 'true');
          if (answer) answer.classList.add('open');
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  6. Contact Form (mailto fallback)                                    */
  /* ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById('quote-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name     = form.querySelector('#f-name')    ? form.querySelector('#f-name').value    : '';
      var email    = form.querySelector('#f-email')   ? form.querySelector('#f-email').value   : '';
      var company  = form.querySelector('#f-company') ? form.querySelector('#f-company').value : '';
      var location = form.querySelector('#f-location')? form.querySelector('#f-location').value: '';
      var message  = form.querySelector('#f-message') ? form.querySelector('#f-message').value : '';

      // Gather checked machines
      var machines = [];
      form.querySelectorAll('input[name="machine"]:checked').forEach(function (cb) {
        machines.push(cb.value);
      });

      // Build mailto body
      var body = [
        'Name: '     + name,
        'Company: '  + company,
        'Location: ' + location,
        'Machines: ' + (machines.join(', ') || 'N/A'),
        '',
        message
      ].join('\n');

      /*
       * TODO: Replace this mailto link with a proper form handler endpoint
       * (e.g., Formspree, Netlify Forms, EmailJS, or a custom backend).
       * mailto: is a placeholder that opens the user's email client.
       */
      var mailto = 'mailto:contact@vendsmart.com'
        + '?subject=' + encodeURIComponent('Quote Request from ' + name + ' – VendSmart')
        + '&body='    + encodeURIComponent(body);

      window.location.href = mailto;

      // Show success message
      var success = document.getElementById('form-success');
      if (success) {
        success.classList.add('visible');
        form.reset();
        setTimeout(function () { success.classList.remove('visible'); }, 8000);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  7. Smooth scroll for anchor buttons                                  */
  /* ------------------------------------------------------------------ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initLangToggle();
    initStickyHeader();
    initMobileNav();
    initActiveNavLink();
    initFAQ();
    initContactForm();
    initSmoothScroll();
  });

})();
