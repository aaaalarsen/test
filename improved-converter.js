// 改善されたconfiguration.json変換プログラム

class ImprovedConfigurationConverter {
    constructor() {
        this.nodeIdCounter = 1;
        this.allNodes = []; // 元のノード情報を全て保持
        this.convertedNodes = [];
        this.codeDefinitions = {};
        this.domainData = {};
        this.nodeRelations = new Map(); // ノード間の関係を管理
    }

    convert(configData) {
        console.log('=== 改善された変換プロセス開始 ===');
        
        // Step 1: 基本データ抽出
        this.extractCodeDefinitions(configData);
        this.extractDomainData(configData);

        // Step 2: 全ノード情報を収集
        if (configData.wfmanager && configData.wfmanager.domainWorkFlows) {
            const workflow = configData.wfmanager.domainWorkFlows[0];
            if (workflow.rootWorkflow && workflow.rootWorkflow.workflow) {
                this.collectAllNodes(workflow.rootWorkflow.workflow);
            }
        }

        // Step 3: ノード間の関係を解析
        this.analyzeNodeRelations();

        // Step 4: チャットボット用ノードに変換
        this.convertToChartBotNodes();

        // Step 5: 結果を返す
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

        console.log('=== 変換完了 ===', result);
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
        console.log('コード定義抽出完了:', this.codeDefinitions);
    }

    extractDomainData(configData) {
        if (configData.wfmanager && configData.wfmanager.domainWorkFlows) {
            const workflow = configData.wfmanager.domainWorkFlows[0];
            if (workflow.domainData) {
                this.domainData = workflow.domainData;
            }
        }
        console.log('ドメインデータ抽出完了');
    }

    collectAllNodes(workflow, parent = null) {
        workflow.forEach(node => {
            // ノード情報を保存
            const nodeInfo = {
                ...node,
                parent: parent,
                screenId: this.nodeIdCounter++
            };
            this.allNodes.push(nodeInfo);
            
            console.log(`ノード収集: ${node.id} (${node.type}) - ${node.title}`);

            // 子ノードも収集
            if (node.type === 'G' && node.group) {
                this.collectAllNodes(node.group.workflow, node);
            } else if (node.type === 'S' && node.branches) {
                node.branches.forEach(branch => {
                    if (branch.workflow) {
                        this.collectAllNodes(branch.workflow, node);
                    }
                });
            }
        });
    }

    analyzeNodeRelations() {
        console.log('=== ノード関係解析 ===');
        
        // スイッチノードの条件分岐を解析
        this.allNodes.filter(node => node.type === 'S').forEach(switchNode => {
            console.log(`スイッチノード解析: ${switchNode.id}`);
            
            if (switchNode.conditions && switchNode.branches) {
                switchNode.conditions.forEach((condition, index) => {
                    const branch = switchNode.branches[index];
                    if (branch && condition.operator) {
                        this.nodeRelations.set(switchNode.id + '_condition_' + index, {
                            sourceNode: switchNode,
                            condition: condition,
                            targetBranch: branch
                        });
                    }
                });
            }
        });

        // 通常のノード順序を解析
        this.allNodes.filter(node => node.type === 'R').forEach((node, index) => {
            const nextNode = this.allNodes.find(n => n.type === 'R' && this.allNodes.indexOf(n) > index);
            if (nextNode) {
                this.nodeRelations.set(node.id + '_next', {
                    sourceNode: node,
                    targetNode: nextNode
                });
            }
        });
    }

    convertToChartBotNodes() {
        console.log('=== チャットボットノード変換 ===');
        
        // グループノードの最初のノードから開始
        const firstGroupNode = this.allNodes.find(node => node.type === 'G');
        if (firstGroupNode && firstGroupNode.group) {
            this.convertWorkflowSequence(firstGroupNode.group.workflow);
        }
    }

    convertWorkflowSequence(workflow) {
        for (let i = 0; i < workflow.length; i++) {
            const node = workflow[i];
            const nodeInfo = this.allNodes.find(n => n.id === node.id);
            
            if (node.type === 'R') {
                const convertedNode = this.convertRegularNode(nodeInfo, workflow, i);
                if (convertedNode) {
                    this.convertedNodes.push(convertedNode);
                }
            } else if (node.type === 'S') {
                this.convertSwitchNode(nodeInfo, workflow, i);
            }
        }
    }

