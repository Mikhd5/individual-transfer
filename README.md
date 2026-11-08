# Individual Transfer

Адаптивний лендінг для індивідуальних трансферів з будь-якого міста Західної України до України, Польщі та Чехії.

## Запуск локально

Відкрийте `index.html` у браузері або запустіть локальний вебсервер у цій папці.

## Заявки

Форма збирає маршрут, дату, кількість пасажирів, ім'я, контакт та побажання. Після відправлення відкривається WhatsApp на номер `+380 67 676 8950` з підготовленим текстом. Користувач сам натискає «Надіслати» у WhatsApp; серверна CRM-інтеграція не використовується.

## Брендинг та медіа

- `assets/logo-horizontal.svg` — основний власний векторний логотип.
- `assets/logo-mark.svg` та `assets/favicon.svg` — знак бренду / favicon.
- `assets/destination-ukraine.webp` — надане фото Києва із Софійським собором; `assets/destination-poland.webp` — надане фото Варшави; `assets/destination-czechia.webp` — надане фото Праги з Карловим мостом. Оригінали стиснуті у WebP для швидшого завантаження.
- `assets/transfer-drive.mp4` — оптимізоване фонове відео першого екрана.

## Розгортання

Статичний сайт можна розгорнути на Vercel як проєкт без кроку build. Файл `vercel.json` містить базову конфігурацію.


## Brand and intro loader
- The main header and footer use `assets/logo-primary.webp`, extracted from the supplied primary logo with a transparent background.
- The original transparent master is `assets/logo-primary.png`.
- The opening screen is built with HTML/CSS/SVG (not a flattened image): it animates the gold route line, reveals the brand mark, shows a progress indicator, and includes a skip control.
- The intro automatically dismisses after the DOM is ready and a short minimum display time; a fallback prevents it from blocking the page on slow devices.

## Оптимізація та мобільна версія

- На екранах до 820 px використовується окреме відео 1280×720 / 30 FPS (`assets/transfer-drive-mobile.mp4`) замість desktop-версії 1920×1080 / ~60 FPS.
- Для Data Saver, повільного 2G/2G та `prefers-reduced-motion` відео не завантажується — показується оптимізоване статичне зображення.
- Під час буферизації відеошар приховується, щоб не залишався завмерлий кадр.
- Зображення напрямків додатково стиснуті у WebP без зміни розмірів; фото нижче першого екрана завантажуються ліниво.
- Поля форми мають обмеження довжини та базову браузерну валідацію; на вузьких екранах поля мають розмір шрифту 16 px, щоб iOS не збільшував сторінку при фокусі.

## Посилення безпеки

`vercel.json` додає заголовки CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP та CORP. Ці заголовки застосовуються під час розгортання через Vercel; локальне відкриття `index.html` через `file://` їх не застосовує.

Сторінка не має власного API, бази даних, обробника платежів, сторонніх JavaScript-бібліотек чи секретних ключів. Значення форми обмежуються та збираються в plain-text повідомлення, яке передається в WhatsApp після дії відвідувача; сайт самостійно не зберігає заявки. Не додавайте до цієї форми платіжні дані, паролі чи іншу чутливу інформацію.

Це статичний фронтенд. Серверна валідація, rate limiting, CAPTCHA, захист CRM/API та журнали безпеки не потрібні для поточного потоку WhatsApp і не можуть бути реалізовані лише в HTML/CSS/JS. Вони знадобляться, якщо згодом з'явиться власний backend або база заявок.

## Hero background behavior
The hero uses only the supplied MP4 video (desktop or mobile-optimized source). There is no poster or still-image fallback. Before playback starts, or if the browser cannot play the video, the hero stage stays a plain dark charcoal background. It never displays a separate photo behind or instead of the video.
