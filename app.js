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
