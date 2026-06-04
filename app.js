// ISO Command Dashboard - Core Logic and Calculators
// Theme: Nordic Tactical Dark (Mobile-first navigation sync)

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTicker();
  initSPECalculator();
  initVTSDecider();
  initHazardMatrix();
  initCANHelper();
  initRehabScheduler();
  initHydrationCalculator();
  initNFPA704();
  initVCECalculator();
  initGrabLivesTrainer();
  initCollapseChecklist();
});

// 1. Navigation State Management (Synced between Desktop Sidebar & Mobile Bottom Nav)
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.content-section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSectionId = btn.getAttribute('data-target');
      
      // Clear active states on all nav buttons
      navButtons.forEach(b => {
        b.classList.remove('nav-active', 'bottom-nav-active', 'text-orange-500');
        if (b.classList.contains('mobile-nav-btn')) {
          b.classList.add('text-slate-400');
        }
      });
      
      // Highlight matching buttons in both desktop sidebar & mobile bottom bar
      const matchingButtons = document.querySelectorAll(`.nav-btn[data-target="${targetSectionId}"]`);
      matchingButtons.forEach(b => {
        if (b.classList.contains('mobile-nav-btn')) {
          b.classList.add('bottom-nav-active', 'text-orange-500');
          b.classList.remove('text-slate-400');
        } else {
          b.classList.add('nav-active');
        }
      });
      
      // Show/Hide sections
      sections.forEach(section => {
        if (section.id === targetSectionId) {
          section.classList.remove('hidden');
          section.classList.add('animate-fade-in');
        } else {
          section.classList.add('hidden');
        }
      });

      // Scroll to top of window on mobile viewports
      if (window.innerWidth < 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// 2. Dynamic Safety Ticker
const tickerAlerts = [
  "⚠️ 鐵皮結構屋受熱達 538°C (1000°F) 時強度折半，極易在受熱後數分鐘內無預警塌陷！",
  "⚠️ 居室地面溫度超過 149°C (300°F) 或充滿黑火，即屬「無生還可能」之低度救援區，禁止派員進入。",
  "⚠️ 管制邊界劃設：建築物有倒塌風險時，禁入管制區 (No-Entry Zone) 須達建築物高度的 1.5 倍距離！",
  "⚠️ 氣瓶休息 20 法則：使用 1 支氣瓶休息 10 分鐘；使用 2 支氣瓶休息 20 分鐘，切勿過勞！",
  "⚠️ 消防員核心體溫一旦超過 38°C，大腦警覺性與風險決策能力將顯著下降，必須主動降溫！",
  "⚠️ 美國消防員因公殉職統計：高達 50% 肇因於現場過勞與極度壓力引發的心血管猝死。",
  "⚠️ 太陽能光電 (PV) 觸電風險：即便切斷交流電，光電板在微弱光線或火光照射下仍持續帶電！",
  "⚠️ 熱顯像儀 (TIC) 限制：遭遇鏡面、光滑磁磚或積水時會產生熱反射，高溫煙霧亦可能導致畫面「白屏」。",
  "⚠️ MAYDAY 求救黃金期：高達 40% 的求救發生在車組作業中，抵達現場後 20-25 分鐘為最高峰！",
  "⚠️ 無線電 CAN 回報：回報內容須符合 Conditions (狀況)、Actions (行動)、Needs (需求)，言簡意賅。"
];

function initTicker() {
  const container = document.getElementById('ticker-container');
  if (!container) return;

  const listHTML = [...tickerAlerts, ...tickerAlerts].map(text => `
    <div class="ticker-item flex items-center">
      <span class="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 mr-2 animate-ping"></span>
      <span>${text}</span>
    </div>
  `).join('');

  container.innerHTML = listHTML;
}

// 3. SPE Risk Calculator (Severity * Probability * Exposure)
function initSPECalculator() {
  const sSlider = document.getElementById('spe-s');
  const pSlider = document.getElementById('spe-p');
  const eSlider = document.getElementById('spe-e');
  
  const sVal = document.getElementById('spe-s-val');
  const pVal = document.getElementById('spe-p-val');
  const eVal = document.getElementById('spe-e-val');
  
  const scoreText = document.getElementById('spe-score');
  const resultAlert = document.getElementById('spe-alert');
  const resultText = document.getElementById('spe-action-text');
  const humanLifeCheckbox = document.getElementById('spe-human-life');

  function calculateSPE() {
    const s = parseInt(sSlider.value);
    const p = parseInt(pSlider.value);
    const e = parseInt(eSlider.value);
    
    sVal.textContent = s;
    pVal.textContent = p;
    eVal.textContent = e;
    
    const score = Math.round((s * p * e) / 10);
    scoreText.textContent = score;
    
    const hasHumanLife = humanLifeCheckbox.checked;
    
    const scoreCircle = document.getElementById('spe-score-circle');
    scoreCircle.className = "relative w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 ";
    
    if (score >= 81) {
      scoreCircle.classList.add('border-red-500', 'bg-red-950/20', 'text-red-400');
      resultAlert.className = "p-4 rounded-lg bg-red-950/40 border border-red-500 text-red-200";
      resultAlert.innerHTML = `<strong>🚨 極高風險階段 (Score: ${score} ≥ 81)</strong>`;
      resultText.innerHTML = `
        <ul class="list-disc pl-5 space-y-1 text-sm text-red-300 mt-2">
          <li>現場面臨極高崩塌、閃燃或化學爆炸威脅。</li>
          <li><strong>決策指引：</strong> 無論是否有待救人員，此風險已超出人體極限。必須立即撤離現場所有救災人員，或全體轉向防衛式攻擊 (Defensive Mode)。</li>
          <li>ISO 應硬性處置，要求現場指揮官下達撤退指令，並啟動安全管制與清點。</li>
        </ul>
      `;
    } else if (score >= 51) {
      scoreCircle.classList.add('border-orange-500', 'bg-orange-950/20', 'text-orange-400');
      resultAlert.className = "p-4 rounded-lg bg-orange-950/40 border border-orange-500 text-orange-200";
      
      if (hasHumanLife) {
        resultAlert.innerHTML = `<strong>⚠️ 高風險階段 (Score: ${score}，有待救人命價值)</strong>`;
        resultText.innerHTML = `
          <ul class="list-disc pl-5 space-y-1 text-sm text-orange-300 mt-2">
            <li>現場存在高風險因子，但由於<strong>仍有生還者受困 (有待救價值)</strong>，容許在嚴密管制與預防措施下進行有限度進攻。</li>
            <li><strong>決策指引：</strong> 部署快速救援小組 (RIC) 在入口待命，派遣人員進入時必須有安全官 (ISO) 進行持續性火煙與結構監視。</li>
            <li>設立明確撤退信號與路線，限制人員在火場停留時間。</li>
          </ul>
        `;
      } else {
        resultAlert.innerHTML = `<strong>🚨 不可接受風險階段 (Score: ${score} ≥ 51，無人命價值)</strong>`;
        resultText.innerHTML = `
          <ul class="list-disc pl-5 space-y-1 text-sm text-red-300 mt-2">
            <li><strong>決策指引：</strong> 現場已確定無生還可能（或為空屋/純財產保護），此時風險大於利益，<strong>超過 51 分即為不可接受風險！</strong></li>
            <li>必須停止進攻式滅火，人員禁止進入建築物，改採戶外防衛式射水，保護鄰近建築。</li>
            <li>ISO 應軟性或硬性介入，終止危險性救災行動。</li>
          </ul>
        `;
      }
    } else {
      scoreCircle.classList.add('border-emerald-500', 'bg-emerald-950/20', 'text-emerald-400');
      resultAlert.className = "p-4 rounded-lg bg-emerald-950/40 border border-emerald-500 text-emerald-200";
      resultAlert.innerHTML = `<strong>✅ 可接受風險範圍 (Score: ${score} < 51)</strong>`;
      resultText.innerHTML = `
        <ul class="list-disc pl-5 space-y-1 text-sm text-emerald-300 mt-2">
          <li>現場風險因素目前處於可控制狀態。</li>
          <li><strong>決策指引：</strong> 可允許採取進攻式滅火與搜救任務。</li>
          <li>ISO 與安全幕僚仍須持續執行 360 度環視監控，密切注意現場能量積累與煙氣變化。</li>
        </ul>
      `;
    }
  }

  [sSlider, pSlider, eSlider].forEach(slider => {
    slider.addEventListener('input', calculateSPE);
  });
  humanLifeCheckbox.addEventListener('change', calculateSPE);
  
  calculateSPE();
}

// 4. VTS Mode Evaluator (Value, Time, Size)
function initVTSDecider() {
  const valueSelect = document.getElementById('vts-value');
  const timeSelect = document.getElementById('vts-time');
  const sizeSelect = document.getElementById('vts-size');
  const resultDiv = document.getElementById('vts-result');

  function evaluateVTS() {
    const v = valueSelect.value;
    const t = timeSelect.value;
    const s = sizeSelect.value;

    let title = "";
    let tactic = "";
    let colorClass = "";

    if (v === 'none') {
      title = "🚫 低度救援模式 (Zero Rescue Profile)";
      tactic = "現場判定已無生還可能（如地面溫度破149°C、全面燃燒黑火、結構已塌陷）。應全面採取<strong>外部防衛式射水</strong>，禁止任何人員進入建築內。救災人員安全為唯一考量。";
      colorClass = "bg-red-950/40 border border-red-500 text-red-200";
    } else if (t === 'immediate') {
      title = "⚠️ 防衛式搶救模式 (Defensive Attack Only)";
      tactic = "雖然可能有人受困，但<strong>結構塌陷或閃燃在即 (Time不足)</strong>。不可派員深入搜救。應改在安全邊界外（1.5倍牆高外）採取防衛包圍，防止火勢延燒。";
      colorClass = "bg-orange-950/40 border border-orange-500 text-orange-200";
    } else if (v === 'life' && t === 'stable' && s === 'contained') {
      title = "⚡ 積極進攻搜救模式 (Aggressive Offensive)";
      tactic = "有人命待救，且時間充裕（結構尚穩定）、火勢尚侷限。可在部署水線保護下，進行<strong>積極室內搜救與進攻滅火</strong>。ISO 應在入口管控，隨時監控煙流 VVDC 變化。";
      colorClass = "bg-emerald-950/40 border border-emerald-500 text-emerald-200";
    } else if (v === 'property' && s === 'uncontrolled') {
      title = "⚠️ 侷限防範模式 (Marginal Defensive)";
      tactic = "無人受困，純屬財產保護，且火勢已失控。此時不值得讓消防員冒險進入。採取<strong>防禦式水幕阻絕</strong>，嚴防危險能量（如化學品、太陽能高壓電）波及。";
      colorClass = "bg-yellow-950/40 border border-yellow-500 text-yellow-200";
    } else {
      title = "🛡️ 協同防衛與有限搜救 (Calculated Offensive)";
      tactic = "在安全水線防護、通風排煙控制及 RIC 小組部署完成後，進行<strong>目標明確的快速搜救與滅火</strong>。ISO 必須鎖定逃生通道暢通，並監測消防員疲勞程度（落實 20 法則）。";
      colorClass = "bg-slate-900 border border-slate-700 text-slate-200";
    }

    resultDiv.className = `p-4 rounded-lg ${colorClass} mt-4 animate-fade-in`;
    resultDiv.innerHTML = `
      <h4 class="font-bold text-base flex items-center mb-1">
        <span>${title}</span>
      </h4>
      <p class="text-sm leading-relaxed">${tactic}</p>
    `;
  }

  valueSelect.addEventListener('change', evaluateVTS);
  timeSelect.addEventListener('change', evaluateVTS);
  sizeSelect.addEventListener('change', evaluateVTS);

  evaluateVTS();
}

// 5. Hazard Prioritization Matrix (5x5 Grid)
const matrixData = {
  '1-1': { level: 'L', name: '低度風險', desc: '可接受，持續常規安全監控。' },
  '1-2': { level: 'L', name: '低度風險', desc: '可接受，持續常規安全監控。' },
  '1-3': { level: 'M', name: '中度風險', desc: '須留意，加強現場管制與宣導。' },
  '1-4': { level: 'M', name: '中度風險', desc: '須留意，配置基本備份救災力量。' },
  '1-5': { level: 'S', name: '嚴重風險', desc: '重大威脅，ISO 須提出警告並列入安全計畫。' },
  '2-1': { level: 'L', name: '低度風險', desc: '可接受。' },
  '2-2': { level: 'M', name: '中度風險', desc: '須留意。' },
  '2-3': { level: 'M', name: '中度風險', desc: '加強安全監測。' },
  '2-4': { level: 'S', name: '嚴重風險', desc: '須有具體預防性防護措施。' },
  '2-5': { level: 'S', name: '嚴重風險', desc: 'ISO 有權採取軟性介入，調整部分戰術。' },
  '3-1': { level: 'M', name: '中度風險', desc: '常規管控。' },
  '3-2': { level: 'M', name: '中度風險', desc: '常規管控，警惕潛在變化。' },
  '3-3': { level: 'S', name: '嚴重風險', desc: '重大風險，需有預防性安全官跟進。' },
  '3-4': { level: 'S', name: '嚴重風險', desc: '要求 RIC 備用小組就位。' },
  '3-5': { level: 'C', name: '臨界風險', desc: '極度危險！必須考慮主動中止救災並撤離人員。' },
  '4-1': { level: 'M', name: '中度風險', desc: '安全官監控。' },
  '4-2': { level: 'S', name: '嚴重風險', desc: '須劃設明顯的黃色警戒管制區。' },
  '4-3': { level: 'S', name: '嚴重風險', desc: '安全官軟性介入，警告並修正危險行為。' },
  '4-4': { level: 'C', name: '臨界風險', desc: '現場必須下達強硬限制，採取最高規格防禦。' },
  '4-5': { level: 'C', name: '臨界風險', desc: '隨時有塌陷或突發火行為危險，下達撤退準備。' },
  '5-1': { level: 'S', name: '嚴重風險', desc: '重大危害，ISO 列為 RECON 重點項目。' },
  '5-2': { level: 'S', name: '嚴重風險', desc: '立即指派特定同仁進行安全巡迴。' },
  '5-3': { level: 'C', name: '臨界風險', desc: '立即發布無線電警訊，人員撤離主要火場。' },
  '5-4': { level: 'C', name: '臨界風險', desc: '強制介入！終止攻擊行動，全體撤退。' },
  '5-5': { level: 'C', name: '臨界風險', desc: '最危險情境，啟動 MAYDAY 應變預備，實施外部射水。' }
};

function initHazardMatrix() {
  const cells = document.querySelectorAll('.matrix-cell');
  const detailBox = document.getElementById('matrix-detail');

  cells.forEach(cell => {
    const l = cell.getAttribute('data-l');
    const s = cell.getAttribute('data-s');
    const key = `${s}-${l}`;
    const info = matrixData[key] || { level: 'L', name: '低度風險', desc: '無資料' };
    
    if (info.level === 'L') {
      cell.classList.add('bg-emerald-500/20', 'text-emerald-400');
    } else if (info.level === 'M') {
      cell.classList.add('bg-yellow-500/20', 'text-yellow-400');
    } else if (info.level === 'S') {
      cell.classList.add('bg-orange-500/20', 'text-orange-400');
    } else if (info.level === 'C') {
      cell.classList.add('bg-red-500/20', 'text-red-400', 'animate-pulse');
    }

    cell.addEventListener('click', () => {
      cells.forEach(c => c.classList.remove('ring-2', 'ring-white'));
      cell.classList.add('ring-2', 'ring-white');

      let badgeColor = '';
      if (info.level === 'L') badgeColor = 'bg-emerald-500 text-slate-900';
      else if (info.level === 'M') badgeColor = 'bg-yellow-500 text-slate-900';
      else if (info.level === 'S') badgeColor = 'bg-orange-500 text-white';
      else if (info.level === 'C') badgeColor = 'bg-red-500 text-white animate-bounce';

      detailBox.innerHTML = `
        <div class="flex items-center space-x-2 mb-2">
          <span class="px-2 py-0.5 rounded text-xs font-bold ${badgeColor}">${info.name}</span>
          <span class="text-xs text-slate-400 font-mono">矩陣座標: [S:${s}, P:${l}]</span>
        </div>
        <p class="text-sm font-medium text-slate-100">${info.desc}</p>
        <p class="text-xs text-slate-400 mt-2">※ 嚴重程度(S)由 1-輕微 到 5-災難性；發生機率(P)由 1-極低 到 5-頻繁發生。</p>
      `;
    });
  });

  if (cells.length > 0) cells[0].click();
}

// 6. Radio CAN Helper
function initCANHelper() {
  const cInput = document.getElementById('can-c');
  const aInput = document.getElementById('can-a');
  const nInput = document.getElementById('can-n');
  const previewDiv = document.getElementById('can-preview');
  const copyBtn = document.getElementById('copy-can-btn');

  function updateCANPreview() {
    const c = cInput.value.trim() || "(請填寫火場現況，如：二樓濃煙、鐵皮屋頂軟化)";
    const a = aInput.value.trim() || "(請填寫正進行的動作，如：進行佈線射水、人員撤退中)";
    const n = nInput.value.trim() || "(請填寫所需資源或協助，如：需要排煙車支援、需要一組氣瓶)";
    
    const now = new Date().toLocaleTimeString();

    const formattedText = `【無線電 CAN 戰術回報】
C (Conditions) 狀況：${c}
A (Actions) 行動：${a}
N (Needs) 需求：${n}
[時間標記: ${now}] - 請依 3C 原則 (Connect 連接, Convey 傳達, Confirm 確認) 呼叫指揮官！`;

    previewDiv.textContent = formattedText;
  }

  [cInput, aInput, nInput].forEach(input => {
    input.addEventListener('input', updateCANPreview);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(previewDiv.textContent).then(() => {
      const originalText = copyBtn.innerText;
      copyBtn.innerText = "✅ 複製成功！";
      copyBtn.classList.remove('bg-orange-600', 'hover:bg-orange-700');
      copyBtn.classList.add('bg-emerald-600');
      
      setTimeout(() => {
        copyBtn.innerText = originalText;
        copyBtn.classList.remove('bg-emerald-600');
        copyBtn.classList.add('bg-orange-600', 'hover:bg-orange-700');
      }, 2000);
    });
  });

  updateCANPreview();
}

// 7. REHAB 20-Rule Rest Scheduler
let rehabTimer = null;
let rehabSecondsLeft = 0;
let rehabIsPaused = true;

function initRehabScheduler() {
  const rule1Btn = document.getElementById('rehab-rule-1');
  const rule2Btn = document.getElementById('rehab-rule-2');
  const timerDisplay = document.getElementById('rehab-timer-display');
  const startBtn = document.getElementById('rehab-start');
  const pauseBtn = document.getElementById('rehab-pause');
  const resetBtn = document.getElementById('rehab-reset');
  const timerLabel = document.getElementById('rehab-timer-label');

  function updateDisplay() {
    const mins = Math.floor(rehabSecondsLeft / 60);
    const secs = rehabSecondsLeft % 60;
    timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function setTimer(minutes, labelText) {
    clearInterval(rehabTimer);
    rehabSecondsLeft = minutes * 60;
    rehabIsPaused = true;
    timerLabel.textContent = labelText;
    updateDisplay();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  rule1Btn.addEventListener('click', () => {
    setTimer(10, "任務階段：使用1支氣瓶/工作20分鐘 (建議休息10分鐘)");
    rule1Btn.className = "px-3 py-1.5 rounded text-xs font-semibold bg-orange-600 text-white";
    rule2Btn.className = "px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700";
  });

  rule2Btn.addEventListener('click', () => {
    setTimer(20, "任務階段：使用2支氣瓶/工作40分鐘 (建議休息20分鐘)");
    rule2Btn.className = "px-3 py-1.5 rounded text-xs font-semibold bg-orange-600 text-white";
    rule1Btn.className = "px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700";
  });

  startBtn.addEventListener('click', () => {
    if (!rehabIsPaused) return;
    rehabIsPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    rehabTimer = setInterval(() => {
      if (rehabSecondsLeft > 0) {
        rehabSecondsLeft--;
        updateDisplay();
      } else {
        clearInterval(rehabTimer);
        playTimerAlarm();
        alert("🚨 安全官提示：消防員休息時間結束！請再次評估心率、血壓與體溫方可重新投入救災。");
        rehabIsPaused = true;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
      }
    }, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    clearInterval(rehabTimer);
    rehabIsPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(rehabTimer);
    rehabIsPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    if (timerLabel.textContent.includes("20分鐘")) {
      rehabSecondsLeft = 20 * 60;
    } else {
      rehabSecondsLeft = 10 * 60;
    }
    updateDisplay();
  });

  rule1Btn.click();
}

function playTimerAlarm() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }, i * 700);
    }
  } catch (e) {
    console.log("Audio API not supported or blocked.");
  }
}

