# Configuration.json 詳細解析書

## 概要

このファイルは、業務システムの画面フロー設定を定義したJSONファイルです。銀行ATMや窓口システムのような金融取引システムにおいて、預入・払出・振込の各取引フローを動的に制御するための設定データです。

## 全体構造

```
configuration.json
├── layouts      # 画面レイアウト定義
├── codedef      # マスタデータ定義
└── wfmanager    # ワークフロー管理
```

---

## 1. Layouts（レイアウト定義）

### 1.1 topmenu（トップメニュー設定）
```json
"topmenu": {
  "component": "DefaultTopMenu",
  "customizedData": {
    "headerTitle": "メニュー",
    "navText": "以下から手続きを選択してください。"
  },
  "header": 1
}
```

**役割**: システムの最初の画面（メニュー画面）の表示設定
- `component`: 使用するUIコンポーネント名
- `headerTitle`: ヘッダーに表示するタイトル
- `navText`: ユーザー向けのナビゲーションメッセージ
- `header`: 使用するヘッダーのインデックス

### 1.2 headers（ヘッダー設定配列）
```json
"headers": [
  {
    "component": "Header",
    "customizedData": {
      "displayBackBtn": false,
      "displayNextBtn": false, 
      "displayQuitBtn": true
    }
  },
  // ... 追加のヘッダー設定
]
```

**役割**: 各画面で使用するヘッダーの設定パターンを定義
- インデックス0: 戻る・次へボタン非表示、終了ボタン表示
- インデックス1: 全ボタン非表示

### 1.3 nodecontents（ノードコンテンツ設定）
```json
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
```

**役割**: フロー内でのステップ表示バーの設定

---

## 2. Codedef（コード定義）

### 2.1 codes配列
システムで使用するマスタデータの定義集合です。

#### 取引種別（transactionType）
```json
{
  "codeid": "transactionType",
  "label": "取引種別",
  "items": [
    {"label": "預入", "value": "deposit"},
    {"label": "払出", "value": "payment"},
    {"label": "振込", "value": "transfer"}
  ]
}
```

#### 必要書類（requiredDocument）
```json
{
  "codeid": "requiredDocument", 
  "label": "必要書類",
  "items": [
    {"label": "運転免許証", "value": "driverLisence"},
    {"label": "パスポート", "value": "passport"},
    {"label": "個人番号カード", "value": "myNumberCard"},
    {"label": "健康保険証", "value": "healthInsuranceCard"},
    {"label": "通帳", "value": "passbook"}
  ]
}
```

#### 金融機関名（financialInstitution）
```json
{
  "codeid": "financialInstitution",
  "label": "金融機関名", 
  "items": [
    {"label": "みずほ銀行", "value": "mizuho"},
    {"label": "三菱UFJ銀行", "value": "mitsubishufj"},
    {"label": "三井住友銀行", "value": "mitsuisumitomo"},
    {"label": "りそな銀行", "value": "risona"},
    {"label": "埼玉りそな銀行", "value": "saitamarisona"},
    {"label": "ゆうちょ銀行", "value": "yuuho"},
    {"label": "その他", "value": "others"}
  ]
}
```

#### その他のコード定義
- **language**: 日本語、English、中文の言語選択
- **recipientsCountry**: 振込先国名（日本、その他）
- **howToSearchBranch**: 支店検索方法（支店名、支店コード）

---

## 3. Wfmanager（ワークフロー管理）

### 3.1 domainWorkFlows配列
業務フローの定義を管理します。

#### 基本情報
```json
{
  "id": "f85d0200-d098-4de8-9f97-8f067a019fd4",
  "headerTitle": "",
  "menuTitle": "AIアシスタント",
  "menuSubTitle": "",
  "domainData": { /* ドメインデータ定義 */ },
  "rootWorkflow": { /* ルートワークフロー定義 */ }
}
```

### 3.2 domainData（ドメインデータ）
フロー内で使用する変数の定義です。

```json
"domainData": {
  "transactionType": {
    "index": 1,
    "name": "取引種別",
    "type": "string",
    "value": ""
  },
  "payoutAmount": {
    "index": 3,
    "name": "払出金額", 
    "type": "string",
    "value": ""
  },
  // ... その他のフィールド定義
}
```

**各フィールドの構造**:
- `index`: 表示順序
- `name`: 日本語での項目名
- `type`: データ型
- `value`: 初期値（通常は空文字）

### 3.3 rootWorkflow（ルートワークフロー）
メインの業務フローを定義します。

#### ワークフローの基本構造
```json
"rootWorkflow": {
  "id": "18bd6b90-cebf-4d2b-bd67-d3b41d0feee5",
  "workflow": [ /* ノード配列 */ ]
}
```

---

## 4. フロー制御の仕組み

### 4.1 ノードタイプ

#### Gタイプ（グループノード）
```json
{
  "type": "G",
  "group": {
    "workflow": [ /* 子ノード配列 */ ]
  }
}
```
複数のノードをグループ化し、順次実行します。

