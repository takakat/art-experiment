// =========================================================
// experiment.js : 上下分割・テキスト復元版
// =========================================================

const jsPsych = initJsPsych({
    on_finish: function() { }
});

// ★DataPipe ID
const DATAPIPE_ID = "FSbN2d1AkLUZ"; 

let timeline = [];

// ---------------------------------------------------------
// 1. 設定・変数定義
// ---------------------------------------------------------

// 画像ファイルリスト
const stimuli_data = [
    { id: 'art_01', path: 'img/painting_01.jpg' },
    { id: 'art_02', path: 'img/painting_02.jpg' },
    { id: 'art_03', path: 'img/painting_03.jpg' },
    { id: 'art_04', path: 'img/painting_04.jpg' },
    { id: 'art_05', path: 'img/painting_05.jpg' },
    { id: 'art_06', path: 'img/painting_06.jpg' },
    { id: 'art_07', path: 'img/painting_07.jpg' },
    { id: 'art_08', path: 'img/painting_08.jpg' },
    { id: 'art_09', path: 'img/painting_09.jpg' },
    { id: 'art_10', path: 'img/painting_10.jpg' },
    { id: 'art_11', path: 'img/painting_11.jpg' },
    { id: 'art_12', path: 'img/painting_12.jpg' },
    { id: 'art_13', path: 'img/painting_13.jpg' },
    { id: 'art_14', path: 'img/painting_14.jpg' },
    { id: 'art_15', path: 'img/painting_15.jpg' },
    { id: 'art_16', path: 'img/painting_16.jpg' },
    { id: 'art_17', path: 'img/painting_17.jpg' },
    { id: 'art_18', path: 'img/painting_18.jpg' },
    { id: 'art_19', path: 'img/painting_19.jpg' },
    { id: 'art_20', path: 'img/painting_20.jpg' },
];
const preload_images = stimuli_data.map(data => data.path);

// ★追加: 保存する列の順番をここで定義（固定）します
const sd_keys = [
    "beauty", "like", "good", "interest", // 評価性
    "dynamic", "strong", "showy","unique", // 活動性
    "bright", "fun", "warm","heavy",              // 明るさ
    "soft", "loose", "sharp",                     // やわらかさ
    "attention_check"                     // アテンションチェック
];


const manip_keys = [
    "happy", "good_mood", "optimistic", "friendly", "energetic", // Positive
    "uncomfortable", "uneasy", "bothered"                        // Negative
];

// SD法尺度 (定義後シャッフル)
// 0と10の下に改行(<br>)を入れて形容詞を表示し、文字サイズを少し小さくします
function create_labels(left_text, right_text) {
    const style = "font-size: 0.8em; font-weight: normal; display: block; margin-top: 5px;";
    return [
        `0<br><span style="${style}">${left_text}</span>`,
        "1", "2", "3", "4", "5", "6", "7", "8", "9",
        `10<br><span style="${style}">${right_text}</span>`
    ];
}

// SD法尺度 (11段階)
// プロンプトはシンプルにし、ラベル側で意味を提示します
const sd_scale_source = [
    // [評価性]
    { prompt: "醜い - 美しい", name: "beauty", labels: create_labels("醜い", "美しい") },
    { prompt: "嫌い - 好き",   name: "like",   labels: create_labels("嫌い", "好き") },
    { prompt: "悪い - 良い",   name: "good",   labels: create_labels("悪い", "良い") },
    { prompt: "つまらない - 面白い", name: "interest", labels: create_labels("つまらない", "面白い") },
    // [活動性]
    { prompt: "静的 - 動的",   name: "dynamic", labels: create_labels("静的", "動的") },
    { prompt: "弱い - 強い",   name: "strong",  labels: create_labels("弱い", "強い") },
    { prompt: "地味な - 派手な", name: "showy", labels: create_labels("地味な", "派手な") },
    { prompt: "個性的な - 平凡な", name: "unique", labels: create_labels("個性的な", "平凡な") },
    // [明るさ]
    { prompt: "暗い - 明るい", name: "bright", labels: create_labels("暗い", "明るい") },
    { prompt: "寂しい - 楽しい", name: "fun",   labels: create_labels("寂しい", "楽しい") },
    { prompt: "冷たい - 暖かい", name: "warm",  labels: create_labels("冷たい", "暖かい") },
    { prompt: "軽い - 重い", name: "heavy",  labels: create_labels("軽い", "重い") },
    // [やわらかさ]
    { prompt: "固い - 柔らかな", name: "soft",  labels: create_labels("固い", "柔らかな") },
    { prompt: "緊張した - ゆるんだ", name: "loose", labels: create_labels("緊張した", "ゆるんだ") },
    { prompt: "鋭い - 鈍い", name: "sharp",  labels: create_labels("鋭い", "鈍い") }
];

