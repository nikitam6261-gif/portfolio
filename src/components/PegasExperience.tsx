'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Lenis from 'lenis';
import {
  ArrowDown, ArrowRight, BarChart3, Box, Check, ChevronRight,
  CircleGauge, CloudSnow, Database, DoorOpen, Droplets, Eye,
  FileCheck2, Fuel, Gauge, Layers3, MapPin, Menu, Navigation, PackageCheck,
  Play, Radio, Route, Satellite, ShieldCheck, Snowflake, Sparkles,
  Thermometer, Truck, Warehouse, Wind, X, Zap,
} from 'lucide-react';

const TruckScene = dynamic(() => import('./TruckScene'), { ssr: false });

type ModalName = 'portal' | 'tracking' | 'carrier' | null;

const temperatureData = [
  { time: '10:00', temp: 2.3, supply: 1.7, returnAir: 2.6, humidity: 67, speed: 0, place: 'Москва · РЦ Север' },
  { time: '10:30', temp: 2.4, supply: 1.8, returnAir: 2.7, humidity: 66, speed: 42, place: 'МКАД · 18 км' },
  { time: '11:00', temp: 2.5, supply: 1.9, returnAir: 2.8, humidity: 65, speed: 76, place: 'М-5 · 72 км' },
  { time: '11:30', temp: 2.4, supply: 1.8, returnAir: 2.7, humidity: 64, speed: 81, place: 'М-5 · 118 км' },
  { time: '12:00', temp: 2.6, supply: 1.9, returnAir: 2.9, humidity: 65, speed: 74, place: 'Коломна' },
  { time: '12:30', temp: 2.7, supply: 2.0, returnAir: 3.0, humidity: 66, speed: 78, place: 'Луховицы' },
  { time: '13:00', temp: 2.5, supply: 1.8, returnAir: 2.8, humidity: 64, speed: 83, place: 'Рязань · обход' },
  { time: '13:30', temp: 2.4, supply: 1.7, returnAir: 2.7, humidity: 63, speed: 79, place: 'М-5 · 232 км' },
  { time: '14:00', temp: 2.6, supply: 1.9, returnAir: 2.9, humidity: 65, speed: 77, place: 'Шацк' },
  { time: '14:30', temp: 2.8, supply: 2.0, returnAir: 3.1, humidity: 67, speed: 61, place: 'М-5 · ремонт' },
  { time: '15:00', temp: 2.6, supply: 1.8, returnAir: 2.9, humidity: 65, speed: 82, place: 'Зубова Поляна' },
  { time: '15:30', temp: 2.4, supply: 1.7, returnAir: 2.7, humidity: 63, speed: 84, place: 'М-5 · 418 км' },
  { time: '16:00', temp: 2.3, supply: 1.6, returnAir: 2.6, humidity: 62, speed: 76, place: 'Саранск · съезд' },
  { time: '16:30', temp: 2.5, supply: 1.8, returnAir: 2.8, humidity: 64, speed: 80, place: 'Пенза · 92 км' },
  { time: '17:00', temp: 2.4, supply: 1.7, returnAir: 2.7, humidity: 63, speed: 78, place: 'Пенза · обход' },
  { time: '17:30', temp: 2.4, supply: 1.7, returnAir: 2.7, humidity: 63, speed: 76, place: 'М-5 · 681 км' },
];

const sensorValues = [2.3, 2.4, 2.5, 2.4, 2.6, 2.7, 2.5, 2.4, 2.6, 2.8, 2.6, 2.4];
const palletValues = [2.4,2.5,2.3,2.4,2.6,2.5,2.4,2.3,2.5,2.7,2.6,2.4,2.3,2.4,2.5,2.6,2.8,2.7,2.5,2.4,2.3,2.5,2.6,2.4];

const services = [
  { n: '01', name: 'Pegas Fresh', tag: '+2…+6°C', icon: Snowflake, text: 'Премиальная перевозка продуктов с доказуемой температурой по всему маршруту.' },
  { n: '02', name: 'Pegas Frozen', tag: 'до −18°C', icon: CloudSnow, text: 'Замороженная продукция, резервный сценарий и контроль рефрижератора 24/7.' },
  { n: '03', name: 'Pegas Meat', tag: 'SPECIAL', icon: ShieldCheck, text: 'Тушевозы, санитарные процессы и специализированное оборудование.' },
  { n: '04', name: 'LTL Cold', tag: 'СБОРНЫЕ', icon: Box, text: 'Консолидация температурных грузов и регулярные холодные маршруты.' },
  { n: '05', name: 'Pegas 3PL', tag: 'FULL CYCLE', icon: Warehouse, text: 'Хранение, кросс-докинг, обработка и распределение в едином контуре.' },
];

