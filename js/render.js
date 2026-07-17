function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function safeUpdate(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function applyTheme() {
    const config = THEMES[theme];
    document.getElementById('app-body').className = `${config.body} h-[100dvh] w-screen p-3 lg:p-5 text-slate-800 transition-colors duration-300`;
    document.getElementById('clock-box').className = `flex-1 bg-gradient-to-br ${config.gradient} rounded-[1.2rem] lg:rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-sm border-b-4 border-blue-600/10 transition-all overflow-hidden`;
    document.getElementById('task-panel').className = `flex-1 lg:flex-[3] min-h-0 bg-white rounded-[1.5rem] lg:rounded-[2rem] shadow-sm flex flex-col border-b-8 ${config.border.replace('100','200')} order-2 lg:order-1 overflow-hidden p-3 lg:p-8 border`;
    document.getElementById('label-title-main').className = `text-xl lg:text-4xl font-black ${config.text} leading-none`;
    document.getElementById('add-task-btn').className = `${config.primary} text-white p-2 rounded-xl transition-all active:scale-95`;

    const toggle = document.getElementById('toggle-bg');
    if(toggle) toggle.style.backgroundColor = document.getElementById('kanji-toggle').checked ? config.primary.replace('bg-', '') : '';
}

function updateUIStrings() {
    safeUpdate('label-title-main', t('title'));
    safeUpdate('label-remaining', t('remaining'));
    safeUpdate('label-stamp', t('stamp_card'));
    safeUpdate('label-reset', t('reset'));
    safeUpdate('label-settings-title', t('settings'));
    safeUpdate('label-display-setting', t('display_setting'));
    safeUpdate('label-theme-setting', t('theme_setting'));
    safeUpdate('label-departure-setting', t('departure_setting'));
    safeUpdate('label-stamp-days', t('stamp_days'));
    safeUpdate('label-alarm-setting', t('alarm_setting'));
    safeUpdate('label-manage-task', t('manage_task'));

    // 削除モードボタン
    const editBtn = document.getElementById('btn-edit-mode');
    if(editBtn) editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        <span>${t('edit_mode')}</span>
    `;

    safeUpdate('finish-edit-btn', t('finish_edit'));

    safeUpdate('btn-alarm-ok-box', useKanji ? "了解" : "わかった！");
    safeUpdate('btn-celebration-ok', useKanji ? "了解" : "はーい！");
    const toggle = document.getElementById('kanji-toggle'); if(toggle) toggle.checked = useKanji;
    const depInput = document.getElementById('departure-input'); if(depInput) depInput.value = departureTime;
}

function updateCountdown(now) {
    const target = getDepartureTarget(now);
    const diff = target - now; const timerElement = document.getElementById('countdown-timer');
    if (diff <= 0 || (target - now) < 1000) {
        timerElement.innerHTML = `<span class="text-red-500 animate-bounce">${t('alarm_time')}</span>`;
    }
    else {
        const totalMins = Math.ceil(diff / MS_PER_MINUTE); const h = Math.floor(totalMins / 60); const m = totalMins % 60;
        let html = `<span class="text-[0.6em] mr-1 lg:mr-2 opacity-50 font-black uppercase tracking-widest leading-none">あと</span>`;
        if (h > 0) html += `<span class="${THEMES[theme].text}">${h}</span><span class="text-[0.5em] mx-0.5 lg:mx-1 font-black leading-none">${useKanji ? '時間':'じかん'}</span>`;
        html += `<span class="${THEMES[theme].text}">${m}</span><span class="text-[0.5em] mx-0.5 lg:mx-1 font-black leading-none">${useKanji ? '分':'ふん'}</span>`;
        timerElement.innerHTML = html;
    }
}

// グリッドの列数・行数・文字サイズを画面サイズに応じて適用し、カード用の文字サイズクラスを返す
function applyGridLayout(grid) {
    const rows = Math.ceil(tasks.length / 3);
    // タブレット縦: 幅640px以上の縦長画面（iPad Pro縦の幅1024px以上も含む。CSSのorientation:portrait判定と揃える）
    const isTabletPortrait = window.innerWidth >= 640 && window.innerHeight > window.innerWidth;

    // PC/タブレットは1画面に収めるため等割、スマホは縦に伸ばして均等割
    if (isTabletPortrait) {
        // タブレット縦: 2列・1画面収め（カードが縦長に間延びしないよう列数を減らす）
        grid.className = "flex-1 min-h-0 grid grid-cols-2 gap-3 overflow-hidden content-stretch pb-1";
        grid.style.gridTemplateRows = `repeat(${Math.ceil(tasks.length / 2)}, 1fr)`;
    } else if (window.innerWidth >= 1024) {
        // PC/タブレット
        grid.className = "flex-1 min-h-0 grid grid-cols-3 gap-2 lg:gap-4 overflow-hidden content-stretch pb-1";
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    } else if (window.innerHeight <= 500 && window.innerWidth > window.innerHeight) {
         // スマホ横向き
        grid.className = "flex-1 min-h-0 grid grid-cols-4 gap-2 overflow-y-auto content-start pb-1 settings-scroll";
        grid.style.gridTemplateRows = `repeat(${Math.ceil(tasks.length / 4)}, minmax(0, 1fr))`;
    } else {
        // スマホ縦：タブレット縦と同じく2列。カードが正方形に近くなり文字も大きくできる
        // （スクロールはさせず1画面に収める方針は維持）
        grid.className = "flex-1 min-h-0 grid grid-cols-2 gap-2 overflow-hidden content-stretch pb-1";
        grid.style.gridTemplateRows = `repeat(${Math.ceil(tasks.length / 2)}, 1fr)`;
    }

    // 画面サイズごとに文字サイズを調整
    let fontSizeClass = 'text-[10px] lg:text-xl';
    if (isTabletPortrait) {
        // タブレット縦は2列でカードが大きいので文字も大きく（タスク数が多い場合は一段小さく）
        fontSizeClass = tasks.length > 9 ? 'text-2xl' : 'text-4xl';
    } else if (window.innerHeight <= 500 && window.innerWidth > window.innerHeight) {
        // スマホ横はカードが低いので小さめのまま
        fontSizeClass = tasks.length > 9 ? 'text-[10px]' : 'text-[11px]';
    } else if (window.innerWidth < 1024) {
        // スマホ縦は2列なので文字を大きく（タスク数が多い場合は一段小さく）
        fontSizeClass = tasks.length > 9 ? 'text-sm' : 'text-lg';
    }
    return fontSizeClass;
}

// 整理モード時のドラッグ＆ドロップ／タッチ並び替えのイベントを1枚のカードに登録する
function attachDragHandlers(card, index) {
    card.setAttribute('draggable', 'true');
    card.ondragstart = (e) => { e.dataTransfer.effectAllowed = 'move'; e.currentTarget.classList.add('dragging'); draggedItemIndex = index; };
    card.ondragover = (e) => e.preventDefault();
    card.ondrop = (e) => { e.preventDefault(); const targetCard = e.currentTarget; const targetIndex = parseInt(targetCard.getAttribute('data-index')); if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) { const item = tasks.splice(draggedItemIndex, 1)[0]; tasks.splice(targetIndex, 0, item); saveToStorage(); renderTasks(); } };
    card.ondragend = (e) => { e.currentTarget.classList.remove('dragging'); draggedItemIndex = null; };

    card.addEventListener('touchstart', (e) => { draggedItemIndex = index; e.currentTarget.classList.add('dragging'); }, {passive: true});
    card.addEventListener('touchend', (e) => {
        e.currentTarget.classList.remove('dragging'); const touch = e.changedTouches[0]; const targetEl = document.elementFromPoint(touch.clientX, touch.clientY); const targetCard = targetEl?.closest('.card-container');
        if (targetCard && draggedItemIndex !== null) { const targetIndex = parseInt(targetCard.getAttribute('data-index')); if (targetIndex !== draggedItemIndex && !isNaN(targetIndex)) { const item = tasks.splice(draggedItemIndex, 1)[0]; tasks.splice(targetIndex, 0, item); saveToStorage(); renderTasks(); } } draggedItemIndex = null;
    });
}

// タスク1枚分のカード要素を生成して返す（整理モード時はドラッグ登録も行う）
function createTaskCard(task, index, config, fontSizeClass) {
    const card = document.createElement('div'); card.className = `card-container ${isDeleteMode ? 'sortable' : ''}`; card.setAttribute('data-id', task.id);
    card.setAttribute('data-index', index);

    if (isDeleteMode) {
        attachDragHandlers(card, index);
    }

    card.innerHTML = `
        <div class="card-inner ${!isDeleteMode && task.completed ? 'is-flipped' : ''} ${isDeleteMode ? 'cursor-default shake-card' : ''}" onclick="${isDeleteMode ? '' : `toggleTask(${task.id})`}">
            <div class="card-front bg-white ${config.border.replace('100','200')} ${config.text} border-2 transition-all relative">
                <span class="${fontSizeClass} font-black px-1 text-center pointer-events-none break-all card-text-main leading-tight">${escapeHtml(taskT(task.text))}</span>
                ${isDeleteMode ? `
                    <button onclick="event.stopPropagation(); deleteTask(${task.id})" aria-label="このタスクをけす" class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg z-20 hover:bg-red-600 transition-transform hover:scale-110 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                ` : ''}
            </div>
            <div class="card-back bg-green-50 border-green-400 text-green-700 border-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" class="lg:w-8 lg:h-8 card-icon text-green-500 mb-1"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span class="text-[8px] lg:text-base font-black card-text-sub">${t('done')}</span>
            </div>
        </div>
    `;
    return card;
}

function renderTasks() {
    const grid = document.getElementById('task-grid'); grid.innerHTML = '';
    const config = THEMES[theme];
    const fontSizeClass = applyGridLayout(grid);

    tasks.forEach((task, index) => {
        grid.appendChild(createTaskCard(task, index, config, fontSizeClass));
    });
    updateProgress();
}

function renderStamps() {
    const container = document.getElementById('stamp-row'); container.innerHTML = '';
    const daysLabels = t('days');
    DAY_ORDER.forEach(d => {
        if (!enabledDays[d]) return;
        const earned = stamps[d]; const div = document.createElement('div');
        // aspect-square（正方形固定）はflex-1（均等割り）と矛盾して狭い画面で潰れるため使わない
        div.className = `flex-1 flex flex-col items-center p-1 lg:p-2 rounded-2xl border ${earned ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-slate-50 border-slate-100'} h-[85%] justify-center min-w-0 transition-all`;
        div.innerHTML = `<span class="stamp-day text-[8px] lg:text-sm font-black ${earned ? 'text-yellow-600' : 'text-gray-400'} mb-0.5 lg:mb-1">${daysLabels[d]}</span><span class="stamp-icon text-sm lg:text-5xl ${earned ? 'earned-stamp' : 'opacity-10 grayscale'}">${earned ? '🌟' : '◯'}</span>`;
        container.appendChild(div);
    });
}