// ★修正: 全項目を必須入力(required: true)にする
sd_scale_source.forEach(q => q.required = true);
// 通常項目の順序をシャッフルして固定
const sd_scale_fixed = jsPsych.randomization.shuffle(sd_scale_source);

// ★修正: 感情・不協和測定用尺度 (8項目)
// 操作チェック（感情指標）
// ここは7段階(0-6)ですが、同様に両端に意味をつけます
const manip_labels = [
    "0<br><span style='font-size:0.8em'>全く<br>当てはまらない</span>", 
    "1", "2", "3", "4", "5", 
    "6<br><span style='font-size:0.8em'>非常に<br>よく当てはまる</span>"
];
// 日本語訳を当て、7段階で測定します。
const manipulation_check_scale = [
    { prompt: "先ほどの文章作成課題を行っている時、「書きにくい」「不快だ」といった葛藤を感じましたか？", 
      name: "discomfort", 
      labels: manip_labels }
];

// アテンションチェック項目
const attention_check_item = {
    prompt: "<span style='color:#d9534f; font-weight:bold;'>【確認】この項目では「0」（一番左）を選んでください</span>",
    name: "attention_check",
    // ここも同じフォーマットで揃えます
    labels: create_labels("これを選択", "不可"),
    //required: true
};

let TARGET_DATA = { id: null, path: null, score: 100 };
let CONDITION = null; 

// ★追加: 事後評価用の画像リスト（下位10枚）を入れる変数
let post_stimuli_data = [];
let current_post_index = 0;

// ★アテンションチェックを入れる対象の画像をランダムに決定
// 事前・事後それぞれで1枚ずつ選ぶ
// ★アテンションチェックを入れる対象の画像をランダムに決定
const pre_check_target_id = jsPsych.randomization.sampleWithoutReplacement(stimuli_data.map(s => s.id), 1)[0];

let post_check_target_id = jsPsych.randomization.sampleWithoutReplacement(stimuli_data.map(s => s.id), 1)[0];
console.log(`Pre-check target: ${pre_check_target_id}`);
console.log(`Post-check target: ${post_check_target_id}`);

// ---------------------------------------------------------
// 2. 初期化
// ---------------------------------------------------------
timeline.push({
    type: jsPsychPreload,
    images: preload_images,
    message: 'データを読み込み中...'
});

// 参加者ID
const subject_id = jsPsych.randomization.randomID(10);

// ★完了コード生成
const completion_code = jsPsych.randomization.randomID(8).toUpperCase();



jsPsych.data.addProperties({
    subject_id: subject_id,
    completion_code: completion_code ,
    pre_check_target_id: pre_check_target_id,   // どの画像でチェックしたか記録
    post_check_target_id: post_check_target_id
});

// // 群割り当て
// timeline.push({
//     type: jsPsychHtmlKeyboardResponse,
//     stimulus: '実験の準備中...',
//     trial_duration: 500,
//     on_finish: function() {
//         const r = Math.random();
//         if (r < 0.33) CONDITION = 'A';
//         else if (r < 0.66) CONDITION = 'B';
//         else CONDITION = 'C';
//         jsPsych.data.addProperties({ condition: CONDITION });
//         console.log("Condition:", CONDITION);
//     }
// });

// 群割り当て (DataPipeによる均等割り付け)
const condition_assignment_trial = {
    type: jsPsychPipe,
    action: "condition",
    experiment_id: DATAPIPE_ID,
    on_finish: function(data) {
        // DataPipeから割り当てられた数値 (0, 1, 2 のいずれか) を取得
        const assigned_condition_num = data.result;
        
        // 数値を A, B, C に変換してグローバル変数 CONDITION に入れる
        if (assigned_condition_num === 0) {
            CONDITION = 'A';
        } else if (assigned_condition_num === 1) {
            CONDITION = 'B';
        } else {
            CONDITION = 'C';
        }

        // データに記録
        jsPsych.data.addProperties({ 
            condition: CONDITION,
            condition_num: assigned_condition_num 
        });
        
        console.log("DataPipe Assigned Condition:", CONDITION);
    }
};
timeline.push(condition_assignment_trial);



