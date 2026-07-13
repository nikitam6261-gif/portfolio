const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  activeSystem: 'crm',
  toastTimer: null
};

const systems = {
  crm: {
    kicker: 'CRM',
    title: 'Клиенты и продажи',
    text: 'История контактов, заявки, ставки, конверсия, причины отказов и следующий шаг по каждому клиенту.',
    result: 'Меньше потерянных лидов и прозрачная воронка'
  },
  tms: {
    kicker: 'TMS',
    title: 'Планирование и контроль рейсов',
    text: 'Маршрут, машина, водитель, ETA, температура, простои, ставка, себестоимость и ответственный в одном окне.',
    result: 'Меньше ручного управления и быстрее реакция на риск'
  },
  oneC: {
    kicker: '1С',
    title: 'Документы и деньги',
    text: 'Счета, УПД, акты, оплаты, дебиторка и связь каждого документа с конкретным рейсом.',
    result: 'Рейс быстрее превращается в закрытые документы и деньги'
  },
  bi: {
    kicker: 'BI',
    title: 'Управленческие решения',
    text: 'Маржа по клиентам и маршрутам, причины простоев, загрузка парка, рекламации и рейтинг перевозчиков.',
    result: 'Руководство управляет по цифрам, а не по ощущениям'
  },
  client: {
    kicker: 'CLIENT PORTAL',
    title: 'Прозрачность для клиента',
    text: 'Статус, ETA, температура, документы, история заказов и обращения без бесконечных звонков логисту.',
    result: 'Меньше ручных запросов и выше доверие к сервису'
  }
};

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  $('span', toast).textContent = message;
  toast.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  if (!document.querySelector('.modal.active')) document.body.classList.remove('modal-open');
}

function initModals() {
  $$('[data-open]').forEach(button => {
    button.addEventListener('click', () => openModal(button.dataset.open));
  });
  $$('[data-close]').forEach(button => {
    button.addEventListener('click', () => closeModal(button.closest('.modal')));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') $$('.modal.active').forEach(closeModal);
  });
}

function initPreloader() {
  const preloader = $('#preloader');
  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('is-hidden'), 650);
  });
  setTimeout(() => preloader?.classList.add('is-hidden'), 2500);
}

function initHeaderAndProgress() {
  const topbar = $('#topbar');
  const progress = $('#scrollProgress');
  const update = () => {
    topbar?.classList.toggle('is-scrolled', window.scrollY > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${value}%`;
  };
  update();
  addEventListener('scroll', update, { passive: true });
}

function initMobileMenu() {
  const button = $('#menuButton');
  const menu = $('#mobileMenu');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    button.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.classList.toggle('modal-open', menu.classList.contains('active'));
  });
  $$('a,button', menu).forEach(item => item.addEventListener('click', () => {
    button.classList.remove('active');
    menu.classList.remove('active');
    document.body.classList.remove('modal-open');
  }));
}

function initReveal() {
  const elements = $$('.reveal-up,.reveal-right,.reveal-left');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(element => element.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });
  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(element);
  });
}

function initCounters() {
  const counters = $$('[data-count]');
  const animate = element => {
    const target = Number(element.dataset.count || 0);
    const duration = 1100;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });
  counters.forEach(counter => observer.observe(counter));
}

function initParallax() {
  const layers = $$('[data-parallax]');
  if (!layers.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  const render = () => {
    const scroll = window.scrollY;
    layers.forEach(layer => {
      const factor = Number(layer.dataset.parallax || 0.1);
      const rect = layer.parentElement.getBoundingClientRect();
      const relative = scroll + rect.top - scroll;
      const offset = (innerHeight / 2 - rect.top) * factor;
      layer.style.transform = `translate3d(0, ${offset}px, 0) scale(1.08)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }, { passive: true });
  render();
}

function initCursorGlow() {
  const glow = $('#cursorGlow');
  if (!glow || matchMedia('(pointer: coarse)').matches) return;
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let cx = x;
  let cy = y;
  addEventListener('pointermove', event => {
    x = event.clientX;
    y = event.clientY;
  });
  const loop = () => {
    cx += (x - cx) * 0.12;
    cy += (y - cy) * 0.12;
    glow.style.left = `${cx}px`;
    glow.style.top = `${cy}px`;
    requestAnimationFrame(loop);
  };
  loop();
}

function initMagneticButtons() {
  if (matchMedia('(pointer: coarse)').matches) return;
  $$('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.08}px, ${y * 0.1}px)`;
    });
    button.addEventListener('pointerleave', () => button.style.transform = '');
  });
}

