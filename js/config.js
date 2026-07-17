const DICT = {
    kanji: {
        title: "朝の準備", remaining: "出発まで", stamp_card: "週間スタンプ", reset: "やりなおす",
        settings: "設定", display_setting: "表示設定", theme_setting: "テーマカラー",
        departure_setting: "出発時間", stamp_days: "スタンプを集める曜日", alarm_setting: "通知設定",
        manage_task: "タスクの整理", edit_mode: "タスクの整理 (削除)", finish_edit: "編集完了",
        delete_confirm: "消してもいい？", delete_desc: "をリストから消します。",
        done: "完了！", celebration_done: "準備完了！", celebration_desc: "すごい！全部できたね！",
        go_out: "いってらっしゃい！", go_out_desc: "気をつけて行ってきてね！",
        perfect_week: "🏆 パーフェクト！ 🏆", perfect_desc: "すごい！一週間の準備をコンプリートしたよ！",
        alarm_time: "出発！", alarm_min: "分前", alarm_only_undone: "※未完了時",
        days: ['日', '月', '火', '水', '木', '金', '土'],
        task_map: { 'はみがき': '歯磨き', 'あさごはん': '朝食', 'トイレ': 'トイレ', 'きがえ': '着替え', 'くつした': '靴下', 'ランドセル': 'ランドセル準備', 'かみのけ': '髪の毛', 'できた！': '完了！' }
    },
    kana: {
        title: "あさのじゅんび", remaining: "しゅっぱつまで", stamp_card: "しゅうかんスタンプ", reset: "やりなおす",
        settings: "せってい", display_setting: "ひょうじ せってい", theme_setting: "テーマカラー",
        departure_setting: "しゅっぱつ じかん", stamp_days: "スタンプをあつめる曜日", alarm_setting: "アラーム",
        manage_task: "タスクのせいり", edit_mode: "タスクをせいりする (さくじょ)", finish_edit: "へんしゅう おわり",
        delete_confirm: "けしても いい？", delete_desc: "をリストからけすよ。",
        done: "できた！", celebration_done: "じゅんび かんりょう！", celebration_desc: "すごい！ぜんぶ できたね！",
        go_out: "いってらっしゃい！", go_out_desc: "きをつけて いってきてね！",
        perfect_week: "🏆 パーフェクト！ 🏆", perfect_desc: "すごい！一週間のじゅんびをコンプリートしたよ！",
        alarm_time: "しゅっぱつ！", alarm_min: "ふんまえ", alarm_only_undone: "※まだのとき",
        days: ['日', '月', '火', '水', '木', '金', '土'],
        task_map: {}
    }
};

const THEMES = {
    blue: { body: 'bg-blue-50', primary: 'bg-blue-500', primaryDark: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', gradient: 'from-blue-400 to-blue-500' },
    pink: { body: 'bg-rose-50', primary: 'bg-rose-400', primaryDark: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-100', gradient: 'from-rose-300 to-rose-400' },
    green: { body: 'bg-emerald-50', primary: 'bg-emerald-500', primaryDark: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100', gradient: 'from-emerald-400 to-emerald-500' },
    orange: { body: 'bg-orange-50', primary: 'bg-orange-500', primaryDark: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-100', gradient: 'from-orange-400 to-orange-500' }
};

const DEFAULT_TASKS = [
    { id: 1, text: 'はみがき', completed: false }, { id: 2, text: 'あさごはん', completed: false },
    { id: 3, text: 'トイレ', completed: false }, { id: 4, text: 'きがえ', completed: false },
    { id: 5, text: 'くつした', completed: false }, { id: 6, text: 'ランドセル', completed: false },
    { id: 7, text: 'かみのけ', completed: false }
];

function t(key) { return DICT[useKanji ? 'kanji' : 'kana'][key] || key; }
function taskT(name) { return useKanji ? (DICT.kanji.task_map[name] || name) : name; }
