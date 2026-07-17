const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
document.addEventListener('click', () => audioCtx.resume(), { once: true });
document.addEventListener('touchstart', () => audioCtx.resume(), { once: true });

window.onload = () => {
    loadFromStorage();
    applyTheme();
    updateUIStrings();
    renderTasks();
    renderAlarmSettings();
    renderDayToggles();
    renderStamps();
    startClock();
    document.getElementById('new-task-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
    window.addEventListener('resize', () => { renderTasks(); renderStamps(); });
};

function playBeep(freq = 880, duration = 0.1, delay = 0) {
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay); gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay); gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration); osc.connect(gain); gain.connect(audioCtx.destination); osc.start(audioCtx.currentTime + delay); osc.stop(audioCtx.currentTime + delay + duration);
}

function speakText(text) { if ('speechSynthesis' in window) { const uttr = new SpeechSynthesisUtterance(text); uttr.lang = 'ja-JP'; uttr.rate = 1.1; window.speechSynthesis.speak(uttr); } }

function startClock() {
    setInterval(() => {
        const now = new Date(); if (now.toDateString() !== lastDateString) { if (getWeekStartString(new Date(lastDateString)) !== getWeekStartString(now)) { stamps = stamps.map(() => false); } lastDateString = now.toDateString(); celebrationShownToday = false; triggeredAlarmPoints.clear(); resetAll(); }
        document.getElementById('digital-clock').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        document.getElementById('digital-seconds').textContent = String(now.getSeconds()).padStart(2, '0');
        updateCountdown(now); checkAlarms(now);
    }, 1000);
}

