// 埋め込み用configuration.jsonデータ（CORS問題回避）

function getEmbeddedConfigData() {
    return {
        "layouts": {
            "topmenu": {
                "component": "DefaultTopMenu",
                "customizedData": {
                    "headerTitle": "メニュー",
                    "navText": "以下から手続きを選択してください。"
                },
                "header": 1
            },
            "headers": [
                {
                    "component": "Header",
                    "customizedData": {
                        "displayBackBtn": false,
                        "displayNextBtn": false,
                        "displayQuitBtn": true
                    }
                },
                {
                    "component": "Header",
                    "customizedData": {
                        "displayBackBtn": false,
                        "displayNextBtn": false,
                        "displayQuitBtn": false
                    }
                }
            ],
            "nodecontents": [
                {
                    "stepbar": {
                        "component": "Stepbar",
                        "customizedData": {
                            "showChildNodeTitle": false
                        }
                    }
                }
            ]
        },
        "codedef": {
            "codes": [
                {
                    "codeid": "transactionType",
                    "label": "取引種別",
                    "items": [
                        { "label": "預入", "value": "deposit" },
                        { "label": "払出", "value": "payment" },
                        { "label": "振込", "value": "transfer" }
                    ]
                },
                {
                    "codeid": "requiredDocument",
                    "label": "必要書類",
                    "items": [
                        { "label": "運転免許証", "value": "driverLisence" },
                        { "label": "パスポート", "value": "passport" },
                        { "label": "個人番号カード", "value": "myNumberCard" },
                        { "label": "健康保険証", "value": "healthInsuranceCard" },
                        { "label": "通帳", "value": "passbook" }
                    ]
                },
                {
                    "codeid": "financialInstitution",
                    "label": "金融機関名",
                    "items": [
                        { "label": "みずほ銀行", "value": "mizuho" },
                        { "label": "三菱UFJ銀行", "value": "mitsubishufj" },
                        { "label": "三井住友銀行", "value": "mitsuisumitomo" },
                        { "label": "りそな銀行", "value": "risona" },
                        { "label": "埼玉りそな銀行", "value": "saitamarisona" },
                        { "label": "ゆうちょ銀行", "value": "yuuho" },
                        { "label": "その他", "value": "others" }
                    ]
                },
                {
                    "codeid": "language",
                    "label": "言語",
                    "items": [
                        { "label": "日本語", "value": "Japanese" },
                        { "label": "English", "value": "English" },
                        { "label": "中文", "value": "Chinese" }
                    ]
                },
                {
                    "codeid": "recipientsCountry",
                    "label": "振込先国名",
                    "items": [
                        { "label": "日本", "value": "Japan" },
                        { "label": "その他", "value": "Others" }
                    ]
                },
                {
                    "codeid": "howToSearchBranch",
                    "label": "支店名検索方法",
                    "items": [
                        { "label": "支店名", "value": "branchName" },
                        { "label": "支店コード", "value": "branchCode" }
                    ]
                }
            ],
            "errcodedef": {
                "codes": []
            },
            "commonData": {}
        },
        "wfmanager": {
            "domainWorkFlows": [
                {
                    "id": "f85d0200-d098-4de8-9f97-8f067a019fd4",
                    "headerTitle": "",
                    "menuTitle": "AIアシスタント",
                    "menuSubTitle": "",
                    "domainData": {
                        "transactionType": {
                            "index": 1,
                            "name": "取引種別",
                            "type": "string",
                            "value": ""
                        },
                        "requiredDocument": {
                            "index": 2,
                            "name": "必要書類",
                            "type": "string",
                            "value": ""
                        },
                        "payoutAmount": {
                            "index": 3,
                            "name": "払出金額",
                            "type": "string",
                            "value": ""
                        },
                        "transferAmount": {
                            "index": 4,
                            "name": "振込金額",
                            "type": "string",
                            "value": ""
                        },
                        "depositAmount": {
                            "index": 5,
                            "name": "預入金額",
                            "type": "string",
                            "value": ""
                        },
                        "financialInstitution": {
                            "index": 6,
                            "name": "金融機関名",
                            "type": "string",
                            "value": ""
                        },
                        "language": {
                            "index": 7,
                            "name": "言語",
                            "type": "string",
                            "value": ""
                        },
                        "accountNumber": {
                            "index": 8,
                            "name": "口座番号",
                            "type": "string",
                            "value": ""
                        },
                        "recipientsCountry": {
                            "index": 9,
                            "name": "振込先国名",
                            "type": "string",
                            "value": ""
                        },
                        "howToSearchBranch": {
                            "index": 10,
                            "name": "支店名検索方法",
                            "type": "string",
                            "value": ""
                        }
                    },
                    "rootWorkflow": {
                        "id": "18bd6b90-cebf-4d2b-bd67-d3b41d0feee5",
                        "workflow": [
                            {
                                "id": "e1aeclae-e96a-47f8-9b1c-da3135710d54",
                                "title": "未設定",
                                "type": "G",
                                "group": {
                                    "id": "6be3bd48-53db-4f7a-aab5-757821bcac97",
                                    "workflow": [
                                        {
                                            "id": "7fc55acb-6015-4e11-a384-7d97fc9418d4",
                                            "title": "言語選択",
                                            "headerTitle": "",
                                            "type": "R",
                                            "content": {
                                                "component": "GeneralTemplate",
                                                "customizedData": {
                                                    "items": [
                                                        {
                                                            "type": "CodeButtonFeild",
                                                            "id": "0b72605e-90a7-4346-bfb0-320eeb339332",
                                                            "field": "language",
                                                            "codeid": "language"
                                                        }
                                                    ],
                                                    "navText": "言語を選択してください。\nPlease select your language."
                                                },
                                                "header": 0,
                                                "footer": {
                                                    "component": "Footer",
                                                    "customizedData": {
                                                        "backBtn": { "display": true },
                                                        "nextBtn": { "display": true },
                                                        "additionalNextBtn1": { "display": false },
                                                        "additionalNextBtn2": { "display": false }
                                                    }
                                                },
                                                "nodecontent": 0,
                                                "isBanker": false
                                            }
                                        },
                                        {
                                            "id": "64508de9-1ed5-4c6b-9473-0720f1c4be1b",
                                            "title": "取引種別選択",
                                            "headerTitle": "",
                                            "type": "R",
                                            "content": {
                                                "component": "GeneralTemplate",
                                                "customizedData": {
                                                    "items": [
                                                        {
                                                            "type": "CodeButtonFeild",
                                                            "id": "bbd3dc6d-8f06-46b3-bf08-8f15def42519",
                                                            "field": "transactionType",
                                                            "codeid": "transactionType"
                                                        }
                                                    ],
                                                    "navText": "ご希望の取引を選択してください。"
                                                },
                                                "header": 0,
                                                "footer": {
                                                    "component": "Footer",
                                                    "customizedData": {
                                                        "backBtn": { "display": true },
                                                        "nextBtn": { "display": true },
                                                        "additionalNextBtn1": { "display": false },
                                                        "additionalNextBtn2": { "display": false }
                                                    }
                                                },
                                                "nodecontent": 0,
                                                "isBanker": false
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "wcmanager": {}
    };
}