// 8. Hydration Calculator
function initHydrationCalculator() {
  const durationInput = document.getElementById('hydrate-duration');
  const resultText = document.getElementById('hydrate-result-text');

  function calculateHydration() {
    const minutes = parseInt(durationInput.value) || 0;
    if (minutes <= 0) {
      resultText.innerHTML = `<span class="text-slate-400">請輸入工作時間計算補水量。</span>`;
      return;
    }

    const minWater = Math.round((minutes / 20) * 120);
    const maxWater = Math.round((minutes / 15) * 240);

    resultText.innerHTML = `
      <div class="text-sm font-semibold text-slate-200">
        預估所需補充水分與電解質：<br>
        <span class="text-lg text-orange-400 font-mono">${minWater} - ${maxWater} ml</span>
      </div>
      <p class="text-xs text-slate-400 mt-2 leading-relaxed">
        <strong>💡 安全指引：</strong><br>
        1. 勿一次性灌入大量純水，以防發生低鈉血症（水中毒）。<br>
        2. 建議飲用 <strong>15°C 左右</strong> 的冰水或運動飲料（稀釋比率 1:1），以達最佳胃排空率與降溫效果。<br>
        3. 現場避免飲用含有高糖分、高咖啡因或酒精之飲料，此類飲品會加速脫水。
      </p>
    `;
  }

  durationInput.addEventListener('input', calculateHydration);
  calculateHydration();
}

