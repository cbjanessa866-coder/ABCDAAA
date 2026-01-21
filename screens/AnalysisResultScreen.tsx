
import React from 'react';
import { PhotoAnalysis } from '../types';
import { motion } from 'framer-motion';

interface AnalysisResultScreenProps {
  photo: string | null;
  analysis: PhotoAnalysis | null;
  onBack: () => void;
  onRetake: () => void;
}

const AnalysisResultScreen: React.FC<AnalysisResultScreenProps> = ({ photo, analysis, onBack, onRetake }) => {
  if (!analysis || !photo) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo;
    link.download = `VisionAI_MasterReview_${Date.now()}.jpg`;
    link.click();
  };

  const CritiqueItem = ({ icon, title, content, delay }: { icon: string, title: string, content: string, delay: number }) => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="relative pl-12 pb-8 last:pb-0"
    >
      <div className="absolute left-0 top-0 size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined !text-[18px] filled">{icon}</span>
      </div>
      <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-gray-100 last:hidden" />
      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{title}</h4>
      <p className="text-deep-blue text-sm leading-relaxed font-medium">{content}</p>
    </motion.div>
  );

  return (
    <div className="relative flex h-full w-full flex-col bg-background-light overflow-hidden">
      {/* 顶部导航 */}
      <div className="flex items-center px-6 py-4 justify-between z-10 sticky top-0 bg-background-light/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-deep-blue">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-deep-blue text-sm font-black uppercase tracking-[0.2em]">视觉点评报告</h2>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Master Critique</span>
        </div>
        <button onClick={handleDownload} className="flex size-10 items-center justify-center rounded-full bg-deep-blue text-white shadow-lg active:scale-90 transition-transform">
          <span className="material-symbols-outlined !text-[20px]">download</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-44 no-scrollbar px-6">
        {/* 照片预览 */}
        <div className="pt-6 pb-8">
          <div className="relative w-full aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white bg-gray-200">
            <img src={photo} alt="Analyzed photo" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-6 right-6">
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-primary filled !text-16">verified</span>
                <span className="text-[10px] font-black text-deep-blue uppercase tracking-widest">{analysis.composition}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 综合评价总结 */}
        <div className="bg-white rounded-[32px] p-6 shadow-soft border border-gray-100 mb-8 flex items-center gap-6">
          <div className="relative size-20 shrink-0">
            <svg className="size-full text-primary -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * analysis.score / 100)} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-black text-deep-blue leading-none">{analysis.score}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Expert Impression</p>
            <p className="text-deep-blue font-bold leading-snug">{analysis.explanation}</p>
          </div>
        </div>

        {/* 大师深度评语 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">大师深度评语</h3>
            <div className="h-[1px] flex-1 bg-gray-100 mx-4" />
          </div>
          
          <div className="bg-white rounded-[40px] p-8 shadow-soft border border-gray-100">
            <CritiqueItem 
              icon="palette" 
              title="艺术表现 / Artistic" 
              content={analysis.critique.artistic} 
              delay={0.1}
            />
            <CritiqueItem 
              icon="grid_view" 
              title="构图逻辑 / Technical" 
              content={analysis.critique.technical} 
              delay={0.2}
            />
            <CritiqueItem 
              icon="favorite" 
              title="意境共鸣 / Emotional" 
              content={analysis.critique.emotional} 
              delay={0.3}
            />
          </div>
        </section>

        {/* 进阶改进方案 */}
        <section className="mb-10">
          <div className="bg-deep-blue rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute -top-4 -right-4 opacity-10">
                <span className="material-symbols-outlined !text-[100px] filled">auto_fix_high</span>
             </div>
             <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary filled !text-[24px]">lightbulb</span>
                <h4 className="font-black text-sm uppercase tracking-widest text-primary">AI 艺术进阶建议</h4>
             </div>
             <p className="text-base font-medium leading-relaxed italic text-white/90">{analysis.proTip}</p>
          </div>
        </section>

        {/* AI Disclaimer Footer */}
        <section className="pb-8">
          <p className="text-[10px] text-gray-300 text-center leading-relaxed">
            免责声明：AI 分析结果基于机器学习模型生成，仅供艺术参考，不作为专业摄影教学的唯一标准。
          </p>
        </section>
      </div>

      {/* 底部操作 */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-background-light via-background-light to-transparent pt-12 pb-10 px-8 flex gap-4 z-50">
        <button onClick={onRetake} className="flex-1 h-16 rounded-[24px] bg-white border border-gray-200 text-deep-blue font-black flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm">
          <span className="material-symbols-outlined">replay</span>
          重拍
        </button>
        <button onClick={onBack} className="flex-[1.5] h-16 rounded-[24px] bg-deep-blue text-white font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-2xl">
          <span className="material-symbols-outlined filled">done_all</span>
          保存并返回
        </button>
      </div>
    </div>
  );
};

export default AnalysisResultScreen;
