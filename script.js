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
  const displayMode = document.getElementById('display-mode'); // ★追加

  let reqId = null;
  let isVisible = false; // ★クリックモード用

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
      displayToggle: displayToggle.checked,
      displayMode: displayMode.value // ★追加
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
    displayMode.value = settingsData.displayMode || "hover"; // ★追加 デフォルトは hover

    applyStyle();
  }

  function resetSettings() {
    localStorage.removeItem("clockSettings");

    bgColor.value = "#000000";
    fontColor.value = "#ffffff";
    fontFamily.value = "sans-serif";
    datePos.value = "top";
    dateToggle.checked = true;
    secondToggle.checked = true;
    displayToggle.checked = false;
    displayMode.value = "hover"; // ★追加

    applyStyle();
    saveSettings();
    setDisplayMode(); // ★リセット後もイベント再設定
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
    if (reqId === null) updateClock();
    showClock();
  }

  function funcEnd() {
    if (reqId !== null && !displayToggle.checked) {
      hideClock();
      cancelAnimationFrame(reqId);
      reqId = null;
    }
  }

  // --- 表示モード変更処理 ★追加 ---
  function setDisplayMode() {
    // 既存イベントをいったん解除
    document.removeEventListener("mouseenter", funcStart);
    document.removeEventListener("mouseleave", funcEnd);
    document.removeEventListener("click", toggleClickMode);

    if (displayMode.value === "hover") {
      document.addEventListener("mouseenter", funcStart);
      document.addEventListener("mouseleave", funcEnd);
    } else if (displayMode.value === "click") {
      document.addEventListener("click", toggleClickMode);
    }
  }

  // ★クリックでトグル動作
  function toggleClickMode() {
    if (isVisible) funcEnd();
    else funcStart();
    isVisible = !isVisible;
  }

  // --- 初期化 ---
  document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    // 入力変更で保存＆反映
    [bgColor, fontColor, fontFamily, datePos, displayToggle, secondToggle, dateToggle, displayMode].forEach(el => {
      el.addEventListener("input", () => {
        applyStyle();
        saveSettings();
        if (el === displayMode) setDisplayMode(); // ★表示モード変更時に再設定
      });
      el.addEventListener("change", () => {
        applyStyle();
        saveSettings();
        if (el === displayMode) setDisplayMode();
      });
    });

    resetBtn.addEventListener("click", resetSettings);

    // 表示モード設定反映
    setDisplayMode();

    // 初期表示
    if (displayToggle.checked) funcStart();
  });
})();
