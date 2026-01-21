
import * as React from 'react';
import { useState, useRef, useMemo } from 'react';
import { Screen, User, PhotoAnalysis } from '../types';
import { analyzePhoto } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeScreenProps {
  onNavigate: (screen: Screen, options?: { tab?: 'mine' | 'master', masterpieceId?: string }) => void;
  onAnalyzeImage: (photo: string, analysis: PhotoAnalysis) => void;
  user: User;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onAnalyzeImage, user }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 首页大师作品封面 - 安塞尔·亚当斯
  const masterCoverImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Adams_The_Tetons_and_the_Snake_River.jpg/800px-Adams_The_Tetons_and_the_Snake_River.jpg";

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      try {
        const analysis = await analyzePhoto(base64Data);
        onAnalyzeImage(base64String, analysis);
      } catch (error) {
        alert("分析失败，请稍后重试。");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const nextLevelInfo = useMemo(() => {
    const count = user.totalPhotos;
    if (count < 10) return { next: 10, label: '爱好者' };
    if (count < 30) return { next: 30, label: '捕手' };
    if (count < 80) return { next: 80, label: '资深' };
    if (count < 200) return { next: 200, label: '大师' };
    return { next: 999, label: '极境' };
  }, [user.totalPhotos]);

  const progressPercent = Math.min(100, (user.totalPhotos / nextLevelInfo.next) * 100);

  return (
    <div className="relative flex h-full w-full flex-col bg-background-light overflow-x-hidden">
      {/* Uploading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center p-10">
            <div className="w-20 h-20 bg-deep-blue rounded-3xl flex items-center justify-center shadow-xl animate-bounce">
              <span className="material-symbols-outlined text-primary text-4xl filled">upload_file</span>
            </div>
            <h2 className="text-xl font-bold text-deep-blue mt-6">AI 正在审视您的作品</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beginner Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowGuide(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="bg-primary p-6 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-20">
                  <span className="material-symbols-outlined !text-[120px] filled">school</span>
                </div>
                <h2 className="text-2xl font-black text-deep-blue mb-1 relative z-10">新手教程</h2>
                <p className="text-deep-blue/60 font-bold text-xs uppercase tracking-widest relative z-10">Quick Start Guide</p>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 font-black text-deep-blue">1</div>
                  <div>
                    <h3 className="font-bold text-deep-blue text-sm mb-1">选择构图模式</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">在拍摄界面切换不同的构图辅助线，或开启 AI 指导自动推荐。</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 font-black text-deep-blue">2</div>
                  <div>
                    <h3 className="font-bold text-deep-blue text-sm mb-1">对准主体</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">将镜头对准拍摄对象，获取 AI 指导建议并调整画面细节。</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 font-black text-deep-blue">3</div>
                  <div>
                    <h3 className="font-bold text-deep-blue text-sm mb-1">获取评分</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">按下快门后，AI 摄影大师将从艺术、构图、意境三个维度进行点评。</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowGuide(false)}
                  className="w-full py-4 bg-deep-blue text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
                >
                  开始创作
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 pt-14 pb-2 sticky top-0 z-10 bg-background-light/80 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">VisionAI Portfolio</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-deep-blue">你好，{user.name.split(' ')[0]}</h1>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setShowGuide(true)} className="relative h-12 w-12 rounded-full bg-white shadow-soft flex items-center justify-center active:scale-95 transition-transform">
               <span className="material-symbols-outlined text-primary filled !text-[24px]">lightbulb</span>
             </button>
             <button onClick={() => onNavigate('profile')} className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-soft">
               <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Profile" />
             </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-deep-blue uppercase tracking-tight">{user.level}</span>
              <div className="px-1.5 py-0.5 bg-primary/20 rounded-md">
                <span className="text-[8px] font-black text-deep-blue">SHUTTER: {user.totalPhotos}</span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-gray-400">距 {nextLevelInfo.label} 还需 {nextLevelInfo.next - user.totalPhotos} 次</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              className="h-full bg-primary"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-40 overflow-y-auto no-scrollbar pt-2">
        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <h2 className="text-lg font-black text-deep-blue tracking-tight">大师之门</h2>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Master Archive</span>
          </div>
          <div onClick={() => onNavigate('gallery', { tab: 'master', masterpieceId: 'ansel-adams' })} className="relative w-full aspect-[21/9] rounded-[32px] overflow-hidden bg-gray-100 shadow-soft active:scale-[0.98] transition-all group cursor-pointer border border-gray-100">
            <img 
              src={masterCoverImage}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 object-top" 
              alt="Masterpiece" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
            <div className="absolute bottom-6 left-8 flex items-center gap-4 z-20">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-deep-blue !text-xl filled">auto_awesome</span>
              </div>
              <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">亚当斯：荒野的区域系统</h3>
            </div>
          </div>
        </section>

        {/* 拍摄工具 */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-deep-blue px-1">拍摄工具</h2>
          <div className="grid grid-cols-2 gap-4">
            <div onClick={handleUploadClick} className="group p-5 rounded-3xl bg-white shadow-soft border border-white active:scale-95 transition-all cursor-pointer">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-deep-blue text-xl filled">upload_file</span></div>
              <h3 className="text-sm font-bold text-deep-blue mb-1">AI 诊断</h3>
              <p className="text-[9px] text-gray-400 font-medium tracking-wide">上传获取大师反馈</p>
            </div>
            <div onClick={() => onNavigate('camera')} className="group p-5 rounded-3xl bg-deep-blue shadow-lg border border-white/5 active:scale-95 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-white text-xl">center_focus_strong</span></div>
              <h3 className="text-sm font-bold text-white mb-1">AI 指导</h3>
              <p className="text-[9px] text-white/40 font-medium tracking-wide">开启构图辅助拍摄</p>
            </div>
          </div>
        </section>

        {/* 构图学院 */}
        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <h2 className="text-lg font-black text-deep-blue tracking-tight">构图学院</h2>
            <button onClick={() => onNavigate('tutorial')} className="text-[10px] font-black text-primary uppercase tracking-widest">全部课程</button>
          </div>
          <div onClick={() => onNavigate('tutorial')} className="group p-6 rounded-[32px] bg-white border border-primary/20 shadow-soft overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-deep-blue shadow-lg group-hover:rotate-6 transition-transform">
                <span className="material-symbols-outlined !text-3xl filled">menu_book</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-deep-blue mb-1">构图实战系列</h3>
                <p className="text-xs text-gray-400 font-medium">从三大法则到视觉心理学</p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Disclaimer Footer */}
        <section className="px-4 py-6">
          <p className="text-[10px] text-gray-300 text-center leading-relaxed">
            免责声明：AI 分析结果基于机器学习模型生成，仅供艺术参考，<br/>不作为专业摄影教学的唯一标准。
          </p>
        </section>
      </main>

      <div className="fixed bottom-8 left-0 right-0 z-50 px-8 flex justify-center">
        <div className="w-full max-sm:max-w-xs h-16 bg-deep-blue/90 backdrop-blur-2xl rounded-[28px] shadow-xl border border-white/10 flex items-center justify-between px-6 relative">
          <button onClick={() => onNavigate('gallery', { tab: 'mine' })} className="flex flex-col items-center justify-center gap-1 group">
            <span className="material-symbols-outlined text-white/40 group-hover:text-primary !text-[24px]">photo_library</span>
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 -top-8">
            <button onClick={() => onNavigate('camera')} className="w-16 h-16 rounded-full bg-primary border-[4px] border-deep-blue shadow-xl flex items-center justify-center active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-deep-blue text-3xl filled">photo_camera</span>
            </button>
          </div>
          <div className="w-12"></div>
          <button onClick={() => onNavigate('profile')} className="flex flex-col items-center justify-center gap-1 group">
            <span className="material-symbols-outlined text-white/40 group-hover:text-primary !text-[24px]">person</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