// 9. NFPA 704 Chemical Hazard Diamond
const nfpaLegends = {
  health: {
    0: "0 - 常規物質：無異常危險（如水）。",
    1: "1 - 輕微危害：可能造成皮膚發炎，微小傷害。",
    2: "2 - 中度危害：短暫接觸可能造成暫時失能或殘留傷害。",
    3: "3 - 嚴重危害：短暫接觸可能造成嚴重暫時或永久性傷害（如氯氣）。",
    4: "4 - 致命危害：極短時間接觸可能致死或重大傷害（如氰化氫）。"
  },
  fire: {
    0: "0 - 不燃物質：在正常環境下不會燃燒（如水）。",
    1: "1 - 高溫可燃：閃點高於 93°C，需強烈預熱才會燃燒。",
    2: "2 - 中度可燃：閃點在 38°C 至 93°C 之間，適度加熱才會燃燒。",
    3: "3 - 易燃液體：閃點低於 38°C，在大多數常溫下極易被引燃。",
    4: "4 - 極度易燃：常溫常壓下即為氣體或極易揮發，閃點低於 23°C。"
  },
  react: {
    0: "0 - 穩定物質：即使暴露在火場中也十分穩定，與水不反應。",
    1: "1 - 高溫不穩定：在高溫高壓下可能發生激烈化學變化。",
    2: "2 - 激烈化學變化：在高溫或與水混合時可能發生劇烈反應，但不會爆炸。",
    3: "3 - 爆震物質：在強引爆源或與水劇烈反應時可能發生爆震或爆炸。",
    4: "4 - 極易爆炸：在常溫常壓下自身極易發生爆震、爆炸或分解反應。"
  },
  spec: {
    "": "無特殊符號限制。",
    "W": "⚠️ 禁水 (<s>W</s>)：與水會發生激烈反應或爆炸，嚴禁射水！",
    "OX": "🔥 強氧化劑 (OX)：會加劇火勢，禁止與有機物堆放。",
    "SA": "💨 窒息性氣體 (SA)：可能導致現場缺氧，須穿戴 SCBA。"
  }
};

function initNFPA704() {
  const hSelect = document.getElementById('nfpa-h-select');
  const fSelect = document.getElementById('nfpa-f-select');
  const rSelect = document.getElementById('nfpa-r-select');
  const sSelect = document.getElementById('nfpa-s-select');

  const hText = document.getElementById('nfpa-h-text');
  const fText = document.getElementById('nfpa-f-text');
  const rText = document.getElementById('nfpa-r-text');
  const sText = document.getElementById('nfpa-s-text');

  const descDiv = document.getElementById('nfpa-desc-container');

  function updateDiamond() {
    const h = hSelect.value;
    const f = fSelect.value;
    const r = rSelect.value;
    const s = sSelect.value;

    hText.textContent = h;
    fText.textContent = f;
    rText.textContent = r;
    
    if (s === "W") {
      sText.innerHTML = `<span style="text-decoration: line-through;">W</span>`;
    } else {
      sText.textContent = s || " ";
    }

    descDiv.innerHTML = `
      <div class="space-y-1.5 text-xs">
        <div class="flex items-start"><span class="w-4 h-4 rounded bg-blue-500 mr-2 flex-shrink-0"></span><span class="text-blue-300 font-semibold mr-1">健康危害:</span> <span class="text-slate-200">${nfpaLegends.health[h]}</span></div>
        <div class="flex items-start"><span class="w-4 h-4 rounded bg-red-500 mr-2 flex-shrink-0"></span><span class="text-red-300 font-semibold mr-1">易燃程度:</span> <span class="text-slate-200">${nfpaLegends.fire[f]}</span></div>
        <div class="flex items-start"><span class="w-4 h-4 rounded bg-yellow-500 mr-2 flex-shrink-0"></span><span class="text-yellow-300 font-semibold mr-1">不穩定性:</span> <span class="text-slate-200">${nfpaLegends.react[r]}</span></div>
        <div class="flex items-start"><span class="w-4 h-4 rounded bg-slate-100 mr-2 flex-shrink-0 border border-slate-300"></span><span class="text-slate-300 font-semibold mr-1">特殊標記:</span> <span class="text-slate-200">${nfpaLegends.spec[s]}</span></div>
      </div>
    `;
  }

  [hSelect, fSelect, rSelect, sSelect].forEach(select => {
    select.addEventListener('change', updateDiamond);
  });

  updateDiamond();
}

