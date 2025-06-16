// メインアプリケーション - UIとチャットボットエンジンを統合

class ChatBotUI {
    constructor() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.inputArea = document.getElementById('chatInputArea');
        this.debugPanel = document.getElementById('debugPanel');
        this.debugInfo = document.getElementById('debugInfo');
        this.engine = null;
        this.currentCallback = null;
    }

    // チャットボットエンジンを設定
    setEngine(engine) {
        this.engine = engine;
        engine.setUI(this);
    }

    // ボットメッセージを表示
    showMessage(text, choices = [], callback = null) {
        this.addMessage(text, 'bot');
        
        if (choices && choices.length > 0) {
            this.showChoiceButtons(choices, callback);
        } else if (callback) {
            this.currentCallback = callback;
        }
        
        this.updateDebugInfo();
    }

    // 入力フィールドを表示
    showInputField(text, validation = {}, callback = null) {
        this.addMessage(text, 'bot');
        this.showInputForm(validation, callback);
        this.updateDebugInfo();
    }

    // 終了メッセージを表示
    showEndMessage(text, endType) {
        const messageType = endType === 'success' ? 'success' : 'error';
        this.addMessage(text, messageType);
        this.clearInputArea();
        this.updateDebugInfo();
    }

    // エラーメッセージを表示
    showError(text) {
        this.addMessage(text, 'error');
        this.updateDebugInfo();
    }

    // メッセージを追加
    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    // ユーザーメッセージを追加
    addUserMessage(text) {
        this.addMessage(text, 'user');
    }

    // タイピングインジケーターを表示
    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        
        // 少し待ってからタイピングインジケーターを削除
        setTimeout(() => {
            if (typingDiv.parentNode) {
                typingDiv.parentNode.removeChild(typingDiv);
            }
        }, 1000);
    }

    // 選択肢ボタンを表示
    showChoiceButtons(choices, callback) {
        this.clearInputArea();
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'choice-buttons';
        
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice;
            button.onclick = () => {
                this.addUserMessage(choice);
                this.showTyping();
                setTimeout(() => {
                    if (callback) callback(choice);
                }, 500);
            };
            buttonsContainer.appendChild(button);
        });
        
        this.inputArea.appendChild(buttonsContainer);
    }

    // 入力フォームを表示
    showInputForm(validation, callback) {
        this.clearInputArea();
        
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        
        const input = document.createElement('input');
        input.className = 'input-field';
        input.type = validation.type === 'number' ? 'number' : 'text';
        input.placeholder = this.getPlaceholder(validation);
        
        if (validation.min) input.min = validation.min;
        if (validation.max) input.max = validation.max;
        
        const sendButton = document.createElement('button');
        sendButton.className = 'send-button';
        sendButton.textContent = '送信';
        sendButton.onclick = () => this.handleInputSubmit(input, callback);
        
        // Enterキーでも送信
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                this.handleInputSubmit(input, callback);
            }
        };
        
        inputGroup.appendChild(input);
        inputGroup.appendChild(sendButton);
        this.inputArea.appendChild(inputGroup);
        
        // フォーカスを設定
        input.focus();
    }

    // 入力送信を処理
    handleInputSubmit(input, callback) {
        const value = input.value.trim();
        if (value) {
            this.addUserMessage(value);
            this.showTyping();
            setTimeout(() => {
                if (callback) callback(value);
            }, 500);
        }
    }

    // プレースホルダーテキストを生成
    getPlaceholder(validation) {
        if (validation.type === 'number') {
            let placeholder = '数値を入力';
            if (validation.min && validation.max) {
                placeholder += ` (${validation.min}〜${validation.max})`;
            } else if (validation.min) {
                placeholder += ` (${validation.min}以上)`;
            } else if (validation.max) {
                placeholder += ` (${validation.max}以下)`;
            }
            return placeholder;
        }
        return 'テキストを入力してください';
    }

    // 入力エリアをクリア
    clearInputArea() {
        this.inputArea.innerHTML = '';
    }

    // 最下部にスクロール
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    // デバッグ情報を更新
    updateDebugInfo() {
        if (this.engine && this.debugInfo) {
            const state = this.engine.getState();
            this.debugInfo.innerHTML = `<pre>${JSON.stringify(state, null, 2)}</pre>`;
        }
    }

    // チャット履歴をクリア
    clearChat() {
        this.messagesContainer.innerHTML = '';
        this.clearInputArea();
    }
}

