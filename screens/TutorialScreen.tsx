
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen } from '../types';

interface TutorialScreenProps {
  onBack: () => void;
  onStartCamera: () => void;
  onNavigate: (screen: Screen, options?: { tab?: 'mine' | 'master', masterpieceId?: string }) => void;
}

type Category = '全部' | '基础入门' | '几何秩序' | '艺术表达' | '进阶思维';

interface Lesson {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  psychology: string;
  description: string;
  tip: string;
  masterName?: string;
  masterId?: string;
  difficulty: '初级' | '进阶' | '挑战';
}

// 构图示意图组件
const CompositionDiagram: React.FC<{ type: string; className?: string }> = ({ type, className = "" }) => {
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0.2 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 3, 
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  const dashVariants = {
    hidden: { strokeDashoffset: 0 },
    visible: {
      strokeDashoffset: -20,
      transition: {
        duration: 1,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  const pointVariants = {
    hidden: { scale: 0.8, opacity: 0.5 },
    visible: { 
      scale: 1.2, 
      opacity: 1,
      transition: { 
        duration: 1.5, 
        ease: "easeInOut", 
        repeat: Infinity, 
        repeatType: "reverse" as const 
      }
    }
  };

  const lineProps = {
    stroke: "#f9d13e",
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round" as const,
    initial: "hidden",
    animate: "visible",
    variants: lineVariants
  };

  const guideLineProps = {
    ...lineProps,
    stroke: "#ffffff",
    strokeOpacity: 0.3,
    strokeWidth: "1",
    strokeDasharray: "4 4",
    variants: {} // Static for grid lines
  };

  return (
    <div className={`absolute inset-0 pointer-events-none z-10 p-8 ${className}`}>
      <svg className="w-full h-full drop-shadow-[0_0_8px_rgba(249,209,62,0.3)]" viewBox="0 0 100 100" preserveAspectRatio="none">
        {type === 'rule-of-thirds' && (
          <>
            {/* Grid Lines */}
            <line x1="33.3" y1="0" x2="33.3" y2="100" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
            <line x1="66.6" y1="0" x2="66.6" y2="100" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
            <line x1="0" y1="33.3" x2="100" y2="33.3" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
            <line x1="0" y1="66.6" x2="100" y2="66.6" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
            
            {/* Active Points */}
            <motion.circle cx="33.3" cy="33.3" r="3" fill="#f9d13e" variants={pointVariants} initial="hidden" animate="visible" />
            <motion.circle cx="66.6" cy="33.3" r="2" fill="#f9d13e" opacity="0.5" />
            <motion.circle cx="33.3" cy="66.6" r="2" fill="#f9d13e" opacity="0.5" />
            <motion.circle cx="66.6" cy="66.6" r="3" fill="#f9d13e" variants={pointVariants} initial="hidden" animate="visible" transition={{delay: 0.5}} />
          </>
        )}
        
        {type === 'leading-lines' && (
          <>
            <motion.path d="M 0 100 L 45 45" {...lineProps} />
            <motion.path d="M 100 100 L 55 45" {...lineProps} transition={{ ...lineVariants.visible.transition, delay: 0.2 }} />
            <motion.path d="M 20 100 L 48 50" {...lineProps} strokeOpacity="0.5" strokeWidth="1" />
            <motion.path d="M 80 100 L 52 50" {...lineProps} strokeOpacity="0.5" strokeWidth="1" />
            <motion.circle cx="50" cy="45" r="2" fill="#f9d13e" variants={pointVariants} initial="hidden" animate="visible" />
          </>
        )}

        {type === 'symmetry' && (
          <>
            <motion.line x1="50" y1="10" x2="50" y2="90" {...lineProps} strokeDasharray="4 4" />
            <motion.path d="M 10 30 Q 30 30 50 50" {...lineProps} strokeOpacity="0.5" />
            <motion.path d="M 90 30 Q 70 30 50 50" {...lineProps} strokeOpacity="0.5" />
            <motion.path d="M 10 70 Q 30 70 50 50" {...lineProps} strokeOpacity="0.5" />
            <motion.path d="M 90 70 Q 70 70 50 50" {...lineProps} strokeOpacity="0.5" />
            <motion.rect x="48" y="48" width="4" height="4" fill="#f9d13e" rotate={45} variants={pointVariants} initial="hidden" animate="visible" />
          </>
        )}

        {type === 'framing' && (
          <>
            {/* The Frame */}
            <motion.rect x="15" y="15" width="70" height="70" rx="2" {...lineProps} />
            {/* The Subject */}
            <motion.circle cx="50" cy="50" r="8" fill="none" stroke="#f9d13e" strokeWidth="2" variants={pointVariants} initial="hidden" animate="visible" />
            {/* Corner guides */}
            <path d="M 0 0 L 15 15" stroke="#ffffff" strokeOpacity="0.2" />
            <path d="M 100 0 L 85 15" stroke="#ffffff" strokeOpacity="0.2" />
            <path d="M 0 100 L 15 85" stroke="#ffffff" strokeOpacity="0.2" />
            <path d="M 100 100 L 85 85" stroke="#ffffff" strokeOpacity="0.2" />
          </>
        )}

        {type === 'minimalism' && (
          <>
            <motion.circle 
              cx="75" cy="75" r="4" 
              fill="none" 
              stroke="#f9d13e" 
              strokeWidth="1.5"
              initial={{ scale: 1, opacity: 0.2 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <circle cx="75" cy="75" r="2" fill="#f9d13e" />
          </>
        )}

        {type === 'golden-ratio' && (
          <>
             {/* Golden Rectangle Grid (Subtle) */}
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="#ffffff" strokeOpacity="0.1" />
            <line x1="61.8" y1="0" x2="61.8" y2="100" stroke="#ffffff" strokeOpacity="0.1" />
            <line x1="61.8" y1="61.8" x2="100" y2="61.8" stroke="#ffffff" strokeOpacity="0.1" />
            <line x1="76.4" y1="61.8" x2="76.4" y2="100" stroke="#ffffff" strokeOpacity="0.1" />

            {/* Correct Golden Spiral Path */}
            {/* Starts Bottom Left (0,100), curves to Top Right (100,0) via Top Left, then spirals in */}
            <motion.path 
              d="M 0 100 C 0 0 100 0 100 61.8 C 100 100 38.2 100 38.2 61.8 C 38.2 38.2 61.8 38.2 61.8 52"
              {...lineProps}
              strokeWidth="2.5"
            />
            <motion.circle cx="61.8" cy="52" r="2" fill="#f9d13e" variants={pointVariants} initial="hidden" animate="visible" />
          </>
        )}
        
        {type === 'color-contrast' && (
           <>
             <motion.circle cx="35" cy="50" r="20" fill="none" stroke="#f9d13e" strokeWidth="2" strokeDasharray="4 4" 
               animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             />
             <motion.circle cx="65" cy="50" r="20" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.5"
               animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             />
             <circle cx="50" cy="50" r="4" fill="#f9d13e" />
           </>
        )}
      </svg>
    </div>
  );
};

const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBack, onStartCamera, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Category>('全部');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const categories: Category[] = ['全部', '基础入门', '几何秩序', '艺术表达', '进阶思维'];

  const lessons: Lesson[] = [
    {
      id: 'rule-of-thirds',
      category: '基础入门',
      title: '三分法：视觉平衡',
      subtitle: '构图的黄金基石',
      psychology: '人眼在观察画面时，视线会自动落在九宫格的交汇点上。将主体放在侧边，能创造更自然的视觉流动并留出叙事空间。',
      description: '将画面纵横各平分为三份。不要总是把被摄体放在正中间，尝试放在四个交汇点之一，或沿分割线排列。',
      tip: '确保主体的前方（视线方向或运动方向）留有更多空间，这能给画面带来“呼吸感”。',
      difficulty: '初级'
    },
    {
      id: 'leading-lines',
      category: '几何秩序',
      title: '引导线：视觉穿越',
      subtitle: '赋予画面深度与指向',
      psychology: '线条能强制引导观众的视线。对角线或S形曲线可以让平面的照片产生深度的错觉，将视线引向远方的消失点。',
      description: '寻找道路、墙壁、围栏或光影形成的边缘，让它们从前景延伸，指向你想要强调的主体。',
      tip: '广角镜头可以显著拉长线条的透视感。尝试降低机位，让线条从画面的角落出发。',
      masterName: '安塞尔·亚当斯',
      masterId: 'ansel-adams',
      difficulty: '进阶'
    },
    {
      id: 'symmetry',
      category: '几何秩序',
      title: '对称构图：秩序之美',
      subtitle: '追求绝对的平衡与庄重',
      psychology: '对称能传达出一种稳定、平静和正式感。在快节奏的视觉环境中，整齐的对称往往能瞬间抓住人类对“秩序”的本能向往。',
      description: '寻找建筑、倒影或自然界中完美平衡的元素。中心构图在这里是核心，确保左右或上下完全一致。',
      tip: '微小的偏离会破坏对称感。使用相机的电子水平仪确保横平竖直。',
      difficulty: '初级'
    },
    {
      id: 'framing',
      category: '艺术表达',
      title: '框架构图：画中画',
      subtitle: '聚焦与隔绝的艺术',
      psychology: '通过前景的遮挡形成“窗户”，观众会产生一种窥探感。这种层级关系增加了画面的维度，让主体更突出。',
      description: '利用窗户、门洞、树枝或建筑阴影作为前景，将主体包裹在其中。',
      tip: '让前景框架稍微失焦或变暗，可以更有效地将视线推向中间明亮清晰的主体。',
      difficulty: '进阶'
    },
    {
      id: 'minimalism',
      category: '艺术表达',
      title: '极简：留白的智慧',
      subtitle: '以少胜多的视觉哲学',
      psychology: '大量的负空间（留白）能极大地增强主体的孤独感或纯粹感。它强迫观众去思考那个微小主体的意义。',
      description: '在大面积的纯色（天空、雪地、海面）中寻找一个孤独的元素。去掉所有干扰因素。',
      tip: '构图要极其大胆。将微小的主体放在角落，用 90% 的留白去压迫感官。',
      difficulty: '挑战'
    },
    {
      id: 'golden-ratio',
      category: '进阶思维',
      title: '黄金螺旋：自然律动',
      subtitle: '超越三分法的高阶平衡',
      psychology: '这是自然界中最广泛存在的比例（斐波那契螺旋）。它比三分法更具动感，视线会沿着曲线自然地汇聚。',
      description: '寻找带有旋转感的场景，如螺旋楼梯、蜗牛壳或波浪。将最细微的视觉核心放在螺旋的最内侧。',
      tip: '这是一种更直觉的构图。如果你觉得三分法太死板，尝试寻找画面中的隐形曲线。',
      difficulty: '挑战'
    },
    {
      id: 'color-contrast',
      category: '进阶思维',
      title: '色彩对比：情绪碰撞',
      subtitle: '用颜色主导视觉优先级',
      psychology: '补色（如红绿、橙蓝）会产生强烈的视觉振动。利用这种对比可以不依靠线条就建立起画面的焦点。',
      description: '寻找色轮上相对的颜色。让一小块鲜艳的补色出现在大面积的中性色或对比色背景中。',
      tip: '控制色彩的比例。通常“小面积的高饱和度色”配“大面积的低饱和度对比色”效果最好。',
      difficulty: '挑战'
    }
  ];

  const filteredLessons = useMemo(() => {
    if (activeTab === '全部') return lessons;
    return lessons.filter(l => l.category === activeTab);
  }, [activeTab]);

  return (
    <div className="flex h-full w-full flex-col bg-background-light overflow-hidden">
      <header className="px-6 pt-12 pb-4 bg-white/95 backdrop-blur-xl z-20 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-deep-blue mr-3 active:scale-90 transition-transform">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-black text-deep-blue tracking-tight">构图学院</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">VisionAI Academy</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
            <span className="material-symbols-outlined !text-[14px] text-deep-blue filled">verified</span>
            <span className="text-[10px] font-black text-deep-blue">大师课程</span>
          </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 ${activeTab === tab ? 'bg-deep-blue text-primary shadow-lg shadow-deep-blue/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-32">
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {filteredLessons.map((lesson, idx) => (
              <motion.div 
                key={lesson.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => setSelectedLesson(lesson)}
                className="group relative bg-zinc-900 rounded-[32px] overflow-hidden shadow-soft border border-gray-100/10 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-80"></div>
                  
                  {/* Abstract Background Decoration */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                  
                  {/* Dynamic Diagram */}
                  <CompositionDiagram type={lesson.id} className="opacity-90" />

                  <div className={`absolute top-4 right-4 px-3 py-1 backdrop-blur-md border border-white/10 rounded-full ${lesson.difficulty === '初级' ? 'bg-green-500/20' : lesson.difficulty === '进阶' ? 'bg-primary/20' : 'bg-red-500/20'}`}>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{lesson.difficulty}</span>
                  </div>

                  <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-[2px] w-4 bg-primary rounded-full"></div>
                      <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{lesson.category}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight">{lesson.title}</h3>
                    <p className="text-white/50 text-[10px] mt-1 font-medium tracking-wide uppercase">{lesson.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {selectedLesson && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 100 }} 
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex flex-col overflow-hidden"
          >
            <div className="p-6 flex justify-between items-center text-white sticky top-0 z-50 bg-black/50 backdrop-blur-md">
              <button onClick={() => setSelectedLesson(null)} className="size-10 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined">close</span></button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-0.5">{selectedLesson.category}</span>
                <h2 className="text-xs font-bold tracking-widest uppercase">构图几何分析</h2>
              </div>
              <button className="size-10 rounded-full bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined">bookmark</span></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-40 no-scrollbar space-y-12 mt-4">
              <div className="relative w-full aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]"></div>
                
                {/* 详情页主示意图 - 动态绘制 */}
                <CompositionDiagram type={selectedLesson.id} />

                <div className="absolute bottom-10 left-10 flex flex-col gap-2">
                  <span className={`w-fit px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20 ${selectedLesson.difficulty === '初级' ? 'bg-green-500/40' : selectedLesson.difficulty === '进阶' ? 'bg-primary/40' : 'bg-red-500/40'}`}>
                    Difficulty: {selectedLesson.difficulty}
                  </span>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="text-5xl font-black text-white leading-tight mb-4 tracking-tighter">{selectedLesson.title}</h3>
                  <p className="text-primary text-sm font-black uppercase tracking-[0.3em] italic">{selectedLesson.subtitle}</p>
                </div>

                <div className="p-10 bg-white/5 rounded-[48px] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6 text-primary">
                    <span className="material-symbols-outlined filled !text-2xl">psychology</span>
                    <span className="text-xs font-black uppercase tracking-widest">视觉逻辑解析</span>
                  </div>
                  <p className="text-white/90 text-xl leading-relaxed font-medium mb-6">
                    {selectedLesson.psychology}
                  </p>
                  <div className="h-[1px] bg-white/10 w-full mb-6"></div>
                  <p className="text-white/60 leading-relaxed text-base italic">{selectedLesson.description}</p>
                </div>

                <div className="p-8 bg-primary rounded-[40px] text-deep-blue shadow-2xl shadow-primary/20">
                   <h4 className="font-black flex items-center gap-3 mb-3 text-sm uppercase">
                    <span className="material-symbols-outlined filled !text-2xl">tips_and_updates</span>
                    进阶秘籍
                  </h4>
                  <p className="text-base font-black leading-relaxed">{selectedLesson.tip}</p>
                </div>

                <button 
                  onClick={() => { setSelectedLesson(null); onStartCamera(); }}
                  className="w-full bg-white text-deep-blue font-black py-8 rounded-[40px] shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-4 text-xl"
                >
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

export default TutorialScreen;
