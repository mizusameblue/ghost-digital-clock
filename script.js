(() => {
  const clock = document.getElementById('clock');
  const date = document.getElementById('date');
  const time = document.getElementById('time');
  const week = ["日", "月", "火", "水", "木", "金", "土"];

  const settings = document.getElementById('settings');
  const bgColor = document.getElementById('bg-color');
  const fontColor = document.getElementById('font-color');
  const fontFamily = document.getElementById('font-family');
  const datePos = document.getElementById('date-pos');
  const displayToggle = document.getElementById('display-toggle');
  const secondToggle = document.getElementById('second-toggle');
  const dateToggle = document.getElementById('date-toggle');
  const resetBtn = document.getElementById('reset-settings');

  let reqId = null;
  
  // --- Utility ---
  function zeroPad(n) {
    return String(n).padStart(2, "0");
  }

  function getDate() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const MM = zeroPad(d.getMonth() + 1);
    const dd = zeroPad(d.getDate());
    const aaa = week[d.getDay()];
    return `${yyyy}/${MM}/${dd} (${aaa})`;
  }

  function getTime() {
    const d = new Date();
    const hh = zeroPad(d.getHours());
    const mm = zeroPad(d.getMinutes());
    const ss = zeroPad(d.getSeconds());
    return secondToggle.checked ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  }

  // --- Settings 保存/復元 ---
  function saveSettings() {
    const settingsData = {
      bgColor: bgColor.value,
      fontColor: fontColor.value,
      fontFamily: fontFamily.value,
      datePos: datePos.value,
      dateToggle: dateToggle.checked,
      secondToggle: secondToggle.checked,
      displayToggle: displayToggle.checked
    };
    localStorage.setItem("clockSettings", JSON.stringify(settingsData));
  }

  function loadSettings() {
    const data = localStorage.getItem("clockSettings");
    if (!data) return;

    const settingsData = JSON.parse(data);
    bgColor.value = settingsData.bgColor;
    fontColor.value = settingsData.fontColor;
    fontFamily.value = settingsData.fontFamily;
    datePos.value = settingsData.datePos;
    dateToggle.checked = settingsData.dateToggle;
    secondToggle.checked = settingsData.secondToggle;
    displayToggle.checked = settingsData.displayToggle;

    applyStyle();
  }

  function resetSettings() {
    // 保存データ削除
    localStorage.removeItem("clockSettings");

    // デフォルト値
    bgColor.value = "#000000";
    fontColor.value = "#ffffff";
    fontFamily.value = "sans-serif";
    datePos.value = "top";
    dateToggle.checked = true;
    secondToggle.checked = true;
    displayToggle.checked = false;
    
    applyStyle();
    saveSettings();
  }

  // --- Style 適用 ---
  function applyStyle() {
    document.body.style.background = bgColor.value;
    clock.style.color = fontColor.value;
    clock.style.fontFamily = fontFamily.value || "";
    clock.style.flexDirection = datePos.value === "bottom" ? "column-reverse" : "";
  }

  // --- Clock 更新 ---
  function updateClock() {
    time.textContent = getTime();
    date.textContent = getDate();
    date.style.display = dateToggle.checked ? "" : "none";
    reqId = requestAnimationFrame(updateClock);
  }

  // --- 表示切替 ---
  function showClock() {
    [clock, settings].forEach((e) => e.classList.remove('hidden'));
  }

  function hideClock() {
    [clock, settings].forEach((e) => e.classList.add('hidden'));
  }

  function funcStart() {
    if (reqId === null) {
      updateClock();
    }
    showClock();
  }

  function funcEnd() {
    if (reqId !== null && !displayToggle.checked) {
      hideClock();
      cancelAnimationFrame(reqId);
      reqId = null;
    }
  }

  // --- 初期化 ---
  document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    // 入力変更を保存に結びつける
    [bgColor, fontColor, fontFamily, datePos, displayToggle, secondToggle, dateToggle].forEach(el => {
      el.addEventListener("input", () => {
        applyStyle();
        saveSettings();
      });
      el.addEventListener("change", () => {
        applyStyle();
        saveSettings();
      });
    });

    resetBtn.addEventListener("click", resetSettings);

    funcStart();
  });

  // ページ全体でホバー検知
  document.addEventListener("mouseenter", funcStart);
  document.addEventListener("mouseleave", funcEnd);

})();