const systems = [
  { id: 'TMS', icon: Route, title: 'Управление рейсом', text: 'Маршрут, машина, водитель, ETA, простои, ставка и ответственный связаны в одной карточке.' },
  { id: 'IOT', icon: Satellite, title: 'Телеметрия груза', text: 'Температура, влажность, двери, подача и возврат воздуха фиксируются каждые 30 секунд.' },
  { id: 'CRM', icon: Database, title: 'Клиентский контур', text: 'Заявки, ставки, история контактов, причины отказов и следующий шаг по каждому клиенту.' },
  { id: 'BI', icon: BarChart3, title: 'Экономика и качество', text: 'Маржа, загрузка парка, SLA, документы и прибыльность маршрутов без ручных отчётов.' },
];

export default function PegasExperience() {
  const [stage, setStage] = useState(0);
  const [modal, setModal] = useState<ModalName>(null);
  const [menu, setMenu] = useState(false);
  const [point, setPoint] = useState(15);
  const [activeSystem, setActiveSystem] = useState(0);
  const [quote, setQuote] = useState<{ price: string; id: number } | null>(null);
  const [track, setTrack] = useState<'found' | 'missing' | null>(null);
  const [hasWebGL, setHasWebGL] = useState(false);
  const current = temperatureData[point];
  const ActiveSystemIcon = systems[activeSystem].icon;

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) || canvas.getContext('webgl');
    const timer = window.setTimeout(() => setHasWebGL(Boolean(window.WebGLRenderingContext && context)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.92 });
    let frame = 0;
    const loop = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
    const onScroll = () => {
      const p = Math.min(1, window.scrollY / (window.innerHeight * 3.15));
      document.documentElement.style.setProperty('--film-progress', String(p));
      const next = p < .2 ? 0 : p < .48 ? 1 : p < .76 ? 2 : 3;
      setStage((value) => value === next ? value : next);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); lenis.destroy(); window.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = modal || menu ? 'hidden' : '';
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setModal(null); setMenu(false); } };
    window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', close); };
  }, [modal, menu]);

  const chartPoints = useMemo(() => temperatureData.map((item, index) => {
    const x = 42 + index * (736 / (temperatureData.length - 1));
    const y = 190 - ((item.temp - 2.1) / .9) * 118;
    return { x, y };
  }), []);
  const chartPath = chartPoints.map((item, index) => `${index ? 'L' : 'M'}${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(' ');
  const selectedChartPoint = chartPoints[point];

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

  const stages = [
    { label: 'COLD CHAIN / 2026', title: <>Холодовая цепь.<br/><span>Без компромиссов.</span></>, text: 'Перевозка, где каждый километр превращается в доказательство качества.' },
    { label: 'PA-2041 / IN MOTION', title: <>Груз едет.<br/><span>Данные работают.</span></>, text: 'Температура, ETA, скорость и состояние рефа обновляются в реальном времени.' },
    { label: 'CARGO X-RAY / 12 SENSORS', title: <>Видим холод<br/><span>внутри каждой паллеты.</span></>, text: 'Не одна средняя цифра, а пространственная карта температуры внутри кузова.' },
    { label: 'CONTROL TOWER / LIVE', title: <>Риск замечен<br/><span>раньше клиента.</span></>, text: 'Система определяет отклонение, назначает ответственного и контролирует реакцию.' },
  ];

  return (
    <div className="pegas-site">
      <div className="page-grain" />
      <div className="page-progress"><i /></div>
      <header className="top-nav">
        <a href="#top" className="brand-lockup" aria-label="Пегас-Авто">
          <Image src="/media/pegas-logo.png" width={128} height={128} alt="Пегас-Авто" priority />
          <span><b>ПЕГАС-АВТО</b><small>УПРАВЛЯЕМАЯ ХОЛОДОВАЯ ЦЕПЬ</small></span>
        </a>
        <nav><a href="#cargo">Груз</a><a href="#twin">3D-двойник</a><a href="#tower">Control Tower</a><a href="#products">Решения</a></nav>
        <div className="top-actions">
          <button onClick={() => setModal('tracking')}>Отследить рейс</button>
          <button className="ice-button" onClick={() => setModal('portal')}>Открыть кабинет <ArrowRight /></button>
        </div>
        <button className="mobile-trigger" aria-label="Открыть меню" onClick={() => setMenu(true)}><Menu /></button>
      </header>

      <main>
        <section className="hero-film" id="top">
          <div className="hero-sticky">
            <div className={`hero-photo hero-photo-main ${stage < 2 ? 'visible' : ''}`} />
            <div className={`hero-photo hero-photo-cargo ${stage >= 2 ? 'visible' : ''}`} />
            <div className="hero-shade" />
            <div className="road-scan" />
            <div className="snow-field">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ '--i': index, '--x': `${(index * 37) % 100}%` } as React.CSSProperties} />)}</div>

            <div className="film-index"><small>SCENE</small><b>0{stage + 1}</b><i /><span>0{stage + 1} / 04</span></div>
            <div className="hero-copy" key={stage}>
              <div className="micro-label"><i />{stages[stage].label}</div>
              <h1>{stages[stage].title}</h1>
              <p>{stages[stage].text}</p>
              {stage === 0 && <div className="hero-buttons"><a href="#quote" className="ice-button">Рассчитать перевозку <ArrowRight /></a><button onClick={() => setModal('portal')}><Play fill="currentColor" /> Смотреть платформу</button></div>}
            </div>

            <div className={`hero-live-card ${stage === 1 ? 'visible' : ''}`}>
              <div className="live-card-head"><span><i /> LIVE · 17:42:18</span><b>PA-2041</b></div>
              <div className="live-route"><strong>МОСКВА</strong><i><em /></i><strong>САМАРА</strong></div>
              <div className="live-primary"><div><Thermometer/><span><small>СРЕДНЯЯ</small><b>+2.4°C</b></span></div><em>НОРМА</em></div>
              <div className="live-grid"><Metric label="ETA" value="18:40" note="± 8 мин"/><Metric label="СКОРОСТЬ" value="76" note="км/ч"/><Metric label="РЕФ" value="ON" note="1780 rpm"/><Metric label="SLA" value="98.1" note="%"/></div>
            </div>

            <div className={`hero-sensor-card ${stage === 2 ? 'visible' : ''}`}>
              <div><span>THERMAL MAP / 12</span><b>КУЗОВ · ЗОНА B</b></div>
              <div className="mini-sensors">{sensorValues.map((value, index) => <i key={index} className={value >= 2.8 ? 'warm' : ''}><small>S{String(index + 1).padStart(2, '0')}</small><b>+{value.toFixed(1)}°</b></i>)}</div>
            </div>

            <div className={`hero-risk-card ${stage === 3 ? 'visible' : ''}`}>
              <div className="risk-orbit"><i /><span><Zap /></span></div>
              <small>RISK ENGINE / PREDICTIVE</small><h3>Задержка предотвращена</h3><p>Окно РЦ подтверждено автоматически. Новый ETA: 18:40.</p><div><span>ОБНАРУЖЕНО<b>17:36</b></span><span>РЕАКЦИЯ<b>04:12</b></span><span>СТАТУС<b>РЕШЕНО</b></span></div>
            </div>

            <div className="hero-floor">
              <div><span><b>100+</b><small>машин в контуре</small></span><span><b>24/7</b><small>операционный контроль</small></span><span><b>30 сек</b><small>шаг телеметрии</small></span></div>
              <a href="#cargo">ЛИСТАЙТЕ <ArrowDown /></a>
            </div>
          </div>
        </section>

        <section className="manifest">
          <div className="section-kicker"><span>01</span> КОНТРОЛИРУЕМ НЕ МАШИНУ, А ОБЕЩАНИЕ</div>
          <h2>Холод, который можно<br/><span>увидеть. Измерить. Доказать.</span></h2>
          <div className="manifest-bottom"><p>Пегас-Авто объединяет транспорт, датчики, документы и людей в одну систему. Клиент больше не спрашивает, где груз. Он уже видит ответ.</p><div className="quality-seal"><Snowflake/><span>PEGAS<br/>COLD STANDARD</span></div></div>
          <div className="ticker"><span>ТЕМПЕРАТУРА</span><i/><span>ВЛАЖНОСТЬ</span><i/><span>ETA</span><i/><span>ДВЕРИ</span><i/><span>ДОКУМЕНТЫ</span><i/><span>SLA</span></div>
        </section>

        <section className="cargo-lab" id="cargo">
          <div className="cargo-heading">
            <div className="section-kicker dark"><span>02</span> LIVE CARGO LAB</div>
            <h2>Один рейс.<br/><span>Тысячи точных сигналов.</span></h2>
            <p>Выберите любую точку на графике. Система покажет точное время, место, температуру, влажность, скорость и состояние холодовой установки.</p>
            <div className="cargo-id"><Radio/><span><small>АКТИВНЫЙ РЕЙС</small><b>PA-2041 · Москва → Самара</b></span></div>
          </div>
          <div className="cargo-console">
            <div className="console-top">
              <div><span><i/> LIVE TELEMETRY</span><b>13 ИЮЛЯ 2026 · {current.time}</b></div>
              <div className="console-status">ТЕМПЕРАТУРНЫЙ РЕЖИМ СОБЛЮДЁН</div>
            </div>
            <div className="console-kpis">
              <DataKpi icon={<Thermometer/>} label="ГРУЗ" value={`+${current.temp.toFixed(1)}°C`} note="цель +2…+6°C"/>
              <DataKpi icon={<Wind/>} label="ПОДАЧА / ВОЗВРАТ" value={`+${current.supply.toFixed(1)} / +${current.returnAir.toFixed(1)}°`} note="дельта 0.9°C"/>
              <DataKpi icon={<Droplets/>} label="ВЛАЖНОСТЬ" value={`${current.humidity}%`} note="в пределах нормы"/>
              <DataKpi icon={<Gauge/>} label="СКОРОСТЬ" value={`${current.speed} км/ч`} note={current.place}/>
            </div>
            <div className="temperature-chart">
              <div className="chart-head"><div><small>TEMPERATURE / CARGO CORE</small><h3>Температура груза</h3></div><div><span className="legend actual"><i/>ФАКТ</span><span className="legend target"><i/>ДОПУСК +2…+6°C</span></div></div>
              <div className="chart-wrap">
                <div className="y-axis"><span>+3.0°</span><span>+2.7°</span><span>+2.4°</span><span>+2.1°</span></div>
                <svg viewBox="0 0 820 230" preserveAspectRatio="none" aria-label="График температуры">
                  <defs><linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3adff7" stopOpacity=".35"/><stop offset="1" stopColor="#3adff7" stopOpacity="0"/></linearGradient></defs>
                  <rect x="42" y="32" width="736" height="166" className="target-band" />
                  {[45,95,145,195].map((y) => <line key={y} x1="42" y1={y} x2="778" y2={y} />)}
                  <path d={`${chartPath} L778,205 L42,205 Z`} className="temp-area" />
                  <path d={chartPath} className="temp-line" />
                  {chartPoints.map((item, index) => <circle key={index} cx={item.x} cy={item.y} r={index === point ? 7 : 4} className={index === point ? 'selected' : ''} onClick={() => setPoint(index)} role="button" tabIndex={0} aria-label={`${temperatureData[index].time}, ${temperatureData[index].temp} градуса`} />)}
                  <line x1={selectedChartPoint.x} y1="30" x2={selectedChartPoint.x} y2="205" className="selected-line" />
                </svg>
                <div className="chart-tooltip" style={{ left: `${Math.min(82, Math.max(8, (selectedChartPoint.x / 820) * 100))}%`, top: `${Math.max(5, (selectedChartPoint.y / 230) * 100 - 15)}%` }}><small>{current.time} · {current.place}</small><b>+{current.temp.toFixed(1)}°C</b><span>влажность {current.humidity}% · {current.speed} км/ч</span></div>
              </div>
              <div className="timeline"><input type="range" min="0" max={temperatureData.length - 1} value={point} onChange={(event) => setPoint(Number(event.target.value))}/><div><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span><span>17:30</span></div></div>
            </div>
            <div className="event-row">
              <Event icon={<DoorOpen/>} time="10:18" title="Двери закрыты" text="пломба PA-88214" status="OK"/>
              <Event icon={<Snowflake/>} time="10:22" title="Реф запущен" text="setpoint +2.0°C" status="OK"/>
              <Event icon={<MapPin/>} time="14:31" title="Зона ремонта" text="скорость 18 км/ч" status="INFO"/>
              <Event icon={<FileCheck2/>} time="17:08" title="Окно подтверждено" text="РЦ Самара · 19:00" status="OK"/>
            </div>
          </div>
        </section>

        <section className="sensor-map">
          <div className="sensor-copy"><div className="section-kicker dark"><span>03</span> ТЕМПЕРАТУРНАЯ КАРТА</div><h2>Холод имеет<br/><span>координаты.</span></h2><p>Двенадцать датчиков формируют пространственную карту кузова. Если одна зона выходит из коридора, система видит это до порчи груза.</p><div className="sensor-facts"><div><b>12</b><span>датчиков<br/>в кузове</span></div><div><b>30 сек</b><span>частота<br/>замера</span></div><div><b>0.4°C</b><span>разброс<br/>по кузову</span></div></div></div>
          <div className="trailer-blueprint">
            <div className="trailer-top"><span>ПЕРЕДНЯЯ СТЕНКА / REEFER</span><span>ЗАДНИЕ ДВЕРИ</span></div>
            <div className="trailer-body"><div className="cold-flow">{Array.from({length:7},(_,i)=><i key={i}/>)}</div>{sensorValues.map((value,index)=><button key={index} className={value >= 2.8 ? 'warm' : ''}><span>S{String(index+1).padStart(2,'0')}</span><b>+{value.toFixed(1)}°C</b><small>{index<4?'FRONT':index<8?'MIDDLE':'REAR'}</small></button>)}</div>
            <div className="trailer-legend"><span><i className="cold"/> +2.0…+2.5°C</span><span><i className="normal"/> +2.6…+2.7°C</span><span><i className="warm"/> +2.8°C</span><em>СРЕДНЯЯ +2.5°C</em></div>
          </div>
        </section>

        <section className="digital-twin" id="twin">
          <div className="twin-copy"><div className="section-kicker"><span>04</span> ИНТЕРАКТИВНЫЙ 3D-ДВОЙНИК</div><h2>Машина становится<br/><span>живым объектом данных.</span></h2><p>Поверните модель мышью. Цифровой слой связывает кабину, рефрижератор и груз с телеметрией рейса.</p><div className="twin-controls"><span><Eye/> вращайте</span><span><CircleGauge/> приближайте</span><span><Layers3/> исследуйте</span></div><small>Базовая бесплатная 3D-модель: Cesium, CC BY 4.0. Визуализация и цифровой слой: Pegas Control.</small></div>
          <div className="twin-stage">{hasWebGL ? <TruckScene/> : <div className="twin-fallback"><div className="fallback-truck"/><div className="fallback-scan"/><div className="fallback-data"><span>ENGINE</span><b>1 240 rpm</b><span>REEFER</span><b>+2.4°C</b><span>POSITION</span><b>53.2194 / 50.1641</b></div></div>}<div className="twin-hud top"><span>ASSET / PA-2041</span><b>DIGITAL TWIN ACTIVE</b></div><div className="twin-hud bottom"><span>GPS LOCK · 12 SAT</span><span>CAN BUS · ONLINE</span><span>REEFER · ONLINE</span></div></div>
        </section>

        <section className="cargo-xray">
          <div className="xray-image"/><div className="xray-shade"/>
          <div className="xray-copy"><div className="section-kicker"><span>05</span> PALLET-LEVEL VISIBILITY</div><h2>Внутри кузова<br/><span>нет тёмных зон.</span></h2><p>Каждая паллета получает позицию, температурную историю и статус документов.</p><button className="ice-button" onClick={() => setModal('portal')}>Открыть паспорт груза <ArrowRight/></button></div>
          <div className="pallet-panel"><div className="pallet-head"><div><small>CARGO MAP / 24 PALLETS</small><b>Загрузка 94%</b></div><span>Все зоны в норме</span></div><div className="pallet-grid">{palletValues.map((value,index)=><div key={index} className={value>=2.8?'warm':''}><small>P{String(index+1).padStart(2,'0')}</small><PackageCheck/><b>+{value.toFixed(1)}°</b><em>{index%3===0?'МОЛОЧНАЯ':'FOOD'}</em></div>)}</div><div className="pallet-footer"><span><Fuel/> Реф: 68% топлива</span><span><Droplets/> Влажность: 63%</span><span><DoorOpen/> Двери: закрыты</span></div></div>
        </section>

        <section className="control-tower" id="tower">
          <div className="tower-intro"><div className="section-kicker"><span>06</span> PEGAS CONTROL TOWER</div><h2>Центр, который<br/><span>не моргает.</span></h2><p>Все активные рейсы, риски, температура, документы и SLA на одном операционном экране.</p></div>
          <div className="tower-board">
            <div className="tower-board-head"><div><Radio/><span><small>LIVE NETWORK</small><b>14 рейсов под контролем</b></span></div><div><span>11</span> норма <span className="amber">2</span> внимание <span className="red">1</span> риск</div></div>
            <div className="tower-layout"><div className="route-map"><div className="map-grid"/><svg viewBox="0 0 760 470"><path d="M65 385 C170 285 250 390 350 245 S540 110 700 65"/><path d="M85 85 C230 180 325 85 445 180 S600 335 710 380" className="alt"/><circle cx="65" cy="385" r="7"/><circle cx="350" cy="245" r="7"/><circle cx="700" cy="65" r="7"/><circle cx="445" cy="180" r="7"/></svg><div className="moving-unit"><Truck/></div><span className="map-label m1">МОСКВА</span><span className="map-label m2">ПЕНЗА</span><span className="map-label m3">САМАРА</span><div className="map-card"><small>PA-2041</small><b>+2.4°C</b><span>ETA 18:40</span></div></div><div className="alerts"><small>СОБЫТИЯ / ПРИОРИТЕТ</small><Alert tone="red" time="17:38" title="PA-2052 · риск температуры" text="Зона REAR +0.8°C к профилю"/><Alert tone="amber" time="17:36" title="PA-2038 · окно РЦ" text="Вероятность задержки 34 минуты"/><Alert tone="cyan" time="17:31" title="PA-2041 · новый ETA" text="Маршрут пересчитан, рейс в SLA"/><Alert tone="green" time="17:28" title="PA-2027 · документы" text="УПД подписан через ЭДО"/><button onClick={() => setModal('portal')}>Открыть все события <ArrowRight/></button></div></div>
          </div>
        </section>

        <section className="products" id="products">
          <div className="products-head"><div className="section-kicker dark"><span>07</span> ПРОДУКТОВАЯ ЛИНЕЙКА</div><h2>Разные грузы.<br/><span>Один стандарт контроля.</span></h2></div>
          <div className="product-list">{services.map((service)=><article key={service.name}><span>{service.n}</span><div className="product-icon"><service.icon/></div><div><small>{service.tag}</small><h3>{service.name}</h3></div><p>{service.text}</p><button onClick={() => setModal('portal')} aria-label={`Открыть ${service.name}`}><ArrowRight/></button></article>)}</div>
        </section>

        <section className="platform">
          <div className="platform-title"><div className="section-kicker"><span>08</span> ЕДИНЫЙ ЦИФРОВОЙ КОНТУР</div><h2>Пять систем.<br/><span>Одна правда.</span></h2><p>Выберите слой платформы и посмотрите, как данные превращаются в управленческое действие.</p></div>
          <div className="platform-console"><div className="system-tabs">{systems.map((system,index)=>{const Icon=system.icon;return <button key={system.id} onClick={()=>setActiveSystem(index)} className={index===activeSystem?'active':''}><Icon/><span>0{index+1}</span><b>{system.id}</b></button>})}</div><div className="system-content"><div className="system-code">PEGAS CORE / {systems[activeSystem].id}</div><ActiveSystemIcon/><h3>{systems[activeSystem].title}</h3><p>{systems[activeSystem].text}</p><div className="data-bars">{Array.from({length:20},(_,index)=><i key={index} style={{'--delay':`${index*.04}s`} as React.CSSProperties}/>)}</div><div className="system-effect"><Zap/><span><small>ЭФФЕКТ</small><b>Решение принимается до того, как проблема станет убытком.</b></span></div></div><div className="core-orbit"><div className="orbit o1"/><div className="orbit o2"/><div className="core-mark"><Image src="/media/pegas-logo.png" width={128} height={128} alt=""/><b>PEGAS<br/>CORE</b></div>{systems.map((system,index)=><span key={system.id} className={`satellite s${index} ${index===activeSystem?'active':''}`}>{system.id}</span>)}</div></div>
        </section>

        <section className="quote" id="quote">
          <div className="quote-copy"><div className="section-kicker"><span>09</span> БЫСТРЫЙ РАСЧЁТ</div><h2>Маршрут в цифрах.<br/><span>Заявка в системе.</span></h2><p>Детерминированный тарифный движок формирует предварительный ориентир и передаёт заявку логисту.</p><div className="demo-note"><Sparkles/><span><b>ДЕМО-РЕЖИМ</b><small>Финальная ставка подтверждается после проверки груза и окон</small></span></div></div>
          <form onSubmit={submitQuote} className="quote-form"><div className="form-grid"><label>ОТКУДА<input name="from" placeholder="Москва" required/></label><label>КУДА<input name="to" placeholder="Самара" required/></label><label>РАССТОЯНИЕ, КМ<input name="distance" type="number" min="50" placeholder="1050" required/></label><label>РЕЖИМ<select name="mode"><option value="1">Без режима</option><option value="1.12">+2…+6°C</option><option value="1.2">0…−18°C</option><option value="1.28">Строгий режим</option></select></label><label>ВЕС, ТОНН<input type="number" min=".1" max="25" step=".1" defaultValue="20"/></label><label>СРОЧНОСТЬ<select name="urgency"><option value="1">Плановая</option><option value="1.15">В течение 24 часов</option><option value="1.25">Срочная</option></select></label></div><label>КОММЕНТАРИЙ<textarea placeholder="Груз, окна, требования к машине и документам"/></label><button type="submit" className="ice-button">Рассчитать перевозку <ArrowRight/></button>{quote&&<div className="quote-result"><span><small>ПРЕДВАРИТЕЛЬНЫЙ ОРИЕНТИР</small><b>{quote.price}</b></span><em>PEG-{quote.id} · создано в демо-CRM</em></div>}</form>
        </section>

        <section className="final-call"><div className="final-grid"/><div className="section-kicker"><span>10</span> СЛЕДУЮЩИЙ РЕЙС</div><h2>Холод под контролем.<br/><span>Бизнес в движении.</span></h2><p>Пегас-Авто. Когда спокойствие клиента становится измеримым сервисом.</p><div><a href="#quote" className="ice-button">Обсудить перевозку <ArrowRight/></a><button onClick={()=>setModal('carrier')}>Стать перевозчиком <ChevronRight/></button></div></section>
      </main>

      <footer><div><a href="#top" className="footer-logo"><Image src="/media/pegas-logo.png" width={128} height={128} alt="Пегас-Авто"/><span><b>ПЕГАС-АВТО</b><small>COLD-CHAIN OPERATOR</small></span></a><p>Температурная логистика нового поколения.<br/>Контроль, доказуемость, спокойствие.</p></div><div className="footer-links"><a href="#cargo">Телеметрия</a><a href="#twin">3D-двойник</a><a href="#tower">Control Tower</a><a href="#products">Решения</a><button onClick={()=>setModal('portal')}>Кабинет клиента</button><button onClick={()=>setModal('carrier')}>Перевозчикам</button></div><small>© 2026 Пегас-Авто · Демонстрационный цифровой прототип · 3D base model: Cesium, CC BY 4.0</small></footer>

      {menu&&<div className="mobile-menu"><button aria-label="Закрыть" onClick={()=>setMenu(false)}><X/></button><a href="#cargo" onClick={()=>setMenu(false)}>Груз</a><a href="#twin" onClick={()=>setMenu(false)}>3D-двойник</a><a href="#tower" onClick={()=>setMenu(false)}>Control Tower</a><a href="#products" onClick={()=>setMenu(false)}>Решения</a><button className="ice-button" onClick={()=>{setMenu(false);setModal('portal')}}>Открыть кабинет</button></div>}

      {modal&&<div className="modal-shell"><div className="modal-backdrop" onClick={()=>setModal(null)}/><div className={`modal-card ${modal==='portal'?'portal-card':''}`} role="dialog" aria-modal="true"><button className="modal-close" aria-label="Закрыть" onClick={()=>setModal(null)}><X/></button>{modal==='tracking'&&<Tracking submit={submitTrack} track={track}/>} {modal==='carrier'&&<Carrier/>} {modal==='portal'&&<Portal/>}</div></div>}
    </div>
  );
}

function Metric({label,value,note}:{label:string;value:string;note:string}) { return <div><small>{label}</small><b>{value}</b><em>{note}</em></div>; }
function DataKpi({icon,label,value,note}:{icon:React.ReactNode;label:string;value:string;note:string}) { return <div className="data-kpi"><span>{icon}</span><div><small>{label}</small><b>{value}</b><em>{note}</em></div></div>; }
function Event({icon,time,title,text,status}:{icon:React.ReactNode;time:string;title:string;text:string;status:string}) { return <div className="event"><span>{icon}</span><div><small>{time}</small><b>{title}</b><em>{text}</em></div><i>{status}</i></div>; }
function Alert({tone,time,title,text}:{tone:string;time:string;title:string;text:string}) { return <div className={`alert ${tone}`}><i/><div><small>{time}</small><b>{title}</b><span>{text}</span></div><ChevronRight/></div>; }

function Tracking({submit,track}:{submit:(event:React.FormEvent<HTMLFormElement>)=>void;track:'found'|'missing'|null}) { return <div className="simple-modal"><div className="section-kicker"><span>LIVE</span> ТРЕКИНГ РЕЙСА</div><h3>Где мой груз?</h3><p>Для демонстрации используйте номер PA-2041.</p><form onSubmit={submit}><input name="track" placeholder="PA-2041" required/><button className="ice-button">Найти рейс <Navigation/></button></form>{track==='found'&&<div className="tracking-result"><span><i/>В ПУТИ</span><b>Москва → Самара</b><p>ETA 18:40 · +2.4°C · режим соблюдён</p><div><em/><Truck/></div></div>}{track==='missing'&&<div className="form-message error">Рейс не найден. Проверьте номер заявки.</div>}</div>; }
function Carrier() { const [sent,setSent]=useState(false); return <div className="simple-modal"><div className="section-kicker"><span>PARTNER</span> CARRIER CLUB</div><h3>Расти вместе с нами.</h3><p>Понятный рейтинг, приоритетные рейсы и единый стандарт качества.</p><form onSubmit={(event)=>{event.preventDefault();setSent(true)}}><input placeholder="Название компании" required/><input placeholder="Телефон или email" required/><select><option>Рефрижераторы</option><option>Изотермы</option><option>Смешанный парк</option></select><button className="ice-button">Отправить заявку <ArrowRight/></button></form>{sent&&<div className="form-message success"><Check/> Заявка принята в демо-режиме</div>}</div>; }

function Portal() {
  const [tab,setTab]=useState(0);
  const tabs=[{name:'Рейсы',icon:Route},{name:'Температура',icon:Thermometer},{name:'Документы',icon:FileCheck2},{name:'Аналитика',icon:BarChart3}];
  return <div className="portal"><aside><div className="portal-brand"><Image src="/media/pegas-logo.png" width={90} height={90} alt=""/><b>PEGAS<br/>PORTAL</b></div>{tabs.map((tabItem,index)=><button key={tabItem.name} className={tab===index?'active':''} onClick={()=>setTab(index)}><tabItem.icon/>{tabItem.name}</button>)}</aside><div className="portal-body"><header><div><small>ЛИЧНЫЙ КАБИНЕТ / ДЕМО</small><h3>Добрый день, клиент</h3></div><span><i/> Все системы работают</span></header>{tab===0&&<div><div className="portal-kpis"><Metric label="АКТИВНЫЕ РЕЙСЫ" value="4" note="3 в норме"/><Metric label="РЕЙСЫ В SLA" value="98.1%" note="за месяц"/><Metric label="ДОКУМЕНТЫ" value="12" note="готовы"/></div><div className="portal-table"><div><span>МАРШРУТ</span><span>РЕЖИМ</span><span>ETA</span><span>СТАТУС</span></div><div><b>Москва → Самара</b><span>+2…+6°C</span><span>18:40</span><em>В ПУТИ</em></div><div><b>Пенза → Москва</b><span>−18°C</span><span>07:20</span><em className="warn">+20 МИН</em></div><div><b>Москва → Казань</b><span>+4°C</span><span>Сегодня</span><em>ВЫГРУЗКА</em></div></div></div>}{tab===1&&<div className="portal-temp"><div><small>PA-2041 · 12 ДАТЧИКОВ</small><h4>Температурный профиль</h4><span>НОРМА</span></div><div className="portal-sensors">{sensorValues.map((value,index)=><i key={index}><small>S{index+1}</small><b>+{value.toFixed(1)}°</b></i>)}</div></div>}{tab===2&&<div className="documents">{['Температурный паспорт','УПД №4182','ТТН №2041','Акт выгрузки'].map((name,index)=><div key={name}><span>{index?'ЭДО':'PDF'}</span><div><b>{name}</b><small>PA-2041 · подписан</small></div><em>ГОТОВ</em></div>)}</div>}{tab===3&&<div className="portal-analytics">{[['Рейсы без срыва','97.8%',98],['Документы в SLA','94.6%',95],['Средняя оценка','4.9 / 5',98],['Средний простой','1ч 12м',63]].map(([name,value,width])=><div key={String(name)}><small>{name}</small><b>{value}</b><i><em style={{width:`${width}%`}}/></i></div>)}</div>}</div></div>;
}
