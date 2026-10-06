# Farg‘ona tumani — turizm sayti

Statik sayt: HTML5, CSS3, Vanilla JS, Leaflet + OpenStreetMap. Backend va build kerak emas.

## 1. Loyihani ishga tushirish
`index.html` faylini brauzerda oching. Yoki: `python3 -m http.server 8000` va `http://localhost:8000`.

## 2. Netlify'ga joylashtirish
1. https://app.netlify.com/drop sahifasini oching.
2. `fargona-tourism` papkasini sudrab tashlang.
3. Build command bo‘sh, publish directory — papkaning o‘zi.
4. Tayyor havolani oching va tekshiring.

## 3. Logo qayerga joylashtiriladi
Prepared logo file should be placed in `assets/logo.svg`.
Agar logo PNG bo‘lsa: `assets/logo.png` (SVG topilmasa sayt avtomatik PNG'ni ishlatadi).

## 4. Logo nomini o‘zgartirish
`index.html` ichida `src="assets/logo.svg"` (header va footer, 2 joyda) ni o‘zingizning fayl nomingizga almashtiring.
Hajmi: `style.css` ichida `.site-logo` (`height`, `max-width`).

## 5. Rasm URL'larini almashtirish
`index.html` da `<img src="...">` qiymatini o‘zgartiring. Hero va CTA uchun `style.css` dagi `.hero` background URL'ini ham yangilang.
Xo‘jam Podshoh kartasida rasm yo‘q: `src=""` ga to‘g‘ridan-to‘g‘ri rasm URL'ini yozing va `data-placeholder` atributini olib tashlang.

## 6. Saytni o‘zgartirish
- Matnlar: `index.html`
- Ranglar: `style.css` boshidagi `:root`
- Xarita joylari: `script.js` ichidagi `PLACES`. Tasdiqlangan koordinata bo‘lsa `lat` va `lng` qo‘shing.

Eslatma: sayt koordinatalarni o‘ylab topmaydi; markerlar OpenStreetMap qidiruvi orqali topiladi.
