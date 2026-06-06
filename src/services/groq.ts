import { RecommendationResponse, RakugoEnmoku } from "../types";
import rakugoData from "../data/rakugo.json";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(prompt: string, systemInstruction: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("VITE_GROQ_API_KEY is missing");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No response from Groq");
  }

  return text;
}

function parseJsonSafely(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("JSON parse failed");
    }
    return JSON.parse(match[0]);
  }
}

export async function getRakugoRecommendations(
  query?: string
): Promise<RecommendationResponse> {
  const datasetSnippet = [...rakugoData]
    .sort(() => Math.random() - 0.5)
    .slice(0, 30)
    .map((r) => ({
      id: r.id,
      title: r.title,
      genre: r.genre,
    }));

  const prompt = `
あなたは落語のコンシェルジュです。
以下の静的データセットの中から、ユーザーの要望に最適な演目を【3つ】厳選し、さらに【それ以外に関連する演目】を2〜4つ程度選んでください。

ユーザーの要望: "${query || "初心者におすすめ"}"

データセット:
${JSON.stringify(datasetSnippet)}

必ず次のJSON形式だけで返してください。
Markdownや説明文は不要です。

{
  "comment": "なぜこれらの演目を選んだかの短いコメント",
  "recommendations": [
    {
      "id": "データセット内のid",
      "recommendationReason": "推薦理由",
      "characters": ["登場人物1", "登場人物2"],
      "points": "演じる・楽しむ上でのポイント",
      "tags": ["タグ1", "タグ2"]
    }
  ],
  "relatedStories": [
    {
      "id": "データセット内のid",
      "context": "なぜ関連するか"
    }
  ]
}
`;

  const text = await callGroq(
    prompt,
    "あなたは落語の専門家です。提供されたリストの中から最適な演目を選択し、必ずJSON形式だけで返してください。"
  );

  const aiResult = parseJsonSafely(text);

  const mapItem = (rec: any) => {
    const staticItem = rakugoData.find((r) => r.id === rec.id);

    return {
      ...staticItem,
      ...rec,
      synopsis: staticItem?.description,
    } as RakugoEnmoku;
  };

  return {
    comment: aiResult.comment,
    recommendations: aiResult.recommendations.map(mapItem),
    relatedStories: aiResult.relatedStories.map(mapItem),
  };
}

export async function getRakugoDetail(id: string): Promise<RakugoEnmoku> {
  const staticItem = rakugoData.find((r) => r.id === id);

  if (!staticItem) {
    throw new Error("Item not found in static dataset");
  }

  const prompt = `
落語の演目「${staticItem.title}」について、物語を盛り上げるための詳細情報をJSONで提供してください。

元データ:
${JSON.stringify(staticItem)}

必ず次のJSON形式だけで返してください。
Markdownや説明文は不要です。

{
  "characters": ["登場人物1", "登場人物2"],
  "synopsis": "200〜400文字の詳しいあらすじ",
  "points": "深い鑑賞ポイントや演じるときのポイント",
  "tags": ["タグ1", "タグ2", "タグ3"]
}
`;

  const text = await callGroq(
    prompt,
    "あなたは落語の専門家です。指定された演目について詳細な情報を必ずJSON形式だけで提供してください。"
  );

  const aiDetail = parseJsonSafely(text);

  return {
    ...staticItem,
    ...aiDetail,
    difficulty: staticItem.difficulty as any,
  };
}