import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, BookOpen } from "lucide-react";
import { motion } from "motion/react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    } else {
      navigate('/recommend');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl w-full"
      >
        <div className="inline-block mb-4 px-4 py-1.5 bg-accent-soft rounded-full text-[10px] uppercase tracking-widest font-sans font-bold text-accent">
          Tradition meets AI
        </div>
        <h1 className="text-5xl sm:text-7xl font-serif font-bold mb-8 leading-[1.1] tracking-tight">
          「笑い」と「江戸の情緒」を<br />
          <span className="text-accent italic">愉しむ</span>、ひととき。
        </h1>
        <p className="text-lg text-ink/70 mb-12 font-medium leading-relaxed max-w-2xl mx-auto">
          AIが400年の歴史を持つ古典落語の中から、<br className="hidden sm:block" />
          あなたの気分や好みにぴったりの三席を厳選します。
        </p>

        <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
          {/* Keyword Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="気になるキーワードを入力... (F5)"
              className="w-full bg-[#efefe9] border-none rounded-full py-5 px-8 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-sans"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-accent text-white px-8 py-2 rounded-full text-sm font-sans font-bold hover:opacity-90 shadow-lg shadow-accent/20 transition-all"
            >
              検索
            </button>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button
              onClick={() => navigate('/recommend')}
              className="flex items-center justify-center gap-2 bg-accent text-white py-4 px-10 rounded-full font-serif text-lg font-bold hover:opacity-90 transition-all shadow-xl shadow-accent/20 active:scale-95"
            >
              <Sparkles size={20} />
              AIにおすすめしてもらう
            </button>
            <button
              onClick={() => navigate('/recommend?genre=人気')}
              className="flex items-center justify-center gap-2 bg-white text-accent border-2 border-accent py-4 px-10 rounded-full font-serif text-lg font-bold hover:bg-accent hover:text-white transition-all active:scale-95"
            >
              <BookOpen size={20} />
              人気の演目
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
