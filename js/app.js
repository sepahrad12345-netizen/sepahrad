(function () {
  "use strict";

  const STORE = window.STORE;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
  const toFa = (value) => String(value).replace(/\d/g, (d) => FA_DIGITS[d]);
  const toEn = (value) => String(value)
    .replace(/[۰-۹]/g, (d) => FA_DIGITS.indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

  /* ------------------------------------------------------------------
     Store data
     ------------------------------------------------------------------ */
  function fillStoreData() {
    const values = {
      name: STORE.name,
      address: STORE.address,
      mobile: STORE.mobile,
      hours: STORE.hours.label
    };
    document.querySelectorAll("[data-store]").forEach((el) => {
      const key = el.dataset.store;
      if (key === "phone") {
        el.textContent = STORE.phone;
        el.href = "tel:" + STORE.phoneHref;
      } else if (key === "map") {
        el.href = STORE.mapUrl;
      } else if (key === "instagram" || key === "telegram") {
        el.href = STORE[key];
      } else if (key in values) {
        el.textContent = values[key];
      }
    });
  }

  function updateOpenStatus() {
    const el = document.getElementById("open-status");
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tehran", weekday: "short", hour: "numeric", hour12: false
    }).formatToParts(new Date());
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = dayNames.indexOf(parts.find((p) => p.type === "weekday").value);
    const hour = parseInt(parts.find((p) => p.type === "hour").value, 10) % 24;
    const { openDays, open, close } = STORE.hours;
    const isOpen = openDays.includes(day) && hour >= open && hour < close;
    el.classList.toggle("is-open", isOpen);
    el.querySelector(".open-status-text").textContent = isOpen ? "الان باز است" : "الان بسته است";
    el.setAttribute("aria-label", (isOpen ? "فروشگاه الان باز است. " : "فروشگاه الان بسته است. ") + STORE.hours.label);
  }

  /* ------------------------------------------------------------------
     Products
     ------------------------------------------------------------------ */
  const SHAPES = {
    condenser: '<svg viewBox="0 0 120 200" fill="none" stroke="currentColor" stroke-width="2"><rect x="38" y="10" width="44" height="78" rx="22"/><path d="M42 30h36M40 44h40M40 58h40M42 72h36"/><rect x="44" y="88" width="32" height="70" rx="4"/><path d="M60 158v30M40 190h40"/><path d="M30 110a30 30 0 0 0 60 0" stroke-opacity=".5"/></svg>',
    broadcast: '<svg viewBox="0 0 120 200" fill="none" stroke="currentColor" stroke-width="2"><rect x="40" y="14" width="40" height="120" rx="20"/><path d="M40 52h40M44 34h32" stroke-opacity=".6"/><path d="M48 134v14h24v-14"/><path d="M60 148v40M36 188h48"/><path d="M28 96h12M80 96h12"/></svg>',
    shotgun: '<svg viewBox="0 0 220 120" fill="none" stroke="currentColor" stroke-width="2"><rect x="20" y="40" width="150" height="22" rx="11"/><path d="M40 40v22M60 40v22M80 40v22M100 40v22" stroke-opacity=".5"/><rect x="170" y="36" width="32" height="30" rx="6"/><path d="M110 62v20h40v-20M100 82h60"/></svg>',
    wireless: '<svg viewBox="0 0 200 140" fill="none" stroke="currentColor" stroke-width="2"><rect x="20" y="30" width="70" height="80" rx="12"/><circle cx="55" cy="58" r="16"/><path d="M45 92h20"/><rect x="110" y="30" width="70" height="80" rx="12"/><path d="M128 52h34M128 64h34M128 76h20" stroke-opacity=".6"/><path d="M90 50c8-8 12-8 20 0M94 60c4-4 8-4 12 0" stroke-opacity=".6"/></svg>',
    usb: '<svg viewBox="0 0 140 200" fill="none" stroke="currentColor" stroke-width="2"><rect x="44" y="12" width="52" height="96" rx="26"/><path d="M48 40h44M46 56h48M46 72h48M48 88h44" stroke-opacity=".6"/><path d="M30 70v20a40 40 0 0 0 80 0V70"/><path d="M70 130v40M40 176h60"/><circle cx="70" cy="122" r="3"/></svg>',
    headphones: '<svg viewBox="0 0 200 180" fill="none" stroke="currentColor" stroke-width="2"><path d="M30 110V90a70 70 0 0 1 140 0v20"/><rect x="18" y="100" width="34" height="58" rx="12"/><rect x="148" y="100" width="34" height="58" rx="12"/><path d="M30 120h10M160 120h10" stroke-opacity=".5"/></svg>'
  };

  function productArt(product) {
    if (product.image) {
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.name;
      img.loading = "lazy";
      return img.outerHTML;
    }
    return SHAPES[product.shape] || SHAPES.condenser;
  }

  function renderProducts() {
    const tabs = document.getElementById("product-tabs");
    const panel = document.getElementById("product-panel");
    const select = document.getElementById("f-product");

    STORE.categories.forEach((cat, i) => {
      const count = STORE.products.filter((p) => p.category === cat.id).length;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab";
      tab.id = "tab-" + cat.id;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "product-panel");
      tab.setAttribute("aria-selected", i === 0 ? "true" : "false");
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.dataset.category = cat.id;
      tab.innerHTML = "<span>" + cat.label + "</span><sup>" + toFa(count) + " مدل</sup>";
      tabs.appendChild(tab);

      const group = document.createElement("optgroup");
      group.label = cat.label;
      STORE.products.filter((p) => p.category === cat.id).forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        group.appendChild(opt);
      });
      select.appendChild(group);
    });

    function show(categoryId) {
      tabs.querySelectorAll(".tab").forEach((t) => {
        const on = t.dataset.category === categoryId;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", "tab-" + categoryId);
      panel.innerHTML = STORE.products
        .filter((p) => p.category === categoryId)
        .map((p) => (
          '<article class="product">' +
            '<div class="product-info">' +
              '<h3 class="product-name">' + p.name + "</h3>" +
              '<p class="product-use">' + p.use + "</p>" +
              '<p class="product-spec">' + toFa(p.spec) + "</p>" +
              '<button type="button" class="btn btn-ghost product-ask" data-product="' + p.id + '">استعلام قیمت ' + p.name + "</button>" +
            "</div>" +
            '<div class="product-art" aria-hidden="true">' + productArt(p) + "</div>" +
          "</article>"
        ))
        .join("");
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    tabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (tab) show(tab.dataset.category);
    });
    tabs.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      const list = Array.from(tabs.querySelectorAll(".tab"));
      const current = list.indexOf(document.activeElement);
      let next = current;
      // RTL: ArrowLeft moves to the next tab
      if (e.key === "ArrowLeft") next = (current + 1) % list.length;
      if (e.key === "ArrowRight") next = (current - 1 + list.length) % list.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = list.length - 1;
      e.preventDefault();
      list[next].focus();
      show(list[next].dataset.category);
    });

    panel.addEventListener("click", (e) => {
      const btn = e.target.closest(".product-ask");
      if (!btn) return;
      select.value = btn.dataset.product;
      scrollToTarget("#consult");
      setTimeout(() => document.getElementById("f-name").focus({ preventScroll: true }), reducedMotion ? 0 : 900);
    });

    show(STORE.categories[0].id);
  }

  /* ------------------------------------------------------------------
     Form
     ------------------------------------------------------------------ */
  function initForm() {
    const form = document.getElementById("consult-form");
    const success = document.getElementById("form-success");
    const fields = {
      name: { input: form.elements.name, error: document.getElementById("e-name") },
      phone: { input: form.elements.phone, error: document.getElementById("e-phone") }
    };

    function validate(key) {
      const { input, error } = fields[key];
      let message = "";
      if (key === "name" && input.value.trim().length < 2) {
        message = "نامت را بنویس تا بدانیم با چه کسی صحبت می‌کنیم.";
      }
      if (key === "phone") {
        const digits = toEn(input.value).replace(/[\s-]/g, "");
        if (!digits) message = "شماره‌ی موبایل را بنویس تا برای مشاوره تماس بگیریم.";
        else if (!/^(\+98|0098|0)?9\d{9}$/.test(digits)) message = "شماره‌ی موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.";
      }
      error.textContent = message;
      input.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    }

    Object.keys(fields).forEach((key) => {
      fields[key].input.addEventListener("blur", () => {
        if (fields[key].input.value) validate(key);
      });
      fields[key].input.addEventListener("input", () => {
        if (fields[key].input.getAttribute("aria-invalid") === "true") validate(key);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const results = Object.keys(fields).map(validate);
      if (results.includes(false)) {
        success.hidden = true;
        const firstInvalid = Object.values(fields).find((f) => f.input.getAttribute("aria-invalid") === "true");
        firstInvalid.input.focus();
        return;
      }
      // Front-end only for now: connect to a backend or form service here.
      form.reset();
      Object.values(fields).forEach((f) => f.input.removeAttribute("aria-invalid"));
      success.hidden = false;
    });
  }

  /* ------------------------------------------------------------------
     Menu
     ------------------------------------------------------------------ */
  function initMenu() {
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu");

    function setOpen(open) {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
      document.body.style.overflow = open ? "hidden" : "";
      if (lenis) open ? lenis.stop() : lenis.start();
      if (open) menu.querySelector("a").focus();
    }

    toggle.addEventListener("click", () => setOpen(menu.hidden));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });
    menu.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#']");
      if (!link) return;
      e.preventDefault();
      setOpen(false);
      scrollToTarget(link.getAttribute("href"));
    });
  }

  /* ------------------------------------------------------------------
     Smooth scroll
     ------------------------------------------------------------------ */
  let lenis = null;

  function scrollToTarget(selector) {
    const target = document.querySelector(selector);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: 0 });
    else target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }

  function initSmoothScroll() {
    if (reducedMotion || !window.Lenis) return;
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll("a[href^='#']").forEach((a) => {
      if (a.closest("#menu")) return;
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (href.length < 2) return;
        e.preventDefault();
        scrollToTarget(href);
      });
    });
  }

  /* ------------------------------------------------------------------
     Hero canvas: video frames, or a drawn stage until frames exist
     ------------------------------------------------------------------ */
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const FRAME_SPEED = 2.0;
  const IMAGE_SCALE = 1; // full-bleed: this video has dark edges, so cover mode leaves no visible border
  let frames = [];
  let frameCount = 0;
  let bgColor = "#000";
  let currentProgress = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    render(currentProgress);
  }

  function sampleBgColor(img) {
    try {
      const c = document.createElement("canvas");
      c.width = 8; c.height = 8;
      const cx = c.getContext("2d");
      cx.drawImage(img, 0, 0, 8, 8);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
    } catch (e) {
      return "#000";
    }
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    if (index % 20 === 0) bgColor = sampleBgColor(img);
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * scale, dh = ih * scale;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // Placeholder: a dark stage with mic stands under a spotlight that brightens with scroll.
  function drawStage(p) {
    const w = canvas.width, h = canvas.height;
    const light = Math.min(1, p * FRAME_SPEED * 1.4);
    const zoom = 1 + Math.min(1, p * FRAME_SPEED) * 0.18;
    ctx.save();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.translate(w / 2, h * 0.62);
    ctx.scale(zoom, zoom);
    ctx.translate(-w / 2, -h * 0.62);

    const floorY = h * 0.78;
    const lightX = w * (0.62 - 0.12 * Math.min(1, p * FRAME_SPEED));

    // light cone
    const cone = ctx.createLinearGradient(0, 0, 0, floorY);
    cone.addColorStop(0, "rgba(255,255,255,0)");
    cone.addColorStop(1, "rgba(255,255,255," + (0.07 * light) + ")");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(lightX - w * 0.02, 0);
    ctx.lineTo(lightX + w * 0.02, 0);
    ctx.lineTo(lightX + w * 0.2, floorY);
    ctx.lineTo(lightX - w * 0.2, floorY);
    ctx.closePath();
    ctx.fill();

    // floor pool
    const pool = ctx.createRadialGradient(lightX, floorY, 0, lightX, floorY, w * 0.32);
    pool.addColorStop(0, "rgba(220,218,212," + (0.22 * light) + ")");
    pool.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(lightX, floorY);
    ctx.scale(1, 0.22);
    ctx.translate(-lightX, -floorY);
    ctx.fillStyle = pool;
    ctx.fillRect(0, floorY - w * 0.35, w, w * 0.7);
    ctx.restore();

    const unit = Math.min(w, h) / 100;
    const tone = Math.round(18 + 62 * light);
    ctx.strokeStyle = "rgb(" + tone + "," + tone + "," + (tone - 3) + ")";
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineCap = "round";

    function stand(x, height, boomDir, s) {
      const top = floorY - height * unit * s;
      ctx.lineWidth = 0.3 * unit * s;
      ctx.beginPath();
      ctx.moveTo(x, floorY - 6 * unit * s); ctx.lineTo(x, top);
      ctx.moveTo(x, floorY - 6 * unit * s); ctx.lineTo(x - 7 * unit * s, floorY);
      ctx.moveTo(x, floorY - 6 * unit * s); ctx.lineTo(x + 7 * unit * s, floorY);
      ctx.moveTo(x, floorY - 6 * unit * s); ctx.lineTo(x + 1.5 * unit * s, floorY + 1.5 * unit * s);
      ctx.moveTo(x, top); ctx.lineTo(x + boomDir * 16 * unit * s, top - 6 * unit * s);
      ctx.stroke();
      ctx.save();
      ctx.translate(x + boomDir * 16 * unit * s, top - 6 * unit * s);
      ctx.rotate(boomDir * 0.35);
      ctx.beginPath();
      ctx.ellipse(boomDir * 2.4 * unit * s, 0, 2.4 * unit * s, 0.9 * unit * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function stool(x, s) {
      const seat = floorY - 14 * unit * s;
      ctx.lineWidth = 0.3 * unit * s;
      ctx.fillRect(x - 4.5 * unit * s, seat - 0.6 * unit * s, 9 * unit * s, 1 * unit * s);
      ctx.beginPath();
      ctx.moveTo(x - 4 * unit * s, seat); ctx.lineTo(x - 5 * unit * s, floorY);
      ctx.moveTo(x + 4 * unit * s, seat); ctx.lineTo(x + 5 * unit * s, floorY);
      ctx.moveTo(x - 4.5 * unit * s, seat + 8 * unit * s); ctx.lineTo(x + 4.5 * unit * s, seat + 8 * unit * s);
      ctx.stroke();
    }

    stand(w * 0.5, 30, 1, 1);
    stool(w * 0.56, 0.9);
    stand(lightX + w * 0.04, 36, -1, 1.15);
    stool(lightX - w * 0.02, 1.05);
    stand(w * 0.3, 26, 1, 0.8);

    ctx.restore();

    // vignette
    const v = ctx.createRadialGradient(w / 2, h * 0.6, Math.min(w, h) * 0.25, w / 2, h * 0.6, Math.max(w, h) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.85)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  function render(progress) {
    currentProgress = progress;
    if (frameCount) {
      const accelerated = Math.min(progress * FRAME_SPEED, 1);
      drawFrame(Math.min(Math.floor(accelerated * frameCount), frameCount - 1));
    } else {
      drawStage(progress);
    }
  }

  function setLoader(ratio) {
    document.getElementById("loader-bar").style.width = Math.round(ratio * 100) + "%";
    document.getElementById("loader-percent").textContent = toFa(Math.round(ratio * 100)) + "٪";
  }

  function finishLoading() {
    setLoader(1);
    document.getElementById("loader").classList.add("is-done");
    document.body.classList.remove("is-loading");
  }

  async function loadFrames() {
    let manifest = null;
    try {
      const res = await fetch("frames/manifest.json", { cache: "no-cache" });
      if (res.ok) manifest = await res.json();
    } catch (e) { /* no frames yet */ }
    if (!manifest || !manifest.count) return;

    const useMobile = isMobile && manifest.mobile && manifest.mobileCount;
    const dir = useMobile ? "frames/mobile/" : "frames/";
    const ext = manifest.ext || "webp";
    const total = useMobile ? manifest.mobileCount : manifest.count;
    let loaded = 0;
    const loadOne = (i) => new Promise((resolve) => {
      const img = new Image();
      img.onload = img.onerror = () => { loaded++; setLoader(loaded / total); resolve(); };
      img.src = dir + "frame_" + String(i + 1).padStart(4, "0") + "." + ext;
      frames[i] = img;
    });

    // first frames fast, then the rest
    const first = Math.min(10, total);
    await Promise.all(Array.from({ length: first }, (_, i) => loadOne(i)));
    frameCount = total;
    render(currentProgress);
    await Promise.all(Array.from({ length: total - first }, (_, i) => loadOne(i + first)));
  }

  /* ------------------------------------------------------------------
     Scroll choreography
     ------------------------------------------------------------------ */
  function initScrollSequence() {
    const container = document.getElementById("scroll-container");
    const hero = document.getElementById("hero");
    const heroInner = hero.querySelector(".hero-inner");
    const canvasWrap = document.querySelector(".canvas-wrap");
    const marquee = document.querySelector(".marquee-wrap");
    const header = document.querySelector(".site-header");
    const progressBar = document.getElementById("progress-bar");

    // Circle-wipe reveal as the hero scrolls away
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const radius = Math.min(1, self.progress * 1.3) * 75;
        canvasWrap.style.clipPath = "circle(" + radius + "% at 50% 60%)";
        heroInner.style.opacity = String(Math.max(0, 1 - self.progress * 1.6));
      }
    });

    // Frames, marquee
    ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        render(self.progress);
        const p = self.progress;
        let o = 0;
        if (p > 0.12 && p < 0.9) o = Math.min(1, (p - 0.12) / 0.08, (0.9 - p) / 0.08);
        marquee.style.opacity = String(o);
      }
    });
    if (!reducedMotion) {
      gsap.to(".marquee-text", {
        xPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: container, start: "top bottom", end: "bottom bottom", scrub: true }
      });
    }

    ScrollTrigger.create({
      trigger: container,
      start: "bottom top",
      onEnter: () => document.body.classList.add("past-sequence"),
      onLeaveBack: () => document.body.classList.remove("past-sequence")
    });

    // Header background and page progress
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        header.classList.toggle("is-solid", self.scroll() > window.innerHeight * 0.6);
        progressBar.style.transform = "scaleX(" + self.progress.toFixed(3) + ")";
      }
    });

    // Text beats: each with its own entrance
    container.querySelectorAll(".beat").forEach((beat) => {
      const enter = parseFloat(beat.dataset.enter) / 100;
      const leave = parseFloat(beat.dataset.leave) / 100;
      const persist = beat.dataset.persist === "true";
      beat.style.top = ((enter + leave) / 2) * 100 + "%";
      const children = beat.querySelectorAll(".beat-heading, .beat-body, .beat-cta");
      const tl = gsap.timeline({ paused: true });
      const from = { opacity: 0, stagger: 0.14, duration: 0.9, ease: "power3.out" };
      switch (beat.dataset.animation) {
        case "slide-in": tl.from(children, Object.assign({ x: 80 }, from)); break;
        case "scale-up": tl.from(children, Object.assign({ scale: 0.88, ease: "power2.out", duration: 1 }, from)); break;
        case "clip-reveal": tl.from(children, Object.assign({ clipPath: "inset(100% 0 0 0)", y: 20, ease: "power4.inOut", duration: 1.1 }, from)); break;
        default: tl.from(children, Object.assign({ y: 50 }, from));
      }
      if (reducedMotion) tl.progress(1);
      let active = false;
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const p = self.progress;
          const shouldBeActive = persist ? p >= enter : p >= enter && p <= leave;
          if (shouldBeActive === active) return;
          active = shouldBeActive;
          beat.classList.toggle("is-active", active);
          if (reducedMotion) return;
          active ? tl.play() : tl.reverse();
        }
      });
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  fillStoreData();
  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);
  renderProducts();
  initForm();

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    initSmoothScroll();
    initScrollSequence();
  }
  initMenu();

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  loadFrames().finally(() => {
    finishLoading();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
