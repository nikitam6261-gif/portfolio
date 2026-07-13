'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import { Activity, ArrowDown, ArrowRight, BarChart3, Check, Clock3, FileCheck2, Gauge, Menu, Navigation, Play, Route, ShieldCheck, Snowflake, Thermometer, Truck, Warehouse, X, Zap } from 'lucide-react';

const TruckScene = dynamic(() => import('./TruckScene'), { ssr: false });

type ModalName = 'portal' | 'tracking' | 'carrier' | null;

const solutions = [
  { code: '01', icon: Snowflake, name: 'Pegas Fresh', tag: 'TEMPERATURE', text: 'Температурная перевозка с паспортом рейса, ETA и контролем каждого отклонения.', tone: 'cyan' },
  { code: '02', icon: ShieldCheck, name: 'Pegas Meat', tag: 'SPECIAL CARGO', text: 'Тушевозы, санитарный контроль и специализированные процессы для мясной продукции.', tone: 'ice' },
  { code: '03', icon: Warehouse, name: 'Pegas Retail', tag: 'SLA DELIVERY', text: 'Окна РЦ, документы и предсказуемые поставки в федеральные торговые сети.', tone: 'orange' },
  { code: '04', icon: Route, name: 'Pegas LTL Cold', tag: 'CONSOLIDATION', text: 'Сборные температурные грузы, консолидация и регулярные маршруты.', tone: 'blue' },
  { code: '05', icon: Truck, name: 'Pegas 3PL', tag: 'FULL CYCLE', text: 'Хранение, кросс-докинг, обработка и распределение в едином контуре.', tone: 'steel' },
];

const systems = [
  { id: 'CRM', title: 'Клиенты и продажи', text: 'Заявки, ставки, история переговоров и следующий шаг по каждому клиенту.' },
  { id: 'TMS', title: 'Рейсы и контроль', text: 'Маршрут, машина, ETA, температура, простой, себестоимость и ответственный.' },
  { id: '1С', title: 'Документы и деньги', text: 'Счета, УПД, акты, оплаты и закрытие рейса без потерянных документов.' },
  { id: 'BI', title: 'Управленческие решения', text: 'P&L, маржа, загрузка парка и прибыльность клиентов и маршрутов.' },
];