// グローバル変数
let chatUI = null;
let chatEngine = null;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    chatUI = new ChatBotUI();
});

// configuration.jsonを変換してチャット開始
async function convertAndStart() {
    const fileInput = document.getElementById('configFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('configuration.jsonファイルを選択してください');
        return;
    }
    
    try {
        const text = await file.text();
        const configData = JSON.parse(text);
        
        const converter = new ConfigurationConverter();
        const chatData = converter.convert(configData);
        
        startChatBot(chatData);
        hideConverterPanel();
        
    } catch (error) {
        console.error('変換エラー:', error);
        alert('ファイルの変換に失敗しました: ' + error.message);
    }
}

// テストデータでチャット開始
async function loadTestData() {
    try {
        // まずfetchを試す
        const response = await fetch('./configuration.json');
        const configData = await response.json();
        
        // 詳細コンバーターを使用
        const converter = new DetailedConfigurationConverter();
        const chatData = converter.convert(configData);
        
        // 変換結果をJSON ファイルとして出力
        downloadConvertedJson(chatData, 'converted_chat_data.json');
        
        startChatBot(chatData);
        hideConverterPanel();
        
    } catch (error) {
        console.error('テストデータ読み込みエラー:', error);
        console.log('フォールバック: 埋め込みデータを使用します');
        
        // フォールバック: 埋め込みconfiguration.jsonデータを使用
        loadEmbeddedTestData();
    }
}