// =========================================================
// 0. 同意画面 (Consent Form)
// =========================================================

let consentResponseData = {
    date: '',
    signature: ''
};

const consent_text_content = `
    <div style="text-align: left; font-size: 0.95em; line-height: 1.6;">
        <h3 style="text-align:center;">研究協力のお願い（説明文書）</h3>
        
        <p><strong>1. 研究の目的</strong><br>
        本研究は、「芸術作品に対する言語表現」と「一般的な言語表現」の思考プロセスを比較・調査することを
        目的としています。人々が絵画のような複雑な視覚情報から受けた印象をどのように言葉にするのか、また、
        そのプロセスが一般的なテキスト情報（文章）記述するプロセスとどのように異なるのかを分析します。</p>

        <p><strong>2. 研究の方法</strong><br>
        この実験では、まず複数の絵画（15～20枚）が提示されますので、それぞれの作品に対するあなたの印象を、いくつかの評価尺度（SD法）を用いてお答えいただきます。次に、文章を作成する課題に取り組んでいただきます。課題はランダムに割り当てられます。一部の方は、先ほど評価した作品の中から1枚が選ばれ、その作品について記述していただきます。それ以外の方は、作品とは無関係な一般的な文章を記述していただきます。課題の直後には、課題中のご自身の状態について（例：集中度など）の短いアンケートにお答えいただきます。最後に、実験の最初と同じの作品の中から5～10枚をランダムな順序で再度提示しますので、作品に対する印象を再度評価していただきます。<br>
        所要時間は約45分です。</p>

        <p><strong>3. 参加の任意性と撤回の自由</strong><br>
        本研究への参加はあなたの自由意志によるものです。参加を断っても不利益を被ることはありません。<br>
        また、実験の途中であっても、ブラウザを閉じることでいつでも参加を取りやめる（同意を撤回する）ことができます。<br>
        その場合、入力されたデータは破棄され、研究に使用されることはありません。</p>

        <p><strong>4. 個人情報の保護（匿名性）</strong><br>
        本研究では、個人を特定できる情報（住所など）は一切収集しません。<br>
        収集されたデータは統計的に処理され、学術目的（学会発表、論文投稿など）でのみ使用されます。</p>

        <p><strong>5. 予想される利益と不利益</strong><br>
        実験による身体的・精神的な危険や不利益は想定されていませんが、作業中に疲労等を感じた場合は直ちに中止してください。</p>


        <p><strong>7. 問い合わせ先</strong><br>
        京都工芸繊維大学工芸科学部設計工学域情報工学課程ブレインサイエンス研究室<br>
        研究責任者：梶村昇吾<br>
        研究担当者: 藤井貴久<br>
        連絡先: b2122051@edu.kit.ac.jp</p>
        
        <hr>
        <p style="font-weight:bold;">
            上記の説明内容をよく読み、理解した上で、本研究に参加することに同意いただける場合は、<br>
            本日の日付を入力し、チェックボックスにチェックを入れてください。
        </p>
    </div>
`;
const consent_trial = {
    type: jsPsychHtmlButtonResponse,
    stimulus: function() {
        // 今日の日付を YYYY-MM-DD 形式で取得
        const today = new Date().toISOString().split('T')[0];
        
        // PDFの内容に基づいたヘッダー情報
        const headerInfo = `

            <h3 style="text-align: center; margin-bottom: 20px;">研究対象者同意書</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9em;">
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px; background: #f0f0f0; width: 30%;">研究責任者</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">京都工芸繊維大学 情報工学・人間科学系 梶村昇吾</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px; background: #f0f0f0;">研究課題名</td>
                    <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">芸術鑑賞と言語表現のプロセスに関する調査</td>
                </tr>
            </table>

        `;

        return `
            <div class="instruction-text" style="max-width: 800px; margin: 0 auto; font-family: 'Noto Sans JP', sans-serif;">
                
                ${headerInfo}

                <div style="border: 1px solid #ccc; padding: 20px; height: 300px; overflow-y: scroll; background: #fff; text-align: left; margin-bottom: 20px; border-radius: 4px;">
                    ${consent_text_content}
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee; text-align: left;">
                    
                    <p style="font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px;">理解した事項（全てにチェックを入れてください）</p>
                    
                    <div id="checklist-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                        <label style="cursor: pointer; display: flex; align-items: center;">
                            <input type="checkbox" class="consent-check" style="transform: scale(1.2); margin-right: 10px;">
                            <span>研究の目的</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center;">
                            <input type="checkbox" class="consent-check" style="transform: scale(1.2); margin-right: 10px;">
                            <span>研究の方法</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center;">
                            <input type="checkbox" class="consent-check" style="transform: scale(1.2); margin-right: 10px;">
                            <span>研究の実施期間</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center;">
                            <input type="checkbox" class="consent-check" style="transform: scale(1.2); margin-right: 10px;">
                            <span>研究への参加に伴う不利益、苦痛又は危険の可能性</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center;">
                            <input type="checkbox" class="consent-check" style="transform: scale(1.2); margin-right: 10px;">
                            <span>研究における倫理的配慮</span>
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center;">
                            <input type="checkbox" class="consent-check" style="transform: scale(1.2); margin-right: 10px;">
                            <span>個人情報等の使用目的及び取扱い</span>
                        </label>
                    </div>

                    <div style="border-top: 1px solid #ddd; pt-3; margin-top: 15px;">
                        <p>これらの事項について確認したうえで、この研究に参加することに同意します。</p>
                        
                        <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; margin-top: 15px;">
                            <div>
                                <label style="font-weight: bold; margin-right: 5px;">同意日:</label>
                                <input type="date" id="consent_date" value="${today}" style="padding: 5px; border: 1px solid #ccc; border-radius: 4px;">
                            </div>
                            <div style="flex-grow: 1;">
                                <label style="font-weight: bold; margin-right: 5px;">署名:</label>
                                <input type="text" id="consent_signature" placeholder="氏名を入力してください" style="padding: 6px; width: 200px; border: 1px solid #ccc; border-radius: 4px;">
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    },
    choices: ['実験を開始する'],
    on_load: function() {
        // 1. 変数をすべて関数の先頭で取得・宣言します
        const btn = document.querySelector('.jspsych-btn');
        const checkboxes = document.querySelectorAll('.consent-check');
        const signatureInput = document.getElementById('consent_signature'); // 署名欄
        const dateInput = document.getElementById('consent_date');         // 日付欄（ここがエラーの原因でした）
        
        // 2. 初期値を変数に保存
        // もし要素が見つからない場合はエラー回避のため空文字を入れる
        consentResponseData.date = dateInput ? dateInput.value : '';
        consentResponseData.signature = '';

        // 3. ボタンの初期状態: 無効化
        if(btn) {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        }

        // 4. キーボードイベントの遮断（署名入力時に実験が進まないようにする）
        if(signatureInput){
            signatureInput.addEventListener('keydown', function(e) {
                e.stopPropagation();
            });
            
            // 署名入力時の処理
            signatureInput.addEventListener('input', function(e) {
                consentResponseData.signature = e.target.value;
                checkConsentStatus();
            });
        }

        if(dateInput){
            dateInput.addEventListener('change', function(e) {
                consentResponseData.date = e.target.value;
            });
        }

        // 5. 状態チェック関数
        function checkConsentStatus() {
            // チェックボックスの確認
            let allChecked = true;
            checkboxes.forEach(box => {
                if (!box.checked) allChecked = false;
            });

            // 署名の確認
            const isSigned = signatureInput && signatureInput.value.trim().length > 0;

            // ボタンの状態更新
            if (btn) {
                if (allChecked && isSigned) {
                    btn.disabled = false;
                    btn.style.opacity = "1";
                    btn.style.cursor = "pointer";
                } else {
                    btn.disabled = true;
                    btn.style.opacity = "0.5";
                    btn.style.cursor = "not-allowed";
                }
            }
        }

        // チェックボックスにイベントを設定
        checkboxes.forEach(box => {
            box.addEventListener('change', checkConsentStatus);
        });
    },
    on_finish: function(data){
        // 保存しておいた変数からデータを保存
        data.consent_date = consentResponseData.date;
        data.consent_signature = consentResponseData.signature;
    }
};

timeline.push(consent_trial);


// ---------------------------------------------------------
// 3. Phase 1: 事前評価
// ---------------------------------------------------------
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <div class="instruction-text">
            <h3>Phase 1: 事前評価</h3>
            <p>これからいくつかの絵画が表示されます。</p>
            <p>画面上部に表示される絵画を見ながら、直感的に印象を評価してください。</p>
            <p>スペースキーを押して開始してください。</p>
        </div>
    `
});