function renderDayToggles() {
    const container = document.getElementById('day-toggle-list'); if(!container) return; container.innerHTML = '';
    const daysLabels = t('days'); const config = THEMES[theme];
    DAY_ORDER.forEach(d => {
        const active = enabledDays[d]; const btn = document.createElement('button');
        btn.className = `p-1 lg:p-3 rounded-xl text-xs lg:text-lg font-black border-2 transition-all flex-1 ${active ? (config.primary + ' text-white ' + config.primaryDark.replace('bg-','border-')) : 'bg-white text-slate-400 border-slate-100'}`;
        btn.textContent = daysLabels[d]; btn.onclick = () => { enabledDays[d] = !enabledDays[d]; renderDayToggles(); renderStamps(); saveToStorage(); };
        container.appendChild(btn);
    });
}

function renderAlarmSettings() {
    const list = document.getElementById('alarm-list'); if(!list) return; list.innerHTML = '';
    const minLabel = t('alarm_min'); const undoneLabel = t('alarm_only_undone');
    ALARM_POINTS.forEach(p => {
        const active = alarmConfig[p]; const item = document.createElement('div');
        item.className = `flex items-center justify-between px-3 lg:px-6 py-2 lg:py-4 rounded-2xl border-2 transition-all cursor-pointer ${active ? 'bg-white border-orange-300 shadow-sm' : 'bg-white border-slate-100 opacity-60'}`;
        item.onclick = () => { alarmConfig[p] = !alarmConfig[p]; renderAlarmSettings(); saveToStorage(); };
        const label = p === 0 ? t('alarm_time') : `${p}${minLabel}`;
        item.innerHTML = `<div class="flex flex-col"><span class="font-black text-sm lg:text-lg ${active ? 'text-orange-600' : 'text-slate-400'}">${label}</span>${SKIP_WHEN_DONE_POINTS.includes(p) ? `<span class="text-[8px] lg:text-xs text-slate-300 font-bold">${undoneLabel}</span>` : ''}</div><div class="text-lg lg:text-2xl">${active ? '🔔' : '🔕'}</div>`;
        list.appendChild(item);
    });
}

function updateProgress() {
    const completed = tasks.filter(task => task.completed).length; const total = tasks.length; const percent = total > 0 ? (completed / total) * 100 : 0;
    const bar = document.getElementById('progress-bar'); if(bar) bar.style.width = `${percent}%`;
    safeUpdate('progress-text', `${completed} / ${total}`);
    if (total > 0 && completed === total && !isSettingsMode && !celebrationShownToday && !isDeleteMode) { celebrationShownToday = true; handleCompletion(); }
}

function showToast(msg) { const toastEl = document.getElementById('toast'); if(!toastEl) return; toastEl.textContent = msg; toastEl.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none'); setTimeout(() => toastEl.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none'), TOAST_DURATION_MS); }
