import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Clock, BarChart, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import { getRakugoRecommendations } from "../services/groq";
import { RecommendationResponse, RakugoEnmoku } from "../types";
import { cn } from "../lib/utils";

export default function Recommend() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || searchParams.get("genre") || "";
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getRakugoRecommendations(query);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("推薦の取得に失敗しました。もう一度お試しください。");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6 text-accent"
        >
          <RefreshCw size={48} />
        </motion.div>
        <h2 className="text-2xl font-serif font-bold mb-2">コンシェルジュが考慮中...</h2>
        <p className="text-ink/60">あなたにぴったりの「一席」を選んでいます。</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">エラーが発生しました</h2>
        <p className="text-ink/60 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-ink text-white py-3 px-8 rounded-xl font-medium hover:bg-ink/90 transition-all"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-block mb-2 px-3 py-1 bg-accent-soft rounded-full text-[10px] uppercase tracking-widest font-sans font-bold text-accent">
          AI Recommended for you
        </div>
        <h1 className="text-4xl italic font-serif font-bold mb-4 leading-tight">
          {query ? `「${query}」に基づいた提案録` : "本日のあなたへの三席"}
        </h1>
        <p className="text-lg leading-relaxed text-ink/70">
          {data?.comment}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <AnimatePresence mode="popLayout">
          {data?.recommendations.map((item, index) => (
            <RecommendationCard key={item.id} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {data?.relatedStories && data.relatedStories.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-4"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Sparkles className="text-accent" size={20} />
            <h2 className="text-xl font-serif font-bold">こちらの演目もおすすめ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.relatedStories.map((story) => (
              <Link
                key={story.id}
                to={`/detail/${story.id}`}
                className="group p-4 bg-white/50 border border-border rounded-2xl flex items-center justify-between hover:bg-white hover:shadow-md transition-all"
              >
                <div>
                  <h4 className="font-serif font-bold text-lg group-hover:text-accent transition-colors">{story.title}</h4>
                  <p className="text-xs text-ink/50">{story.genre} • {story.difficulty}</p>
                </div>
                <ChevronRight size={18} className="text-accent-light group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      <div className="pt-12 text-center pb-20">
        <button
          onClick={() => navigate("/")}
          className="px-10 py-4 bg-ink text-white rounded-full text-sm font-sans font-bold shadow-xl hover:opacity-90 transition-all"
        >
          条件を変えて再検索
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({ item, index }: { item: RakugoEnmoku; index: number }) {
  const isBestMatch = index === 1; // Middle one as visual emphasis

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "bg-white p-6 rounded-[32px] flex flex-col h-full relative transition-all duration-300",
        isBestMatch 
          ? "shadow-2xl border-2 border-accent scale-105 z-10" 
          : "shadow-sm border border-border"
      )}
    >
      {isBestMatch && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest">
          Best Match
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <span className="bg-paper text-accent px-3 py-1 rounded-full text-xs font-sans font-bold">
          難易度：{item.difficulty}
        </span>
        <span className="text-accent-light text-xs font-sans font-bold">
          約{item.duration}
        </span>
      </div>

      <h3 className="text-2xl font-serif font-bold mb-2">{item.title}</h3>
      <p className="text-[10px] text-accent-light font-bold mb-6 overflow-hidden text-ellipsis whitespace-nowrap">
        {item.tags.map(t => `#${t}`).join(' ')}
      </p>

      <div className="flex-grow mb-8 px-2 overflow-hidden">
        <p className="text-sm font-serif italic text-ink/60 mb-2 font-bold">推薦理由：</p>
        <p className="text-sm leading-relaxed border-l-2 border-accent pl-4 font-sans text-ink font-medium line-clamp-4">
          {item.recommendationReason}
        </p>
      </div>

      <Link
        to={`/detail/${item.id}`}
        className={cn(
          "w-full py-4 rounded-full text-sm font-sans font-bold text-center transition-all",
          isBestMatch
            ? "bg-accent text-white shadow-lg"
            : "border border-accent text-accent hover:bg-accent hover:text-white"
        )}
      >
        詳細を見る
      </Link>
    </motion.div>
  );
}