const pre_evaluation_loop = {
    timeline: [{
        type: jsPsychSurveyLikert,
        css_classes: ['sticky-top-layout'],
        
        preamble: function() {
            const p = jsPsych.evaluateTimelineVariable('path');
            return `<img src="${p}" class="fixed-img">`;
        },
        
        // ★ここで動的に質問リストを生成する
        questions: function() {
            const current_id = jsPsych.evaluateTimelineVariable('id');
            
            // 通常の尺度（シャッフル済みの固定順序）をコピー
            let current_questions = [...sd_scale_fixed];

            // もし「チェック対象の画像」だったら、チェック項目を混ぜる
            if (current_id === pre_check_target_id) {
                // ランダムな位置（0〜12番目）にチェック項目を挿入
                const insert_index = Math.floor(Math.random() * (current_questions.length + 1));
                current_questions.splice(insert_index, 0, attention_check_item);
            }
            
            return current_questions;
        },
        
        scale_width: 800,
        on_finish: function(data) {
            const res = data.response;
            // ★修正: データを1つずつ取り出して個別の列に保存
            // ★修正: 固定リスト(sd_keys)の順番通りにデータを保存
            // 該当する回答がない場合（チェック項目が無い回など）は空欄または無視されます
            sd_keys.forEach(key => {
                if(res[key] !== undefined) {
                    data[key] = res[key];
                }
            });
            // 通常項目の合計スコアを計算（チェック項目は無視）
            let sum = (res.beauty||0) + (res.like||0) + (res.good||0) + (res.interest||0);
            
            data.phase = 'pre';
            data.eval_score = sum / 4;
            data.img_id = jsPsych.evaluateTimelineVariable('id');
            data.img_path = jsPsych.evaluateTimelineVariable('path');
            
            // チェック項目が含まれていた場合、正解したかどうかも記録しておくと便利
            if (res.attention_check !== undefined) {
                // 一番左（index 0）が正解
                data.passed_check = (res.attention_check === 0);
            }
        }
    }],
    timeline_variables: stimuli_data,
    randomize_order: true
};
timeline.push(pre_evaluation_loop);

