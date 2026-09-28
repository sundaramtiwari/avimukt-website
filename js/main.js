/* Avimukt Engineers — shared vanilla JS (no build step, no dependencies) */
(function () {
  "use strict";

  /* Landing on a page with a #hash (breadcrumbs, nav dropdown deep links):
     force an instant jump instead of the CSS `scroll-behavior: smooth`
     animation, which web-font/image reflow can interrupt partway and leave
     the page stuck at the top. Runs immediately (script is at the end of
     <body>, before window "load") so it applies before that first jump.
     Restored once the page has fully settled so later same-page anchor
     clicks (e.g. clicking "Innovations" while already on this page) still
     scroll smoothly. */
  if (window.location.hash) {
    document.documentElement.style.scrollBehavior = "auto";
    window.addEventListener("load", function () {
      setTimeout(function () {
        document.documentElement.style.scrollBehavior = "";
      }, 400);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initDesktopDropdownA11y();
    initActiveNav();
    initReveal();
    initTabs();
    initAccordion();
    initContactForm();
    initYear();
    initHashScrollFix();
  });

  /* ---------------- Reliable scroll-to-anchor on page load ----------------
     Cross-page links (e.g. breadcrumbs, nav dropdowns) navigate to a new
     document with a #hash. The browser's native jump-to-anchor can land in
     the wrong place or get cancelled if web fonts / lazy images shift the
     layout while it's still settling, especially with `scroll-behavior:
     smooth` on <html>. Re-assert the correct position once the page (and
     its fonts/images) have actually finished loading. */
  function initHashScrollFix() {
    if (!window.location.hash) return;
    var id = window.location.hash.slice(1);
    var target;
    try { target = document.getElementById(id); } catch (e) { target = null; }
    if (!target) return;

    function scrollToTarget() {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    }

    scrollToTarget();
    requestAnimationFrame(function () { requestAnimationFrame(scrollToTarget); });
    window.addEventListener("load", scrollToTarget);
    setTimeout(scrollToTarget, 350);
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.classList.toggle("nav-locked", isOpen);
    });

    var items = panel.querySelectorAll(".m-item");
    items.forEach(function (item) {
      var top = item.querySelector(".m-top");
      if (!top) return;
      top.addEventListener("click", function () {
        var willOpen = !item.classList.contains("is-open");
        items.forEach(function (i) { i.classList.remove("is-open"); });
        if (willOpen) item.classList.add("is-open");
      });
    });

    /* Close mobile panel on resize back to desktop */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1240 && panel.classList.contains("is-open")) {
        panel.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-locked");
      }
    });
  }

  /* ---------------- Desktop dropdown keyboard support ---------------- */
  function initDesktopDropdownA11y() {
    var navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(function (item) {
      var link = item.querySelector(".nav-link");
      if (!link) return;
      link.addEventListener("focus", function () { item.classList.add("is-open"); });
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) item.classList.remove("is-open");
      });
    });
  }

  /* ---------------- Active nav state ---------------- */
  function initActiveNav() {
    var current = (window.location.pathname.split("/").pop() || "index.html");
    if (current === "") current = "index.html";
    document.querySelectorAll("[data-nav-path]").forEach(function (el) {
      var path = el.getAttribute("data-nav-path");
      if (path === current) {
        el.classList.add("is-active");
      }
    });
  }

  /* ---------------- Reveal-on-scroll ---------------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Tabs ---------------- */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var buttons = group.querySelectorAll(".tab-btn");
      var panels = group.querySelectorAll(".tab-panel");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var target = btn.getAttribute("data-tab-target");
          buttons.forEach(function (b) { b.classList.remove("is-active"); });
          panels.forEach(function (p) { p.classList.remove("is-active"); });
          btn.classList.add("is-active");
          var panel = group.querySelector('[data-tab-panel="' + target + '"]');
          if (panel) panel.classList.add("is-active");
        });
      });
    });
  }

  /* ---------------- Accordion ---------------- */
  function initAccordion() {
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      var trigger = item.querySelector(".accordion-trigger");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        item.classList.toggle("is-open");
      });
    });
  }

  /* ---------------- Contact form -> mailto ---------------- */
  function initContactForm() {
    var form = document.querySelector("[data-mailto-form]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.querySelector("#cf-name") || {}).value || "";
      var email = (form.querySelector("#cf-email") || {}).value || "";
      var phone = (form.querySelector("#cf-phone") || {}).value || "";
      var org = (form.querySelector("#cf-org") || {}).value || "";
      var subject = (form.querySelector("#cf-subject") || {}).value || "General enquiry";
      var message = (form.querySelector("#cf-message") || {}).value || "";

      var bodyLines = [
        "Name: " + name,
        "Organisation: " + org,
        "Email: " + email,
        "Phone: " + phone,
        "",
        message
      ];

      var mailto = "mailto:sales@avimuktengineers.in" +
        "?subject=" + encodeURIComponent("Website enquiry: " + subject) +
        "&body=" + encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;

      var status = form.querySelector("[data-form-status]");
      if (status) {
        status.classList.add("is-visible");
        status.textContent = "Opening your email client to send this to sales@avimuktengineers.in — if nothing happens, please email us directly.";
      }
    });
  }

  /* ---------------- Footer year ---------------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
})();