    convertRegularNode(nodeInfo, workflow, index) {
        const node = nodeInfo;
        const content = node.content;
        const customData = content.customizedData;

        let convertedNode = {
            screen: nodeInfo.screenId,
            navText: customData.navText || node.title || '',
            choices: [],
            preNodes: [],
            isInputField: false,
            conditions: null
        };

        console.log(`通常ノード変換: ${node.title} (画面${nodeInfo.screenId})`);

        // アイテムの処理
        if (customData.items && customData.items.length > 0) {
            customData.items.forEach(item => {
                if (item.type === 'CodeButtonFeild') {
                    // 動的選択肢
                    convertedNode.dynamicChoices = {
                        source: `codeDefinitions.${item.codeid}`
                    };
                    
                    // 選択肢に基づく次画面の設定
                    const nextNodes = [];
                    if (this.codeDefinitions[item.codeid]) {
                        this.codeDefinitions[item.codeid].forEach(choice => {
                            const nextScreen = this.findNextScreenForChoice(node, choice, workflow, index);
                            nextNodes.push({
                                choice: choice.label,
                                nextScreen: nextScreen,
                                setValue: { [item.field]: choice.value }
                            });
                        });
                    }
                    convertedNode.nextNodes = nextNodes;

                } else if (item.type === 'FormInputTextField') {
                    // 入力フィールド
                    convertedNode.isInputField = true;
                    convertedNode.inputValidation = {
                        type: item.field.includes('Amount') ? "number" : "text",
                        required: true
                    };
                    
                    if (item.field.includes('Amount')) {
                        convertedNode.inputValidation.min = 1;
                        convertedNode.inputValidation.max = 10000000;
                        convertedNode.inputValidation.errorMessage = "1円以上1000万円以下で入力してください";
                    }

                    // 入力後の分岐を設定
                    const nextScreen = this.findNextScreenForInput(node, item, workflow, index);
                    convertedNode.nextNodes = [{
                        condition: "valid",
                        nextScreen: nextScreen,
                        setValue: { [item.field]: "input" }
                    }];

                    // 金額制限チェック（transferAmountやpayoutAmountの場合）
                    if (item.field === 'transferAmount' || item.field === 'payoutAmount') {
                        const errorScreen = this.findErrorScreen();
                        convertedNode.nextNodes = [
                            {
                                condition: { field: "input", operator: "GREATER", value: 200000 },
                                nextScreen: errorScreen,
                                message: "20万円を超える取引は窓口をご利用ください"
                            },
                            {
                                condition: { field: "input", operator: "LESS_EQUALS", value: 200000 },
                                nextScreen: nextScreen,
                                setValue: { [item.field]: "input" }
                            }
                        ];
                    }

                } else if (item.type === 'DomainDataWithLabelDisplayFeild') {
                    // 確認表示
                    convertedNode.displayData = convertedNode.displayData || [];
                    convertedNode.displayData.push({
                        label: item.label,
                        field: item.field,
                        format: item.field.includes('Amount') ? "currency" : "code:" + this.getCodeIdForField(item.field)
                    });
                    convertedNode.choices = ["確認", "修正"];
                    
                    const completeScreen = this.findCompleteScreen();
                    convertedNode.nextNodes = [
                        { choice: "確認", nextScreen: completeScreen },
                        { choice: "修正", nextScreen: 1 }
                    ];
                }
            });
        }

        // 特別な画面タイプ
        if (node.title === "手続き完了" || content.component === "DoneIconTemplate") {
            convertedNode.isEndNode = true;
            convertedNode.endType = "success";
        } else if (node.title === "手続き不可") {
            convertedNode.isEndNode = true;
            convertedNode.endType = "error";
        }

        return convertedNode;
    }

    convertSwitchNode(nodeInfo, workflow, index) {
        // スイッチノードは基本的に条件分岐として次のノードに反映
        console.log(`スイッチノード処理: ${nodeInfo.id}`);
        
        if (nodeInfo.branches) {
            nodeInfo.branches.forEach(branch => {
                if (branch.workflow) {
                    this.convertWorkflowSequence(branch.workflow);
                }
            });
        }
    }

    findNextScreenForChoice(currentNode, choice, workflow, index) {
        // スイッチノードまたは次のRegularノードを探す
        const nextNode = workflow[index + 1];
        if (nextNode) {
            const nextNodeInfo = this.allNodes.find(n => n.id === nextNode.id);
            if (nextNodeInfo) {
                return nextNodeInfo.screenId;
            }
        }
        
        // 取引種別による分岐
        if (choice.value === 'deposit') {
            return this.findNodeByTitle('預入金額入力')?.screenId || this.nodeIdCounter++;
        } else if (choice.value === 'payment') {
            return this.findNodeByTitle('払出金額入力')?.screenId || this.nodeIdCounter++;
        } else if (choice.value === 'transfer') {
            return this.findNodeByTitle('振込先国確認')?.screenId || this.nodeIdCounter++;
        }
        
        return this.nodeIdCounter++;
    }

    findNextScreenForInput(currentNode, item, workflow, index) {
        // 入力後の次の画面を探す
        if (item.field.includes('Amount')) {
            // 金額入力の場合は確認画面
            return this.findNodeByTitle(item.field.replace('Amount', '') + '確認')?.screenId || 
                   this.findNodeByTitle('確認')?.screenId || 
                   this.nodeIdCounter++;
        }
        
        const nextNode = workflow[index + 1];
        if (nextNode) {
            const nextNodeInfo = this.allNodes.find(n => n.id === nextNode.id);
            if (nextNodeInfo) {
                return nextNodeInfo.screenId;
            }
        }
        
        return this.nodeIdCounter++;
    }

    findNodeByTitle(title) {
        return this.allNodes.find(node => 
            node.title && node.title.includes(title)
        );
    }

    findErrorScreen() {
        const errorNode = this.allNodes.find(node => 
            node.title === "手続き不可"
        );
        return errorNode ? errorNode.screenId : this.nodeIdCounter++;
    }

    findCompleteScreen() {
        const completeNode = this.allNodes.find(node => 
            node.title === "手続き完了"
        );
        return completeNode ? completeNode.screenId : this.nodeIdCounter++;
    }

    getCodeIdForField(field) {
        const mapping = {
            'transactionType': 'transactionType',
            'financialInstitution': 'financialInstitution',
            'recipientsCountry': 'recipientsCountry',
            'language': 'language'
        };
        return mapping[field] || 'text';
    }
}

// 使用関数を更新
function convertConfigurationImproved() {
    fetch('./configuration.json')
        .then(response => response.json())
        .then(configData => {
            const converter = new ImprovedConfigurationConverter();
            const chatData = converter.convert(configData);
            
            // 変換結果をダウンロード
            const blob = new Blob([JSON.stringify(chatData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'improved_chat_configuration.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('改善された変換結果:', chatData);
            return chatData;
        })
        .catch(error => {
            console.error('Error converting configuration:', error);
        });
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImprovedConfigurationConverter;
}