#### Rタイプ（レギュラーノード）
```json
{
  "type": "R",
  "content": {
    "component": "GeneralTemplate",
    "customizedData": { /* 画面表示設定 */ }
  }
}
```
実際の画面表示を行うノードです。

#### Sタイプ（スイッチノード）
```json
{
  "type": "S",
  "branches": [ /* 分岐配列 */ ],
  "conditions": [ /* 条件配列 */ ]
}
```
条件に基づいてフローを分岐させるノードです。

### 4.2 条件分岐システム

#### 条件の基本構造
```json
{
  "operator": {
    "type": "AND",
    "child": [
      {
        "type": "STATE",
        "field": "transactionType",
        "value": "deposit",
        "state": "EQUALS"
      }
    ]
  },
  "branchNo": 0
}
```

#### 条件演算子
- **EQUALS**: 等しい
- **NOT_EQUALS**: 等しくない  
- **GREATER**: より大きい
- **EQUALS_LESS_THAN**: 以下

### 4.3 フロー分岐の実装例

#### 取引種別による分岐
1. **預入（deposit）**: 預入金額入力 → 金額確認
2. **払出（payment）**: 払出金額入力 → 金額確認 → 金額制限チェック
3. **振込（transfer）**: 振込先国確認 → 金融機関選択 → 支店検索 → 口座番号入力 → 振込金額入力 → 金額確認

#### 金額制限による分岐
```json
{
  "field": "payoutAmount",
  "value": "200000",
  "state": "GREATER"
}
```
払出金額が20万円を超える場合は「手続き不可」画面へ遷移します。

---

## 5. 画面コンポーネント

### 5.1 GeneralTemplate
汎用的な画面テンプレートです。

```json
"content": {
  "component": "GeneralTemplate",
  "customizedData": {
    "items": [ /* UI要素配列 */ ],
    "navText": "ユーザー向けメッセージ"
  }
}
```

### 5.2 UI要素タイプ

#### CodeButtonFeild
コード定義から選択肢ボタンを生成します。
```json
{
  "type": "CodeButtonFeild",
  "field": "transactionType",
  "codeid": "transactionType"
}
```

#### FormInputTextField
テキスト入力フィールドです。
```json
{
  "type": "FormInputTextField",
  "field": "depositAmount",
  "label": "預入金額",
  "isReveal": true
}
```

#### DomainDataWithLabelDisplayFeild
入力済みデータの確認表示です。
```json
{
  "type": "DomainDataWithLabelDisplayFeild",
  "field": "depositAmount",
  "label": "預入金額"
}
```

### 5.3 Footer設定
各画面のフッターボタン制御です。
```json
"footer": {
  "component": "Footer",
  "customizedData": {
    "backBtn": {"display": true},
    "nextBtn": {"display": true},
    "additionalNextBtn1": {"display": false},
    "additionalNextBtn2": {"display": false}
  }
}
```

---

## 6. システム設計思想

### 6.1 設定駆動型アーキテクチャ
- コードを変更せずに、JSONファイルの編集のみで業務フローを変更可能
- 画面レイアウト、マスタデータ、フロー制御が分離された設計

### 6.2 条件分岐による動的フロー制御
- ユーザーの入力値に応じて次の画面を動的に決定
- 複雑な業務ルール（金額制限、対応可能取引など）をJSON設定で表現

### 6.3 多言語対応
- 言語選択により、後続の画面表示を切り替え可能な構造
- 国際化対応を前提とした設計

### 6.4 再利用可能なコンポーネント設計
- 汎用テンプレートとカスタマイズデータの分離
- 同じコンポーネントを異なる設定で使い回し

---

## 7. フロー実行例

### 振込取引の場合
1. **言語選択** → 日本語選択
2. **取引種別選択** → 振込選択  
3. **振込先国確認** → 日本選択
4. **金融機関選択** → みずほ銀行選択
5. **支店名検索方法選択** → 支店名選択
6. **支店名検索** → 支店選択
7. **口座番号入力** → 口座番号入力
8. **振込金額入力** → 金額入力
9. **振込金額確認** → 確認
10. **手続き完了**

### エラーケース
- 払出金額が20万円超 → 「手続き不可」画面
- 振込先が海外 → 「手続き不可」画面
- 金融機関が「その他」選択 → 金融機関検索画面

---

## 8. 拡張ポイント

### 8.1 新しい取引タイプの追加
1. `codedef.codes[0].items`に新しい取引種別を追加
2. `domainData`に必要なフィールドを追加
3. `rootWorkflow`に新しい分岐条件とフローを追加

### 8.2 新しい金融機関の追加
`codedef.codes[2].items`に新しい金融機関を追加するだけで対応可能

### 8.3 業務ルールの変更
金額制限などの条件値を`conditions`配列内で変更可能

このシステムは、設定ファイルの変更のみで複雑な業務フローを制御できる、非常に柔軟で拡張性の高い設計となっています。