/**
 * Roberto & Rossella · Wedding Landing
 * script.js — Animazioni premium con GSAP
 *
 * ✏️ Modifica WEDDING_DATE per aggiornare il countdown.
 */

'use strict';

/* ── Configurazione ────────────────────────────────────── */
// ✏️ Data del matrimonio (ISO 8601): anno-mese-giorno ore:minuti
const WEDDING_DATE = new Date('2026-09-27T11:00:00');


/* ── Attendi GSAP ──────────────────────────────────────── */
function initAll() {
  initEnvelope();
  initCountdown();
  /* ScrollTrigger reveal viene init DOPO apertura */
}

/* Fallback: se GSAP non è ancora caricato (defer), aspetta */
if (typeof gsap === 'undefined') {
  window.addEventListener('load', initAll);
} else {
  initAll();
}


/* ============================================================
   ENVELOPE ANIMATION
   ============================================================ */
function initEnvelope() {
  const intro      = document.getElementById('intro');
  const landing    = document.getElementById('landing');
  const openBtn    = document.getElementById('openInvite');
  const seal       = openBtn.querySelector('.envelope__seal');
  const flap       = openBtn.querySelector('.envelope__flap');

  if (!intro || !landing || !openBtn) return;

  let hasOpened = false;

  function openInvite() {
    if (hasOpened) return;
    hasOpened = true;

    /* Disabilita interazione busta */
    openBtn.setAttribute('disabled', 'true');
    openBtn.style.pointerEvents = 'none';

    const tl = gsap.timeline();

    /* ── Fase 1 · Sigillo (0–0.5s) ─── */
    tl.to(seal, {
      duration: .45,
      scale: 1.22,
      rotation: -9,
      opacity: 0,
      filter: 'blur(4px)',
      transformOrigin: '50% 50%',
      ease: 'power2.out',
    });

    /* ── Fase 2 · Busta sfuma (0.2–1.4s) ─── */
    tl.to(flap, {
      duration: .7,
      rotateX: 48,
      opacity: .6,
      ease: 'power1.inOut',
    }, '-=0.1');

    tl.to(openBtn, {
      duration: 1.0,
      opacity: 0,
      filter: 'blur(8px)',
      scale: .97,
      ease: 'power2.inOut',
    }, '-=0.5');

    tl.to(intro, {
      duration: .55,
      opacity: 0,
      ease: 'power2.inOut',
      onComplete: () => {
        intro.classList.add('is-gone');
        intro.setAttribute('aria-hidden', 'true');
      }
    }, '-=0.4');

    /* ── Fase 3 · Landing reveal ─── */
    landing.classList.add('is-visible');
    landing.setAttribute('aria-hidden', 'false');

    tl.fromTo(landing, {
      opacity: 0,
      filter: 'blur(10px)',
      scale: .985,
    }, {
      duration: 1.4,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      ease: 'power2.out',
      onComplete: initScrollReveals,
    }, '-=0.35');
  }

  openBtn.addEventListener('click', openInvite);
  openBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openInvite();
    }
  });
}


/* ============================================================
   SCROLL REVEALS (attivati solo dopo apertura)
   ============================================================ */
function initScrollReveals() {
  if (typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* Hero: anima i figli .reveal-item immediatamente (già visibili) */
  const heroItems = document.querySelectorAll('.hero .reveal-item');
  gsap.fromTo(heroItems, {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)',
  }, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 1,
    stagger: .18,
    ease: 'power2.out',
    delay: .1,
  });

  /* Tutte le altre sezioni: reveal su scroll */
  const scrollItems = document.querySelectorAll(
    '.section .reveal-item, .footer .reveal-item'
  );

  scrollItems.forEach((el) => {
    gsap.fromTo(el, {
      opacity: 0,
      y: 26,
      filter: 'blur(3px)',
    }, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: .9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  /* Event cards: stagger per riga */
  document.querySelectorAll('.event__card').forEach((card, i) => {
    /* Già gestito sopra via reveal-item, ma aggiungiamo stagger */
    gsap.fromTo(card, {
      opacity: 0,
      y: 30,
      scale: .97,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: .8,
      delay: i * .1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });
}


/* ============================================================
   COUNTDOWN DINAMICO
   ============================================================ */
function initCountdown() {
  const elDays  = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMin   = document.getElementById('cd-min');
  const elSec   = document.getElementById('cd-sec');

  if (!elDays) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now   = Date.now();
    const delta = WEDDING_DATE - now;

    if (delta <= 0) {
      elDays.textContent  = '00';
      elHours.textContent = '00';
      elMin.textContent   = '00';
      elSec.textContent   = '00';
      /* Messaggio festivo opzionale */
      const section = document.getElementById('countdown-section');
      if (section) {
        const title = section.querySelector('.section__title');
        if (title) title.textContent = '🎉 Oggi è il grande giorno!';
      }
      return;
    }

    const days  = Math.floor(delta / 86400000);
    const hours = Math.floor((delta % 86400000) / 3600000);
    const min   = Math.floor((delta % 3600000)  / 60000);
    const sec   = Math.floor((delta % 60000)    / 1000);

    elDays.textContent  = pad(days);
    elHours.textContent = pad(hours);
    elMin.textContent   = pad(min);
    elSec.textContent   = pad(sec);
  }

  tick();
  setInterval(tick, 1000);
}