// 出発時刻のDateを返す。すでに過ぎていたら翌日に繰り越す（繰り越しあり用の共通ヘルパー）
function getDepartureTarget(now) {
    const [depH, depM] = departureTime.split(':').map(Number);
    const target = new Date(now);
    target.setHours(depH, depM, 0, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    return target;
}

function checkAlarms(now) {
    const target = getDepartureTarget(now);
    const diffMins = Math.floor((target - now) / MS_PER_MINUTE); const isAllDone = tasks.length > 0 && tasks.every(task => task.completed);
    const duePoint = ALARM_POINTS.find(point => alarmConfig[point] && diffMins <= point && !triggeredAlarmPoints.has(point));
    if (duePoint === undefined) return;
    triggeredAlarmPoints.add(duePoint);
    if (SKIP_WHEN_DONE_POINTS.includes(duePoint) && isAllDone) return;
    showAlarm(duePoint);
}

function showAlarm(point) {
    const overlay = document.getElementById('alarm-overlay'); const title = document.getElementById('alarm-title'); for(let i=0; i<3; i++) playBeep(880, 0.1, i * 0.2);
    if (point === 0) { title.textContent = t('alarm_time'); speakText(useKanji ? "出発の時間です！忘れ物はありませんか？" : "しゅっぱつの じかんだよ！わすれものはないかな？"); }
    else { title.textContent = `あと ${point}${t('alarm_min')}`; speakText(useKanji ? `出発まであと${point}分です。準備を進めましょう！` : `しゅっぱつまで あと${point}ふんだよ。じゅんびをすすめよう！`); }
    overlay.classList.remove('hidden');
}

function closeAlarm() { document.getElementById('alarm-overlay').classList.add('hidden'); window.speechSynthesis.cancel(); }

function handleCompletion() {
    const now = new Date(); const todayIdx = now.getDay(); const [depH, depM] = departureTime.split(':').map(Number);
    const todayLimit = new Date(now); todayLimit.setHours(depH, depM, 0, 0);
    let isPerfectWeek = false; const isOnTime = now < todayLimit;
    if (enabledDays[todayIdx] && isOnTime) { if (!stamps[todayIdx]) { stamps[todayIdx] = true; const req = enabledDays.filter(d => d).length; const ern = stamps.filter((s, i) => s && enabledDays[i]).length; if (req === ern) { isPerfectWeek = true; perfectWeekCount++; safeUpdate('perfect-count', perfectWeekCount); } } }
    renderStamps(); saveToStorage(); showCelebration(isPerfectWeek, isOnTime);
}

function showCelebration(isPerfect, isOnTime) {
    const overlay = document.getElementById('celebration-overlay'); const title = document.getElementById('main-celebration-title'); const desc = document.getElementById('main-celebration-desc'); const box = document.getElementById('celebration-title-box');

    let speechMsg = "";
    if (isPerfect) {
        title.textContent = t('perfect_week'); desc.textContent = t('perfect_desc');
        box.className = "bg-yellow-400 rounded-[3rem] p-10 lg:p-20 shadow-2xl mb-8 text-white border-b-8 border-yellow-500";
        speechMsg = useKanji ? "完璧です！パーフェクト達成！一週間の準備が完了しました！" : "すごい！パーフェクト達成！一週間のじゅんびをコンプリートしたよ！";
    }
    else if (isOnTime) {
        title.textContent = t('celebration_done'); desc.textContent = t('celebration_desc');
        box.className = "bg-white rounded-[3rem] p-10 lg:p-20 shadow-2xl mb-8 border-b-8 border-rose-50 text-rose-600";
        speechMsg = useKanji ? "準備完了です！すごいですね。ゆっくり過ごしてください。" : "じゅんび かんりょう！すごいね。ゆっくりすごしてね。";
    }
    else {
        title.textContent = t('go_out'); desc.textContent = t('go_out_desc');
        box.className = "bg-white rounded-[3rem] p-10 lg:p-20 shadow-2xl mb-8 border-b-8 border-rose-50 text-rose-600";
        speechMsg = useKanji ? "いってらっしゃい！気をつけて行ってきてね！" : "いってらっしゃい！きをつけて いってきてね！";
    }

    speakText(speechMsg);
    const container = document.getElementById('confetti-container'); container.innerHTML = '';
    for (let i = 0; i < CONFETTI_COUNT; i++) { const c = document.createElement('div'); c.className = 'confetti'; c.style.left = Math.random() * 100 + 'vw'; c.style.backgroundColor = ['#f472b6', '#fb7185', '#fbbf24', '#60a5fa', '#a78bfa'][Math.floor(Math.random() * 5)]; c.style.animationDelay = Math.random() * 3 + 's'; c.style.width = '10px'; c.style.height = '10px'; container.appendChild(c); }
    overlay?.classList.remove('hidden');
}

function closeCelebration() { document.getElementById('celebration-overlay')?.classList.add('hidden'); window.speechSynthesis.cancel(); }
function toggleTask(id) {
    // 編集モード中は反応させない
    if (isDeleteMode) return;
    const task = tasks.find(item => item.id === id);
    if (task) { task.completed = !task.completed; if (!task.completed) celebrationShownToday = false; audioCtx.resume(); playBeep(task.completed ? 1100 : 440, 0.05); renderTasks(); saveToStorage(); }
}
function addTask() { const input = document.getElementById('new-task-input'); const text = input?.value.trim(); if (text) { tasks.push({ id: Date.now(), text, completed: false }); celebrationShownToday = false; if(input) input.value = ''; renderTasks(); saveToStorage(); } }
function deleteTask(id) {
    const target = tasks.find(task => task.id === id);
    const name = target ? taskT(target.text) : '';
    if (!window.confirm(`${t('delete_confirm')}\n"${name}"${t('delete_desc')}`)) return;
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
    saveToStorage();
    showToast(useKanji ? "削除しました" : "けしたよ！");
}
function resetAll() { tasks = tasks.map(task => ({ ...task, completed: false })); renderTasks(); saveToStorage(); }
function updateDepartureTime() { departureTime = document.getElementById('departure-input')?.value || departureTime; triggeredAlarmPoints.clear(); saveToStorage(); }

function toggleKanji() {
    useKanji = document.getElementById('kanji-toggle').checked;
    updateUIStrings(); renderTasks(); renderAlarmSettings(); renderDayToggles(); renderStamps(); saveToStorage();
}

function changeTheme(newTheme) {
    theme = newTheme; applyTheme(); renderTasks(); renderDayToggles(); renderAlarmSettings(); saveToStorage();
}

function enterDeleteMode() {
    toggleSettings();
    isDeleteMode = true;
    document.getElementById('normal-controls').classList.add('hidden');
    document.getElementById('delete-mode-controls').classList.remove('hidden');
    renderTasks();
    showToast(useKanji ? "整理モード：ドラッグで移動、×ボタンで削除" : "カードをうごかしたり、けしたりできるよ！");
}

function exitDeleteMode() {
    isDeleteMode = false;
    document.getElementById('normal-controls').classList.remove('hidden');
    document.getElementById('delete-mode-controls').classList.add('hidden');
    renderTasks();
}

function toggleSettings() {
    isSettingsMode = !isSettingsMode;
    const overlay = document.getElementById('settings-overlay');
    const btn = document.getElementById('settings-btn');
    const config = THEMES[theme];
    if (isSettingsMode) {
        overlay?.classList.remove('hidden');
        if(btn) btn.className = `p-2 ${config.primary} text-white rounded-full transition-colors shadow-lg`;
    } else {
        overlay?.classList.add('hidden');
        if(btn) btn.className = `p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors`;
    }
    renderTasks();
}