// ---------------------------------------------------------
// 4. ターゲット選定
// ---------------------------------------------------------
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'データ集計中...',
    trial_duration: 500,
    on_finish: function() {
        const all_data = jsPsych.data.get().filter({phase: 'pre'}).values();
        all_data.sort((a, b) => a.eval_score - b.eval_score);
        
        if(all_data.length > 0){
            // 1. 介入対象 (最下位)
            TARGET_DATA.id = all_data[0].img_id;
            TARGET_DATA.path = all_data[0].img_path;
            TARGET_DATA.score = all_data[0].eval_score;
            jsPsych.data.addProperties({ target_id: TARGET_DATA.id });

            // 2. 再評価用リスト (下位10枚)
            const slice_count = Math.min(10, all_data.length);
            const low_10_data = all_data.slice(0, slice_count);
            
            // ★ここでリストを作成し、シャッフルまで完了させておく
            let temp_list = low_10_data.map(d => {
                return { id: d.img_id, path: d.img_path };
            });
            post_stimuli_data = jsPsych.randomization.shuffle(temp_list);

            // 3. アテンションチェック対象の再抽選
            // (シャッフルされた post_stimuli_data から1つ選ぶ)
            const new_check_id = jsPsych.randomization.sampleWithoutReplacement(post_stimuli_data.map(s => s.id), 1)[0];
            post_check_target_id = new_check_id;
            
            // ★カウンターをリセット
            current_post_index = 0;

            console.log("再評価リスト(決定済):", post_stimuli_data);
        }
    }
});

