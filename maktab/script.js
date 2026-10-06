(function () {
  "use strict";

  /* ---------- Logo: logo.svg yo'q bo'lsa logo.png ---------- */
  document.querySelectorAll("img[data-logo]").forEach(function (img) {
    img.addEventListener("error", function () {
      if (!img.dataset.tried) {
        img.dataset.tried = "1";
        img.src = "images/logo.png";
      } else {
        img.style.display = "none";
      }
    });
  });

  /* ---------- Rasm xatolarini boshqarish ----------
     1-urinish: rasm o'z manzilidan. Ochilmasa 2-urinish: wsrv.nl proxy orqali
     (hotlink bloklarini chetlab o'tadi). Bo'lmasa: chiroyli placeholder. */
  function markPlaceholder(img) {
    var box =
      img.closest("figure, .plan, .g, .cta, .card") || img.parentElement;
    if (!box) return;
    img.classList.add("ph");
    img.setAttribute("aria-hidden", "true");
    img.style.display = "none";
    box.classList.add("ph-wrap");
  }
  function failed(img) {
    var src = img.getAttribute("src") || "";
    if (!img.dataset.retry && /^https?:/.test(src)) {
      img.dataset.retry = "1";
      img.src = "https://wsrv.nl/?w=1400&url=" + encodeURIComponent(src);
    } else {
      markPlaceholder(img);
    }
  }
  document.querySelectorAll("img:not([data-logo])").forEach(function (img) {
    if (img.hasAttribute("data-placeholder") || !img.getAttribute("src")) {
      markPlaceholder(img);
      return;
    }
    img.addEventListener("error", function () {
      failed(img);
    });
    /* lazy rasmlar hali yuklanmagan bo'lsa ham complete=true bo'lishi mumkin, shuning uchun faqat eager rasmlarni tekshiramiz */
    if (img.loading !== "lazy" && img.complete && img.naturalWidth === 0)
      failed(img);
  });

  /* ---------- Header va mobil menyu ---------- */
  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute(
      "aria-label",
      open ? "Menyuni yopish" : "Menyuni ochish",
    );
  }
  burger.addEventListener("click", function () {
    setMenu(!menu.classList.contains("open"));
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      setMenu(false);
    });
  });

  /* ---------- Scroll reveal ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var btns = Array.prototype.slice.call(
    document.querySelectorAll("#galleryGrid .g"),
  );
  var cur = 0,
    lastFocus = null;
  function show(i) {
    cur = (i + btns.length) % btns.length;
    var im = btns[cur].querySelector("img");
    lbImg.src = im.src;
    lbImg.alt = im.alt;
    lbCap.textContent = btns[cur].dataset.t;
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lbX").focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  btns.forEach(function (b, i) {
    b.type = "button";
    b.addEventListener("click", function () {
      openLb(i);
    });
  });
  document.getElementById("lbX").addEventListener("click", closeLb);
  document.getElementById("lbP").addEventListener("click", function () {
    show(cur - 1);
  });
  document.getElementById("lbN").addEventListener("click", function () {
    show(cur + 1);
  });
  lb.addEventListener("click", function (e) {
    if (e.target === lb) closeLb();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!lb.hidden) closeLb();
      setMenu(false);
    }
    if (lb.hidden) return;
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });

  /* ---------- Xarita (Leaflet + OpenStreetMap) ----------
     Koordinatalar qo'lda yozilmagan. Joylar OpenStreetMap
     qidiruvi (Nominatim) orqali topiladi; topilmasa marker qo'yilmaydi.
     Aniq koordinata qo'shish uchun: { name, info, location, lat, lng } */
  var PLACES = [
    {
      name: "Chimyon",
      q: "Chimyon, Fergana Region, Uzbekistan",
      info: "Tog‘li tabiat maskani.",
      location: "Farg‘ona tumani",
    },
    {
      name: "Vodil",
      q: "Vodil, Fergana Region, Uzbekistan",
      info: "Tog‘ manzaralari va qishloq.",
      location: "Farg‘ona tumani",
    },
    {
      name: "Huvaydo ziyoratgohi",
      q: "Huvaydo, Fergana Region, Uzbekistan",
      info: "Tarixiy ziyoratgoh.",
      location: "Farg‘ona tumani",
    },
    {
      name: "Shohimardon",
      q: "Shohimardon, Fergana Region, Uzbekistan",
      info: "Hazrat Ali Shohimardon ziyoratgohi.",
      location: "Farg‘ona viloyati",
    },
  ];
  var note = document.getElementById("mapnote");
  if (window.L) {
    var map = L.map("leaflet", { scrollWheelZoom: false }).setView(
      [41.3, 64.5],
      5,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    var pts = [];
    function addMarker(p, lat, lng) {
      var m = L.marker([lat, lng]).addTo(map);
      var el = document.createElement("div");
      el.innerHTML = "<strong></strong><br><span></span><br><em></em>";
      el.querySelector("strong").textContent = p.name;
      el.querySelector("span").textContent = p.info;
      el.querySelector("em").textContent = p.location;
      m.bindPopup(el);
      pts.push([lat, lng]);
      map.fitBounds(pts, { padding: [40, 40], maxZoom: 11 });
    }
    PLACES.forEach(function (p) {
      if (typeof p.lat === "number") {
        addMarker(p, p.lat, p.lng);
        return;
      }
      fetch(
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
          encodeURIComponent(p.q),
      )
        .then(function (r) {
          return r.json();
        })
        .then(function (d) {
          if (d && d[0])
            addMarker(p, parseFloat(d[0].lat), parseFloat(d[0].lon));
        })
        .catch(function () {})
        .then(function () {
          if (!pts.length && note)
            note.textContent = "Markerlar yuklanmoqda yoki topilmadi.";
          else if (note) note.textContent = "";
        });
    });
  } else if (note) {
    note.textContent = "Xaritani yuklab bo‘lmadi.";
  }
})();