// 10. LNG VCE Blast Estimator (Vapor Cloud Explosion)
function initVCECalculator() {
  const lngMassInput = document.getElementById('vce-mass');
  const reactivitySelect = document.getElementById('vce-reactivity');
  const densitySelect = document.getElementById('vce-density');
  const resultDiv = document.getElementById('vce-result-container');

  function calculateVCE() {
    const mass = parseFloat(lngMassInput.value) || 0;
    if (mass <= 0) {
      resultDiv.innerHTML = `<p class="text-slate-400 text-xs">請輸入預估洩漏量以計算爆風安全半徑。</p>`;
      return;
    }

    const reactivity = parseFloat(reactivitySelect.value);
    const density = parseFloat(densitySelect.value);

    const baseC = 18;
    const finalC = baseC * reactivity * density;
    
    const cubeRootMass = Math.pow(mass, 1/3);
    const safeEvacDistance = Math.round(finalC * cubeRootMass);
    const heavyDamageDistance = Math.round(0.35 * finalC * cubeRootMass);
    const fatalityDistance = Math.round(0.15 * finalC * cubeRootMass);

    resultDiv.innerHTML = `
      <div class="space-y-3 mt-2">
        <div class="grid grid-cols-3 gap-2">
          <div class="p-2 rounded bg-red-950/40 border border-red-800 text-center">
            <div class="text-[10px] text-red-400 font-semibold">1.0 bar 致命爆風半徑</div>
            <div class="text-base font-bold text-red-200 font-mono mt-0.5">${fatalityDistance} m</div>
          </div>
          <div class="p-2 rounded bg-orange-950/40 border border-orange-800 text-center">
            <div class="text-[10px] text-orange-400 font-semibold">0.3 bar 重損毀半徑</div>
            <div class="text-base font-bold text-orange-200 font-mono mt-0.5">${heavyDamageDistance} m</div>
          </div>
          <div class="p-2 rounded bg-emerald-950/40 border border-emerald-800 text-center">
            <div class="text-[10px] text-emerald-400 font-semibold">安全疏散警戒距離</div>
            <div class="text-base font-bold text-emerald-200 font-mono mt-0.5">${safeEvacDistance} m</div>
          </div>
        </div>
        
        <div class="p-3 rounded bg-slate-900 border border-slate-700 text-xs space-y-1.5 text-slate-300">
          <div><strong class="text-orange-400">物理機制解析（謝爾金效應）：</strong></div>
          <p class="leading-relaxed">
            港口 LNG 洩漏時，在遭遇高度擁擠障礙物區域（如貨櫃堆疊、密集群體）時，火焰傳播會被反射波加速。
            多能量模型 (MEM) 指出，<strong>空間擁擠度與燃料活性</strong> 是導致爆震蒸氣雲爆炸 (VCE) 的最關鍵原因。
            在安全規劃中，應於擁擠區設置<strong>防爆導流牆</strong>，或確保洩漏槽區周圍維持至少 <strong class="text-white">${safeEvacDistance}公尺</strong> 的防火防爆空地。
          </p>
        </div>
      </div>
    `;
  }

  lngMassInput.addEventListener('input', calculateVCE);
  reactivitySelect.addEventListener('change', calculateVCE);
  densitySelect.addEventListener('change', calculateVCE);

  calculateVCE();
}

// 11. GRAB LIVES Self-Rescue Trainer
const grabLivesSteps = [
  {
    step: "G",
    title: "Gauge (檢查氣壓)",
    desc: "即時確認空氣瓶餘量！回報求救時，向指揮官提供確切的可運作時間（氣體磅數/分鐘），以利RIC評估救援時限。",
    action: "查看胸前壓力錶，記下磅數。"
  },
  {
    step: "R",
    title: "Radio (無線電求救)",
    desc: "立即切換至專用頻道，清晰重複發送三次『MAYDAY, MAYDAY, MAYDAY』，並依 LUNAR 架構回報：Location (位置)、Unit (單位)、Name (姓名)、Assignment (任務)、Resources (需求)。",
    action: "發出 MAYDAY 呼叫，並進行 LUNAR 簡要報告。"
  },
  {
    step: "A",
    title: "Activate (啟動救命器)",
    desc: "手動開啟個人警報器（PASS 裝置）至持續鳴叫狀態。若環境過於吵雜或需無線電通話，可短暫關閉，通話後立即重啟。",
    action: "手動切換 PASS 裝置至緊急警報模式。"
  },
  {
    step: "B",
    title: "Breathe (控制呼吸)",
    desc: "保持冷靜，實施節奏式呼吸（吸氣2秒、憋氣2秒、吐氣4秒），以極大化空氣瓶殘氣的使用時長，杜絕因恐慌引發的換氣過度。",
    action: "進行三次深長慢呼吸，穩定心率。"
  },
  {
    step: "L",
    title: "Low (保持低姿勢)",
    desc: "避開頂部高熱煙流（高溫常破數百度）與有毒物質，貼近地面爬行。地面溫度與視野相對較佳，且含有較多氧氣。",
    action: "將身體重心壓至最低，手腳著地貼近地面。"
  },
  {
    step: "I",
    title: "Illuminate (照亮通道)",
    desc: "將手電筒與胸前照明燈垂直向上指向天花板或通道出口。即使倒地，燈光亦能形成光斑，方便 RIC 搜救人員從濃煙中定位。",
    action: "開啟所有照明裝置，將燈光朝向易被發現之方向。"
  },
  {
    step: "V",
    title: "Volume (製造聲響)",
    desc: "使用破拆工具、斧頭或鐵槌，用力敲擊牆壁、水管、地板或鐵皮外牆，發出規律的金屬敲擊聲（如三聲一組），與 PASS 裝置協同定位。",
    action: "尋找硬物並製造規律的敲擊聲。"
  },
  {
    step: "E",
    title: "Exit (尋找出口)",
    desc: "沿著水線（順著母接頭出火場方向）、尋找牆壁邊緣或窗戶撤退。如果發現有窗戶，設法破窗以取得新鮮空氣並標示位置。",
    action: "沿水線觸摸或摸牆尋找通道。"
  },
  {
    step: "S",
    title: "Shield (防護隔絕)",
    desc: "如果無法逃出，應關閉房門以阻擋火勢與高溫，用衣物堵住門縫防煙。在窗口或牆角就地避難，並把安全防護衣（面罩、手套）完全穿戴好，阻絕熱輻射。",
    action: "緊閉避難空間門窗，將面罩完全密封防護。"
  }
];

let currentGrabStep = 0;