function initTiltCards() {
  if (matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $$('.tilt-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * 5;
      const ry = (px - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

function initSystemOrbit() {
  const nodes = $$('.system-node');
  const kicker = $('#systemKicker');
  const title = $('#systemTitle');
  const text = $('#systemText');
  const result = $('#systemResult');
  const render = key => {
    const item = systems[key];
    if (!item) return;
    state.activeSystem = key;
    nodes.forEach(node => node.classList.toggle('active', node.dataset.system === key));
    [kicker, title, text, result].forEach(element => element?.animate([
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 300, easing: 'ease-out' }));
    if (kicker) kicker.textContent = item.kicker;
    if (title) title.textContent = item.title;
    if (text) text.textContent = item.text;
    if (result) result.textContent = item.result;
  };
  nodes.forEach(node => node.addEventListener('click', () => render(node.dataset.system)));
  render('crm');
}

function initPortalTabs() {
  $$('.portal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.portalTab;
      $$('.portal-tab').forEach(item => item.classList.remove('active'));
      $$('.portal-panel').forEach(panel => panel.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });
}

function calculateRate(distance, temperature, urgency, weight) {
  const basePerKm = 86 + Math.max(0, weight - 10) * 1.7;
  const minimum = 42000;
  return Math.max(minimum, Math.round((distance * basePerKm * temperature * urgency) / 1000) * 1000);
}

function initQuoteForm() {
  const form = $('#quoteForm');
  const result = $('#quoteResult');
  if (!form || !result) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const from = $('#fromCity').value.trim();
    const to = $('#toCity').value.trim();
    const distance = Number($('#distance').value || 0);
    const temperature = Number($('#temperature').value || 1);
    const urgency = Number($('#urgency').value || 1);
    const weight = Number($('#weight').value || 20);
    const amount = calculateRate(distance, temperature, urgency, weight);
    result.style.display = 'block';
    result.innerHTML = `<b>${amount.toLocaleString('ru-RU')} ₽ без НДС</b><small>${from} → ${to}. Предварительный ориентир. Заявка PA-${String(Math.floor(2000 + Math.random() * 700))} создана в демо-CRM.</small>`;
    result.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease-out' });
    showToast('Заявка создана в демо-CRM');
  });
}

function initTrackForm() {
  const form = $('#trackForm');
  const result = $('#trackResult');
  if (!form || !result) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = $('#trackInput').value.trim().toUpperCase();
    result.style.display = 'block';
    if (value === 'PA-2041') {
      result.innerHTML = '<b>Москва → Самара</b><br>Статус: в пути • ETA 18:40 • температура +2.4°C • риск низкий';
    } else {
      result.innerHTML = '<b>Демо-рейс не найден.</b><br>Используйте номер PA-2041.';
    }
  });
}

function initCarrierForm() {
  const form = $('#carrierForm');
  const result = $('#carrierResult');
  if (!form || !result) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    result.style.display = 'block';
    result.innerHTML = '<b>Заявка принята.</b><br>В реальном проекте она попадёт в кабинет партнёрской сети и на проверку службы качества.';
    showToast('Заявка перевозчика принята');
    form.reset();
  });
}

function buildPassportDocument() {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Температурный паспорт PA-2041</title><style>
  body{font-family:Arial,sans-serif;margin:0;padding:40px;color:#10212a;background:#eef7f9}.sheet{max-width:820px;margin:auto;background:#fff;padding:36px;border-radius:20px;box-shadow:0 20px 70px rgba(0,0,0,.12)}h1{margin:0;font-size:28px}.muted{color:#66808e;font-size:12px}.top{display:flex;justify-content:space-between;gap:20px}.route{padding:35px 0;border-bottom:1px solid #d9e6ea}.route b{font-size:25px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.box{padding:16px;border:1px solid #dce8ec;border-radius:13px}.box small,.box b{display:block}.box small{color:#728893;font-size:10px}.box b{margin-top:7px}.chart{height:200px;border:1px solid #dce8ec;border-radius:15px;padding:14px}.chart svg{width:100%;height:100%}.seal{margin-top:24px;padding:18px;border-radius:14px;background:#e9fbf4;color:#0d7659}.foot{margin-top:30px;color:#7a8f99;font-size:10px}</style></head><body><div class="sheet"><div class="top"><div><div class="muted">PEGAS COLD STANDARD</div><h1>Температурный паспорт рейса</h1></div><b>PA-2041</b></div><div class="route"><div class="muted">МАРШРУТ</div><b>Москва → Самара</b><div class="muted">Рефрижератор • режим +2…+6°C</div></div><div class="grid"><div class="box"><small>MIN</small><b>+2.1°C</b></div><div class="box"><small>AVG</small><b>+2.4°C</b></div><div class="box"><small>MAX</small><b>+2.8°C</b></div><div class="box"><small>ОТКЛОНЕНИЯ</small><b>0</b></div></div><div class="chart"><svg viewBox="0 0 800 200" preserveAspectRatio="none"><g stroke="#dce8ec"><line x1="0" y1="40" x2="800" y2="40"/><line x1="0" y1="100" x2="800" y2="100"/><line x1="0" y1="160" x2="800" y2="160"/></g><path d="M0 120 C80 100 110 140 180 112 S310 105 370 125 S500 90 575 120 S700 135 800 95" fill="none" stroke="#1498b5" stroke-width="4"/></svg></div><div class="seal"><b>✓ Температурный режим соблюдён</b><br><span>Критические отклонения не зафиксированы. Документы по рейсу готовы.</span></div><div class="foot">Демонстрационный документ. В рабочем проекте данные формируются автоматически из TMS, GPS и температурных датчиков.</div></div><script>window.onload=()=>window.print()<\/script></body></html>`;
}

function printPassport() {
  const popup = window.open('', '_blank');
  if (!popup) {
    showToast('Разрешите всплывающие окна для печати паспорта');
    return;
  }
  popup.document.write(buildPassportDocument());
  popup.document.close();
}

function initPassportButtons() {
  $('#passportButton')?.addEventListener('click', printPassport);
  $('#modalPassportButton')?.addEventListener('click', printPassport);
}

function initSmoothActions() {
  $$('[data-scroll]').forEach(button => {
    button.addEventListener('click', () => document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }));
  });
}

function initImageFallbacks() {
  $$('img').forEach(image => {
    image.addEventListener('error', () => {
      image.style.display = 'none';
      image.parentElement?.classList.add('image-fallback');
    });
  });
}

function init() {
  initPreloader();
  initHeaderAndProgress();
  initMobileMenu();
  initModals();
  initReveal();
  initCounters();
  initParallax();
  initCursorGlow();
  initMagneticButtons();
  initTiltCards();
  initSystemOrbit();
  initPortalTabs();
  initQuoteForm();
  initTrackForm();
  initCarrierForm();
  initPassportButtons();
  initSmoothActions();
  initImageFallbacks();
}

document.addEventListener('DOMContentLoaded', init);
