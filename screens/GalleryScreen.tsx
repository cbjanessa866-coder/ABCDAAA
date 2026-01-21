
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryScreenProps {
  onBack: () => void;
  onStartCamera: () => void;
  onViewAnalysis?: (photo: string) => void;
  initialTab?: 'mine' | 'master';
  initialMasterpieceId?: string | null;
  capturedPhotos?: string[];
}

interface MasterpieceContent {
  title: string;
  data: string;
  desc: string;
}

interface Artist {
  id: string;
  name: string;
  portrait: string;
  works: MasterpieceContent[];
  bio: string;
  history: string;
  quote: string;
}

const ASSETS_DATABASE: Record<string, Artist> = {
  'ansel-adams': {
    id: 'ansel-adams',
    name: '安塞尔·亚当斯',
    portrait: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ansel_Adams_and_camera.jpg/400px-Ansel_Adams_and_camera.jpg',
    quote: '“我们带到摄影中的是我们阅读过的书、看过的电影。”',
    works: [
      { 
        title: '提顿山脉与蛇河', 
        data: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Adams_The_Tetons_and_the_Snake_River.jpg/800px-Adams_The_Tetons_and_the_Snake_River.jpg', 
        desc: '宏大的S形引导线。弯曲的河道引导视线穿越平原直抵雪山，展现了自然的雄伟。' 
      }
    ],
    bio: '美国最伟大的风光摄影师，发明了著名的“区域曝光法”。',
    history: '他不仅是摄影师，更是一位用黑白影像保护荒野的战士。'
  }
};

const LocalAssetImage: React.FC<{ src: string, alt: string, className?: string, containerClass?: string }> = ({ src, alt, className = "", containerClass = "" }) => {
  return (
    <div className={`relative overflow-hidden bg-zinc-100 flex items-center justify-center ${containerClass}`}>
      <img 
        src={src} 
        alt={alt} 
        className={`${className} object-cover w-full h-full`}
        loading="lazy"
      />
    </div>
  );
};

const GalleryScreen: React.FC<GalleryScreenProps> = ({ onBack, onStartCamera, onViewAnalysis, initialTab = 'mine', initialMasterpieceId = null, capturedPhotos = [] }) => {
  const [activeTab, setActiveTab] = useState<'mine' | 'master'>(initialTab);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
    if (initialMasterpieceId && ASSETS_DATABASE[initialMasterpieceId]) {
      setSelectedArtist(ASSETS_DATABASE[initialMasterpieceId]);
    }
  }, [initialTab, initialMasterpieceId]);

  const artistsList = Object.values(ASSETS_DATABASE);

  return (
    <div className="flex h-full w-full flex-col bg-background-light overflow-hidden">
      <header className="px-6 pt-12 pb-4 bg-white/95 backdrop-blur-md z-20 border-b border-gray-100">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-deep-blue mr-3 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-black text-deep-blue tracking-tight">{activeTab === 'mine' ? '作品足迹' : '大师典藏库'}</h1>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl relative">
          <motion.div 
            className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm z-0"
            initial={false}
            animate={{ x: activeTab === 'mine' ? '0%' : '100%', width: '50%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button onClick={() => { setActiveTab('mine'); setSelectedArtist(null); }} className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${activeTab === 'mine' ? 'text-deep-blue' : 'text-gray-400'}`}>我的照片</button>
          <button onClick={() => setActiveTab('master')} className={`flex-1 py-2 text-sm font-bold relative z-10 transition-colors ${activeTab === 'master' ? 'text-deep-blue' : 'text-gray-400'}`}>本地典藏</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'mine' ? (
            <motion.div key="mine-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3 pb-20">
              {capturedPhotos.length > 0 ? (
                capturedPhotos.map((src, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onViewAnalysis && onViewAnalysis(src)} 
                    className="aspect-[4/5] rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform bg-white cursor-pointer border border-gray-100"
                  >
                    <LocalAssetImage src={src} alt="Captured photo" containerClass="w-full h-full" className="w-full h-full object-cover" />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center">
                  <span className="material-symbols-outlined text-gray-200 !text-6xl mb-4">photo_library</span>
                  <p className="text-gray-400 font-bold">快去拍摄您的第一张作品吧</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="master-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
              {artistsList.length > 0 ? artistsList.map((artist) => (
                <div key={artist.id} onClick={() => setSelectedArtist(artist)} className="group bg-white rounded-[32px] overflow-hidden shadow-soft border border-gray-100 active:scale-[0.98] transition-all cursor-pointer">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <LocalAssetImage src={artist.works[0].data} alt={artist.name} containerClass="w-full h-full bg-gray-200" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-8 text-white z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1 block">Local Collection</span>
                      <h3 className="text-2xl font-black leading-tight">{artist.name}</h3>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-gray-200 !text-6xl mb-4">folder_open</span>
                  <p className="text-gray-400 font-bold">暂无典藏大师</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedArtist && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
            <div className="p-6 flex justify-between items-center text-deep-blue sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
              <button onClick={() => setSelectedArtist(null)} className="size-10 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"><span className="material-symbols-outlined">close</span></button>
              <h2 className="text-lg font-black tracking-tight">{selectedArtist.name}</h2>
              <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar space-y-16 mt-4">
              {selectedArtist.works.map((work, idx) => (
                <div key={idx} className="space-y-6">
                  <div className="relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-xl border border-gray-100 bg-gray-50">
                    <LocalAssetImage src={work.data} alt={work.title} containerClass="w-full h-full" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-[2px] w-8 bg-primary rounded-full" />
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">作品解析 {idx + 1}</span>
                    </div>
                    <h3 className="text-2xl font-black text-deep-blue mb-4 leading-tight">{work.title}</h3>
                    <p className="text-gray-600 text-base leading-relaxed font-medium">{work.desc}</p>
                  </div>
                </div>
              ))}

              <div className="space-y-10 pb-12">
                <div className="w-full aspect-square rounded-[48px] overflow-hidden shadow-xl bg-gray-50 relative">
                   <LocalAssetImage src={selectedArtist.portrait} alt="Portrait" containerClass="w-full h-full bg-gray-200" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                   <div className="absolute bottom-10 left-10 z-10">
                      <p className="text-white text-3xl font-black">{selectedArtist.name}</p>
                      <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mt-2">Visionary Mentor</p>
                   </div>
                </div>

                <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-200">
                  <p className="text-deep-blue text-xl leading-relaxed mb-8 font-black italic border-l-4 border-primary pl-6">{selectedArtist.quote}</p>
                  <p className="text-gray-600 text-base leading-relaxed mb-6">{selectedArtist.bio}</p>
                  <div className="h-[1px] bg-gray-200 w-full mb-6"></div>
                  <p className="text-gray-400 text-xs leading-relaxed italic">{selectedArtist.history}</p>
                </div>

                <button onClick={() => { setSelectedArtist(null); onStartCamera(); }} className="w-full bg-deep-blue text-white font-black py-8 rounded-[40px] shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-4 text-xl">
                  <span className="material-symbols-outlined !text-[36px]">center_focus_strong</span>
                  开启AI指导
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryScreen;
