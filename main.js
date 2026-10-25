/* Emanuel Camacho — shared site script (all pages) */
(function () {
  "use strict";
  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: background on scroll + mobile menu ---------- */
  var nav = doc.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = nav.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open);
        toggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
      });
      nav.querySelectorAll(".nav-links a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
      });
    }

    /* Highlight the section currently in view */
    var links = nav.querySelectorAll('.nav-links a[href^="#"]');
    if (links.length && "IntersectionObserver" in window) {
      var map = {};
      links.forEach(function (l) { map[l.getAttribute("href").slice(1)] = l; });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            links.forEach(function (l) { l.classList.remove("active"); });
            map[e.target.id].classList.add("active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var s = doc.getElementById(id); if (s) spy.observe(s); });
    }
  }

  /* ---------- Reveal on scroll (each element animates once) ---------- */
  var revealEls = doc.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Media slots (thesis page) ----------
     <a class="figure-media slot" data-slot="thesis/media/prototype" data-kind="image">
     Tries .webp/.jpg/.jpeg/.png (or .mp4/.webm for video). If one exists it is shown,
     otherwise the "coming soon" placeholder stays. Add ?slots to the URL to see file names. */
  if (/[?&]slots\b/.test(location.search)) doc.documentElement.classList.add("show-slots");

  var IMG_EXT = ["webp", "jpg", "jpeg", "png"];
  var VID_EXT = ["mp4", "webm"];

  function tryImage(base, i, done) {
    if (i >= IMG_EXT.length) return done(null);
    var src = base + "." + IMG_EXT[i];
    var img = new Image();
    img.onload = function () { done(src); };
    img.onerror = function () { tryImage(base, i + 1, done); };
    img.src = src;
  }
  function tryVideo(base, i, done) {
    if (i >= VID_EXT.length) return done(null);
    var src = base + "." + VID_EXT[i];
    var v = doc.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = function () { v.removeAttribute("src"); v.load(); done(src); };
    v.onerror = function () { tryVideo(base, i + 1, done); };
    v.src = src;
  }

  doc.querySelectorAll("[data-slot]").forEach(function (slot) {
    var base = slot.getAttribute("data-slot");
    var kind = slot.getAttribute("data-kind") || "image";
    var label = slot.getAttribute("data-alt") || "";
    var code = slot.querySelector(".slot-empty code");
    if (code) code.textContent = base + (kind === "video" ? ".mp4" : ".webp / .jpg / .png");

    if (kind === "video") {
      tryVideo(base, 0, function (src) {
        if (!src) return;
        var v = doc.createElement("video");
        v.controls = true; v.preload = "none"; v.playsInline = true; v.src = src;
        tryImage(base + "-poster", 0, function (poster) { if (poster) v.poster = poster; });
        slot.appendChild(v);
        slot.classList.add("filled");
      });
    } else {
      tryImage(base, 0, function (src) {
        if (!src) return;
        var img = doc.createElement("img");
        img.src = src; img.alt = label; img.loading = "lazy"; img.decoding = "async";
        slot.appendChild(img);
        slot.classList.add("filled");
        if (slot.tagName === "A") { slot.href = src; slot.setAttribute("data-lightbox", slot.getAttribute("data-lightbox") || "slots"); }
      });
    }
  });

  /* ---------- Documents that may not be uploaded yet ----------
     <a data-doc="thesis/MSc_Thesis_Emanuel_Camacho.pdf" aria-disabled="true">
     Enabled automatically once the file exists on the server. */
  doc.querySelectorAll("[data-doc]").forEach(function (a) {
    var url = a.getAttribute("data-doc");
    if (location.protocol === "file:") return;
    fetch(url, { method: "HEAD" }).then(function (r) {
      if (r.ok) {
        a.href = url;
        a.removeAttribute("aria-disabled");
        var t = a.querySelector("[data-ready-text]");
        if (t) t.textContent = t.getAttribute("data-ready-text");
        var row = a.closest(".doc");
        if (row) row.classList.add("ready");
      }
    }).catch(function () {});
  });

  /* ---------- PDF previews load only when opened ---------- */
  doc.querySelectorAll("details[data-pdf]").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open && !d.querySelector("iframe")) {
        var f = doc.createElement("iframe");
        f.className = "pdf-frame";
        f.src = d.getAttribute("data-pdf");
        f.title = d.getAttribute("data-title") || "PDF preview";
        d.appendChild(f);
      }
    });
  });

  /* ---------- Lightbox ---------- */
  var lb, lbImg, lbCap, group = [], idx = 0, lastFocus;
  function buildLightbox() {
    lb = doc.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<img alt="">' +
      '<p class="lb-caption"></p>' +
      '<button class="lb-btn lb-close" aria-label="Close"><i class="fas fa-xmark"></i></button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>' +
      '<button class="lb-btn lb-next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>';
    doc.body.appendChild(lb);
    lbImg = lb.querySelector("img");
    lbCap = lb.querySelector(".lb-caption");
    lb.querySelector(".lb-close").onclick = close;
    lb.querySelector(".lb-prev").onclick = function () { show(idx - 1); };
    lb.querySelector(".lb-next").onclick = function () { show(idx + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    doc.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }
  function show(i) {
    idx = (i + group.length) % group.length;
    var a = group[idx];
    lbImg.src = a.getAttribute("href");
    var img = a.querySelector("img");
    lbImg.alt = img ? img.alt : "";
    lbCap.textContent = a.getAttribute("data-caption") || (img ? img.alt : "");
    var multi = group.length > 1;
    lb.querySelector(".lb-prev").style.display = multi ? "" : "none";
    lb.querySelector(".lb-next").style.display = multi ? "" : "none";
  }
  function close() {
    lb.classList.remove("open");
    doc.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  doc.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-lightbox]");
    if (!a || (a.classList.contains("slot") && !a.classList.contains("filled"))) {
      if (a) e.preventDefault();
      return;
    }
    e.preventDefault();
    if (!lb) buildLightbox();
    var name = a.getAttribute("data-lightbox");
    group = Array.prototype.filter.call(doc.querySelectorAll('a[data-lightbox="' + name + '"]'), function (x) {
      return !x.classList.contains("slot") || x.classList.contains("filled");
    });
    lastFocus = a;
    show(group.indexOf(a));
    lb.classList.add("open");
    doc.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  });

  /* ---------- Footer year ---------- */
  doc.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
