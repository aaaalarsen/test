// configuration.jsonを改善されたチャット用JSON形式に変換するプログラム

class ConfigurationConverter {
    constructor() {
        this.nodeIdCounter = 1;
        this.nodeMap = new Map(); // 元のIDと新しいscreen番号のマッピング
        this.convertedNodes = [];
        this.codeDefinitions = {};
        this.domainData = {};
        this.processedNodes = new Set(); // 処理済みノードを追跡
    }

    convert(configData) {
        console.log('開始: configuration.json変換', configData);
        
        // codeDefinitionsとdomainDataを抽出
        this.extractCodeDefinitions(configData);
        this.extractDomainData(configData);

        // ワークフローノードを変換
        if (configData.wfmanager && configData.wfmanager.domainWorkFlows) {
            const workflow = configData.wfmanager.domainWorkFlows[0];
            if (workflow.rootWorkflow && workflow.rootWorkflow.workflow) {
                this.convertWorkflow(workflow.rootWorkflow.workflow);
            }
        }

        const result = {
            nodes: this.convertedNodes,
            codeDefinitions: this.codeDefinitions,
            domainData: this.domainData,
            runtime: {
                currentScreen: 1,
                variables: {},
                history: []
            }
        };

        console.log('変換完了:', result);
        return result;
    }

    extractCodeDefinitions(configData) {
        if (configData.codedef && configData.codedef.codes) {
            configData.codedef.codes.forEach(code => {
                this.codeDefinitions[code.codeid] = code.items.map(item => ({
                    label: item.label,
                    value: item.value
                }));
            });
        }
    }

    extractDomainData(configData) {
        if (configData.wfmanager && configData.wfmanager.domainWorkFlows) {
            const workflow = configData.wfmanager.domainWorkFlows[0];
            if (workflow.domainData) {
                this.domainData = workflow.domainData;
            }
        }
    }

    convertWorkflow(workflow) {
        workflow.forEach(node => {
            this.convertNode(node);
        });
    }

    convertNode(node) {
        if (this.processedNodes.has(node.id)) {
            return this.nodeMap.get(node.id);
        }

        const screenId = this.nodeIdCounter++;
        this.nodeMap.set(node.id, screenId);
        this.processedNodes.add(node.id);

        console.log(`変換中ノード: ${node.id}, タイプ: ${node.type}, タイトル: ${node.title}`);

        if (node.type === 'G' && node.group) {
            // グループノードの場合、子ノードを順次処理
            this.convertWorkflow(node.group.workflow);
        } else if (node.type === 'R' && node.content) {
            // 通常ノードの場合
            const convertedNode = this.convertRegularNode(node, screenId);
            if (convertedNode) {
                this.convertedNodes.push(convertedNode);
            }
        } else if (node.type === 'S') {
            // スイッチノードの場合
            this.convertSwitchNode(node, screenId);
        }

        return screenId;
    }