export default function PegasExperience() {
  const [stage, setStage] = useState(0);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  const [activeSystem, setActiveSystem] = useState(0);
  const [quote, setQuote] = useState<{ price: string; id: number } | null>(null);
  const [track, setTrack] = useState<string | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 0.9 });
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const onScroll = () => {
      const p = Math.min(1, window.scrollY / (window.innerHeight * 3.2));
      document.documentElement.style.setProperty('--page-progress', String(p));
      document.documentElement.style.setProperty('--route-progress', `${38 + p * 56}%`);
      const nextStage = p < 0.22 ? 0 : p < 0.52 ? 1 : p < 0.78 ? 2 : 3;
      setStage((current) => current === nextStage ? current : nextStage);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(raf); lenis.destroy(); window.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = modal || menu ? 'hidden' : '';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setModal(null); setMenu(false); } };
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', closeOnEscape); };
  }, [modal, menu]);

  const stageCopy = useMemo(() => [
    { eyebrow: 'ПЕГАС-АВТО / COLD CHAIN', title: <>Холодовая цепь.<br /><span>Без слепых зон.</span></>, text: 'Температура, срок, документы и риски в одном управляемом процессе.' },
    { eyebrow: 'В ПУТИ / LIVE', title: <>Мы везём не груз.<br /><span>Мы везём уверенность.</span></>, text: 'Диспетчер видит отклонение раньше, чем оно становится проблемой клиента.' },
    { eyebrow: 'PA-2041 / DIGITAL TWIN', title: <>Каждый километр<br /><span>оставляет доказательство.</span></>, text: 'ETA, температура, события и реакция команды фиксируются в цифровом паспорте.' },
    { eyebrow: 'PEGAS CONTROL TOWER', title: <>Дорога становится<br /><span>данными.</span></>, text: 'Рейсы, риски, документы и экономика сходятся в едином центре управления.' },
  ], []);

  const submitQuote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const distance = Math.max(50, Number(data.get('distance')) || 0);
    const mode = Number(data.get('mode')) || 1;
    const urgency = Number(data.get('urgency')) || 1;
    const result = Math.round((distance * 112 * mode * urgency + 18000) / 1000) * 1000;
    setQuote({ price: `${result.toLocaleString('ru-RU')} ₽`, id: 2041 + Math.round(distance % 7000) });
  };

  const submitTrack = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('track') || '').trim().toUpperCase();
    setTrack(value === 'PA-2041' ? 'found' : 'missing');
  };

  return (
    <div className="site-shell">
      <div className="grain" />
      <div className="scroll-line"><i /></div>

      <header className="nav">
        <a className="logo" href="#home" aria-label="Пегас-Авто"><PegasMark /><span><b>ПЕГАС-АВТО</b><small>COLD-CHAIN OPERATOR</small></span></a>
        <nav><a href="#solutions">Решения</a><a href="#tower">Control Tower</a><a href="#platform">Платформа</a><a href="#quote">Расчёт</a></nav>
        <div className="nav-actions"><button className="text-button" onClick={() => setModal('tracking')}>Отследить рейс</button><button className="pill-button" onClick={() => setModal('portal')}>Демо кабинета <ArrowRight size={15} /></button></div>
        <button className="menu-trigger" onClick={() => setMenu(true)} aria-label="Открыть меню"><Menu /></button>
      </header>

      <main>
        <section className="cinematic" id="home">
          <div className="cinematic-sticky">
            <TruckScene />
            <div className="aurora" />
            <div className="vignette" />
            <div className="cinematic-grid" />

            <div className="chapter-index"><span>SCENE</span><b>0{stage + 1}</b><i /><em>0{stage + 1} / 04</em></div>
            <div className="stage-copy" key={stage}>
              <div className="eyebrow"><i />{stageCopy[stage].eyebrow}</div>
              <h1>{stageCopy[stage].title}</h1>
              <p>{stageCopy[stage].text}</p>
              {stage === 0 && <div className="hero-actions"><a className="hero-primary" href="#quote">Рассчитать перевозку <ArrowRight /></a><button onClick={() => setModal('portal')}><Play fill="currentColor" size={14} /> Смотреть платформу</button></div>}
            </div>

            <div className={`telemetry ${stage > 0 ? 'visible' : ''}`}>
              <div className="telemetry-head"><span><i /> LIVE CONTROL</span><b>PA-2041</b></div>
              <div className="telemetry-route"><strong>МОСКВА</strong><i><em /></i><strong>САМАРА</strong></div>
              <div className="telemetry-data"><div><Thermometer /><span>ТЕМПЕРАТУРА<b>+2.4°C</b></span><em>НОРМА</em></div><div><Clock3 /><span>ETA<b>18:40</b></span><em>В СРОК</em></div><div><Gauge /><span>СКОРОСТЬ<b>76 км/ч</b></span><em>СТАБИЛЬНО</em></div></div>
              <div className="temperature-graph">{[42,55,48,65,57,71,64,82,73,87,79,91,84,88,76,90].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div>
            </div>

            <div className="hero-bottom"><div className="hero-metrics"><div><b>24/7</b><span>мониторинг</span></div><div><b>5</b><span>цифровых контуров</span></div><div><b>1</b><span>ответственный за риск</span></div></div><a href="#manifesto"><span>ЛИСТАЙТЕ</span><ArrowDown /></a></div>
          </div>
        </section>

        <section className="manifesto" id="manifesto">
          <div className="section-label"><span>01</span> НОВАЯ РОЛЬ НА РЫНКЕ</div>
          <h2>Не просто машина<br />и маршрут. <span>Система,<br />которая держит слово.</span></h2>
          <div className="manifesto-side"><p>Пегас-Авто продаёт сохранность, доказуемость, срок, документы и спокойствие клиента.</p><div className="manifesto-seal"><Snowflake /><span>PEGAS<br />COLD STANDARD</span></div></div>
          <div className="signal-strip"><span>ТЕМПЕРАТУРА</span><i /><span>ETA</span><i /><span>ДОКУМЕНТЫ</span><i /><span>SLA</span><i /><span>РИСКИ</span></div>
        </section>

        <section className="solutions section-pad" id="solutions">
          <div className="section-head"><div><div className="section-label"><span>02</span> ПРОДУКТОВАЯ ЛИНЕЙКА</div><h2>Разные грузы.<br /><span>Один холодный стандарт.</span></h2></div><p>Каждый продукт отвечает не на вопрос какой кузов, а на вопрос какой риск клиента мы берём под контроль.</p></div>
          <div className="solution-list">
            {solutions.map((item) => <article key={item.name} className={`solution-row tone-${item.tone}`}><div className="solution-code">{item.code}</div><div className="solution-icon"><item.icon /></div><div className="solution-name"><small>{item.tag}</small><h3>{item.name}</h3></div><p>{item.text}</p><button onClick={() => setModal('portal')} aria-label={`Открыть ${item.name}`}><ArrowRight /></button></article>)}
          </div>
        </section>

        <section className="tower" id="tower">
          <div className="tower-backdrop"><div className="radar radar-a" /><div className="radar radar-b" /></div>
          <div className="tower-copy"><div className="section-label light"><span>03</span> PEGAS CONTROL TOWER</div><h2>Замечаем риск<br /><span>раньше клиента.</span></h2><p>Система не просто показывает проблему. Она назначает ответственного, запускает сценарий реакции и сохраняет результат.</p><button className="hero-primary" onClick={() => setModal('portal')}>Открыть полный мониторинг <ArrowRight /></button></div>
          <div className="control-board">
            <div className="board-head"><div><small>CONTROL TOWER / LIVE MAP</small><b><i /> 14 РЕЙСОВ ПОД КОНТРОЛЕМ</b></div><span>СИСТЕМА В НОРМЕ</span></div>
            <div className="board-body">
              <div className="digital-map"><div className="map-mesh" /><svg viewBox="0 0 700 430" preserveAspectRatio="none"><path d="M40 350 C180 250 245 380 360 215 S540 120 660 62"/><path d="M70 95 C220 160 295 75 430 155 S565 285 665 330" className="route-alt"/><circle cx="40" cy="350" r="6"/><circle cx="360" cy="215" r="6"/><circle cx="660" cy="62" r="6"/><circle cx="430" cy="155" r="6"/></svg><div className="map-truck"><Truck size={16} /></div><span className="city city-a">МОСКВА</span><span className="city city-b">КАЗАНЬ</span><span className="city city-c">ЕКАТЕРИНБУРГ</span></div>
              <div className="risk-feed"><small>СОБЫТИЯ / LIVE</small><Risk tone="amber" icon={<Clock3 />} title="PA-2038 · Москва → Уфа" text="Риск опоздания на 34 минуты" time="2 МИН"/><Risk tone="cyan" icon={<Thermometer />} title="PA-2041 · Пенза → Москва" text="Температура +0.6°C к плану" time="4 МИН"/><Risk tone="green" icon={<FileCheck2 />} title="PA-2027 · Москва → Казань" text="УПД подписан через ЭДО" time="8 МИН"/><button onClick={() => setModal('portal')}>ВСЕ СОБЫТИЯ <ArrowRight /></button></div>
            </div>
          </div>
        </section>

        <section className="passport section-pad">
          <div className="passport-copy"><div className="section-label"><span>04</span> ТЕМПЕРАТУРНЫЙ ПАСПОРТ</div><h2>Качество,<br /><span>которое можно доказать.</span></h2><p>После рейса клиент получает цифровой отчёт: температурную кривую, события, отклонения, реакцию диспетчера, окна и статус документов.</p><ul><li><Check /> Температурная кривая по всему маршруту</li><li><Check /> Погрузка, выгрузка и фактическая ETA</li><li><Check /> Отклонения и принятые меры</li><li><Check /> Подтверждение закрывающих документов</li></ul></div>
          <div className="passport-card">
            <div className="passport-head"><span>PEGAS / COLD STANDARD</span><b>PA-2041</b></div><div className="passport-route"><small>МАРШРУТ</small><h3>Москва <ArrowRight /> Самара</h3><p>Рефрижератор · +2…+6°C</p></div>
            <div className="passport-chart"><div className="chart-range"><span>+6°</span><span>+4°</span><span>+2°</span></div><svg viewBox="0 0 720 250" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#58dfff" stopOpacity=".4"/><stop offset="1" stopColor="#58dfff" stopOpacity="0"/></linearGradient></defs><path className="chart-fill" d="M0 150 C55 120 95 158 145 126 S235 115 290 148 S385 104 445 132 S550 160 610 118 S680 130 720 98 L720 250 L0 250Z"/><path className="chart-stroke" d="M0 150 C55 120 95 158 145 126 S235 115 290 148 S385 104 445 132 S550 160 610 118 S680 130 720 98"/></svg></div>
            <div className="passport-stats"><div><small>MIN</small><b>+2.1°</b></div><div><small>AVG</small><b>+2.4°</b></div><div><small>MAX</small><b>+2.8°</b></div><div><small>ОТКЛОНЕНИЯ</small><b>0</b></div></div><div className="passport-ok"><ShieldCheck /><span><b>РЕЖИМ СОБЛЮДЁН</b><small>PEGAS COLD STANDARD</small></span></div>
          </div>
        </section>

        <section className="platform section-pad" id="platform">
          <div className="platform-intro"><div className="section-label"><span>05</span> ЕДИНЫЙ DIGITAL-КОНТУР</div><h2>Пять систем.<br /><span>Одна правда о бизнесе.</span></h2><p>Клиент, рейс, документы, деньги и управленческие выводы больше не живут в разных таблицах и чатах.</p></div>
          <div className="system-console"><div className="console-tabs">{systems.map((s,i)=><button key={s.id} onClick={()=>setActiveSystem(i)} className={activeSystem===i?'active':''}><span>0{i+1}</span><b>{s.id}</b></button>)}</div><div className="console-main"><small>PEGAS CORE / {systems[activeSystem].id}</small><h3>{systems[activeSystem].title}</h3><p>{systems[activeSystem].text}</p><div className="data-stream">{Array.from({length:12},(_,i)=><i key={i} style={{animationDelay:`${i*.08}s`}} />)}</div><div className="console-result"><Zap /><span><small>ЭФФЕКТ</small><b>Меньше ручного хаоса. Больше управляемости.</b></span></div></div><div className="console-orbit"><div className="orbit-ring o1"/><div className="orbit-ring o2"/><div className="core"><PegasMark /><b>PEGAS<br/>CORE</b></div>{systems.map((s,i)=><span key={s.id} className={`satellite sat-${i} ${activeSystem===i?'active':''}`}>{s.id}</span>)}</div></div>
        </section>

        <section className="quote" id="quote">
          <div className="quote-copy"><div className="section-label light"><span>06</span> БЫСТРЫЙ РАСЧЁТ</div><h2>Дайте маршрут.<br /><span>Система соберёт заявку.</span></h2><p>Предварительный ориентир рассчитывается тарифным движком и передаётся в CRM для проверки логистом.</p><div className="quote-note"><Activity /><span><b>ДЕМО-РЕЖИМ</b><small>Расчёт не является коммерческим предложением</small></span></div></div>
          <form className="quote-form" onSubmit={submitQuote}><div className="form-grid"><label>ОТКУДА<input name="from" placeholder="Москва" required /></label><label>КУДА<input name="to" placeholder="Самара" required /></label><label>РАССТОЯНИЕ, КМ<input name="distance" type="number" min="50" placeholder="1050" required /></label><label>ТЕМПЕРАТУРНЫЙ РЕЖИМ<select name="mode"><option value="1">Без режима</option><option value="1.12">+2…+6°C</option><option value="1.2">0…−18°C</option><option value="1.28">Строгий режим</option></select></label><label>ВЕС, ТОНН<input name="weight" type="number" min="0.1" max="25" step=".1" defaultValue="20" /></label><label>СРОЧНОСТЬ<select name="urgency"><option value="1">Плановая</option><option value="1.15">В течение 24 часов</option><option value="1.25">Срочная</option></select></label></div><label>КОММЕНТАРИЙ<textarea name="comment" placeholder="Груз, окна, требования к машине и документам" /></label><button className="hero-primary" type="submit">Рассчитать и создать заявку <ArrowRight /></button>{quote && <div className="quote-result"><span>ПРЕДВАРИТЕЛЬНЫЙ ОРИЕНТИР</span><b>{quote.price}</b><em>Заявка PEG-{quote.id} создана в демо-CRM</em></div>}</form>
        </section>

        <section className="final-cta"><div className="final-lines"/><div className="section-label light"><span>07</span> СЛЕДУЮЩИЙ РЕЙС</div><h2>Холод под контролем.<br /><span>Бизнес в движении.</span></h2><div><a className="hero-primary" href="#quote">Обсудить перевозку <ArrowRight /></a><button onClick={()=>setModal('carrier')}>Стать перевозчиком</button></div><div className="final-truck"><Truck /></div></section>
      </main>

      <footer><a className="logo" href="#home"><PegasMark /><span><b>ПЕГАС-АВТО</b><small>COLD-CHAIN OPERATOR</small></span></a><p>Температурная логистика нового поколения.<br />Контроль, доказуемость, спокойствие.</p><div><a href="#solutions">Решения</a><a href="#tower">Control Tower</a><button onClick={()=>setModal('portal')}>Кабинет клиента</button><button onClick={()=>setModal('carrier')}>Перевозчикам</button></div><small>© 2026 Пегас-Авто · Демонстрационный прототип</small></footer>

      {menu && <div className="mobile-menu"><button onClick={()=>setMenu(false)}><X /></button><a href="#solutions" onClick={()=>setMenu(false)}>Решения</a><a href="#tower" onClick={()=>setMenu(false)}>Control Tower</a><a href="#platform" onClick={()=>setMenu(false)}>Платформа</a><a href="#quote" onClick={()=>setMenu(false)}>Рассчитать</a><button className="hero-primary" onClick={()=>{setMenu(false);setModal('portal')}}>Демо кабинета</button></div>}

      {modal && <div className="modal-shell"><div className="modal-backdrop" onClick={()=>setModal(null)}/><div className={`modal-card ${modal==='portal'?'portal-modal':''}`}><button className="modal-close" onClick={()=>setModal(null)}><X /></button>{modal==='tracking'&&<><div className="section-label"><span>LIVE</span> ТРЕКИНГ РЕЙСА</div><h3>Где мой груз?</h3><p>Для демонстрации используйте номер PA-2041.</p><form className="track-form" onSubmit={submitTrack}><input name="track" placeholder="PA-2041" required/><button className="hero-primary">Найти рейс <Navigation /></button></form>{track==='found'&&<div className="track-success"><div><span><i/> В ПУТИ</span><b>Москва → Самара</b><small>ETA сегодня, 18:40 · +2.4°C · режим соблюдён</small></div><div className="track-road"><i/><Truck /></div></div>}{track==='missing'&&<div className="track-error">Рейс не найден. Проверьте номер заявки.</div>}</>}{modal==='carrier'&&<><div className="section-label"><span>PARTNER</span> PEGAS CARRIER CLUB</div><h3>Расти вместе с нами.</h3><p>Понятный рейтинг, приоритетные рейсы, единый стандарт качества и прозрачная работа.</p><form className="carrier-form" onSubmit={(e)=>{e.preventDefault();setTrack('carrier')}}><input placeholder="Название компании" required/><input placeholder="Телефон или email" required/><select><option>Рефрижераторы</option><option>Тенты</option><option>Изотермы</option><option>Смешанный парк</option></select><button className="hero-primary">Отправить заявку <ArrowRight /></button></form>{track==='carrier'&&<div className="track-error success"><Check/> Заявка принята в демо-режиме</div>}</>}{modal==='portal'&&<PortalDemo />}</div></div>}
    </div>
  );
}

