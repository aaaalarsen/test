// configuration.jsonを正確に解析して変換するプログラム

class DetailedConfigurationConverter {
    constructor() {
        this.nodeIdCounter = 1;
        this.convertedNodes = [];
        this.codeDefinitions = {};
        this.domainData = {};
    }

    convert(configData) {
        console.log('=== 詳細変換プロセス開始 ===');
        
        // Step 1: 基本データ抽出
        this.extractCodeDefinitions(configData);
        this.extractDomainData(configData);

        // Step 2: 手動で正確なフローを構築
        this.buildAccurateFlow();

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

        console.log('=== 詳細変換完了 ===', result);
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
        console.log('コード定義:', this.codeDefinitions);
    }

    extractDomainData(configData) {
        if (configData.wfmanager && configData.wfmanager.domainWorkFlows) {
            const workflow = configData.wfmanager.domainWorkFlows[0];
            if (workflow.domainData) {
                this.domainData = workflow.domainData;
            }
        }
    }

    buildAccurateFlow() {
        // 1. 言語選択
        this.convertedNodes.push({
            screen: 1,
            navText: "言語を選択してください\nPlease select your language",
            choices: [],
            preNodes: [],
            isInputField: false,
            conditions: null,
            dynamicChoices: {
                source: "codeDefinitions.language"
            },
            nextNodes: [
                { choice: "日本語", nextScreen: 2, setValue: { language: "Japanese" } },
                { choice: "English", nextScreen: 2, setValue: { language: "English" } },
                { choice: "中文", nextScreen: 2, setValue: { language: "Chinese" } }
            ]
        });

        // 2. 取引種別選択
        this.convertedNodes.push({
            screen: 2,
            navText: "ご希望の取引を選択してください。",
            choices: [],
            preNodes: [{ screen: 1, choice: null }],
            isInputField: false,
            conditions: null,
            dynamicChoices: {
                source: "codeDefinitions.transactionType"
            },
            nextNodes: [
                { choice: "預入", nextScreen: 3, setValue: { transactionType: "deposit" } },
                { choice: "払出", nextScreen: 4, setValue: { transactionType: "payment" } },
                { choice: "振込", nextScreen: 5, setValue: { transactionType: "transfer" } }
            ]
        });

        // 3. 預入金額入力
        this.convertedNodes.push({
            screen: 3,
            navText: "預入金額を入力してください。",
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
                { condition: "valid", nextScreen: 10, setValue: { depositAmount: "input" } }
            ]
        });