    convertRegularNode(node, screenId) {
        const content = node.content;
        const customData = content.customizedData;
        
        let convertedNode = {
            screen: screenId,
            navText: customData.navText || node.title || '',
            choices: [],
            preNodes: [],
            isInputField: false,
            conditions: null
        };

        console.log(`通常ノード変換: ${node.title}, アイテム数: ${customData.items ? customData.items.length : 0}`);

        // コンテンツタイプに基づいて処理
        if (customData.items) {
            customData.items.forEach(item => {
                console.log(`アイテムタイプ: ${item.type}, フィールド: ${item.field}`);
                
                if (item.type === 'CodeButtonFeild') {
                    // 選択肢ボタンの場合
                    convertedNode.isInputField = false;
                    convertedNode.dynamicChoices = {
                        source: `codeDefinitions.${item.codeid}`
                    };
                    // 次のノードは後で設定（スイッチノードや次のノードを解析してから）
                } else if (item.type === 'FormInputTextField') {
                    // 入力フィールドの場合
                    convertedNode.isInputField = true;
                    convertedNode.inputValidation = {
                        type: "text",
                        required: true
                    };
                    if (item.field.includes('Amount')) {
                        convertedNode.inputValidation.type = "number";
                        convertedNode.inputValidation.min = 1;
                        convertedNode.inputValidation.max = 10000000;
                        convertedNode.inputValidation.errorMessage = "1円以上1000万円以下で入力してください";
                    }
                    // 入力後の分岐は後で設定
                } else if (item.type === 'DomainDataWithLabelDisplayFeild') {
                    // 確認表示の場合
                    convertedNode.displayData = convertedNode.displayData || [];
                    convertedNode.displayData.push({
                        label: item.label,
                        field: item.field,
                        format: item.field.includes('Amount') ? "currency" : "text"
                    });
                    convertedNode.choices = ["確認", "修正"];
                }
            });
        } else if (customData.navText && !customData.items) {
            // アイテムがない場合（メッセージのみ）
            if (node.title === "手続き不可") {
                convertedNode.isEndNode = true;
                convertedNode.endType = "error";
            }
        }

        // 特別な画面タイプの処理
        if (node.title === "手続き完了" || content.component === "DoneIconTemplate") {
            convertedNode.isEndNode = true;
            convertedNode.endType = "success";
        } else if (node.title === "手続き不可") {
            convertedNode.isEndNode = true;
            convertedNode.endType = "error";
        }

        return convertedNode;
    }

    convertSwitchNode(node, screenId) {
        // スイッチノードの条件を解析
        if (node.conditions && node.branches) {
            node.conditions.forEach((condition, index) => {
                if (condition.operator && condition.operator.child) {
                    const rules = condition.operator.child.map(child => ({
                        field: child.field,
                        operator: this.mapOperator(child.state),
                        value: child.value
                    }));

                    // 条件に一致する分岐を処理
                    if (node.branches[index] && node.branches[index].workflow) {
                        const branchScreenId = this.nodeIdCounter++;
                        this.nodeMap.set(node.branches[index].id, branchScreenId);

                        const conditionNode = {
                            screen: screenId,
                            navText: "条件判定中...",
                            choices: [],
                            preNodes: [],
                            isInputField: false,
                            conditions: {
                                operator: condition.operator.type,
                                rules: rules
                            },
                            nextNodes: [
                                { condition: "match", nextScreen: branchScreenId },
                                { condition: "default", nextScreen: screenId + 1 }
                            ]
                        };

                        this.convertedNodes.push(conditionNode);
                        this.convertWorkflow(node.branches[index].workflow);
                    }
                }
            });
        }
    }

    generateChoiceTransitions(fieldName) {
        const nextNodes = [];
        if (this.codeDefinitions[fieldName]) {
            this.codeDefinitions[fieldName].forEach(item => {
                nextNodes.push({
                    choice: item.label,
                    nextScreen: this.nodeIdCounter,
                    setValue: { [fieldName]: item.value }
                });
            });
            this.nodeIdCounter++;
        }
        return nextNodes;
    }

    mapOperator(state) {
        const mapping = {
            'EQUALS': 'EQUALS',
            'NOT_EQUALS': 'NOT_EQUALS',
            'GREATER': 'GREATER',
            'EQUALS_LESS_THAN': 'LESS_EQUALS',
            'LESS': 'LESS',
            'CONTAINS': 'CONTAINS'
        };
        return mapping[state] || 'EQUALS';
    }
}

// 使用例
function convertConfiguration() {
    // configuration.jsonを読み込んで変換
    fetch('./configuration.json')
        .then(response => response.json())
        .then(configData => {
            const converter = new ConfigurationConverter();
            const chatData = converter.convert(configData);
            
            // 変換結果をダウンロード
            const blob = new Blob([JSON.stringify(chatData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chat_configuration.json';
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('Converted chat configuration:', chatData);
            return chatData;
        })
        .catch(error => {
            console.error('Error converting configuration:', error);
        });
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigurationConverter;
}