function initGrabLivesTrainer() {
  const badge = document.getElementById('grab-badge');
  const title = document.getElementById('grab-title');
  const desc = document.getElementById('grab-desc');
  const actionText = document.getElementById('grab-action');
  const nextBtn = document.getElementById('grab-next');
  const prevBtn = document.getElementById('grab-prev');
  const progressBar = document.getElementById('grab-progress');

  function updateTrainer() {
    const s = grabLivesSteps[currentGrabStep];
    badge.textContent = s.step;
    title.textContent = s.title;
    desc.textContent = s.desc;
    actionText.textContent = s.action;
    
    const progressPercent = ((currentGrabStep + 1) / grabLivesSteps.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    prevBtn.disabled = currentGrabStep === 0;
    
    if (currentGrabStep === grabLivesSteps.length - 1) {
      nextBtn.innerHTML = `<span>完成模擬 ↺</span>`;
    } else {
      nextBtn.innerHTML = `<span>下一步</span> <i class="fas fa-chevron-right ml-1"></i>`;
    }
  }

  nextBtn.addEventListener('click', () => {
    if (currentGrabStep < grabLivesSteps.length - 1) {
      currentGrabStep++;
      updateTrainer();
    } else {
      currentGrabStep = 0;
      updateTrainer();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentGrabStep > 0) {
      currentGrabStep--;
      updateTrainer();
    }
  });

  updateTrainer();
}

// 12. Tin House Collapse 5-Step Checklist
const collapseStepsDetails = {
  step1: "鋼樑與輕鋼架受熱達 538°C (1000°F) 時強度流失 50%。鐵皮屋頂或外牆若有紅熱變色，代表已臨界極限溫度。",
  step2: "高溫氣體在大氣壓力下尋求出口。大量煙霧從鐵皮縫隙、接縫處『極度高壓、流速極快』噴出，代表內部已蓄積巨大熱量與氣體。",
  step3: "鐵皮受熱膨脹，但受限於固定螺栓與鋼架，會產生強烈的金屬扭曲、擠壓聲、或沉悶的爆裂聲。",
  step4: "鐵皮屋頂、外牆或主支柱發生肉眼可見的下陷、扭曲、或不自然外凸，這是塌陷前數十秒的最終預兆！",
  step5: "現場射水直接打在已經處於極度高溫的鐵皮結構上，會導致鋼材急遽冷卻、熱脹冷縮不均，加速固定點拉脫與塌陷。"
};

function initCollapseChecklist() {
  const checkboxes = document.querySelectorAll('.collapse-chk');
  const progressText = document.getElementById('collapse-progress-text');
  const warningDiv = document.getElementById('collapse-warning-indicator');

  function updateCollapseRisk() {
    let checkedCount = 0;
    checkboxes.forEach(chk => {
      if (chk.checked) checkedCount++;
    });

    const percentage = checkedCount * 20;
    progressText.textContent = `倒塌預兆符合度: ${percentage}% (${checkedCount}/5)`;

    const progressBar = document.getElementById('collapse-progress');
    progressBar.style.width = `${percentage}%`;

    warningDiv.className = "p-4 rounded-lg transition-all duration-300 ";
    
    if (checkedCount >= 4) {
      warningDiv.classList.add('bg-red-950/50', 'border', 'border-red-500', 'pulse-red-border');
      warningDiv.innerHTML = `
        <div class="flex items-center text-red-400 font-bold mb-1 text-sm">
          <i class="fas fa-exclamation-triangle mr-2 text-base animate-bounce"></i>
          <span>🚨 倒塌危險極高 (極度危急)</span>
        </div>
        <p class="text-xs text-red-200 leading-relaxed">
          符合 4 項以上倒塌徵兆！鐵皮結構隨時可能發生整體性垮塌。
          <strong>安全官指令：</strong> 應立即透過無線電通報現場全體人員『緊急撤退』，撤離至建築物高度 1.5 倍以上的安全禁入管制區！
        </p>
      `;
    } else if (checkedCount >= 2) {
      warningDiv.classList.add('bg-orange-950/40', 'border', 'border-orange-500');
      warningDiv.innerHTML = `
        <div class="flex items-center text-orange-400 font-bold mb-1 text-sm">
          <i class="fas fa-exclamation-circle mr-2 text-base"></i>
          <span>⚠️ 結構受損警訊 (密切觀察)</span>
        </div>
        <p class="text-xs text-orange-200 leading-relaxed">
          已出現結構破壞先兆。安全官應通知指揮官限制人員進攻深度，避免在鐵皮懸挑或無橫樑支撐區域下方逗留，並做好撤離準備。
        </p>
      `;
    } else if (checkedCount >= 1) {
      warningDiv.classList.add('bg-yellow-950/30', 'border', 'border-yellow-600/50');
      warningDiv.innerHTML = `
        <div class="flex items-center text-yellow-400 font-bold mb-1 text-sm">
          <i class="fas fa-info-circle mr-2"></i>
          <span>ℹ️ 煙熱跡象初顯 (持續監視)</span>
        </div>
        <p class="text-xs text-yellow-200 leading-relaxed">
          內部火勢已波及建築結構骨架。ISO 應在 360 度 RECON 巡迴中重點記錄該側牆面與屋頂的受熱時間。
        </p>
      `;
    } else {
      warningDiv.classList.add('bg-slate-900', 'border', 'border-slate-800');
      warningDiv.innerHTML = `
        <div class="flex items-center text-slate-400 font-medium mb-1 text-sm">
          <i class="fas fa-check-circle mr-2"></i>
          <span>結構無明顯變異</span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          尚未觀測到明顯的鐵皮倒塌徵兆。請安全官定時進行 RECON 巡視並持續評估。
        </p>
      `;
    }
  }

  checkboxes.forEach(chk => {
    chk.addEventListener('change', updateCollapseRisk);
    
    const label = chk.nextElementSibling;
    if (label) {
      const stepId = chk.id;
      if (collapseStepsDetails[stepId]) {
        label.setAttribute('data-tooltip', collapseStepsDetails[stepId]);
        label.classList.add('tooltip', 'cursor-help');
      }
    }
  });

  updateCollapseRisk();
}

const quizData = [
  {
    scenario: "彰化防疫旅館高層火警 (喬友大樓改編)",
    visualHtml: `
     <svg viewBox="0 0 400 300" class="w-full h-full bg-[#0b0f19]">
       <defs>
         <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
           <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(51, 65, 85, 0.15)" stroke-width="1"/>
         </pattern>
         <linearGradient id="smoke-grad" x1="0" y1="1" x2="0" y2="0">
           <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
           <stop offset="30%" stop-color="#3b4252" stop-opacity="0.9"/>
           <stop offset="100%" stop-color="#0b0f19" stop-opacity="0.3"/>
         </linearGradient>
       </defs>
       <rect width="100%" height="100%" fill="url(#grid)" />
       <rect x="120" y="20" width="160" height="260" fill="rgba(30, 41, 59, 0.4)" stroke="#475569" stroke-width="2" rx="4"/>
       <line x1="120" y1="60" x2="280" y2="60" stroke="#475569" stroke-dasharray="2 2"/>
       <line x1="120" y1="100" x2="280" y2="100" stroke="#475569" stroke-dasharray="2 2"/>
       <line x1="120" y1="140" x2="280" y2="140" stroke="#475569" stroke-dasharray="2 2"/>
       <line x1="120" y1="180" x2="280" y2="180" stroke="#ef4444" stroke-width="1.5"/>
       <line x1="120" y1="220" x2="280" y2="220" stroke="#475569" stroke-dasharray="2 2"/>
       <rect x="250" y="30" width="20" height="240" fill="rgba(15, 23, 42, 0.8)" stroke="#ef4444" stroke-width="1" stroke-opacity="0.4"/>
       <path d="M130,220 C130,180 180,180 180,220 Z M160,220 C160,190 200,190 200,220 Z" fill="#ef4444" opacity="0.6"/>
       <path d="M140,220 C140,195 170,195 170,220 Z M170,220 C170,200 190,200 190,220 Z" fill="#f97316" opacity="0.8"/>
       <path d="M250,220 C250,140 260,100 260,30 L270,30 C270,100 260,140 260,220 Z" fill="url(#smoke-grad)"/>
       <ellipse cx="200" cy="50" rx="60" ry="25" fill="#3b4252" opacity="0.8"/>
       <ellipse cx="210" cy="90" rx="50" ry="20" fill="#3b4252" opacity="0.7"/>
       <rect x="135" y="40" width="45" height="16" rx="3" fill="#f59e0b" opacity="0.9"/>
       <text x="157" y="52" fill="#000" font-size="9" font-weight="900" text-anchor="middle">受困區 9F</text>
       <text x="50" y="210" fill="#ef4444" font-size="10" font-weight="bold">起火層 (2-3F)</text>
       <text x="50" y="90" fill="#f97316" font-size="10" font-weight="bold">濃煙波及 (7-9F)</text>
       <text x="295" y="140" fill="#cbd5e1" font-size="10" font-weight="bold">電梯垂直井通道</text>
     </svg>
    `,
    description: "暗夜大樓火警，火勢位於 2-3 樓，但濃煙迅速沿著電梯井與樓梯間向高層擴散。7-9 樓的防疫旅館內部有多名旅客因受困無法逃生，且無線電回報已有多名搜救隊員深入搜救，但目前頻道混雜，有分隊回報空氣瓶即將用盡。",
    observationOptions: [
      { text: "高樓層高窗有大量黑灰色濃煙向上竄出", correct: true },
      { text: "大門入口處空氣呈平靜雙向層流", correct: false },
      { text: "無線電頻道通訊極度頻繁且吵雜混亂", correct: true },
      { text: "現場有太陽能直流高壓電觸電標誌", correct: false },
      { text: "多組搜救人員已深入室內超過 20 分鐘卻無 PAR 回報", correct: true }
    ],
    question: "在此極度吵雜、搜救小組已工作超過 20 分鐘（已達 1 支氣瓶的生理臨界極限）且多組人馬失去主動 PAR 清點回報的情況下，身為現場安全官 (ISO)，您的最適當介入處置為何？",
    choices: [
      { text: "A. 採取「軟性介入」：私下以無線電呼叫各小組長提醒注意氣量，避免打擾現場指揮官。", correct: false, feedback: "不正確。在這種濃煙大範圍蔓延且失去 PAR 的緊急情況下，時間就是生命，被動或私下的小範圍提醒極易被忽視，無法應對系統性失聯危險。" },
      { text: "B. 採取「硬性介入」與現場協調：立即通報指揮官要求淨空頻道（或指派分流頻道），對所有深入小組實施 PAR 清點，並促請指揮官指派入口的快速救援小組 (RIC) 做好搜救與接替準備。", correct: true, feedback: "正確！喬友大樓火災的血淚教訓之一是空氣管理失效與無線電混雜。當搜救小組失去定時 PAR 回報且處於極限時間時，ISO 必須立刻以硬性管制督導指揮官執行清點與 RIC 的預防性部署，以阻斷受困氣瓶用盡殉職的鏈條。" },
      { text: "C. 為了防止通訊過載，安全官應自行穿戴 SCBA (空氣呼吸器) 親自進入火場尋找失聯小組。", correct: false, feedback: "不正確。安全官 (ISO) 應在外部實施全面性安全管制與狀況監控，絕不能私自脫離崗位進入火場搜救，這會導致現場安全監控機制完全停擺，甚至讓 ISO 自己也陷入受困危險。" }
    ]
  },
  {
    scenario: "輕鋼構鐵皮屋工廠火警 (敬鵬工業改編)",
    visualHtml: `
     <svg viewBox="0 0 400 300" class="w-full h-full bg-[#0b0f19]">
       <defs>
         <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
           <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(51, 65, 85, 0.15)" stroke-width="1"/>
         </pattern>
         <linearGradient id="heat-grad" x1="0" y1="1" x2="0" y2="0">
           <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9"/>
           <stop offset="60%" stop-color="#ef4444" stop-opacity="0.4"/>
           <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.1"/>
         </linearGradient>
       </defs>
       <rect width="100%" height="100%" fill="url(#grid)" />
       <line x1="20" y1="260" x2="380" y2="260" stroke="#475569" stroke-width="3"/>
       <path d="M40,260 L40,140 L200,100 L360,140 L360,260" fill="none" stroke="#334155" stroke-width="6"/>
       <path d="M60,260 L60,150 L200,125 L340,150 L340,260" fill="none" stroke="url(#heat-grad)" stroke-width="4" stroke-linecap="round"/>
       <path d="M60,150 Q200,165 340,150" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="3 3"/>
       <ellipse cx="200" cy="110" rx="35" ry="18" fill="#1e293b" opacity="0.95"/>
       <ellipse cx="180" cy="90" rx="45" ry="22" fill="#0f172a" opacity="0.9"/>
       <ellipse cx="220" cy="75" rx="55" ry="25" fill="#090d16" opacity="0.8"/>
       <path d="M200,125 L200,145" fill="none" stroke="#ef4444" stroke-width="2"/>
       <text x="200" y="185" fill="#ef4444" font-size="10" font-weight="bold" text-anchor="middle">屋頂鋼樑軟化下陷 (Critical)</text>
       <text x="200" y="45" fill="#cbd5e1" font-size="11" font-weight="extrabold" text-anchor="middle">⚠️ 湍流高壓黑煙</text>
       <text x="95" y="230" fill="#ef4444" font-size="9" font-weight="bold" transform="rotate(-90 95 230)">TEMP > 538°C (強度折半)</text>
       <path d="M200,135 L200,150" fill="none" stroke="#ef4444" stroke-width="2"/>
       <polygon points="200,155 196,147 204,147" fill="#ef4444"/>
     </svg>
    `,
    description: "大跨度單層鐵皮結構工廠起火，內部堆放大量印刷電路板原料與化學儲槽。你到達時發現外牆局部已受高溫輻射呈現紅熱變色，金屬擠壓扭曲聲此起彼落，屋頂縫隙噴出湍流黑色濃煙。指揮官正準備下令消防員佈線入內進行全面搜救與火點搶攻。",
    observationOptions: [
      { text: "鐵皮屋頂及外牆部分受熱呈現紅熱、變形", correct: true },
      { text: "煙霧呈湍流狀（Turbulent Smoke）由縫隙高壓噴出", correct: true },
      { text: "發出強烈金屬扭曲、敲擊爆裂聲", correct: true },
      { text: "現場無任何倒塌徵兆，結構非常穩定", correct: false }
    ],
    question: "現場經 360 度 RECON 確認「無待救人命價值（已確定無人受困）」，但鐵皮屋頂與結構隨時面臨軟化崩塌危險（符合鐵皮倒塌多項指標）。面對指揮官的入內攻擊命令，做為現場安全官 (ISO)，您的最適當決策為何？",
    choices: [
      { text: "A. 尊重指揮官進攻命令，叮囑入內隊員動作加快、迅速撤出。", correct: false, feedback: "不正確。大跨度輕鋼構鐵皮在高溫 (538°C) 下極易在幾分鐘內無預警塌陷。既然現場已判定無人命受困（無救援價值），依據消防法退避權與 ISO 標準程序，決不能讓同仁進入隨時會崩塌的致命區域。" },
      { text: "B. 採取「硬性干預」：立即命令準備進入的同仁「停止動作並立刻撤退」，同時促請指揮官下達防衛性搶救指令，全面改採外部射水阻絕。", correct: true, feedback: "正確！依據消防法第 20-1 條之退避權，無待救人命價值且高度危險時，得改採防衛式搶救。ISO 具有緊急情況下的戰術終止權（硬性干預），必須強行制止危險進攻，撤離至 1.5 倍牆高外的安全區。" },
      { text: "C. 採取「軟性干預」：在入口處口頭警告隊員注意安全，若看到天花板掉落再行撤退。", correct: false, feedback: "不正確。輕鋼構鐵皮屋的塌陷是整體性、無預警且極速的。一旦天花板開始大量掉落，內部人員已無逃生時間。必須在倒塌徵兆顯現時就提前果斷撤離。" }
    ]
  },
  {
    scenario: "住宅太陽能光電板火警",
    visualHtml: `
     <svg viewBox="0 0 400 300" class="w-full h-full bg-[#0b0f19]">
       <rect width="100%" height="100%" fill="url(#grid)" />
       <rect x="130" y="160" width="140" height="100" fill="rgba(30, 41, 59, 0.4)" stroke="#475569" stroke-width="2"/>
       <polygon points="110,160 200,90 290,160" fill="rgba(15, 23, 42, 0.9)" stroke="#475569" stroke-width="2"/>
       <polygon points="140,135 200,92 200,110 140,150" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
       <polygon points="260,135 200,92 200,110 260,150" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1.5"/>
       <path d="M150,135 C150,115 170,115 170,135 Z M180,115 C180,95 200,95 200,115 Z" fill="#ef4444" opacity="0.7"/>
       <path d="M200,105 L195,120 L202,120 L198,135 L208,118 L201,118 Z" fill="#f59e0b"/>
       <text x="200" y="80" fill="#f97316" font-size="10" font-weight="bold" text-anchor="middle">直流端 DC 高壓持續輸出</text>
       <path d="M40,240 L160,135" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="4 4"/>
       <circle cx="160" cy="135" r="8" fill="#ef4444" opacity="0.3"/>
       <text x="70" y="175" fill="#ef4444" font-size="9" font-weight="bold" transform="rotate(-40 70 175)">直流水柱 (DANGER: 導電)</text>
       <path d="M40,260 L240,140" fill="none" stroke="#10b981" stroke-width="1.5"/>
       <path d="M220,150 L250,135 L240,165 Z" fill="#10b981" opacity="0.3"/>
       <text x="110" y="215" fill="#10b981" font-size="9" font-weight="bold" transform="rotate(-31 110 215)">霧狀射水 (SAFE: 保持3m)</text>
     </svg>
    `,
    description: "一棟三層透天住宅起火，頂樓裝設滿版太陽能光電板 (PV)。此時正值中午烈日，火舌已燒至屋頂太陽能板，現場產生大量毒性塑料燒灼黑煙。消防分隊長準備帶隊攜帶破拆工具直接擊碎板面以打開排煙口，並指示水線正面朝屋頂射水。",
    observationOptions: [
      { text: "屋頂排滿太陽能光電板並正被熊熊烈火吞噬", correct: true },
      { text: "現場無任何太陽能發電設備", correct: false },
      { text: "正值中午烈日，光照強烈", correct: true },
      { text: "直流電端 (DC) 持續輸出高壓電", correct: true }
    ],
    question: "考慮到太陽能光電設備的特殊物理屬性與危險性能量（直流高壓電觸電風險），做為現場安全官 (ISO)，您應如何進行安全管控與介入？",
    choices: [
      { text: "A. 同意分隊長破拆，因為迅速排煙降溫是首要戰術，且只要拉下交流電閘就完全沒有觸電風險。", correct: false, feedback: "不正確。拉下電閘只能切斷交流電（AC）。直流端（DC）只要在太陽光、甚至現場火光的照射下，就會持續產生高壓直流電。破拆太陽能板會造成電弧飛濺與觸電危險。" },
      { text: "B. 立即介入制止物理撞擊與破拆，要求射水隊員維持至少 3 公尺的安全距離，且必須使用「霧狀射水」嚴禁使用直流水柱正面沖擊，並督導隊員嚴禁踩踏面板。", correct: true, feedback: "正確！太陽能面板在受光照時 DC 導線持續帶電。ISO 應制止對面板的直接物理破拆以防觸電，射水必須保持距離並用霧狀水（水霧顆粒不連續，不易導電），且警告隊員嚴禁踩踏受熱脆弱的太陽能板。" },
      { text: "C. 要求水線靠近至 1 公尺內，用柱狀直流水柱將面板全部擊碎以中斷其發電功能。", correct: false, feedback: "不正確。用柱狀直流水在近距離射擊帶電板面會形成高度導電通路，導致射水隊員嚴重觸電殉職，且直流水重力擊碎板面會造成結構垮塌。" }
    ]
  },
  {
    scenario: "化學品槽區與 NFPA 704 標誌辨識",
    visualHtml: `
     <svg viewBox="0 0 400 300" class="w-full h-full bg-[#0b0f19]">
       <circle cx="200" cy="150" r="70" fill="rgba(51, 65, 85, 0.4)" stroke="#64748b" stroke-width="3"/>
       <line x1="150" y1="210" x2="130" y2="270" stroke="#475569" stroke-width="4"/>
       <line x1="250" y1="210" x2="270" y2="270" stroke="#475569" stroke-width="4"/>
       <line x1="200" y1="220" x2="200" y2="270" stroke="#475569" stroke-width="4"/>
       <g transform="translate(200, 150) rotate(45) scale(0.35)">
         <rect x="-40" y="-40" width="80" height="80" fill="none" stroke="#000" stroke-width="2"/>
         <rect x="-40" y="-40" width="40" height="40" fill="#ef4444"/>
         <rect x="-40" y="0" width="40" height="40" fill="#3b82f6"/>
         <rect x="0" y="-40" width="40" height="40" fill="#f59e0b"/>
         <rect x="0" y="0" width="40" height="40" fill="#f8fafc"/>
         <text x="-20" y="-12" fill="#000" font-size="28" font-weight="900" text-anchor="middle" transform="rotate(-45 -20 -20)">4</text>
         <text x="-20" y="28" fill="#000" font-size="28" font-weight="900" text-anchor="middle" transform="rotate(-45 -20 20)">3</text>
         <text x="20" y="-12" fill="#000" font-size="28" font-weight="900" text-anchor="middle" transform="rotate(-45 20 -20)">2</text>
         <text x="20" y="28" fill="#000" font-size="28" font-weight="900" text-anchor="middle" transform="rotate(-45 20 20)">W</text>
         <line x1="10" y1="20" x2="30" y2="20" stroke="#000" stroke-width="4" transform="rotate(-45 20 20)"/>
       </g>
       <rect x="50" y="110" width="70" height="45" rx="4" fill="#ef4444" stroke="#fff" stroke-width="1.5"/>
       <text x="85" y="128" fill="#fff" font-size="10" font-weight="900" text-anchor="middle">嚴禁射水</text>
       <text x="85" y="145" fill="#fff" font-size="12" font-weight="900" text-anchor="middle" style="text-decoration: line-through;">W</text>
       <path d="M120,270 C120,250 140,240 140,270 Z M260,270 C260,240 280,230 280,270 Z" fill="#ef4444" opacity="0.6"/>
       <text x="200" y="55" fill="#f97316" font-size="11" font-weight="extrabold" text-anchor="middle">NFPA 704 危害辨識標誌</text>
       <text x="200" y="285" fill="#cbd5e1" font-size="10" font-weight="bold" text-anchor="middle">球形儲槽冷卻防範 (MEM模型)</text>
     </svg>
    `,
    description: "某化工廠原料槽區發生洩漏並引發周邊起火。你帶領安全小組進行 360 度環視，在起火槽體周邊的鐵柱上看到標示有 NFPA 704 標誌，數值為：藍色 (健康) 3、紅色 (易燃) 4、黃色 (不穩定) 2、白色特殊代碼為一個帶有橫線的 W (<s>W</s>)。此時水線隊員正拉起水線準備朝槽體噴射水霧冷卻。",
    observationOptions: [
      { text: "起火區域位於化工廠槽區且周圍有化學物質洩漏", correct: true },
      { text: "看到 NFPA 704 標誌：健康3, 易燃4, 不穩定2", correct: true },
      { text: "特殊標記為帶橫線的 W (禁水符號)", correct: true },
      { text: "特殊標記為 OX (氧化劑)", correct: false }
    ],
    question: "辨識該 NFPA 704 鑽石符號數值後，做為現場安全官 (ISO)，您的戰術安全處置與命令為何？",
    choices: [
      { text: "A. 支持朝槽體噴水冷卻，因為水能迅速降溫，對所有易燃物都有效。", correct: false, feedback: "不正確。白色特殊欄位的帶橫線 W (<s>W</s>) 是明確的「禁水符號」。該化學品與水接觸會引發劇烈反應，甚至爆炸！絕對禁止射水。" },
      { text: "B. 採取「硬性干預」：大聲喝止水線射水，命令隊員撤退至安全防爆距離，並促請指揮官聯繫廠方專責人員提供 SDS 資訊，改以泡沫或乾粉乾預，且要求所有人員穿戴防護衣與 SCBA 以防 3 級毒性吸入。", correct: true, feedback: "正確！NFPA 704 特殊代碼 W 橫線代表禁水。射水會引發爆炸或劇烈釋熱。健康 3 級代表高毒性。易燃 4 級代表極易燃爆。ISO 必須果斷硬性干預，制止射水，並要求改用合適的滅火媒介與高規格防毒面具防護。" },
      { text: "C. 指示射水人員改用柱狀直流水以巨大壓力將洩漏物沖稀釋釋。", correct: false, feedback: "不正確。禁水化學品遇直流水會瞬間引發大爆炸或化學噴濺，危及全體消防員。必須禁止任何水的接觸。" }
    ]
  }
];

let currentQuizIdx = 0;
let userObservationsSelected = [];

function initPracticeQuiz() {
  const quizVisualContainer = document.getElementById('quiz-visual-container');
  const quizDesc = document.getElementById('quiz-description');
  const obsContainer = document.getElementById('quiz-observations');
  const quizQ = document.getElementById('quiz-question');
  const optionsContainer = document.getElementById('quiz-options');
  const step2Title = document.getElementById('quiz-step-2-title');
  const step2Box = document.getElementById('quiz-step-2');
  const feedbackBox = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('quiz-next');
  const restartBtn = document.getElementById('quiz-restart');
  const progressText = document.getElementById('quiz-progress-text');
  const progressBar = document.getElementById('quiz-progress');
  const scenarioBadge = document.getElementById('quiz-scenario-badge');

  if (!quizVisualContainer || !optionsContainer) return;

  function loadQuiz(idx) {
    const quiz = quizData[idx];
    
    // Update basic text
    progressText.textContent = `第 ${idx + 1} / ${quizData.length} 題`;
    progressBar.style.width = `${((idx + 1) / quizData.length) * 100}%`;
    scenarioBadge.textContent = quiz.scenario;
    quizVisualContainer.innerHTML = quiz.visualHtml;
    quizDesc.textContent = quiz.description;
    quizQ.textContent = quiz.question;

    // Reset steps
    userObservationsSelected = [];
    step2Box.classList.add('opacity-50');
    step2Box.classList.remove('active-phase-2', 'completed-quiz');
    step2Title.textContent = "第二階段：進行安全官介入決策 (請先完成第一階段危害觀測)";
    optionsContainer.innerHTML = '';
    feedbackBox.classList.add('hidden');
    feedbackBox.innerHTML = '';
    nextBtn.disabled = false;
    nextBtn.innerHTML = `<span>驗證觀測指標</span> <i class="fas fa-chevron-right ml-1"></i>`;
    
    // Render observations checkboxes
    obsContainer.innerHTML = quiz.observationOptions.map((obs, oIdx) => `
      <label class="flex items-start space-x-2 p-2 rounded bg-slate-950/40 hover:bg-slate-950/80 transition cursor-pointer min-h-[40px] border border-slate-800/50">
        <input type="checkbox" data-index="${oIdx}" class="obs-chk mt-0.5 w-4 h-4 rounded text-orange-600 focus:ring-orange-500">
        <span class="text-slate-300 leading-tight">${obs.text}</span>
      </label>
    `).join('');

    // Attach listeners to observation checkboxes
    const obsCheckboxes = document.querySelectorAll('.obs-chk');
    obsCheckboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        // Toggle selected state
        const oIdx = parseInt(chk.getAttribute('data-index'));
        if (chk.checked) {
          if (!userObservationsSelected.includes(oIdx)) userObservationsSelected.push(oIdx);
        } else {
          userObservationsSelected = userObservationsSelected.filter(i => i !== oIdx);
        }
      });
    });
  }

  function handleNextClick() {
    const quiz = quizData[currentQuizIdx];
    
    // If we are in Phase 1 (validating observations)
    if (!step2Box.classList.contains('active-phase-2')) {
      // Find what are the correct indices
      const correctIndices = quiz.observationOptions
        .map((obs, i) => obs.correct ? i : null)
        .filter(i => i !== null);
      
      // Check if user selected exactly the correct ones
      const isObsCorrect = correctIndices.length === userObservationsSelected.length &&
        correctIndices.every(val => userObservationsSelected.includes(val));

      feedbackBox.classList.remove('hidden');
      if (isObsCorrect) {
        // Unlock Stage 2
        step2Box.classList.remove('opacity-50');
        step2Box.classList.add('active-phase-2');
        step2Title.innerHTML = `<span class="text-emerald-400 font-extrabold flex items-center"><i class="fas fa-check-circle mr-1"></i> 危害辨識正確！已解鎖第二階段戰術決策。</span>`;
        
        feedbackBox.className = "p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300";
        feedbackBox.innerHTML = `<strong>✅ 觀測完成！</strong> 您成功識別出了現場所有的危險特徵。現在，請針對下方的戰術情境進行決策選擇。`;
        
        // Disable observation checkboxes
        document.querySelectorAll('.obs-chk').forEach(c => c.disabled = true);
        
        // Render decision options
        renderDecisionOptions(quiz);
        
        // Change button to Submit
        nextBtn.innerHTML = `<span>提交決策</span> <i class="fas fa-check ml-1"></i>`;
        nextBtn.disabled = true; // Disabled until choice is selected
      } else {
        feedbackBox.className = "p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300";
        feedbackBox.innerHTML = `<strong>❌ 辨識未完全或有誤！</strong> 現場仍有其他關鍵安全威脅，或者您勾選了不存在的危害。請重新對照照片特徵，調整您的 RECON 勾選。`;
      }
    } else {
      // We are in Phase 2, submitting the final decision
      const selectedOption = document.querySelector('input[name="tactic-choice"]:checked');
      if (!selectedOption) return;
      
      const choiceIdx = parseInt(selectedOption.value);
      const choice = quiz.choices[choiceIdx];

      feedbackBox.classList.remove('hidden');
      if (choice.correct) {
        feedbackBox.className = "p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300";
        feedbackBox.innerHTML = `<strong>🎉 決策正確！</strong><br>${choice.feedback}`;
        
        // Change button to next question
        if (currentQuizIdx < quizData.length - 1) {
          nextBtn.innerHTML = `<span>下一題</span> <i class="fas fa-chevron-right ml-1"></i>`;
        } else {
          nextBtn.innerHTML = `<span>完成所有模擬 ↺</span>`;
        }
        nextBtn.disabled = false;
        step2Box.classList.remove('active-phase-2');
        step2Box.classList.add('completed-quiz');
        
        // Disable choices
        document.querySelectorAll('input[name="tactic-choice"]').forEach(c => c.disabled = true);
      } else {
        feedbackBox.className = "p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300";
        feedbackBox.innerHTML = `<strong>❌ 戰術失當！</strong><br>${choice.feedback}`;
      }
    }
  }

  function renderDecisionOptions(quiz) {
    optionsContainer.innerHTML = quiz.choices.map((choice, cIdx) => `
      <label class="flex items-start space-x-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer min-h-[44px]">
        <input type="radio" name="tactic-choice" value="${cIdx}" class="mt-0.5 w-4.5 h-4.5 rounded-full text-orange-600 focus:ring-orange-500">
        <span class="text-xs text-slate-200 leading-normal">${choice.text}</span>
      </label>
    `).join('');

    const radios = document.querySelectorAll('input[name="tactic-choice"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        nextBtn.disabled = false;
      });
    });
  }

  nextBtn.addEventListener('click', () => {
    if (step2Box.classList.contains('completed-quiz')) {
      step2Box.classList.remove('completed-quiz');
      if (currentQuizIdx < quizData.length - 1) {
        currentQuizIdx++;
        loadQuiz(currentQuizIdx);
      } else {
        currentQuizIdx = 0;
        loadQuiz(currentQuizIdx);
      }
    } else {
      handleNextClick();
    }
  });

  restartBtn.addEventListener('click', () => {
    currentQuizIdx = 0;
    step2Box.classList.remove('active-phase-2', 'completed-quiz');
    loadQuiz(currentQuizIdx);
  });

  loadQuiz(currentQuizIdx);
}

