import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Clock, 
  BarChart, 
  Users, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  Lightbulb,
  BookOpen,
  Tag
} from "lucide-react";
import { getRakugoDetail } from "../services/gemini";
import { RakugoEnmoku } from "../types";

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RakugoEnmoku | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await getRakugoDetail(id);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("詳細情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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
        <p className="text-ink/60 font-serif">演目の巻物を開いています...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">エラーが発生しました</h2>
        <p className="text-ink/60 mb-8">{error || "データが見つかりませんでした。"}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-ink text-white py-3 px-8 rounded-xl font-medium"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(data.title + " 落語")}`;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-ink/60 hover:text-accent font-medium mb-12 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        戻る
      </button>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-16"
      >
        {/* Header Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-4 text-[10px] font-black text-accent uppercase tracking-widest font-sans">
               <span className="bg-accent-soft px-3 py-1 rounded-full">{data.genre}</span>
               <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
               <span className="text-accent-light">{data.difficulty}向き</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-serif font-bold leading-tight tracking-tight">
              {data.title}
            </h1>
            {data.alias && (
              <p className="text-2xl font-serif text-accent/40 italic font-bold">別名: {data.alias}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-12 py-10 border-y border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent">
                <BarChart size={24} />
              </div>
              <div>
                <p className="text-[10px] font-sans font-bold text-accent-light uppercase tracking-widest">難易度</p>
                <p className="font-serif text-xl font-bold">{data.difficulty}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-sans font-bold text-accent-light uppercase tracking-widest">上演時間</p>
                <p className="font-serif text-xl font-bold">{data.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center text-accent">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[10px] font-sans font-bold text-accent-light uppercase tracking-widest">主な登場人物</p>
                <p className="font-serif text-xl font-bold">{data.characters.slice(0, 2).join("・")}{data.characters.length > 2 ? " 等" : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Synopsis Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
              <BookOpen size={18} />
            </div>
            あらすじ
          </h2>
          <div className="bg-white p-10 sm:p-14 rounded-[40px] shadow-sm border border-border leading-relaxed text-lg font-sans font-medium text-ink/80">
            {data.synopsis}
          </div>
        </section>

        {/* Points Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-serif font-bold flex items-center gap-4">
            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent">
              <Lightbulb size={18} />
            </div>
            演じるときのポイント
          </h2>
          <div className="bg-accent text-white p-10 sm:p-14 rounded-[40px] shadow-xl shadow-accent/10 leading-relaxed text-lg font-serif italic font-bold">
            <p className="border-l-4 border-white/30 pl-6">
              {data.points}
            </p>
          </div>
        </section>

        {/* Meta Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-12 pt-16 border-t border-border">
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            {data.tags.map(tag => (
              <span key={tag} className="bg-[#efefe9] text-accent px-5 py-2 rounded-full text-xs font-sans font-bold tracking-wider">
                #{tag}
              </span>
            ))}
          </div>

          <a
            href={youtubeUrl}
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#2c2c2a] text-white py-5 px-10 rounded-full font-sans text-lg font-bold hover:opacity-90 transition-all shadow-2xl active:scale-95 whitespace-nowrap"
          >
            <ExternalLink size={20} />
             YouTubeで高座を愉しむ
          </a>
        </div>
      </motion.article>
    </div>
  );
}
