(() => {
  const DOM = {
    clock: document.getElementById('clock'),
    date: document.getElementById('date'),
    wrapper: document.getElementById('clockWrapper'),
    settingsBtn: document.getElementById('settings-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    panel: document.getElementById('settings-panel')
  };

  const settingsInputs = {
    bg: document.getElementById('bgPicker'),
    color: document.getElementById('colorPicker'),
    font: document.getElementById('fontSelect'),
    size: document.getElementById('sizeSelect'),
    hover: document.getElementById('hoverToggle'),
    date: document.getElementById('dateToggle'),
    sec: document.getElementById('secToggle'),
    hour: document.getElementById('hourFormat'),
    datePos: document.getElementById('datePos')
  };

  const uiElements = [DOM.clock, DOM.date, DOM.settingsBtn, DOM.fullscreenBtn];
  const STORAGE_KEY = "fullscreen-clock-settings";
  const weekdays = ["日","月","火","水","木","金","土"];

  const storage = {
    save: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    load: (key, fallback = null) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        localStorage.removeItem(key);
        return fallback;
      }
    }
  };

  const SIZE_MAP = { small:0.75, medium:1.0, large:1.25, xlarge:1.5 };
  const two = n => String(n).padStart(2,'0');

  const fitClockSize = () => {
    const ratio = SIZE_MAP[settingsInputs.size.value] || 1.0;
    const minFont = 40 * ratio;
    const maxFont = 200 * ratio;
    const target = 10 * ratio;
    DOM.clock.style.fontSize = `clamp(${minFont}px, ${target}vw, ${maxFont}px)`;
    if(settingsInputs.date.checked){
      DOM.date.style.fontSize = `clamp(${minFont*0.4}px, ${target*0.4}vw, ${maxFont*0.4}px)`;
    }
  };

  const getTimeString = () => {
    const d = new Date();
    let h = d.getHours(), ampm="";
    if(settingsInputs.hour.value==="12"){ ampm=h>=12?"PM":"AM"; h=h%12||12; }
    const hh=two(h), mm=two(d.getMinutes()), ss=two(d.getSeconds());
    return settingsInputs.hour.value==="12"
      ? (settingsInputs.sec.checked ? `${ampm} ${hh}:${mm}:${ss}` : `${ampm} ${hh}:${mm}`)
      : (settingsInputs.sec.checked ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`);
  };

  const getDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}/${two(d.getMonth()+1)}/${two(d.getDate())} (${weekdays[d.getDay()]})`;
  };

  const updateClock = () => {
    DOM.clock.textContent = getTimeString();
    DOM.date.textContent = getDateString();
    DOM.date.style.display = settingsInputs.date.checked ? "block":"none";
    DOM.wrapper.style.flexDirection = settingsInputs.datePos.value==="top"?"column":"column-reverse";
    fitClockSize();
    requestAnimationFrame(updateClock);
  };

  const applyStyleChanges = () => {
    document.body.style.background = settingsInputs.bg.value;
    DOM.clock.style.color = DOM.date.style.color = settingsInputs.color.value;
    DOM.clock.style.fontFamily = DOM.date.style.fontFamily = settingsInputs.font.value;
    fitClockSize();
  };

  const showAll = () => uiElements.forEach(el=>el.classList.remove('hidden'));
  const hideAll = () => {
    if(settingsInputs.hover.checked){
      uiElements.forEach(el=>el.classList.add('hidden'));
      DOM.panel.style.display='none';
    }
  };

  window.addEventListener('mouseleave', hideAll);
  window.addEventListener('mouseenter', showAll);

  DOM.settingsBtn.addEventListener('click', e=>{
    e.stopPropagation();
    DOM.panel.style.display = DOM.panel.style.display==='block'?'none':'block';
  });
  document.addEventListener('click', e=>{
    if(DOM.panel.style.display==='block' && !DOM.panel.contains(e.target) && e.target!==DOM.settingsBtn){
      DOM.panel.style.display='none';
    }
  });
  document.addEventListener('keydown', e=>{
    if(e.key==="Escape" && DOM.panel.style.display==='block') DOM.panel.style.display='none';
  });

  DOM.fullscreenBtn.addEventListener('click', ()=>{
    if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen();
  });
  document.addEventListener('fullscreenchange', ()=>{
    DOM.fullscreenBtn.innerHTML = document.fullscreenElement
      ? '<span class="material-icons">fullscreen_exit</span>'
      : '<span class="material-icons">fullscreen</span>';
  });

  const saveSettings = () => {
    const s={};
    Object.entries(settingsInputs).forEach(([key,el])=>{
      if(!el) return;
      s[key] = el.type==='checkbox'?el.checked:el.value;
    });
    storage.save(STORAGE_KEY,s);
  };

  const applySettings = s => {
    if(!s) return;
    Object.entries(s).forEach(([key,value])=>{
      const el = settingsInputs[key];
      if(!el) return;
      if(el.type==='checkbox') el.checked=value;
      else el.value=value;
    });
    applyStyleChanges();
  };

  const loadSettings = () => applySettings(storage.load(STORAGE_KEY));

  Object.entries(settingsInputs).forEach(([key,el])=>{
    if(!el) return;
    if(['bg','color','font','size'].includes(key)){
      el.addEventListener('change',applyStyleChanges);
      if(key==='bg'||key==='color') el.addEventListener('input',applyStyleChanges);
    }
    el.addEventListener('change',saveSettings);
  });

  loadSettings();
  requestAnimationFrame(updateClock);
})();