// 14. Flashcard Study Logic
const flashcardsData = [
  {
    category: "消防法 §20-1",
    title: "退避權",
    desc: "當災害現場無待救人命價值且高度危急時，救災人員得採取防衛式搶救。安全官若判定現場已無生還可能（如黑火、超高溫、結構倒塌臨界），應促請指揮官下達退避令，避免讓消防員無謂涉險。"
  },
  {
    category: "消防法 §21-1",
    title: "資訊權",
    desc: "工廠、化學品廠區管理權人必須提供廠區內化學品種類、配置位置與安全資料表（SDS）。安全官應第一時間要求廠方人員提供 NFPA 704 危害分類與儲槽平面圖，否則消防同仁有權不進入火場。"
  },
  {
    category: "消防法 §27",
    title: "調查權",
    desc: "發生消防人員因公殉職或重傷時，法定調查委員會將會同專家調查。安全官現場的無線電通訊紀錄（如 CAN 回報、PAR 清點紀錄）將是判定現場危害判定與指揮鏈決策的重要法定事證。"
  },
  {
    category: "Dave Dodson VVDC",
    title: "煙流流速 (Velocity)",
    desc: "煙霧噴出的流動速度由高熱膨脹壓力推送。若出口流速出現「湍流 (Turbulent)」，代表火場內部熱裂解極度劇烈且熱空氣急劇膨脹，空間即將在數秒內發生閃燃 (Flashover)。"
  },
  {
    category: "Dave Dodson VVDC",
    title: "煙流密度 (Density)",
    desc: "判讀火場最關鍵的指標！煙霧厚重稠密代表含有大量未燃燒的可燃性微粒與毒性氣體（煙即燃料）。密度越厚，爆炸性與燃燒能量越強，隨時可能被一引而爆。"
  },
  {
    category: "安全管制",
    title: "氣瓶休息 20 法則",
    desc: "消防員每使用 1 支氣瓶，建議休息 10 分鐘；連續使用 2 支氣瓶，必須強制作息 20 分鐘以上。在 REHAB 休息站實施主動降溫並補充電解質水，以防止過度熱蓄積導致心血管猝死。"
  },
  {
    category: "化災防護",
    title: "禁水 (W) 符號",
    desc: "NFPA 704 底部白色的特殊代碼。若標註 W 帶有橫線，代表該化學品與水接觸會發生激烈化學反應、爆震、放熱或產生大量易燃有毒氣體，現場佈線時嚴禁朝槽體或化學洩漏物直接射水！"
  }
];

