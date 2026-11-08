# Технічна перевірка Individual Transfer

## Внесені зміни

- Додані HTTP security headers для Vercel: Content Security Policy без `unsafe-inline` для скриптів і стилів, HSTS, захист від MIME sniffing і clickjacking, Referrer Policy, Permissions Policy, COOP та CORP.
- У коді не знайдені `eval`, `Function`, `document.write`, `innerHTML`, `outerHTML`, inline scripts або inline style attributes.
- Динамічні значення форми не вставляються в HTML. Вони очищуються від керівних символів, обрізаються до заданої довжини та кодуються через `encodeURIComponent` перед передачею у фіксований WhatsApp endpoint.
- Відкриття WhatsApp від'єднує `window.opener`; зовнішні посилання з новою вкладкою мають `noopener noreferrer`.
- Додана мобільна навігація з `inert`, закриттям через Escape та закриттям після переходу за посиланням.
- Інтродукційний екран не блокує сторінку, якщо JavaScript не виконався; основний вміст залишається видимим.

## Оптимізація

- Окремий мобільний відеофайл 1280×720 / 30 FPS — близько 1.7 MB замість desktop 1920×1080 / ~60 FPS — близько 5.4 MB.
- Відео вимикається для Data Saver, повільного 2G/2G та налаштування зменшення анімації.
- Під час буферизації відео приховується й показується статичний fallback, а не завмерлий кадр.
- Зображення для трьох напрямків перекодовані у WebP нижчої ваги із збереженням роздільності 1672×941.
- Додані responsive overrides для полів, типографіки, карток, мобільної навігації та safe-area на iOS.

## Перевірки

- JavaScript syntax check (`node --check`).
- HTML parse, duplicate IDs, локальні asset references, fragment links, alt/dimensions, labels для всіх полів.
- CSS parser check.
- JSON parse для `vercel.json`.
- Перевірена структура та метадані обох MP4.

## Межі перевірки

Це статичний сайт без backend. Форма готує повідомлення та передає його у WhatsApp; заявки не зберігаються на сервері. Тому серверну валідацію, rate limiting, CAPTCHA, захист бази даних або CRM перевірити неможливо — таких компонентів у проєкті немає.

Заголовки безпеки вмикаються на Vercel. Відкриття сайту локально через `file://` не перевіряє HTTP headers. Фактичне тестування на фізичних iOS/Android-пристроях і перевірка заголовків на production-домені мають виконуватись після розгортання.
