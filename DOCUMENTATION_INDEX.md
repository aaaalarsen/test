# ドキュメントインデックス

## 📋 ドキュメント一覧

### 🚀 **開始ガイド**
- **[README.md](./README.md)** - システム概要、使用方法、技術仕様
- **[start-server.py](./start-server.py)** - ローカルサーバー起動スクリプト

### 🏗️ **システム設計**
- **[system_documentation.md](./system_documentation.md)** - **包括的システム設計書**
  - システム全体アーキテクチャ図
  - データスキーマ図（元形式→変換後形式）
  - シーケンス図（初期化、対話、条件分岐）
  - フロー図（15画面の完全業務フロー）
  - コンポーネント構成図
  - データフロー図
  - 技術スタック、パフォーマンス特性

### 📊 **改善案解説**
- **[minimal_improvement_rationale.md](./minimal_improvement_rationale.md)** - **改善案の詳細解説**
  - 元のtest.json形式の限界分析
  - 6つの改善案の必要性と根拠
  - 実装された機能の具体例
  - Before/After比較
  - 技術的成果の総括

### 📈 **分析資料**
- **[configuration_analysis.md](./configuration_analysis.md)** - 元configuration.jsonの詳細解析
- **[test_json_limitations.md](./test_json_limitations.md)** - 元test.json形式の限界分析

---

## 🎯 **読者別推奨ドキュメント**

### 👨‍💼 **プロジェクトマネージャー向け**
1. [README.md](./README.md) - プロジェクト概要
2. [system_documentation.md](./system_documentation.md) - システム全体像
3. [minimal_improvement_rationale.md](./minimal_improvement_rationale.md) - 改善効果

### 👨‍💻 **開発者向け**
1. [system_documentation.md](./system_documentation.md) - 技術アーキテクチャ
2. [minimal_improvement_rationale.md](./minimal_improvement_rationale.md) - 実装詳細
3. [README.md](./README.md) - 開発・デバッグ方法

### 🏢 **業務担当者向け**
1. [README.md](./README.md) - 使用方法
2. [system_documentation.md](./system_documentation.md) - 業務フロー図
3. [configuration_analysis.md](./configuration_analysis.md) - 元仕様理解

### 🔧 **システム設計者向け**
1. [system_documentation.md](./system_documentation.md) - 全図表
2. [minimal_improvement_rationale.md](./minimal_improvement_rationale.md) - 設計判断根拠
3. [test_json_limitations.md](./test_json_limitations.md) - 制約分析

---

## 📈 **図表インデックス**

### システム図表（system_documentation.md内）

#### **アーキテクチャ図**
- システム全体アーキテクチャ図
- コンポーネント構成図
- データフロー図

#### **データ設計図**
- 元configuration.json構造図
- 変換後チャットボット用JSON構造図
- データ変換関係図

#### **動作フロー図**
- システム初期化シーケンス図
- チャット対話シーケンス図
- 条件分岐処理シーケンス図
- 業務フロー全体図（15画面）

### 改善案図表（minimal_improvement_rationale.md内）

#### **Before/After比較**
- 元test.json vs 改善JSON
- 機能比較表
- 実装効果表

---

## 🔍 **検索ガイド**

### **キーワード別ドキュメント**

#### **技術実装**
- `nextNodes` → minimal_improvement_rationale.md
- `inputValidation` → minimal_improvement_rationale.md
- `dynamicChoices` → minimal_improvement_rationale.md
- `シーケンス図` → system_documentation.md

#### **業務フロー**
- `振込フロー` → README.md, system_documentation.md
- `金額制限` → minimal_improvement_rationale.md
- `条件分岐` → system_documentation.md

#### **システム設計**
- `アーキテクチャ` → system_documentation.md
- `データスキーマ` → system_documentation.md
- `パフォーマンス` → system_documentation.md

#### **使用方法**
- `CORS` → README.md
- `デバッグ` → README.md, system_documentation.md
- `カスタマイズ` → README.md

---

## 📝 **更新履歴**

### Version 2.0（実装完了版）
- **system_documentation.md** - 新規作成（包括的設計書）
- **minimal_improvement_rationale.md** - 実装内容に合わせて全面更新
- **README.md** - 実装機能・フローの詳細追記
- **DOCUMENTATION_INDEX.md** - 新規作成（本ファイル）

### Version 1.0（初期版）
- **configuration_analysis.md** - 元仕様の詳細解析
- **test_json_limitations.md** - 課題分析
- **minimal_improvement_rationale.md** - 改善提案（初期版）

---

## 🎯 **学習パス**

### **初学者向け（システム理解）**
1. README.md（概要把握）
2. configuration_analysis.md（元仕様理解）
3. test_json_limitations.md（課題理解）
4. minimal_improvement_rationale.md（解決策理解）

### **開発者向け（実装理解）**
1. system_documentation.md（アーキテクチャ理解）
2. minimal_improvement_rationale.md（実装詳細）
3. README.md（開発環境構築）
4. 実際のソースコード確認

### **運用者向け（操作理解）**
1. README.md（使用方法）
2. system_documentation.md（業務フロー図）
3. 実際のシステム操作
4. デバッグ機能活用

---

このドキュメントインデックスにより、目的に応じて適切な資料にアクセスできます。