let currentCardIdx = 0;

function initFlashcards() {
  const card = document.getElementById('flashcard');
  const cardCategory = document.getElementById('flashcard-category');
  const cardTitle = document.getElementById('flashcard-title');
  const cardDesc = document.getElementById('flashcard-desc');
  
  const prevBtn = document.getElementById('card-prev');
  const nextBtn = document.getElementById('card-next');

  if (!card) return;

  function loadCard(idx) {
    const data = flashcardsData[idx];
    
    if (card.classList.contains('flipped')) {
      card.classList.remove('flipped');
      setTimeout(() => {
        updateCardContent(data);
      }, 150);
    } else {
      updateCardContent(data);
    }
  }

  function updateCardContent(data) {
    cardCategory.textContent = data.category;
    cardTitle.textContent = data.title;
    cardDesc.textContent = data.desc;
  }

  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });

  prevBtn.addEventListener('click', () => {
    if (currentCardIdx > 0) {
      currentCardIdx--;
    } else {
      currentCardIdx = flashcardsData.length - 1;
    }
    loadCard(currentCardIdx);
  });

  nextBtn.addEventListener('click', () => {
    if (currentCardIdx < flashcardsData.length - 1) {
      currentCardIdx++;
    } else {
      currentCardIdx = 0;
    }
    loadCard(currentCardIdx);
  });

  loadCard(currentCardIdx);
}