// ---------------------------------------------------------
// 5. Phase 2: 介入 (記述課題)
// ---------------------------------------------------------
// ※ここも画像を見ながら行うため、上下固定レイアウトを適用します
timeline.push({
    type: jsPsychSurveyText,
    css_classes: ['sticky-top-layout'], 
    
    preamble: function() {
        let html = `<div>`;
        
        // 条件C以外は画像を表示
        if (CONDITION !== 'C') {
            html += `<img src="${TARGET_DATA.path}" class="fixed-img"><br>`;
        } else {
            html += `<div style="height:50px;"></div>`; 
        }
        
        html += `<div style="text-align:left; max-width:800px; margin:20px auto;">`;
        html += `<h3>記述課題</h3>`;

        // ★追加: 文字数制限の注意書き
        html += `<p style="font-weight:bold; color:#d9534f; border: 1px solid #d9534f; padding: 10px; background: #fff0f0;">
                 ※この課題では、最低150文字以上の記述が必要です。<br>
                 文字数が150文字を超えるまで「送信して次へ」ボタンは押せません。
                 </p>`;
        
        if (CONDITION === 'A') { // 実験群(CAA)
            html += `<p style="color:#0056b3; font-weight:bold;">
                「この作品の魅力や、他者に推薦できる優れた点」についての推薦文を作成していただきます。
                </p>`;
            html += `<p>
                以下の入力欄に、この絵画を肯定的に評価し、他者に推薦するためのユニークな論点を最低3つ挙げ、それぞれについて具体的に説明してください。
                </p>`;
        } 
        else if (CONDITION === 'B') { // 統制群(客観記述)
            html += `<p style="color:#333; font-weight:bold;">
                あなたの個人的な感想や「良い・悪い」といった評価は含めず、「作品の構成要素」を客観的に記述してください。
                </p>`;
            html += `<p>
                描かれている人物や物、色彩の配置、筆のタッチなど、目に見える事実に基づいた客観的な特徴を3つ以上取り上げて説明してください。
                </p>`;
        } 
        else { // 無関係統制群(C) - 想起課題
            html += `<div style="background:#f9f9f9; padding:15px; border:1px solid #ddd;">
                <p><strong>課題:</strong></p>
                <p>今まで見た中で一番印象に残っている絵画について思い浮かべてください。それはどのような絵画か、またなぜ印象に残っているのかを具体的に記述してください。</p>
            </div>`;
        }
        html += `</div></div>`;
        return html;
    },
    
    // 入力欄（少し広めにしています）
    questions: [{ prompt: "", rows: 10, columns: 80, required: true, name: 'essay' }],
    button_label: '送信して次へ（150文字以上で有効化）',

    // ★追加: 文字数カウントとボタン制御のロジック
    on_load: function() {
        const textarea = document.querySelector('textarea');
        const button = document.getElementById('jspsych-survey-text-next');
        
        const counterDiv = document.createElement('div');
        counterDiv.style.marginTop = "10px";
        counterDiv.style.fontWeight = "bold";
        counterDiv.style.textAlign = "right";
        counterDiv.innerHTML = "現在の文字数: <span id='char-count' style='color:red; font-size:1.2em;'>0</span> / 150文字 (空白除く)";
        
        textarea.parentElement.appendChild(counterDiv);

        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";

        textarea.addEventListener('input', function() {
            // ★ここがポイント: 正規表現 /\s+/g で空白文字(スペース,改行,タブ)を全て削除
            const textWithoutSpace = this.value.replace(/\s+/g, '');
            const currentLength = textWithoutSpace.length;
            
            const countSpan = document.getElementById('char-count');
            countSpan.textContent = currentLength;

            if (currentLength >= 150) {
                button.disabled = false;
                button.style.opacity = "1";
                button.style.cursor = "pointer";
                countSpan.style.color = "green";
                button.value = "送信して次へ"; 
            } else {
                button.disabled = true;
                button.style.opacity = "0.5";
                button.style.cursor = "not-allowed";
                countSpan.style.color = "red";
                button.value = `あと ${150 - currentLength} 文字必要です`;
            }
        });
    },

    on_finish: function(data) { 
        data.phase = 'intervention'; 
        data.essay = data.response.essay;
        // 保存データにも「空白抜きの文字数」を記録しておくと便利です
        data.char_count = data.essay.replace(/\s+/g, '').length;
    }
});

// ---------------------------------------------------------
// 6. Phase 3: 操作チェック
// ---------------------------------------------------------
// 7件法のリッカート尺度ラベル
const manip_labels_p3 = [
    "1<br>全くあてはまらない", 
    "2", 
    "3", 
    "4", 
    "5", 
    "6", 
    "7<br>非常によくあてはまる"
];

// データの保存順序を固定するためのキーリスト
// (質問の提示順序がランダムになっても、CSV等ではこの順序で列が作られます)
const manip_keys_p3 = [
    "manip_filler_observe",      // Q1: 観察 (フィラー)
    "manip_dissonance_conflict", // Q2: 葛藤・迷い (不協和) [cite: 251]
    "manip_volition_will",       // Q3: 自発性 (前提) 
    "manip_filler_difficulty",   // Q4: 困難度 (フィラー)
    "manip_dissonance_discomfort",// Q5: 不快感 (不協和) [cite: 251]
    "manip_reverse_conviction",  // Q6: 納得 (逆転項目) [cite: 367]
    "manip_dissonance_deception",// Q7: 欺瞞・嘘 (不協和) [cite: 367]
    "manip_filler_style",        // Q8: 文体 (フィラー)
    "manip_reverse_calm",        // Q9: 安定 (逆転項目) [cite: 367]
    "manip_volition_refusal"     // Q10: 拒否可能性 (前提) 
];