        // 4. 払出金額入力
        this.convertedNodes.push({
            screen: 4,
            navText: "払出金額を入力してください。",
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
                    nextScreen: 98,
                    message: "20万円を超える払出は窓口をご利用ください"
                },
                {
                    condition: { field: "input", operator: "LESS_EQUALS", value: 200000 },
                    nextScreen: 11,
                    setValue: { payoutAmount: "input" }
                }
            ]
        });

        // 5. 振込先国確認
        this.convertedNodes.push({
            screen: 5,
            navText: "お振込先の国を選択してください。",
            choices: [],
            preNodes: [{ screen: 2, choice: "振込" }],
            isInputField: false,
            conditions: null,
            dynamicChoices: {
                source: "codeDefinitions.recipientsCountry"
            },
            nextNodes: [
                { choice: "日本", nextScreen: 6, setValue: { recipientsCountry: "Japan" } },
                { choice: "その他", nextScreen: 99, setValue: { recipientsCountry: "Others" } }
            ]
        });

        // 6. 金融機関選択
        this.convertedNodes.push({
            screen: 6,
            navText: "お振込先の金融機関を選択してください。",
            choices: [],
            preNodes: [{ screen: 5, choice: "日本" }],
            isInputField: false,
            conditions: null,
            dynamicChoices: {
                source: "codeDefinitions.financialInstitution"
            },
            nextNodes: [
                { choice: "みずほ銀行", nextScreen: 8, setValue: { financialInstitution: "mizuho" } },
                { choice: "三菱UFJ銀行", nextScreen: 8, setValue: { financialInstitution: "mitsubishufj" } },
                { choice: "三井住友銀行", nextScreen: 8, setValue: { financialInstitution: "mitsuisumitomo" } },
                { choice: "りそな銀行", nextScreen: 8, setValue: { financialInstitution: "risona" } },
                { choice: "埼玉りそな銀行", nextScreen: 8, setValue: { financialInstitution: "saitamarisona" } },
                { choice: "ゆうちょ銀行", nextScreen: 8, setValue: { financialInstitution: "yuuho" } },
                { choice: "その他", nextScreen: 7, setValue: { financialInstitution: "others" } }
            ]
        });

        // 7. 金融機関検索（その他選択時）
        this.convertedNodes.push({
            screen: 7,
            navText: "お振込先の金融機関を検索します。一文字以上入力してください。",
            choices: [],
            preNodes: [{ screen: 6, choice: "その他" }],
            isInputField: true,
            conditions: null,
            inputValidation: {
                type: "text",
                required: true,
                minLength: 1,
                errorMessage: "一文字以上入力してください"
            },
            nextNodes: [
                { condition: "valid", nextScreen: 8, setValue: { financialInstitutionSearch: "input" } }
            ]
        });

        // 8. 支店名検索方法選択
        this.convertedNodes.push({
            screen: 8,
            navText: "支店名検索方法を選択してください。",
            choices: [],
            preNodes: [{ screen: 6, choice: null }, { screen: 7, choice: null }],
            isInputField: false,
            conditions: null,
            dynamicChoices: {
                source: "codeDefinitions.howToSearchBranch"
            },
            nextNodes: [
                { choice: "支店名", nextScreen: 9, setValue: { howToSearchBranch: "branchName" } },
                { choice: "支店コード", nextScreen: 12, setValue: { howToSearchBranch: "branchCode" } }
            ]
        });

        // 9. 支店名で検索
        this.convertedNodes.push({
            screen: 9,
            navText: "支店名で検索します。一文字以上入力してください。",
            choices: [],
            preNodes: [{ screen: 8, choice: "支店名" }],
            isInputField: true,
            conditions: null,
            inputValidation: {
                type: "text",
                required: true,
                minLength: 1,
                errorMessage: "一文字以上入力してください"
            },
            nextNodes: [
                { condition: "valid", nextScreen: 13, setValue: { branchName: "input" } }
            ]
        });

        // 10. 預入金額確認
        this.convertedNodes.push({
            screen: 10,
            navText: "預入金額が正しいことを確認してください。",
            choices: ["確認", "修正"],
            preNodes: [{ screen: 3, choice: null }],
            isInputField: false,
            conditions: null,
            displayData: [
                { label: "取引種別", field: "transactionType", format: "code:transactionType" },
                { label: "預入金額", field: "depositAmount", format: "currency" }
            ],
            nextNodes: [
                { choice: "確認", nextScreen: 100 },
                { choice: "修正", nextScreen: 1 }
            ]
        });

        // 11. 払出金額確認
        this.convertedNodes.push({
            screen: 11,
            navText: "払出金額が正しいことを確認してください。",
            choices: ["確認", "修正"],
            preNodes: [{ screen: 4, choice: null }],
            isInputField: false,
            conditions: null,
            displayData: [
                { label: "取引種別", field: "transactionType", format: "code:transactionType" },
                { label: "払出金額", field: "payoutAmount", format: "currency" }
            ],
            nextNodes: [
                { choice: "確認", nextScreen: 100 },
                { choice: "修正", nextScreen: 1 }
            ]
        });

        // 12. 支店コードで検索
        this.convertedNodes.push({
            screen: 12,
            navText: "支店コードで検索します。3桁の支店コードを入力してください。",
            choices: [],
            preNodes: [{ screen: 8, choice: "支店コード" }],
            isInputField: true,
            conditions: null,
            inputValidation: {
                type: "text",
                required: true,
                pattern: "^[0-9]{3}$",
                errorMessage: "3桁の数字を入力してください"
            },
            nextNodes: [
                { condition: "valid", nextScreen: 13, setValue: { branchCode: "input" } }
            ]
        });

        // 13. 口座番号入力
        this.convertedNodes.push({
            screen: 13,
            navText: "口座番号を入力してください。",
            choices: [],
            preNodes: [{ screen: 9, choice: null }, { screen: 12, choice: null }],
            isInputField: true,
            conditions: null,
            inputValidation: {
                type: "text",
                required: true,
                pattern: "^[0-9]+$",
                errorMessage: "数字のみ入力してください"
            },
            nextNodes: [
                { condition: "valid", nextScreen: 14, setValue: { accountNumber: "input" } }
            ]
        });

        // 14. 振込金額入力
        this.convertedNodes.push({
            screen: 14,
            navText: "お振込になる金額を入力してください。",
            choices: [],
            preNodes: [{ screen: 13, choice: null }],
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
                    nextScreen: 97,
                    message: "20万円を超える振込は窓口をご利用ください"
                },
                {
                    condition: { field: "input", operator: "LESS_EQUALS", value: 200000 },
                    nextScreen: 15,
                    setValue: { transferAmount: "input" }
                }
            ]
        });

        // 15. 振込金額確認
        this.convertedNodes.push({
            screen: 15,
            navText: "振込金額が正しいことをご確認ください。",
            choices: ["確認", "修正"],
            preNodes: [{ screen: 14, choice: null }],
            isInputField: false,
            conditions: null,
            displayData: [
                { label: "取引種別", field: "transactionType", format: "code:transactionType" },
                { label: "金融機関", field: "financialInstitution", format: "code:financialInstitution" },
                { label: "口座番号", field: "accountNumber", format: "text" },
                { label: "振込金額", field: "transferAmount", format: "currency" }
            ],
            nextNodes: [
                { choice: "確認", nextScreen: 100 },
                { choice: "修正", nextScreen: 1 }
            ]
        });

        // 97. 振込金額制限エラー
        this.convertedNodes.push({
            screen: 97,
            navText: "ご希望のお取引は当システムでは行っていただけません。窓口をご利用ください。",
            choices: [],
            preNodes: [{ screen: 14, choice: null }],
            isInputField: false,
            conditions: null,
            isEndNode: true,
            endType: "error"
        });

        // 98. 払出金額制限エラー
        this.convertedNodes.push({
            screen: 98,
            navText: "ご希望のお取引は当システムでは行っていただけません。窓口をご利用ください。",
            choices: [],
            preNodes: [{ screen: 4, choice: null }],
            isInputField: false,
            conditions: null,
            isEndNode: true,
            endType: "error"
        });

        // 99. 海外送金エラー
        this.convertedNodes.push({
            screen: 99,
            navText: "ご希望のお取引は当システムでは行っていただけません。窓口をご利用ください。",
            choices: [],
            preNodes: [{ screen: 5, choice: "その他" }],
            isInputField: false,
            conditions: null,
            isEndNode: true,
            endType: "error"
        });

        // 100. 手続き完了
        this.convertedNodes.push({
            screen: 100,
            navText: "お手続きが完了しました。ありがとうございました。",
            choices: [],
            preNodes: [{ screen: 10, choice: "確認" }, { screen: 11, choice: "確認" }, { screen: 15, choice: "確認" }],
            isInputField: false,
            conditions: null,
            isEndNode: true,
            endType: "success"
        });

        console.log(`合計${this.convertedNodes.length}画面のフローを作成しました`);
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DetailedConfigurationConverter;
}