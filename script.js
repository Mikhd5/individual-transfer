(() => {
  'use strict';

  document.documentElement.classList.add('js-enabled');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.getElementById('site-loader');
  const siteContent = document.querySelector('.site-shell');
  const floatingShortcut = document.querySelector('.floating-wa');

  // The intro is opt-in through JavaScript, so the site remains usable if JS is blocked.
  if (loader) {
    document.body.classList.add('loader-active');
    [siteContent, floatingShortcut].forEach((element) => {
      if (element) {
        element.setAttribute('inert', '');
        element.setAttribute('aria-hidden', 'true');
      }
    });

    const value = document.getElementById('loader-progress-value');
    const label = document.getElementById('loader-progress-label');
    const progressBar = document.getElementById('loader-progress-fill');
    const skip = document.getElementById('loader-skip');
    const startedAt = performance.now();
    let progress = 0;
    let closed = false;
    let pendingClose = 0;
    let domReady = document.readyState !== 'loading';

    const paintProgress = (next) => {
      progress = Math.max(progress, Math.min(100, Math.round(next)));
      if (progressBar) progressBar.value = progress;
      if (value) value.textContent = `${String(progress).padStart(2, '0')}%`;
      if (label) {
        label.textContent = progress >= 100 ? 'МАРШРУТ ГОТОВИЙ' : 'ГОТУЄМО ВАШ МАРШРУТ';
      }
    };

    const progressTimer = window.setInterval(() => {
      if (closed || progress >= 94) return;
      const target = domReady ? 100 : 92;
      paintProgress(progress + Math.max(0.6, (target - progress) * 0.075));
    }, 42);

    const closeLoader = (immediate = false) => {
      if (closed) return;
      const remaining = Math.max(0, 850 - (performance.now() - startedAt));
      if (!immediate && remaining > 0) {
        if (!pendingClose) {
          pendingClose = window.setTimeout(() => closeLoader(true), remaining);
        }
        return;
      }

      closed = true;
      if (pendingClose) window.clearTimeout(pendingClose);
      window.clearInterval(progressTimer);
      paintProgress(100);
      loader.classList.add('is-hidden');
      loader.setAttribute('aria-hidden', 'true');
      [siteContent, floatingShortcut].forEach((element) => {
        if (element) {
          element.removeAttribute('inert');
          element.removeAttribute('aria-hidden');
        }
      });
      document.body.classList.remove('loader-active');
      window.setTimeout(() => loader.remove(), 760);
    };

    if (!domReady) {
      document.addEventListener('DOMContentLoaded', () => {
        domReady = true;
        closeLoader(false);
      }, { once: true });
    } else {
      closeLoader(false);
    }

    // Failsafe: never leave the intro overlay blocking the site.
    window.setTimeout(() => closeLoader(true), 3600);
    if (skip) skip.addEventListener('click', () => closeLoader(true));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Mobile navigation: keyboard- and screen-reader-friendly open/close behavior.
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  const mobileNav = window.matchMedia('(max-width: 820px)');

  if (toggle && nav) {
    const setMenuOpen = (open, restoreFocus = false) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);

      if (mobileNav.matches) {
        if (open) nav.removeAttribute('inert');
        else nav.setAttribute('inert', '');
      } else {
        nav.removeAttribute('inert');
      }

      if (restoreFocus) toggle.focus();
    };

    const syncMenuForViewport = () => {
      if (!mobileNav.matches) setMenuOpen(false);
      else setMenuOpen(false);
    };

    syncMenuForViewport();
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isOpen);
      if (!isOpen && mobileNav.matches) {
        const firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false, true);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (mobileNav.matches && toggle.getAttribute('aria-expanded') === 'true'
          && !nav.contains(event.target) && !toggle.contains(event.target)) {
        setMenuOpen(false);
      }
    }, { passive: true });

    if (typeof mobileNav.addEventListener === 'function') {
      mobileNav.addEventListener('change', syncMenuForViewport);
    } else if (typeof mobileNav.addListener === 'function') {
      mobileNav.addListener(syncMenuForViewport);
    }
  }

  // Video-only hero: use the lighter encoded video on phones and constrained networks.
  // If autoplay or download is unavailable, keep the stage dark; never show a still photo.
  const heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const useMobileVideo = window.matchMedia('(max-width: 820px)').matches
      || Boolean(connection && ['slow-2g', '2g', '3g'].includes(connection.effectiveType))
      || Boolean(connection && connection.saveData);
    const source = heroVideo.querySelector('source');

    if (source) {
      const selectedSource = useMobileVideo ? source.dataset.mobileSrc : source.dataset.src;
      if (selectedSource) {
        source.src = selectedSource;
        heroVideo.load();
      }
    }

    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    heroVideo.removeAttribute('poster');

    const startHeroVideo = () => {
      if (document.visibilityState === 'hidden' || heroVideo.error || !heroVideo.paused) return;
      const playback = heroVideo.play();
      // Deliberately do not swap to an image if autoplay is blocked: the hero stays dark.
      if (playback && typeof playback.catch === 'function') playback.catch(() => {});
    };

    heroVideo.addEventListener('canplay', startHeroVideo, { once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) heroVideo.pause();
      else startHeroVideo();
    });
    window.addEventListener('pageshow', startHeroVideo);
    startHeroVideo();
  }

  // Keep the date picker from offering dates in the past, using the visitor's local date.
  const dateInput = document.getElementById('trip-date');
  if (dateInput) {
    const now = new Date();
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 10);
    dateInput.min = localToday;
  }

  // Build a plain-text WhatsApp request. User input is never inserted as HTML.
  const phone = '380676768950';
  const form = document.getElementById('transfer-form');
  const status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const raw = (key) => String(data.get(key) || '');
      const singleLine = (key, limit) => raw(key)
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, limit);
      const notes = raw('notes')
        .replace(/\r\n?/g, '\n')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
        .trim()
        .slice(0, 500);
      const dateValue = raw('date');
      const dateLabel = dateValue
        ? new Intl.DateTimeFormat('uk-UA').format(new Date(`${dateValue}T12:00:00`))
        : 'потрібно узгодити';

      const message = [
        'Добрий день! Хочу замовити індивідуальний трансфер.',
        '',
        `Звідки: ${singleLine('from', 160)}`,
        `Куди: ${singleLine('to', 160)}`,
        `Бажана дата: ${dateLabel}`,
        `Пасажири: ${singleLine('passengers', 32)}`,
        `Ім’я: ${singleLine('name', 80)}`,
        `Контактний номер: ${singleLine('contact', 24) || 'узгодити у WhatsApp'}`,
        `Побажання: ${notes || 'немає'}`
      ].join('\n');

      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      if (status) status.textContent = 'Відкриваємо WhatsApp із підготовленою заявкою…';

      // Use a fixed WhatsApp URL and a noreferrer link; no user value becomes a URL host/path.
      const whatsappLink = document.createElement('a');
      whatsappLink.href = url;
      whatsappLink.target = '_blank';
      whatsappLink.rel = 'noopener noreferrer';
      whatsappLink.referrerPolicy = 'no-referrer';
      whatsappLink.textContent = 'Відкрити WhatsApp із підготовленою заявкою';
      if (status) {
        status.replaceChildren(
          document.createTextNode('Заявку підготовлено. Якщо нова вкладка не відкрилася, '),
          whatsappLink
        );
      }
      whatsappLink.click();
    });
  }

  // Reveal effects are progressive enhancement: without JS or with reduced motion,
  // content remains visible instead of being hidden behind an animation class.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    document.documentElement.classList.add('motion-enabled');
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  const floatingWhatsApp = document.querySelector('.floating-wa');
  const bookingSection = document.getElementById('booking');
  if (floatingWhatsApp && bookingSection && 'IntersectionObserver' in window) {
    const bookingObserver = new IntersectionObserver(([entry]) => {
      floatingWhatsApp.classList.toggle('is-obscured', entry.isIntersecting);
    }, { threshold: 0.08 });
    bookingObserver.observe(bookingSection);
  }

  // Keep the accordion tidy on small screens: one answer open at a time.
  const faqItems = Array.from(document.querySelectorAll('.faq-list details'));
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open && window.matchMedia('(max-width: 820px)').matches) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
