/* ==========================================================================
   ARUVIA.DIGITAL — SCRIPT
   Vanilla JS, no dependencies. Organized by feature, each self-contained.
   ========================================================================== */

(function () {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const html = document.documentElement;

  /* ------------------------------------------------------------------------
     1. THEME — persists choice, replays splash on manual toggle
     ------------------------------------------------------------------------ */
  const themeBtn = document.getElementById('themeBtn');
  const themeIcon = document.getElementById('themeIcon');
  const SUN = '<path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5 3.6 3.6M18.4 18.4 20 20M5 19l-1.4 1.4M18.4 5.6 20 4" /><circle cx="12" cy="12" r="4.5" />';
  const MOON = '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />';

  function paintTheme(t) {
    html.setAttribute('data-theme', t);
    themeIcon.innerHTML = t === 'dark' ? MOON : SUN;
  }
  function currentTheme() {
    return localStorage.getItem('av-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  }
  paintTheme(currentTheme());

  function setTheme(t, replaySplash) {
    localStorage.setItem('av-theme', t);
    if (replaySplash && !reduceMotion) {
      playSplash(() => paintTheme(t));
    } else {
      paintTheme(t);
    }
  }
  themeBtn.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true));

  /* ------------------------------------------------------------------------
     2. SPLASH — logo, typed brand name, two cursor blinks, blur transition
     ------------------------------------------------------------------------ */
  const splash = document.getElementById('splash');
  const splashText = document.getElementById('splashText');
  const WORD = 'aruvia.digital';

  function playSplash(onMid) {
    return new Promise((resolve) => {
      splash.classList.remove('hide');
      splashText.textContent = '';
      let i = 0;
      const type = () => {
        if (i <= WORD.length) {
          splashText.textContent = WORD.slice(0, i);
          i++;
          setTimeout(type, 55 + Math.random() * 45);
        } else {
          if (onMid) onMid();
          setTimeout(() => {
            splash.classList.add('hide');
            setTimeout(resolve, 700);
          }, 620); // two cursor blinks (~1.1s cycle) + pause
        }
      };
      type();
    });
  }

  if (reduceMotion) {
    splash.classList.add('hide');
    splashText.textContent = WORD;
  } else {
    playSplash();
  }

  /* ------------------------------------------------------------------------
     3. NAV — hides on scroll down, reappears on scroll up; scrolled state,
        mobile menu, active link on scroll
     ------------------------------------------------------------------------ */
  const nav = document.getElementById('site-nav');
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobile-menu');

  let lastScrollY = window.scrollY;
  let navTicking = false;
  function handleNavScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 12);
    if (mobileMenu.classList.contains('open')) { navTicking = false; return; }
    if (y < 80) {
      nav.classList.remove('hide-nav');
    } else if (y > lastScrollY + 4) {
      nav.classList.add('hide-nav');      // scrolling down -> hide header
    } else if (y < lastScrollY - 4) {
      nav.classList.remove('hide-nav');   // scrolling up -> show header
    }
    lastScrollY = y;
    navTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!navTicking) { requestAnimationFrame(handleNavScroll); navTicking = true; }
  }, { passive: true });

  function closeMenu() {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ------------------------------------------------------------------------
     4. SCROLL REVEAL
     ------------------------------------------------------------------------ */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.14 });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
  }

  /* ------------------------------------------------------------------------
     5. HERO TERMINAL — rotating one-line "commands" describing the studio
     ------------------------------------------------------------------------ */
  const termBody = document.getElementById('termBody');
  const commands = [
    { cmd: 'whoami', out: 'Aruvia Digital — creative studio, Ludhiana' },
    { cmd: 'ls services/', out: 'web-dev  ui-ux  video  thumbnails  social  seo' },
    { cmd: 'cat status.txt', out: '35+ projects shipped · 99% on-time delivery' },
    { cmd: './deploy --fast', out: 'Build complete in 0.8s — ready for review' },
  ];
  let cmdIndex = 0;
  function typeTerminal() {
    if (reduceMotion) {
      termBody.innerHTML = commands.map(c => `<div class="term-line"><span class="prompt">$</span> ${c.cmd}</div><div class="term-line out">${c.out}</div>`).join('');
      return;
    }
    const { cmd, out } = commands[cmdIndex % commands.length];
    termBody.innerHTML = '';
    const line1 = document.createElement('div');
    line1.className = 'term-line';
    line1.innerHTML = '<span class="prompt">$</span> <span class="cmdtxt"></span><span class="term-caret"></span>';
    termBody.appendChild(line1);
    const cmdSpan = line1.querySelector('.cmdtxt');
    let i = 0;
    (function typeChar() {
      if (i <= cmd.length) {
        cmdSpan.textContent = cmd.slice(0, i);
        i++;
        setTimeout(typeChar, 42);
      } else {
        setTimeout(() => {
          line1.querySelector('.term-caret')?.remove();
          const line2 = document.createElement('div');
          line2.className = 'term-line out';
          line2.textContent = out;
          termBody.appendChild(line2);
          cmdIndex++;
          setTimeout(typeTerminal, 2200);
        }, 260);
      }
    })();
  }
  typeTerminal();

  /* ------------------------------------------------------------------------
     6. COUNTERS — count up once in view, and replay on hover
     ------------------------------------------------------------------------ */
  const counters = document.querySelectorAll('.counter-num');
  function runCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    let cur = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur + suffix;
      if (cur < target) requestAnimationFrame(tick);
    };
    el.textContent = '0' + suffix;
    tick();
  }
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }
  document.querySelectorAll('.counter-card').forEach(card => {
    const num = card.querySelector('.counter-num');
    if (num) card.addEventListener('mouseenter', () => runCount(num));
  });

  /* ------------------------------------------------------------------------
     6b. NEON LINE — blinks for ~6s once the About section is reached, then
        settles into a steady glow
     ------------------------------------------------------------------------ */
  const neonLine = document.getElementById('neonLine');
  if (neonLine && 'IntersectionObserver' in window) {
    const nio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (reduceMotion) { neonLine.classList.add('steady'); }
        else {
          neonLine.classList.add('blinking');
          setTimeout(() => { neonLine.classList.remove('blinking'); neonLine.classList.add('steady'); }, 6050);
        }
        nio.unobserve(neonLine);
      });
    }, { threshold: 0.3 });
    nio.observe(neonLine);
  }

  /* ------------------------------------------------------------------------
     7. PRICING TABS — auto-rotates every 10s (with a shrinking progress bar)
        until the user manually picks a tab, then it stays manual forever.
     ------------------------------------------------------------------------ */
  const ptabs = Array.from(document.querySelectorAll('.ptab'));
  const panels = document.querySelectorAll('.price-panel');
  let ptabAutoplay = !reduceMotion;
  let ptabTimer = null;
  let ptabIndex = ptabs.findIndex(t => t.classList.contains('active'));
  if (ptabIndex < 0) ptabIndex = 0;

  function activatePtab(tab, animateCards) {
    ptabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      const bar = t.querySelector('.ptab-bar');
      if (bar) { bar.classList.remove('running'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const cat = tab.dataset.cat;
    panels.forEach(p => {
      const match = p.dataset.cat === cat;
      p.hidden = !match;
      if (match && animateCards) p.querySelectorAll('.price-card').forEach((c, i) => {
        c.style.animation = 'none';
        void c.offsetWidth;
        c.style.animation = `pcIn .45s ease ${i * 0.05}s both`;
      });
    });
    if (ptabAutoplay) {
      const bar = tab.querySelector('.ptab-bar');
      if (bar) bar.classList.add('running');
    }
  }

  function scheduleNextPtab() {
    clearTimeout(ptabTimer);
    if (!ptabAutoplay) return;
    ptabTimer = setTimeout(() => {
      if (!ptabAutoplay) return;
      ptabIndex = (ptabIndex + 1) % ptabs.length;
      activatePtab(ptabs[ptabIndex], true);
      scheduleNextPtab();
    }, 10000);
  }

  ptabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      ptabAutoplay = false; // user took control — stop auto-rotating for good
      clearTimeout(ptabTimer);
      ptabs.forEach(t => t.querySelector('.ptab-bar')?.classList.remove('running'));
      ptabIndex = i;
      activatePtab(tab, true);
    });
  });

  activatePtab(ptabs[ptabIndex], false);
  scheduleNextPtab();

  /* ------------------------------------------------------------------------
     8. TECH BADGE RAIL
     ------------------------------------------------------------------------ */
  const techs = ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Node.js', 'WordPress', 'Shopify', 'Figma', 'UI/UX', 'SEO', 'Automation'];
  const badgeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round"><path d="M8 6 3 12l5 6M16 6l5 6-5 6M14 4l-4 16" /></svg>';
  const badgeRail = document.getElementById('badgeRail');
  if (badgeRail) {
    const html2 = techs.map(t => `<span class="badge">${badgeIcon}${t}</span>`).join('');
    badgeRail.innerHTML = html2 + html2;
  }

  /* ------------------------------------------------------------------------
     9. CAPABILITIES — data, auto-scroll rail, detail modal
     ------------------------------------------------------------------------ */
  const capabilities = [
    { title: 'Website Development', desc: 'Custom-built, fast-loading websites tailored to your brand.', points: ['Fully custom-coded, not a drag-and-drop template', 'Fast load times and clean, SEO-friendly structure', 'Responsive on mobile, tablet and desktop', "Built to match your brand's colours and voice"] },
    { title: 'Landing Pages', desc: 'High-conversion single pages built for campaigns and launches.', points: ['Single focused page built around one goal', 'Clear call-to-action above the fold', 'Optimised for ad traffic and social campaigns', 'Fast to launch, easy to update'] },
    { title: 'Portfolio Websites', desc: 'Showcase-ready sites for creatives, freelancers, and studios.', points: ['Visual-first layout that puts your work front and center', 'Project galleries with smooth transitions', 'Built-in contact and enquiry forms', 'Perfect for freelancers, photographers and studios'] },
    { title: 'Restaurant Websites', desc: 'Menus, gallery, Maps and WhatsApp ordering built in.', points: ['Dynamic menu with categories, prices and photos', 'Google Maps and directions built in', 'Direct WhatsApp ordering — no third-party app', 'Gallery for food and ambience photos'] },
    { title: 'Bakery Websites', desc: 'Warm, visual storefronts with custom order flows.', points: ['Warm, appetite-driving visual design', 'Custom cake/order builder flow', 'Category-wise product showcase', 'WhatsApp-based order collection'] },
    { title: 'Business Websites', desc: 'Professional multi-page sites that build client trust.', points: ['Multi-page structure — Home, About, Services, Contact', 'Professional design that builds instant trust', 'Lead-capture forms and click-to-WhatsApp buttons', 'Easy to hand to clients or investors'] },
    { title: 'UI/UX Design', desc: 'Wireframes to polished interfaces users genuinely enjoy.', points: ['Wireframes before a single pixel of final design', 'User-flow thinking, not just decoration', 'Consistent design system — spacing, type, colour', 'Click-through prototypes before we build'] },
    { title: 'Video Editing', desc: 'Reels, YouTube edits, and brand video content.', points: ['Reels and Shorts edited for retention', 'Colour grading and sound design', 'Captions and on-screen text where needed', 'Fast turnaround for regular posting'] },
    { title: 'Thumbnail Design', desc: 'Scroll-stopping thumbnails engineered for clicks.', points: ['Designed around what actually earns clicks', 'Bold typography and clear focal point', 'A/B-style variants on request', 'Consistent style across your channel'] },
    { title: 'Brand Identity', desc: 'Logos, colour systems, and visual language that stick.', points: ['Logo design with usage guidelines', 'Colour palette and typography system', 'Business card / social kit templates', 'Consistent identity across every platform'] },
    { title: 'SEO', desc: 'On-page and technical SEO that actually moves rankings.', points: ['On-page SEO — titles, meta tags, headings, alt text', 'Site speed and mobile-friendliness optimisation', 'Google Search Console setup and monitoring', 'Local SEO for nearby-customer searches'] },
    { title: 'Social Media Management', desc: 'Content calendars, posting, and growth strategy.', points: ['Content calendar planned around your goals', 'Post design, captions and hashtag research', 'Reels editing for higher reach', 'Monthly performance reporting'] },
    { title: 'Google Business Profile', desc: 'Local listings optimised to bring nearby customers in.', points: ['Full profile setup and verification support', 'Optimised category, description and photos', 'Review-response strategy', "Helps you show up in local 'near me' searches"] },
  ];
  const capRail = document.getElementById('capRail');
  function capCardHTML(c, i) {
    return `<button class="cap-card" type="button" data-i="${i}">
      <h4>${c.title}</h4><p>${c.desc}</p><span class="cap-more">Tap for details →</span>
    </button>`;
  }
  if (capRail) {
    const set = capabilities.map(capCardHTML).join('');
    capRail.innerHTML = set + set;
    capRail.querySelectorAll('.cap-card').forEach(card => {
      card.addEventListener('click', () => openCapModal(capabilities[+card.dataset.i]));
    });
  }
  const capModal = document.getElementById('capModal');
  const capModalTitle = document.getElementById('capModalTitle');
  const capModalList = document.getElementById('capModalList');
  const capModalClose = document.getElementById('capModalClose');
  let lastFocusCap = null;
  function openCapModal(c) {
    capModalTitle.textContent = c.title;
    capModalList.innerHTML = c.points.map(p => `<li>${p}</li>`).join('');
    lastFocusCap = document.activeElement;
    openModal(capModal, capModalClose);
  }
  capModalClose.addEventListener('click', () => closeModal(capModal, lastFocusCap));
  capModal.addEventListener('click', (e) => { if (e.target === capModal) closeModal(capModal, lastFocusCap); });

  /* ------------------------------------------------------------------------
     10. TESTIMONIALS — data, auto-scroll rail, detail modal
     ------------------------------------------------------------------------ */
  const testimonials = [
    { name: 'Rahul Sharma', business: 'Spice Route Kitchen', country: 'India', role: 'Restaurant Owner', service: 'Website + Branding', rating: 5, completion: '8 days', satisfaction: '98%', text: 'They delivered a stunning website that exceeded every expectation. Responsive, fast, and beautiful.', goal: 'Replace a slow, outdated site with something that actually brought in reservations.', challenges: 'Menu updates used to need a developer. We rebuilt it as an editable, categorised menu with photos and a one-tap WhatsApp ordering flow.', experience: 'Communication was clear from day one, revisions were fast, and the final build loaded noticeably quicker than our old site.', recommend: 'Would recommend to any restaurant owner who wants a site that pulls its weight, not just looks nice.' },
    { name: 'Priya Verma', business: 'Priya Creates', country: 'India', role: 'Content Creator', service: 'Thumbnail Design', rating: 5, completion: '3 days', satisfaction: '96%', text: 'The thumbnail designs transformed our YouTube channel. CTR doubled within the first month.', goal: 'Improve click-through rate on a YouTube channel that was plateauing despite good content.', challenges: 'Old thumbnails blended into the feed. We designed a bold, consistent style with clear focal points and A/B variants.', experience: 'Fast turnaround every single week, and the team actually watched the videos before designing instead of guessing.', recommend: "Ideal for any creator who's tired of thumbnails being an afterthought." },
    { name: 'Arjun Singh', business: 'Urban Threads Co.', country: 'India', role: 'E-commerce Owner', service: 'Landing Page', rating: 5, completion: '6 days', satisfaction: '97%', text: 'Professional, fast, and incredibly talented. Our new landing page converts like never before.', goal: 'A single, focused landing page for a product launch campaign running on paid ads.', challenges: 'Our old page had too many distractions. We stripped it back to one clear call-to-action optimised for ad traffic.', experience: 'Professional, fast, and incredibly talented — the new page converts noticeably better than anything before.', recommend: 'Great pick if you need a page built purely to convert, not just to look good.' },
    { name: 'Marco Bianchi', business: 'Bianchi & Sons Bakery', country: 'Italy', role: 'Bakery Owner', service: 'Website + Order Flow', rating: 5, completion: '10 days', satisfaction: '95%', text: 'Our online orders tripled once customers could actually see and customise cakes before messaging us.', goal: 'Move custom cake orders off phone calls and onto a simple online flow customers could use anytime.', challenges: 'Order requests were getting lost in texts. We built a guided cake-order builder that lands straight in our WhatsApp.', experience: 'Warm, appetite-driving design that actually looks like our shop, and the order builder just works.', recommend: 'Perfect for any bakery or small food business drowning in DMs and missed calls.' },
    { name: 'Sarah Mitchell', business: 'Mitchell Design Studio', country: 'United Kingdom', role: 'Interior Designer', service: 'Portfolio Website', rating: 5, completion: '7 days', satisfaction: '99%', text: 'Our new portfolio finally does justice to the work. Enquiries have been steadier ever since it launched.', goal: 'A visual-first portfolio that put finished work front and centre instead of behind clicks.', challenges: 'Previous site buried our best projects three pages deep. We rebuilt around smooth project galleries and a proper enquiry form.', experience: 'Every revision came back same-day, and the transitions between projects feel genuinely premium.', recommend: 'Highly recommend for freelancers or studios who need their work to speak for itself.' },
    { name: 'David Okafor', business: 'Okafor Legal Partners', country: 'Nigeria', role: 'Managing Partner', service: 'Business Website', rating: 5, completion: '9 days', satisfaction: '97%', text: 'Client enquiries through the site have picked up noticeably, and the design matches the seriousness of our work.', goal: 'A multi-page site that builds instant trust with prospective clients researching the firm.', challenges: 'We needed clear practice-area pages and an easy way to book a consultation without calling during business hours.', experience: 'The finished site reads as professional and established — exactly the impression we needed to make.', recommend: 'Solid choice for any professional services firm that needs to look as credible online as in person.' },
    { name: 'Elena Petrova', business: 'Petrova Wellness Studio', country: 'Canada', role: 'Studio Owner', service: 'Complete Digital Presence', rating: 5, completion: '18 days', satisfaction: '98%', text: 'Booking enquiries have never been this consistent since our full digital presence went live.', goal: 'A full brand refresh across website, socials and Google Business, launched together.', challenges: 'Our branding was inconsistent across platforms. Everything was rebuilt to match across every channel at once.', experience: 'Having one team handle the site, socials and local listings together meant nothing fell through the cracks.', recommend: 'Recommended if you want your whole online presence to finally feel like one brand.' },
    { name: 'James Whitfield', business: 'Whitfield & Co. Realty', country: 'Australia', role: 'Real Estate Agent', service: 'SEO + Website', rating: 4, completion: '14 days', satisfaction: '93%', text: 'Organic leads are finally showing up in our pipeline, not just paid ones. Solid technical work.', goal: 'Rank locally for property searches after years of relying only on paid listings.', challenges: 'The old site was slow with no real SEO structure. We rebuilt it clean and fast, and set up Search Console properly.', experience: 'Organic traffic took a few weeks to build, but is now a genuine second channel alongside paid listings.', recommend: "Worth it if you're willing to give SEO time to compound — the foundation work was thorough." },
    { name: 'Fatima Al-Sayed', business: 'Al-Sayed Boutique', country: 'United Arab Emirates', role: 'Boutique Owner', service: 'Social Media Management', rating: 5, completion: 'Ongoing · monthly', satisfaction: '96%', text: 'Our engagement has grown every single month since handing social media over to them.', goal: 'Consistent posting and a content calendar that actually reflects upcoming collections.', challenges: 'Posting was sporadic and reactive. We now plan a full content calendar in advance with reels edited for reach.', experience: 'Engagement has grown steadily month over month, and I no longer think about what to post each day.', recommend: 'Great fit for boutique or product-based brands that need consistency without hiring in-house.' },
    { name: 'Tom Bergström', business: 'Bergström Fitness', country: 'Sweden', role: 'Fitness Studio Owner', service: 'UI/UX Design', rating: 5, completion: '11 days', satisfaction: '97%', text: 'Class sign-ups went up almost immediately after the booking flow redesign launched.', goal: 'Redesign a cluttered booking flow causing people to drop off before signing up for classes.', challenges: 'Users were abandoning the form halfway through. We wireframed the flow, then rebuilt it as a guided step-by-step process.', experience: 'Drop-off dropped noticeably after launch, and the interface finally feels consistent, not bolted together.', recommend: "Recommended for any business whose booking or checkout flow is quietly losing customers." },
  ];
  const tqRail = document.getElementById('tqRail');
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
  function tqCardHTML(t, i) {
    return `<button class="tq-card" type="button" data-i="${i}">
      <div class="tq-stars">${stars(t.rating)}</div>
      <p class="tq-text">${t.text}</p>
      <div class="tq-author">
        <div class="tq-av">${t.name.charAt(0)}</div>
        <div><div class="tq-name">${t.name}</div><div class="tq-role">${t.role} · ${t.country}</div></div>
      </div>
    </button>`;
  }
  if (tqRail) {
    const set = testimonials.map(tqCardHTML).join('');
    tqRail.innerHTML = set + set;
    tqRail.querySelectorAll('.tq-card').forEach(card => {
      card.addEventListener('click', () => openTqModal(testimonials[+card.dataset.i]));
    });
  }
  const tqModal = document.getElementById('tqModal');
  const tqModalClose = document.getElementById('tqModalClose');
  let lastFocusTq = null;
  function openTqModal(t) {
    document.getElementById('tqModalAv').textContent = t.name.charAt(0);
    document.getElementById('tqModalName').textContent = t.name;
    document.getElementById('tqModalSub').textContent = `${t.business} · ${t.country}`;
    document.getElementById('tqModalService').textContent = t.service;
    document.getElementById('tqModalTimeline').textContent = t.completion;
    document.getElementById('tqModalRating').textContent = t.rating + ' / 5';
    document.getElementById('tqModalSatisfaction').textContent = t.satisfaction;
    document.getElementById('tqModalGoal').textContent = t.goal;
    document.getElementById('tqModalChallenges').textContent = t.challenges;
    document.getElementById('tqModalExperience').textContent = t.experience;
    document.getElementById('tqModalRecommend').textContent = t.recommend;
    lastFocusTq = document.activeElement;
    openModal(tqModal, tqModalClose);
  }
  tqModalClose.addEventListener('click', () => closeModal(tqModal, lastFocusTq));
  tqModal.addEventListener('click', (e) => { if (e.target === tqModal) closeModal(tqModal, lastFocusTq); });

  /* ------------------------------------------------------------------------
     11. MODAL HELPERS — shared focus-trap + escape handling
     ------------------------------------------------------------------------ */
  function openModal(modal, focusTarget) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    (focusTarget || modal).focus();
  }
  function closeModal(modal, restoreFocus) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (restoreFocus) restoreFocus.focus();
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    [capModal, tqModal].forEach(m => { if (m.classList.contains('open')) closeModal(m, m === capModal ? lastFocusCap : lastFocusTq); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const open = [capModal, tqModal].find(m => m.classList.contains('open'));
    if (!open) return;
    const focusable = open.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ------------------------------------------------------------------------
     12. AMBIENT SOUND — reliable across iOS/Android, remembers preference
     ------------------------------------------------------------------------ */
  const ambientBtn = document.getElementById('ambientBtn');
  const ambientAudio = document.getElementById('ambientAudio');
  ambientAudio.volume = 0;
  let ambientOn = localStorage.getItem('av-ambient') === 'on';
  let fadeTimer = null;

  function fadeAudio(to, ms) {
    clearInterval(fadeTimer);
    const start = ambientAudio.volume;
    const steps = 20;
    let i = 0;
    fadeTimer = setInterval(() => {
      i++;
      ambientAudio.volume = Math.max(0, Math.min(1, start + (to - start) * (i / steps)));
      if (i >= steps) {
        clearInterval(fadeTimer);
        if (to === 0) ambientAudio.pause();
      }
    }, ms / steps);
  }

  function setAmbient(on) {
    ambientOn = on;
    localStorage.setItem('av-ambient', on ? 'on' : 'off');
    ambientBtn.setAttribute('aria-pressed', String(on));
    if (on) {
      ambientAudio.play().then(() => fadeAudio(0.35, 800)).catch(() => {
        ambientOn = false;
        localStorage.setItem('av-ambient', 'off');
        ambientBtn.setAttribute('aria-pressed', 'false');
        showToast('Tap again to enable sound — your browser blocked autoplay');
      });
    } else {
      fadeAudio(0, 500);
    }
  }
  ambientBtn.addEventListener('click', () => setAmbient(!ambientOn));
  // Browsers require a user gesture before audio can play; if the preference
  // was already "on" from a previous visit, arm it on the first interaction.
  if (ambientOn) {
    const armOnce = () => { setAmbient(true); document.removeEventListener('pointerdown', armOnce); };
    document.addEventListener('pointerdown', armOnce, { once: true });
  }

  /* ------------------------------------------------------------------------
     13. TOAST
     ------------------------------------------------------------------------ */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ------------------------------------------------------------------------
     14. KEYBOARD SHORTCUTS
     ------------------------------------------------------------------------ */
  document.addEventListener('keydown', (e) => {
    if (!e.altKey) return;
    if (e.key === 't' || e.key === 'T') { e.preventDefault(); setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true); }
    if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setAmbient(!ambientOn); }
  });

})();