// 埋め込みテストデータでチャット開始
function loadEmbeddedTestData() {
    try {
        // 詳細コンバーターを使用（埋め込みconfiguration.jsonデータ付き）
        const converter = new DetailedConfigurationConverter();
        const chatData = converter.convert(getEmbeddedConfigData());
        
        // 変換結果をJSON ファイルとして出力
        downloadConvertedJson(chatData, 'converted_chat_data.json');
        
        startChatBot(chatData);
        hideConverterPanel();
        
    } catch (error) {
        console.error('埋め込みデータ変換エラー:', error);
        
        // 最終フォールバック: 簡単なテストデータ
        const fallbackData = {
            nodes: [
                {
                    screen: 1,
                    navText: "言語を選択してください\nPlease select your language",
                    choices: ["日本語", "English", "中文"],
                    preNodes: [],
                    isInputField: false,
                    conditions: null,
                    nextNodes: [
                        { choice: "日本語", nextScreen: 2, setValue: { language: "Japanese" } },
                        { choice: "English", nextScreen: 2, setValue: { language: "English" } },
                        { choice: "中文", nextScreen: 2, setValue: { language: "Chinese" } }
                    ]
                },
                {
                    screen: 2,
                    navText: "ご希望の取引を選択してください",
                    choices: ["預入", "払出", "振込"],
                    preNodes: [{ screen: 1, choice: null }],
                    isInputField: false,
                    conditions: null,
                    nextNodes: [
                        { choice: "預入", nextScreen: 3, setValue: { transactionType: "deposit" } },
                        { choice: "払出", nextScreen: 4, setValue: { transactionType: "payment" } },
                        { choice: "振込", nextScreen: 5, setValue: { transactionType: "transfer" } }
                    ]
                },
                {
                    screen: 3,
                    navText: "預入金額を入力してください",
                    choices: [],
                    preNodes: [{ screen: 2, choice: "預入" }],
                    isInputField: true,
                    conditions: null,
                    inputValidation: {
                        type: "number",
                        required: true,
                        min: 1,
                        max: 10000000,
                        errorMessage: "1円以上1000万円以下で入力してください"
                    },
                    nextNodes: [
                        { condition: "valid", nextScreen: 6, setValue: { depositAmount: "input" } }
                    ]
                },
                {
                    screen: 4,
                    navText: "払出金額を入力してください",
                    choices: [],
                    preNodes: [{ screen: 2, choice: "払出" }],
                    isInputField: true,
                    conditions: null,
                    inputValidation: {
                        type: "number",
                        required: true,
                        min: 1,
                        max: 10000000,
                        errorMessage: "1円以上1000万円以下で入力してください"
                    },
                    nextNodes: [
                        {
                            condition: { field: "input", operator: "GREATER", value: 200000 },
                            nextScreen: 99,
                            message: "20万円を超える払出は窓口をご利用ください"
                        },
                        {
                            condition: { field: "input", operator: "LESS_EQUALS", value: 200000 },
                            nextScreen: 6,
                            setValue: { payoutAmount: "input" }
                        }
                    ]
                },
                {
                    screen: 5,
                    navText: "お振込先の国を選択してください",
                    choices: ["日本", "その他"],
                    preNodes: [{ screen: 2, choice: "振込" }],
                    isInputField: false,
                    conditions: null,
                    nextNodes: [
                        { choice: "日本", nextScreen: 6, setValue: { recipientsCountry: "Japan" } },
                        { choice: "その他", nextScreen: 98, setValue: { recipientsCountry: "Others" } }
                    ]
                },
                {
                    screen: 6,
                    navText: "以下の内容で手続きを行います",
                    choices: ["確認", "修正"],
                    preNodes: [],
                    isInputField: false,
                    conditions: null,
                    displayData: [
                        { label: "取引種別", field: "transactionType", format: "text" },
                        { label: "金額", field: "depositAmount", format: "currency" }
                    ],
                    nextNodes: [
                        { choice: "確認", nextScreen: 100 },
                        { choice: "修正", nextScreen: 1 }
                    ]
                },
                {
                    screen: 98,
                    navText: "海外送金は当システムでは行っていただけません。窓口をご利用ください。",
                    choices: [],
                    preNodes: [],
                    isInputField: false,
                    conditions: null,
                    isEndNode: true,
                    endType: "error"
                },
                {
                    screen: 99,
                    navText: "20万円を超えるお取引は当システムでは行っていただけません。窓口をご利用ください。",
                    choices: [],
                    preNodes: [],
                    isInputField: false,
                    conditions: null,
                    isEndNode: true,
                    endType: "error"
                },
                {
                    screen: 100,
                    navText: "お手続きが完了しました。ありがとうございました。",
                    choices: [],
                    preNodes: [],
                    isInputField: false,
                    conditions: null,
                    isEndNode: true,
                    endType: "success"
                }
            ],
            codeDefinitions: {
                transactionType: [
                    { label: "預入", value: "deposit" },
                    { label: "払出", value: "payment" },
                    { label: "振込", value: "transfer" }
                ]
            },
            domainData: {},
            runtime: {
                currentScreen: 1,
                variables: {},
                history: []
            }
        };
        
        startChatBot(fallbackData);
        hideConverterPanel();
    }
}

// チャットボット開始
function startChatBot(chatData) {
    console.log('チャットデータ:', chatData);
    
    chatEngine = new ChatBotEngine(chatData);
    chatUI.setEngine(chatEngine);
    
    chatUI.clearChat();
    chatUI.addMessage('AIアシスタントです。お手続きを開始いたします。', 'system');
    
    setTimeout(() => {
        chatEngine.start();
    }, 1000);
}

// 変換パネルを非表示
function hideConverterPanel() {
    const panel = document.getElementById('converterPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// 変換結果JSONをダウンロード
function downloadConvertedJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`変換結果を${filename}として保存しました`);
}

// デバッグ表示切替
function toggleDebug() {
    const panel = document.getElementById('debugPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        if (chatEngine) {
            chatUI.updateDebugInfo();
        }
    } else {
        panel.style.display = 'none';
    }
}

// 状態をダウンロード
function downloadState() {
    if (!chatEngine) return;
    
    const state = chatEngine.getState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { 
        type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chatbot_state.json';
    a.click();
    URL.revokeObjectURL(url);
}

// 開発用：特定画面にジャンプ
function jumpToScreen(screenId) {
    if (chatEngine) {
        chatEngine.jumpToScreen(screenId);
    }
}

// デバッグ用ショートカット
document.addEventListener('keydown', function(e) {
    // Ctrl+D でデバッグパネル切替
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDebug();
    }
    
    // Ctrl+R でチャットリセット
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (chatEngine) {
            chatEngine.jumpToScreen(1);
        }
    }
});