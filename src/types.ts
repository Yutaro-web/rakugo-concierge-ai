export interface RakugoEnmoku {
  id: string;
  title: string;
  alias?: string;
  difficulty: "初級" | "中級" | "上級";
  duration: string;
  genre: string;
  characters: string[];
  synopsis: string;
  points: string;
  tags: string[];
  recommendationReason?: string;
}

export interface RecommendationResponse {
  comment: string;
  recommendations: RakugoEnmoku[];
  relatedStories?: RakugoEnmoku[];
}
