import React from "react";
import { Link } from "react-router-dom";
import { Search, Home as HomeIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-paper font-serif relative border-8 border-accent">
      {/* Decorative side accents */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 h-48 w-1 bg-accent opacity-20 hidden lg:block" />
      <div className="fixed top-1/2 right-0 -translate-y-1/2 h-48 w-1 bg-accent opacity-20 hidden lg:block" />

      <div className="flex flex-col min-h-[calc(100vh-16px)]">
        <header className="border-b border-border bg-[#fdfdfb] sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white italic text-xl">落</div>
              <h1 className="text-2xl font-bold tracking-tighter text-ink">落語AI 推薦録</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-ink hover:opacity-70 transition-colors flex items-center gap-1 text-sm font-sans font-bold">
                <HomeIcon size={16} />
                <span className="hidden sm:inline">ホーム</span>
              </Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
          {children}
        </main>
        
        <footer className="border-t border-border py-12 px-6 bg-gradient-to-t from-paper to-transparent relative">
          <div className="max-w-5xl mx-auto text-center">
            <p className="font-serif text-sm text-accent/60 uppercase tracking-widest font-bold">
              日本伝統の笑いを、現代の叡智と共に。
            </p>
            <div className="mt-4 flex justify-center gap-4 text-xs font-sans font-bold text-ink/40">
              <span>© 2026 Rakugo AI Concierge</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
