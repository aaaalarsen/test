// チャットボットエンジン - 変換後JSONを読み取って対話を制御

class ChatBotEngine {
    constructor(chatData) {
        this.chatData = chatData;
        this.runtime = {
            currentScreen: 1,
            variables: {},
            history: []
        };
        this.ui = null; // UIハンドラーは後で設定
    }

    // UIハンドラーを設定
    setUI(uiHandler) {
        this.ui = uiHandler;
    }

    // チャットボット開始
    start() {
        this.showCurrentScreen();
    }

    // 現在の画面を表示
    showCurrentScreen() {
        const currentNode = this.getCurrentNode();
        if (!currentNode) {
            this.showError('画面が見つかりません');
            return;
        }

        // 履歴に追加
        this.runtime.history.push({
            screen: this.runtime.currentScreen,
            timestamp: new Date().toISOString()
        });

        // 画面タイプに応じて表示
        if (currentNode.isEndNode) {
            this.showEndScreen(currentNode);
        } else if (currentNode.isInputField) {
            this.showInputScreen(currentNode);
        } else if (currentNode.conditions) {
            this.evaluateConditions(currentNode);
        } else {
            this.showChoiceScreen(currentNode);
        }
    }

    // 現在のノードを取得
    getCurrentNode() {
        return this.chatData.nodes.find(node => node.screen === this.runtime.currentScreen);
    }

    // 選択肢画面を表示
    showChoiceScreen(node) {
        let choices = [];

        // 動的選択肢の場合
        if (node.dynamicChoices) {
            choices = this.generateDynamicChoices(node.dynamicChoices);
        } else {
            choices = node.choices || [];
        }

        // 確認画面の場合、データも表示
        let displayText = node.navText;
        if (node.displayData) {
            displayText += '\n\n' + this.formatDisplayData(node.displayData);
        }

        this.ui.showMessage(displayText, choices, (selectedChoice) => {
            this.handleChoice(node, selectedChoice);
        });
    }

    // 入力画面を表示
    showInputScreen(node) {
        const validation = node.inputValidation || {};
        
        this.ui.showInputField(node.navText, validation, (inputValue) => {
            if (this.validateInput(inputValue, validation)) {
                this.handleInput(node, inputValue);
            } else {
                this.ui.showError(validation.errorMessage || '入力値が正しくありません');
            }
        });
    }

    // 終了画面を表示
    showEndScreen(node) {
        this.ui.showEndMessage(node.navText, node.endType);
    }

    // エラー画面を表示
    showError(message) {
        this.ui.showError(message);
    }

    // 選択肢を処理
    handleChoice(node, selectedChoice) {
        // 履歴に選択を記録
        const lastHistory = this.runtime.history[this.runtime.history.length - 1];
        if (lastHistory) {
            lastHistory.choice = selectedChoice;
        }

        // 次の画面を決定
        const nextScreen = this.findNextScreen(node, selectedChoice);
        if (nextScreen !== null) {
            // 変数の設定
            this.setVariablesFromChoice(node, selectedChoice);
            this.runtime.currentScreen = nextScreen;
            this.showCurrentScreen();
        } else {
            this.showError('次の画面が見つかりません');
        }
    }

    // 入力を処理
    handleInput(node, inputValue) {
        // 履歴に入力を記録
        const lastHistory = this.runtime.history[this.runtime.history.length - 1];
        if (lastHistory) {
            lastHistory.input = inputValue;
        }

        // 次の画面を決定（入力値による分岐も考慮）
        const nextScreen = this.findNextScreenForInput(node, inputValue);
        if (nextScreen !== null) {
            // 変数の設定
            this.setVariablesFromInput(node, inputValue);
            this.runtime.currentScreen = nextScreen;
            this.showCurrentScreen();
        } else {
            this.showError('次の画面が見つかりません');
        }
    }

    // 動的選択肢を生成
    generateDynamicChoices(dynamicConfig) {
        const sourcePath = dynamicConfig.source.split('.');
        let choices = this.chatData;
        
        for (const path of sourcePath) {
            choices = choices[path];
            if (!choices) break;
        }

        return choices ? choices.map(item => item.label) : [];
    }

    // 表示データをフォーマット
    formatDisplayData(displayData) {
        return displayData.map(item => {
            const value = this.runtime.variables[item.field] || '';
            let formattedValue = value;

            // フォーマット処理
            if (item.format.startsWith('code:')) {
                const codeId = item.format.substring(5);
                formattedValue = this.formatCodeValue(value, codeId);
            } else if (item.format === 'currency') {
                formattedValue = this.formatCurrency(value);
            }

            return `${item.label}: ${formattedValue}`;
        }).join('\n');
    }