const manip_check = {
    timeline: [{
        type: jsPsychSurveyLikert,
        // カバーストーリーに合わせた教示文
        preamble: '<div style="margin: 20px 0; text-align: left;">' +
                  '<h3>言語表現プロセスに関する振り返りシート</h3>' +
                  '<p>このアンケートは、先ほどの文章記述課題において、あなたがどのような意識で言葉を選び、文章を構成したかを把握するためのものです。</p>' +
                  '<p>課題に取り組んでいた時の<strong>あなたの気持ちや状態</strong>として、以下の項目がどの程度当てはまるかお答えください。</p>' +
                  '</div>',
        questions: [
            // Q1: フィラー (カバーストーリー維持)
            { prompt: "絵画の細部（色使いや構図など）をよく観察して文章を書いた。", name: "manip_filler_observe", labels: manip_labels_p3, required: true },
            
            // Q2: 葛藤 (吉田, 1977の「迷い」に対応) [cite: 251]
            { prompt: "文章の内容を構成する際、自分の気持ちと裏腹なことを書くことに「迷い」や「抵抗」を感じた。", name: "manip_dissonance_conflict", labels: manip_labels_p3, required: true },
            
            // Q3: 自発性 (吉田, 1977の「意志」に対応) 
            { prompt: "この文章を書くという行為は、あなた自身の自由な意志で行った。", name: "manip_volition_will", labels: manip_labels_p3, required: true },
            
            // Q4: フィラー (難易度の統制)
            { prompt: "適切な表現や語彙を見つけるのに苦労した。", name: "manip_filler_difficulty", labels: manip_labels_p3, required: true },
            
            // Q5: 不快感 (吉田, 1974, 1977の「不快さ」に対応) [cite: 367]
            { prompt: "課題に取り組んでいる間、心理的な居心地の悪さ（不快さ）を感じた。", name: "manip_dissonance_discomfort", labels: manip_labels_p3, required: true },
            
            // Q6: 納得感 (★分析時に逆転処理が必要)
            { prompt: "自分の書いた文章の内容に納得している。", name: "manip_reverse_conviction", labels: manip_labels_p3, required: true },
            
            // Q7: 欺瞞感 (吉田, 1974の「正直さ」の応用) [cite: 367]
            { prompt: "自分の本心ではないことを書いているという感覚（嘘をついている感覚）があった。", name: "manip_dissonance_deception", labels: manip_labels_p3, required: true },
            
            // Q8: フィラー (カバーストーリー維持)
            { prompt: "普段の自分の文章スタイルで書くことができた。", name: "manip_filler_style", labels: manip_labels_p3, required: true },
            
            // Q9: 安定感 (★分析時に逆転処理が必要)
            { prompt: "落ち着いた気持ちで課題に取り組むことができた。", name: "manip_reverse_calm", labels: manip_labels_p3, required: true },
            
            // Q10: 拒否可能性 (自発性の再確認) 
            { prompt: "もし書きたくなければ、この課題を中断・拒否することもできたと感じている。", name: "manip_volition_refusal", labels: manip_labels_p3, required: true }
        ],
        scale_width: 800,
        randomize_question_order: true, // ランダム表示にする
        on_finish: function(data) { 
            data.phase = 'manipulation_check';
            const res = data.response;
            // 定義した manip_keys の順序でデータを保存
            manip_keys_p3.forEach(key => {
                if(res[key] !== undefined) {
                    data[key] = res[key];
                }
            });
        }
    }]
};
timeline.push(manip_check);

