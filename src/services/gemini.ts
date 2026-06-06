import { GoogleGenAI, Type } from "@google/genai";
import { RecommendationResponse, RakugoEnmoku } from "../types";
import rakugoData from "../data/rakugo.json";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const RAKUGO_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    comment: {
      type: Type.STRING,
      description: "A summary comment about why these Rakugo stories were chosen.",
    },
    recommendations: {
      type: Type.ARRAY,
      description: "Primary top 3 recommendations.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          recommendationReason: { type: Type.STRING },
          characters: { type: Type.ARRAY, items: { type: Type.STRING } },
          points: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["id", "recommendationReason", "characters", "points", "tags"],
      },
    },
    relatedStories: {
      type: Type.ARRAY,
      description: "Other related stories from the dataset that might interest the user.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          context: { type: Type.STRING, description: "Short context on why this is related." }
        },
        required: ["id", "context"]
      }
    }
  },
  required: ["comment", "recommendations", "relatedStories"],
};

export async function getRakugoRecommendations(query?: string): Promise<RecommendationResponse> {
  const datasetSnippet = rakugoData.map(r => ({
    id: r.id,
    title: r.title,
    genre: r.genre,
    description: r.description
  }));

  const prompt = `
あなたは落語のコンシェルジュです。以下の静的データセットの中から、ユーザーの要望に最適な演目を【3つ】厳選し、さらに【それ以外に関連する演目】をいくつか（2〜4つ程度）選んでください。

ユーザーの要望: "${query || "初心者におすすめ"}"

データセット:
${JSON.stringify(datasetSnippet, null, 2)}

出力にはJSON形式で、厳選した3つ（recommendations）と、関連する演目（relatedStories）を含めてください。
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "あなたは落語の専門家です。提供されたリストの中から最適な演目を選択し、それぞれにパーソナライズされた推薦文を作成してください。",
      responseMimeType: "application/json",
      responseSchema: RAKUGO_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  const aiResult = JSON.parse(text);
  
  const mapItem = (rec: any) => {
    const staticItem = rakugoData.find(r => r.id === rec.id);
    return {
      ...staticItem,
      ...rec,
      synopsis: staticItem?.description
    } as RakugoEnmoku;
  };

  return {
    comment: aiResult.comment,
    recommendations: aiResult.recommendations.map(mapItem),
    relatedStories: aiResult.relatedStories.map(mapItem)
  };
}

export async function getRakugoDetail(id: string): Promise<RakugoEnmoku> {
  const staticItem = rakugoData.find(r => r.id === id);
  if (!staticItem) throw new Error("Item not found in static dataset");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `落語の演目「${staticItem.title}」について、物語を盛り上げるための詳細情報（登場人物、深い鑑賞ポイント、拡張されたあらすじ）をJSONで提供してください。`,
    config: {
      systemInstruction: "あなたは落語の専門家です。指定された演目について詳細な情報をJSON形式で提供してください。",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characters: { type: Type.ARRAY, items: { type: Type.STRING } },
          synopsis: { type: Type.STRING, description: "200〜400文字の詳しいあらすじ" },
          points: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["characters", "synopsis", "points", "tags"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  const aiDetail = JSON.parse(text);
  
  return {
    ...staticItem,
    ...aiDetail,
    // Ensure types match
    difficulty: staticItem.difficulty as any
  };
}