    // コード値をラベルに変換
    formatCodeValue(value, codeId) {
        console.log(`コード変換: ${value} -> ${codeId}`);
        const codes = this.chatData.codeDefinitions[codeId];
        if (codes) {
            const code = codes.find(c => c.value === value);
            const result = code ? code.label : value;
            console.log(`変換結果: ${result}`);
            return result;
        }
        console.log(`コード定義が見つかりません: ${codeId}`);
        return value;
    }

    // 通貨フォーマット
    formatCurrency(value) {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(value);
    }

    // 次の画面を検索
    findNextScreen(node, selectedChoice) {
        if (!node.nextNodes) return null;

        for (const nextNode of node.nextNodes) {
            if (nextNode.choice === selectedChoice || nextNode.choice === '*') {
                return nextNode.nextScreen;
            }
        }
        return null;
    }

    // 入力値による次の画面を検索
    findNextScreenForInput(node, inputValue) {
        if (!node.nextNodes) return null;

        for (const nextNode of node.nextNodes) {
            if (nextNode.condition) {
                if (nextNode.condition === 'valid') {
                    return nextNode.nextScreen;
                } else if (typeof nextNode.condition === 'object') {
                    if (this.evaluateCondition(nextNode.condition, inputValue)) {
                        return nextNode.nextScreen;
                    }
                }
            }
        }
        return null;
    }

    // 条件を評価
    evaluateCondition(condition, inputValue) {
        if (condition.field === 'input') {
            const value = parseFloat(inputValue) || inputValue;
            const compareValue = parseFloat(condition.value) || condition.value;

            switch (condition.operator) {
                case 'EQUALS':
                    return value === compareValue;
                case 'NOT_EQUALS':
                    return value !== compareValue;
                case 'GREATER':
                    return value > compareValue;
                case 'LESS':
                    return value < compareValue;
                case 'GREATER_EQUALS':
                    return value >= compareValue;
                case 'LESS_EQUALS':
                    return value <= compareValue;
                default:
                    return false;
            }
        }
        return false;
    }

    // 条件ノードを評価
    evaluateConditions(node) {
        const conditions = node.conditions;
        let match = false;

        if (conditions.rules) {
            if (conditions.operator === 'AND') {
                match = conditions.rules.every(rule => this.evaluateRule(rule));
            } else if (conditions.operator === 'OR') {
                match = conditions.rules.some(rule => this.evaluateRule(rule));
            }
        }

        // 結果に応じて次の画面を決定
        const nextScreen = this.findNextScreenForCondition(node, match);
        if (nextScreen !== null) {
            this.runtime.currentScreen = nextScreen;
            this.showCurrentScreen();
        } else {
            this.showError('条件評価エラー');
        }
    }

    // ルールを評価
    evaluateRule(rule) {
        const value = this.runtime.variables[rule.field];
        return this.evaluateCondition(rule, value);
    }

    // 条件結果による次の画面を検索
    findNextScreenForCondition(node, match) {
        if (!node.nextNodes) return null;

        for (const nextNode of node.nextNodes) {
            if ((nextNode.condition === 'match' && match) ||
                (nextNode.condition === 'default' && !match)) {
                return nextNode.nextScreen;
            }
        }
        return null;
    }

    // 選択による変数設定
    setVariablesFromChoice(node, selectedChoice) {
        if (!node.nextNodes) return;

        const nextNode = node.nextNodes.find(n => n.choice === selectedChoice);
        if (nextNode && nextNode.setValue) {
            Object.assign(this.runtime.variables, nextNode.setValue);
        }
    }

    // 入力による変数設定
    setVariablesFromInput(node, inputValue) {
        if (!node.nextNodes) return;

        for (const nextNode of node.nextNodes) {
            if (nextNode.setValue) {
                const setValue = { ...nextNode.setValue };
                // 'input'を実際の入力値に置換
                for (const key in setValue) {
                    if (setValue[key] === 'input') {
                        setValue[key] = inputValue;
                    }
                }
                Object.assign(this.runtime.variables, setValue);
            }
        }
    }

    // 入力値検証
    validateInput(value, validation) {
        if (validation.required && (!value || value.trim() === '')) {
            return false;
        }

        if (validation.type === 'number') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return false;
            
            if (validation.min && numValue < validation.min) return false;
            if (validation.max && numValue > validation.max) return false;
        }

        if (validation.minLength && value.length < validation.minLength) {
            return false;
        }

        if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) return false;
        }

        return true;
    }

    // デバッグ用：現在の状態を取得
    getState() {
        return {
            currentScreen: this.runtime.currentScreen,
            variables: this.runtime.variables,
            history: this.runtime.history
        };
    }

    // デバッグ用：特定の画面に移動
    jumpToScreen(screenId) {
        this.runtime.currentScreen = screenId;
        this.showCurrentScreen();
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatBotEngine;
}