// ---------------------------------------------------------
// 7. Phase 4: 事後評価 (マニュアルループ版)
// ---------------------------------------------------------
timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <div class="instruction-text">
            <h3>Phase 3: 事後評価</h3>
            <p>最後に、もう一度いくつかの絵画についてお伺いします。</p>
            <p>今のあなたの率直な印象を回答してください。</p>
            <p>スペースキーで開始</p>
        </div>
    `
});

// ★単一の試行定義（変数はカウンターを使って動的に取得）
const post_trial = {
    type: jsPsychSurveyLikert,
    css_classes: ['sticky-top-layout'],
    
    // 画像パス: 配列から現在のインデックスのものを取り出す
    preamble: function() {
        // 安全策: データが無い場合はエラー回避
        if (!post_stimuli_data[current_post_index]) return "";
        
        const path = post_stimuli_data[current_post_index].path;
        return `<img src="${path}" class="fixed-img">`;
    },
    
    // 質問生成: ここもインデックスを使って判定
    questions: function() {
        if (!post_stimuli_data[current_post_index]) return [];

        const current_id = post_stimuli_data[current_post_index].id;
        let current_questions = [...sd_scale_fixed]; 

        // アテンションチェック挿入ロジック
        if (current_id === post_check_target_id) {
            const insert_index = Math.floor(Math.random() * (current_questions.length + 1));
            current_questions.splice(insert_index, 0, attention_check_item);
        }
        return current_questions;
    },
    
    scale_width: 800,
    
    on_finish: function(data) {
        // 現在のデータIDを取得して保存
        const current_item = post_stimuli_data[current_post_index];
        
        const res = data.response;
        sd_keys.forEach(key => {
            if(res[key] !== undefined) {
                data[key] = res[key];
            }
        });
        let sum = (res.beauty||0) + (res.like||0) + (res.good||0) + (res.interest||0);
        
        data.phase = 'post'; 
        data.eval_score = sum / 4;
        data.img_id = current_item.id;
        data.is_target = (current_item.id === TARGET_DATA.id);
        
        if (res.attention_check !== undefined) {
            data.passed_check = (res.attention_check === 0);
        }

        // ★★★重要: ここでカウンターを1つ進める★★★
        current_post_index++;
    }
};

// ★ループ定義
const post_evaluation_loop = {
    timeline: [post_trial],
    // カウンターがデータの個数より小さい間、繰り返す
    loop_function: function() {
        if (current_post_index < post_stimuli_data.length) {
            return true; // 繰り返す
        } else {
            return false; // 終了
        }
    }
};

timeline.push(post_evaluation_loop);

// ---------------------------------------------------------
// 8. 終了処理（デブリーフィング復元）
// ---------------------------------------------------------

// 削除する列のリスト
const ignore_columns = [
    'stimulus', 
    'question_order', 
    'success', 
    'timeout', 
    'failed_images', 
    'failed_audio', 
    'failed_video', 
    'plugin_version', 
    'internal_node_id', 
    'trial_type'
];

const save_data_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="font-size:24px;">データを保存しています...</p>',
    trial_duration: 1000, 
    on_finish: function() {
       jsPsych.data.get()
            .ignore(ignore_columns)
            .localSave('csv', 'dissonance_experiment_data.csv');
    }
};
timeline.push(save_data_trial);

if(DATAPIPE_ID !== "") {
    timeline.push({
        type: jsPsychPipe,
        action: "save",
        experiment_id: DATAPIPE_ID,
        filename: `${subject_id}.csv`,
        data_string: ()=>jsPsych.data.get().ignore(ignore_columns).csv()
    });
}

// ★ここが復元したデブリーフィングです
const debriefing = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        return `
            <div class="instruction-text">
                <h3>実験終了：ご協力ありがとうございました</h3>
                <p><strong>研究の目的について</strong><br>
                事前説明では「言語表現と思考プロセスの研究」とお伝えしましたが、実際には「自分の好みと異なる文章を書くことで、その対象への評価がどう変化するか（認知的不協和理論）」を調査する実験でした。<br>
                正確な結果を得るため、意図的な隠蔽（カバーストーリーの使用）があったことをお詫び申し上げます。</p>
                
                <hr style="border: 2px solid #333; margin: 30px 0;">
                
                <div style="background-color: #f0f8ff; padding: 20px; border: 2px solid #0056b3; border-radius: 8px; text-align: center;">
                    <p style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">実験完了コード</p>
                    <p style="font-size: 36px; font-weight: bold; letter-spacing: 3px; color: #d32f2f; background: #fff; display: inline-block; padding: 5px 20px; border: 1px solid #ccc; user-select: all;">
                        ${completion_code}
                    </p>
                    <p style="font-size: 14px; margin-top: 10px;">
                        上記のコードを必ず<strong>コピー、またはメモ</strong>をしてください。<br>
                        <br>
                        コードを記録しましたら、ブラウザを閉じて終了してください。
                    </p>
                </div>

                <p style="margin-top: 30px;">※自動的にデータ(CSV)がダウンロードされます。</p>
            </div>
        `;
    },
    choices: "NO_KEYS" 
};
timeline.push(debriefing);

// 実行
jsPsych.run(timeline);