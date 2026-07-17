let tasks = [];
let departureTime = "08:00";
let isSettingsMode = false;
let isDeleteMode = false;
let lastDateString = new Date().toDateString();
let alarmConfig = { 30: true, 20: true, 10: true, 5: true, 0: true };
let triggeredAlarmPoints = new Set();
let draggedItemIndex = null;
let celebrationShownToday = false;
let enabledDays = [false, true, true, true, true, true, false];
let stamps = [false, false, false, false, false, false, false];
let perfectWeekCount = 0;
let useKanji = false;
let theme = 'blue';

function saveToStorage() {
    const data = { tasks, departureTime, saveDate: new Date().toDateString(), alarmConfig, celebrationShownToday, enabledDays, stamps, perfectWeekCount, useKanji, theme };
    localStorage.setItem('morning_routine_v3_data', JSON.stringify(data));
}

function loadFromStorage() {
    const savedData = localStorage.getItem('morning_routine_v3_data');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            const today = new Date().toDateString();
            if (parsed.saveDate !== today) { tasks = (parsed.tasks || DEFAULT_TASKS).map(task => ({ ...task, completed: false })); celebrationShownToday = false; }
            else { tasks = parsed.tasks || DEFAULT_TASKS; celebrationShownToday = parsed.celebrationShownToday || false; }
            departureTime = parsed.departureTime || "08:00"; alarmConfig = parsed.alarmConfig || alarmConfig; enabledDays = parsed.enabledDays || enabledDays; stamps = parsed.stamps || stamps; perfectWeekCount = parsed.perfectWeekCount || 0; useKanji = parsed.useKanji || false; theme = parsed.theme || 'blue';
            safeUpdate('perfect-count', perfectWeekCount);
        } catch (e) { tasks = DEFAULT_TASKS; }
    } else { tasks = DEFAULT_TASKS; }
}
