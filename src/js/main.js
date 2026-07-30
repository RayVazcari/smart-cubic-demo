import { initI18n } from './i18n.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  const openIcon = document.querySelector('[data-nav-icon-open]');
  const closeIcon = document.querySelector('[data-nav-icon-close]');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    openIcon?.classList.toggle('hidden', isOpen);
    closeIcon?.classList.toggle('hidden', !isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      openIcon?.classList.remove('hidden');
      closeIcon?.classList.add('hidden');
    });
  });
}

function initHeaderScrollState() {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (prefersReducedMotion) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

function initStaggerGroups() {
  const groups = document.querySelectorAll('[data-reveal-group]');
  if (!groups.length) return;

  groups.forEach((group) => {
    const children = Array.from(group.children);
    children.forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = prefersReducedMotion ? '0ms' : `${i * 80}ms`;
    });
  });

  if (prefersReducedMotion) {
    groups.forEach((group) => {
      Array.from(group.children).forEach((child) => child.classList.add('is-visible'));
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          Array.from(entry.target.children).forEach((child) => child.classList.add('is-visible'));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
  );

  groups.forEach((group) => observer.observe(group));
}

function animateCount(el, target, suffix) {
  const duration = 1300;
  const start = performance.now();
  const isInt = Number.isInteger(target);

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = target * eased;
    el.textContent = `${isInt ? Math.round(value) : value.toFixed(1)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  counters.forEach((el) => {
    const raw = el.dataset.counter;
    const match = raw.match(/[\d.]+/);
    if (!match) return;
    const target = parseFloat(match[0]);
    const suffix = raw.replace(match[0], '');

    if (prefersReducedMotion) {
      el.textContent = raw;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(el, target, suffix);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
  });
}

function initContactForm() {
  const form = document.querySelector('[data-lead-form]');
  if (!form) return;

  const successPanel = document.querySelector('[data-form-success]');
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'wait';

    // No backend is wired up yet — this is the integration point for the future
    // lead-capture pipeline (CRM write + calendar event + AI phone-bot handoff).
    // Simulated delay only; nothing is transmitted.
    window.setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.cursor = '';
      submitBtn.textContent = originalLabel;
      form.classList.add('hidden');
      successPanel?.classList.remove('hidden');
      successPanel?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    }, 700);
  });

  const resetBtn = document.querySelector('[data-form-reset]');
  resetBtn?.addEventListener('click', () => {
    form.reset();
    form.classList.remove('hidden');
    successPanel?.classList.add('hidden');
  });
}

function setYear() {
  const el = document.querySelector('[data-current-year]');
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initNav();
  initHeaderScrollState();
  initScrollReveal();
  initStaggerGroups();
  initCounters();
  initContactForm();
  setYear();
});
