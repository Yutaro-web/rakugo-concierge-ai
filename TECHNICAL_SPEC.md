# 技術設計・企画書：落語コンシェルジュ AI (V2)

本ドキュメントでは、静的データセットとAI推薦を組み合わせたハイブリッド構成、および各ファイルの役割について詳細に解説します。

---

## 1. データとモデルの配置 (Architecture)

本バージョンでは、データの信頼性とAIの柔軟性を両立させるため、以下の2層構造を採用しています。

### **A. 静的データセット (The Source of Truth)**
- **場所:** `/src/data/rakugo.json`
- **内容:** 厳選された10以上の古典落語演目リスト。ハルシネーションを防ぐための唯一のソースです。

### **B. AIレコメンドモデル (The Intelligence)**
- **場所:** `/src/services/gemini.ts`
- **機能:**
    1.  ユーザーの入力を解析。
    2.  `rakugo.json` から最適な【3つのメイン演目】と【2〜4つの関連演目】を選択。
    3.  各演目に対してパーソナライズされた推薦文や鑑賞ポイントを動的に生成。

---

## 2. 全ファイル構成の詳細説明

### **主要な変更点**
- **`src/services/gemini.ts`**: スキーマを拡張し、`relatedStories` フィールドを追加。静的データセットからのフィルタリングロジックを強化。
- **`src/routes/Recommend.tsx`**: 3つのメインカードに加え、関連演目をサブリストとして表示するハイブリッドUIを採用。
- **`src/data/rakugo.json`**: 10件の主要演目を定義。

### **Design & Utils (基盤層)**
- **`/src/index.css`**: Tailwind CSS v4によるスタイリング。和紙（Paper）と和墨（Ink）の配色定義。
- **`/src/lib/utils.ts`**: クラス名結合などの共通ユーティリティ。

---

## 3. 実装上の注記 (Python/Node.jsについて)

AI Studioのライブプレビュー環境では、リアルタイムの編集・実行を最適化するため、**Node.js (TypeScript/Express)** をランタイムとして使用しています。

もしこれをPythonバックエンドで構築する場合の対応表は以下の通りです：

| 機能 | AI Studio (現在の実装) | Pythonによる実装例 |
| :--- | :--- | :--- |
| APIサーバー | Express (Node.js) | Flask または FastAPI |
| AI連携 | `@google/genai` (JS SDK) | `google-generativeai` (Python SDK) |
| フロントエンド | React (Vite) | Jinja2 + HTML/CSS |
| データ管理 | `rakugo.json` (JSON) | `rakugo.json` または SQLite |

**Pythonへの移植コード例 (`app.py`):**
```python
import json
import google.generativeai as genai
from flask import Flask, request, jsonify

app = Flask(__name__)
# 静的データの読み込み
with open('data/rakugo.json', 'r') as f:
    rakugo_dataset = json.load(f)

@app.route('/api/recommend')
def recommend():
    query = request.args.get('query')
    # Geminiにrakugo_datasetを渡して、推薦理由を生成させるロジックをここに記述
    return jsonify({"recommendations": [...]})
```

---

## 4. 主要機能のフロー
1.  **入力:** ユーザーが「泣ける話が聴きたい」と入力。
2.  **処理:** バックエンドが `rakugo.json` を読み込み、キーワードと共にGeminiへ送信。
3.  **生成:** Geminiが「鰍沢」と「芝浜」を選び、心情に合わせた推薦文を作成。
4.  **表示:** フロントエンドが和風のカードUIで結果を表示。
