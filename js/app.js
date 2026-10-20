(() => {
  "use strict";

  // ========== الإعدادات ==========
  const LANGUAGES = ["ar", "en", "tr", "fr"];
  const WHATSAPP_NUMBER = "963991310740";
  const PAGE = document.body.dataset.p || "home";

  // البيانات القادمة من data.js و i18n.js
  const TRANSLATIONS = typeof K !== "undefined" && K ? K : {};
  const PRODUCTS = typeof P !== "undefined" && Array.isArray(P) ? P : [];
  const DESCRIPTIONS = typeof OD !== "undefined" && OD ? OD : {};

  const PAGE_LIST = [
    ["home", "index.html", "nav.home"],
    ["mf", "bedding.html", "t.mf"],
    ["hm", "home.html", "t.hm"],
    ["of", "office.html", "t.of"],
    ["ct", "contact.html", "t.ct"],
  ];

  const SUBCATEGORIES = {
    mf: ["beds", "mattresses"],
    hm: ["bedroom", "dining", "sitting", "tables"],
    of: ["exec", "work", "ops", "meet", "recep", "store", "school", "seat"],
  };

  const FILTERS = { mf: "all", hm: "all", of: "all" };

  let language = 0;
  let currentProduct = null;
  let currentImageIndex = 0;
  let observer = null;
  let revealObserver = null;
  let mobilePreview = null;
  let lightbox = null;
  let navigation = null;

  // ========== Firebase ==========
  const firebaseConfig = {
    apiKey: "AIzaSyD-bac9kfXCRvLrBR8GrfMn5E4YQ8rl41A",
    authDomain: "konfor-c1128.firebaseapp.com",
    projectId: "konfor-c1128",
    storageBucket: "konfor-c1128.firebasestorage.app",
    messagingSenderId: "986871870236",
    appId: "1:986871870236:web:22d2216996e46c978480d9",
    measurementId: "G-Z0975DMLLK",
  };

  if (typeof firebase !== "undefined" && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  function detectSection(item) {
    let s = "mf";
    let u = "beds";
    const cat = String(item.category || item.section || "").toLowerCase();

    if (/home|hm|منزل/.test(cat)) {
      s = "hm";
      u = "bedroom";
    } else if (/office|^of$|مكتب/.test(cat)) {
      s = "of";
      u = "exec";
    }
    return { s, u };
  }

  // تبديل ملف PDF الخاص بالقسم (الزر الأصلي أعلى الصفحة) من لوحة التحكم
  function loadCatalogs() {
    if (typeof firebase === "undefined") return;
    const btn = document.querySelector("a.dl");
    if (!btn) return;

    firebase
      .firestore()
      .collection("catalogs")
      .doc(PAGE)
      .onSnapshot(
        (doc) => {
          const data = doc.exists ? doc.data() : null;
          if (data && data.pdfUrl) {
            btn.href = data.pdfUrl;
            btn.setAttribute("download", (data.name || "catalog") + ".pdf");
          }
        },
        (err) => console.error("Catalog error:", err)
      );
  }

  function fetchFirebaseProducts(onReady) {
    if (typeof firebase === "undefined") {
      console.error("Firebase library not loaded");
      if (onReady) onReady();
      return;
    }

    const db = firebase.firestore();

    db.collection("products").onSnapshot(
      (snapshot) => {
        const staticProducts = PRODUCTS.filter((p) => !p.isFirebase);
        const firebaseProducts = [];

        snapshot.forEach((doc) => {
          const item = doc.data();
          const { s, u } = detectSection(item);
          const desc = item.desc || "";
          const imgs =
            Array.isArray(item.images) && item.images.length
              ? item.images
              : item.imageUrl
              ? [item.imageUrl]
              : [0];

          firebaseProducts.push({
            isFirebase: true,
            id: doc.id,
            s,
            u,
            n: item.title || "منتج جديد",
            d: [desc, desc, desc, desc],
            z: item.size || "",
            i: imgs,
          });
        });

        PRODUCTS.length = 0;
        PRODUCTS.push(...firebaseProducts, ...staticProducts);

        if (onReady) onReady();
      },
      (err) => {
        console.error("Firestore error:", err);
        if (onReady) onReady();
      }
    );
  }

  // استرجاع اللغة المحفوظة
  try {
    const savedIndex = LANGUAGES.indexOf(localStorage.getItem("kl"));
    if (savedIndex !== -1) language = savedIndex;
  } catch {}

  // ========== أدوات مساعدة ==========
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  function createElement(tag, className = "", text = null) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== null && text !== undefined) element.textContent = String(text);
    return element;
  }

  function translate(key) {
    const value = TRANSLATIONS[key];
    if (Array.isArray(value)) return value[language] ?? value[0] ?? key;
    return value ?? key;
  }

  function localizedValue(value, fallback = "") {
    if (Array.isArray(value)) return value[language] ?? value[0] ?? fallback;
    return value ?? fallback;
  }

  function productName(product) {
    return localizedValue(product.n, "Product");
  }

  function productDescription(product) {
    return localizedValue(
      product.d,
      localizedValue(DESCRIPTIONS[product.u], "")
    );
  }

  function categoryName(product) {
    return translate(`t.${product.s}`);
  }

  function getProductImage(product, index = 0, fullSize = false) {
    const imageId = product.i[index];
    if (
      typeof imageId === "string" &&
      (imageId.startsWith("data:") || imageId.startsWith("http"))
    ) {
      return imageId;
    }
    return `images/${fullSize ? "f" : "t"}/${encodeURIComponent(imageId)}.webp`;
  }

  function observeReveal(element) {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("in");
  }

  // ========== الأيقونات ==========
  const FLOWER_ICON = `
    <svg width="30" height="30" viewBox="-36 -36 72 72" fill="currentColor" aria-hidden="true">
      <path d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/>
      <path transform="rotate(72)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/>
      <path transform="rotate(144)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/>
      <path transform="rotate(216)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/>
      <path transform="rotate(288)" d="M0-3C-11-11-10-26 0-33C10-26 11-11 0-3Z"/>
    </svg>
  `;

  const WHATSAPP_ICON = `
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 13.8c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.2 1.3 2.5 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/>
    </svg>
  `;

  function createWhatsAppURL(product) {
    const message = translate("msg")
      .replace("{n}", productName(product))
      .replace("{c}", categoryName(product));
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function setWhatsAppLink(element) {
    if (element) element.href = `https://wa.me/${WHATSAPP_NUMBER}`;
  }

  // ========== التنقل ==========
  function initializeNavigation() {
    navigation = createElement("nav");

    navigation.innerHTML = `
      <a class="logo" href="index.html" aria-label="KONFOR">
        ${FLOWER_ICON}
        <span>KONFOR</span>
      </a>

      <div class="menu" id="menu">
        <div class="lk"></div>

        <div class="lw">
          <span data-k="lang"></span>
          <div class="lsw" aria-label="Language selector"></div>
        </div>

        <a class="nb" href="contact.html">
          <span class="ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M8 7h9v9"/>
            </svg>
          </span>
          <span data-k="h.b2"></span>
        </a>
      </div>

      <button class="bg" id="bg" type="button" aria-label="Open menu"
        aria-controls="menu" aria-expanded="false">☰</button>
    `;

    const links = $(".lk", navigation);
    const languageSwitcher = $(".lsw", navigation);

    PAGE_LIST.forEach(([key, href, translationKey]) => {
      const link = createElement("a");
      link.href = href;
      link.dataset.k = translationKey;
      link.dataset.pg = key;
      links.append(link);
    });

    ["عربي", "EN", "TR", "FR"].forEach((label, index) => {
      const button = createElement("button", "", label);
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        language = index;
        try {
          localStorage.setItem("kl", LANGUAGES[index]);
        } catch {}
        render();
      });
      languageSwitcher.append(button);
    });

    document.body.prepend(navigation);

    const menuButton = $("#bg", navigation);
    const menu = $("#menu", navigation);

    function closeMenu() {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }

    menuButton.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    $$(".lk a", navigation).forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (menu.classList.contains("open") && !navigation.contains(event.target)) {
        closeMenu();
      }
    });

    function updateNavigationStyle() {
      navigation.classList.toggle("solid", PAGE !== "home" || window.scrollY > 60);
    }

    updateNavigationStyle();
    window.addEventListener("scroll", updateNavigationStyle, { passive: true });
  }

  function initializeFooter() {
    document.body.append(createElement("footer", "", "© KONFOR · ALKURDI GROUP"));
  }

  // ========== الصفحة الرئيسية ==========
  function initializeHome() {
    const collectionGrid = $("#cc");

    if (collectionGrid) {
      ["mf", "hm", "of"].forEach((category) => {
        const product = PRODUCTS.find((item) => item.s === category);
        const page = PAGE_LIST.find((item) => item[0] === category);

        if (!product || !product.i?.length || !page) return;

        const link = createElement("a", "cc rv");
        link.href = page[1];

        const image = createElement("img");
        image.src = getProductImage(product);
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";

        const arrow = createElement("b", "", "→");
        arrow.setAttribute("aria-hidden", "true");

        const content = createElement("div");
        const heading = createElement("h3");
        heading.dataset.k = `t.${category}`;
        const description = createElement("p");
        description.dataset.k = `s.${category}`;

        content.append(heading, description);
        link.append(image, arrow, content);
        collectionGrid.append(link);
        observeReveal(link);
      });
    }

    const heroVideo = $("#hv");
    if (heroVideo) {
      heroVideo.addEventListener("error", () => heroVideo.remove(), { once: true });
      if (typeof heroVideo.play === "function") {
        const playback = heroVideo.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch(() => {});
        }
      }
    }
  }

  // ========== المراقبات (Observers) ==========
  function initializeRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      revealObserver = null;
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            instance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
  }

  function initializeGridObserver() {
    if (!("IntersectionObserver" in window)) {
      observer = null;
      return;
    }
    observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            instance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
  }

  // ========== بطاقات المنتجات ==========
  function buildProductCard(product, index) {
    const card = createElement("article", "card");
    card.style.transitionDelay = `${(index % 3) * 90}ms`;

    const imageButton = createElement("button", "cv");
    imageButton.type = "button";
    imageButton.setAttribute("aria-label", productName(product));

    const image = createElement("img");
    image.src = getProductImage(product);
    image.alt = productName(product);
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 440;
    image.height = 330;
    image.addEventListener(
      "error",
      () => imageButton.classList.add("image-error"),
      { once: true }
    );

    const badge = createElement(
      "span",
      "bd",
      product.isFirebase
        ? product.i.length > 1
          ? `${product.i.length} ${translate("ph")}`
          : "جديد"
        : `${product.i.length} ${translate("ph")}`
    );

    imageButton.append(image, badge);
    imageButton.addEventListener("click", () => openLightbox(product));

    const info = createElement("div", "info");
    info.append(
      createElement("h3", "", productName(product)),
      createElement("p", "d", productDescription(product))
    );

    if (product.z) info.append(createElement("p", "z", product.z));

    const buyLink = createElement("a", "buy");
    buyLink.innerHTML = WHATSAPP_ICON;
    buyLink.append(createElement("span", "", translate("buy")));
    buyLink.href = createWhatsAppURL(product);
    buyLink.target = "_blank";
    buyLink.rel = "noopener noreferrer";
    info.append(buyLink);

    card.append(imageButton, info);
    return card;
  }

  function renderGrid() {
    const chips = $("#chips");
    const grid = $("#grid");
    if (!chips || !grid) return;

    if (observer) observer.disconnect();

    chips.replaceChildren();
    grid.replaceChildren();

    const categories = ["all", ...(SUBCATEGORIES[PAGE] || [])];

    categories.forEach((category) => {
      const button = createElement(
        "button",
        FILTERS[PAGE] === category ? "on" : "",
        translate(`u.${category}`)
      );
      button.type = "button";
      button.setAttribute("aria-pressed", String(FILTERS[PAGE] === category));
      button.addEventListener("click", () => {
        FILTERS[PAGE] = category;
        renderGrid();
      });
      chips.append(button);
    });

    const filteredProducts = PRODUCTS.filter(
      (product) =>
        product.s === PAGE &&
        (FILTERS[PAGE] === "all" || product.u === FILTERS[PAGE])
    );

    filteredProducts.forEach((product, index) => {
      if (!Array.isArray(product.i) || product.i.length === 0) return;

      const card = buildProductCard(product, index);
      grid.append(card);

      if (observer) observer.observe(card);
      else card.classList.add("in");
    });
  }

  // ========== المعرض المنبثق (Lightbox) ==========
  function initializeLightbox() {
    lightbox = createElement("div");
    lightbox.id = "lb";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Product gallery");

    lightbox.innerHTML = `
      <button id="cl" type="button" aria-label="Close">×</button>

      <div class="m">
        <button class="ar2" id="pv" type="button" aria-label="Previous image">‹</button>
        <img id="bi" alt="">
        <button class="ar2" id="nx" type="button" aria-label="Next image">›</button>
      </div>

      <div class="t">
        <b id="lt"></b>
        <span id="ld"></span>
        <a class="buy" id="lbb" target="_blank" rel="noopener noreferrer"></a>
      </div>

      <div class="th" id="th"></div>
    `;

    document.body.append(lightbox);

    $("#cl", lightbox).addEventListener("click", closeLightbox);
    $("#pv", lightbox).addEventListener("click", () => showImage(currentImageIndex - 1));
    $("#nx", lightbox).addEventListener("click", () => showImage(currentImageIndex + 1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  function openLightbox(product) {
    if (!product?.i?.length || !lightbox) return;

    currentProduct = product;
    $("#lt", lightbox).textContent = productName(product);
    $("#ld", lightbox).textContent = productDescription(product);

    const buyLink = $("#lbb", lightbox);
    buyLink.replaceChildren();
    buyLink.insertAdjacentHTML("afterbegin", WHATSAPP_ICON);
    buyLink.append(createElement("span", "", translate("buy")));
    buyLink.href = createWhatsAppURL(product);

    const thumbnails = $("#th", lightbox);
    thumbnails.replaceChildren();

    product.i.forEach((imageId, index) => {
      const thumbnail = createElement("img");
      thumbnail.src = getProductImage(product, index);
      thumbnail.alt = `${productName(product)} — ${index + 1}`;
      thumbnail.loading = "lazy";
      thumbnail.tabIndex = 0;

      thumbnail.addEventListener("click", () => showImage(index));
      thumbnail.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showImage(index);
        }
      });

      thumbnails.append(thumbnail);
    });

    showImage(0);
    lightbox.classList.add("on");
    document.body.style.overflow = "hidden";
    $("#cl", lightbox).focus();
  }

  function showImage(index) {
    if (!currentProduct?.i?.length || !lightbox) return;

    const imageCount = currentProduct.i.length;
    currentImageIndex = ((index % imageCount) + imageCount) % imageCount;

    const image = $("#bi", lightbox);
    image.style.animation = "none";
    void image.offsetWidth;
    image.style.animation = "";

    image.src = getProductImage(currentProduct, currentImageIndex, true);
    image.alt = `${productName(currentProduct)} — ${currentImageIndex + 1} / ${imageCount}`;

    $$("#th img", lightbox).forEach((thumbnail, i) => {
      const isActive = i === currentImageIndex;
      thumbnail.classList.toggle("on", isActive);
      if (isActive) thumbnail.setAttribute("aria-current", "true");
      else thumbnail.removeAttribute("aria-current");
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("on");
    document.body.style.overflow = "";
    currentProduct = null;
  }

  // ========== معاينة الجوال ==========
  function initializeMobilePreview() {
    if (window.self !== window.top) return;

    const previewButton = createElement("button");
    previewButton.id = "vm";
    previewButton.type = "button";
    previewButton.addEventListener("click", openMobilePreview);

    mobilePreview = createElement("div");
    mobilePreview.id = "mv";
    mobilePreview.innerHTML = `
      <button id="mx" type="button"></button>
      <div class="ph2"><iframe title="Mobile website preview"></iframe></div>
    `;

    document.body.append(previewButton, mobilePreview);

    $("#mx", mobilePreview).addEventListener("click", closeMobilePreview);
    mobilePreview.addEventListener("click", (event) => {
      if (event.target === mobilePreview) closeMobilePreview();
    });
  }

  function openMobilePreview() {
    if (!mobilePreview) return;
    $("iframe", mobilePreview).src = window.location.href;
    mobilePreview.classList.add("on");
    document.body.style.overflow = "hidden";
    $("#mx", mobilePreview).focus();
  }

  function closeMobilePreview() {
    if (!mobilePreview) return;
    mobilePreview.classList.remove("on");
    $("iframe", mobilePreview).src = "about:blank";
    document.body.style.overflow = "";
  }

  // ========== لوحة المفاتيح ==========
  function initializeKeyboardControls() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (lightbox?.classList.contains("on")) closeLightbox();
        if (mobilePreview?.classList.contains("on")) closeMobilePreview();
        return;
      }

      if (!lightbox?.classList.contains("on")) return;

      const direction = document.documentElement.dir === "rtl" ? -1 : 1;

      if (event.key === "ArrowRight") showImage(currentImageIndex + direction);
      else if (event.key === "ArrowLeft") showImage(currentImageIndex - direction);
    });
  }

  // ========== العرض الرئيسي ==========
  function render() {
    document.documentElement.lang = LANGUAGES[language];
    document.documentElement.dir = language === 0 ? "rtl" : "ltr";

    $$("[data-k]").forEach((element) => {
      element.textContent = translate(element.dataset.k);
    });

    if (navigation) {
      $$(".lk a", navigation).forEach((link) => {
        const isActive = link.dataset.pg === PAGE;
        link.classList.toggle("on", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });

      $$(".lsw button", navigation).forEach((button, index) => {
        const isActive = index === language;
        button.classList.toggle("on", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      const indicator = $(".lsw i", navigation);
      if (indicator) {
        indicator.style.transform = `translateX(${language * 42}px)`;
      }
    }

    const previewButton = $("#vm");
    const closeButton = $("#mx");
    if (previewButton) previewButton.textContent = translate("vm");
    if (closeButton) closeButton.textContent = translate("close");

    const page = PAGE_LIST.find((item) => item[0] === PAGE);
    if (page) document.title = `KONFOR — ${translate(page[2])}`;

    renderGrid();
    setWhatsAppLink($("#wal"));
  }

  // ========== التشغيل ==========
  function initialize() {
    initializeRevealObserver();
    initializeGridObserver();
    initializeNavigation();
    initializeFooter();
    initializeHome();
    initializeLightbox();
    initializeMobilePreview();
    initializeKeyboardControls();

    $$(".rv, .ci").forEach(observeReveal);

    // عرض فوري للمحتوى الثابت، حتى لو تأخر Firebase
    render();

    // ثم تحديث العرض عند وصول منتجات Firestore
    fetchFirebaseProducts(render);

    // تبديل كتالوج PDF الخاص بالقسم
    loadCatalogs();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