function PegasMark(){return <svg className="pegas-mark" viewBox="0 0 64 64" aria-hidden="true"><path d="M6 42c13-2 22-8 29-23 4 9 10 15 22 18-9 3-16 8-21 17-8-7-17-11-30-12Z" fill="currentColor"/><path d="M17 32c9-2 17-7 23-17" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}

function Risk({tone,icon,title,text,time}:{tone:string;icon:React.ReactNode;title:string;text:string;time:string}){return <div className={`risk risk-${tone}`}><span>{icon}</span><div><b>{title}</b><small>{text}</small></div><em>{time}</em></div>}

function PortalDemo(){const [tab,setTab]=useState(0);return <div className="portal-demo"><aside><div className="portal-logo"><PegasMark/><b>PEGAS<br/>PORTAL</b></div>{['Рейсы','Температура','Документы','Аналитика'].map((t,i)=><button key={t} className={tab===i?'active':''} onClick={()=>setTab(i)}>{[<Route key="r"/>,<Thermometer key="t"/>,<FileCheck2 key="f"/>,<BarChart3 key="b"/>][i]}{t}</button>)}</aside><div className="portal-content"><header><div><small>ЛИЧНЫЙ КАБИНЕТ / ДЕМО</small><h3>Добрый день, клиент</h3></div><span><i/> Все системы работают</span></header>{tab===0&&<div><div className="portal-kpis"><div><small>Активные рейсы</small><b>4</b><em>3 в норме</em></div><div><small>Рейсы в SLA</small><b>98.1%</b><em>за месяц</em></div><div><small>Документы готовы</small><b>12</b><em>за 30 дней</em></div></div><div className="portal-table"><div><span>МАРШРУТ</span><span>РЕЖИМ</span><span>ETA</span><span>СТАТУС</span></div><div><b>Москва → Самара</b><span>+2…+6°C</span><span>18:40</span><em>В ПУТИ</em></div><div><b>Пенза → Москва</b><span>−18°C</span><span>07:20</span><em className="warn">+20 МИН</em></div><div><b>Москва → Казань</b><span>+4°C</span><span>Сегодня</span><em>ВЫГРУЗКА</em></div></div></div>}{tab===1&&<div className="portal-big-chart"><div><small>PA-2041</small><h4>Температурная кривая</h4><span>НОРМА</span></div><svg viewBox="0 0 900 300" preserveAspectRatio="none"><path className="chart-fill" d="M0 180 C80 140 130 190 210 145 S360 135 430 174 S580 115 660 150 S790 170 900 112 L900 300 L0 300Z"/><path className="chart-stroke" d="M0 180 C80 140 130 190 210 145 S360 135 430 174 S580 115 660 150 S790 170 900 112"/></svg></div>}{tab===2&&<div className="doc-list">{['Температурный паспорт','УПД №4182','ТТН №2041'].map((d,i)=><div key={d}><span>{i?'ЭДО':'PDF'}</span><div><b>{d}</b><small>{i?'Подписан и получен':'PA-2041 · сформирован'}</small></div><em>ГОТОВ</em></div>)}</div>}{tab===3&&<div className="analytics">{[['Рейсы без срыва','97.8%'],['Документы в SLA','94.6%'],['Средняя оценка','4.9 / 5'],['Средний простой','1ч 12м']].map(([a,b],i)=><div key={a}><small>{a}</small><b>{b}</b><i><em style={{width:`${[97,94,98,63][i]}%`}}/></i></div>)}</div>}</div></div>}
