
import * as React from 'react';

const StartupScreen: React.FC = () => {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-background-light p-6">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[30%] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[30%] bg-brand-blue/5 rounded-full blur-[80px]"></div>
      </div>
      
      <div className="flex-1"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <div className="relative mb-8 group cursor-default">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-brand-blue rounded-3xl flex items-center justify-center shadow-xl shadow-brand-blue/10">
            <span className="material-symbols-outlined text-white text-[64px] opacity-90 font-light">
              lens_blur
            </span>
          </div>
          <div className="absolute -top-3 -right-3 bg-primary text-brand-blue rounded-2xl p-2.5 border-4 border-background-light shadow-lg flex items-center justify-center transform rotate-12">
            <span className="material-symbols-outlined text-2xl font-bold">
              auto_awesome
            </span>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-brand-blue">
            Vision<span className="text-primary">AI</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-[280px] mx-auto">
            每一次快门，都是完美的构图
          </p>
        </div>
      </div>
      
      <div className="flex-1"></div>
      
      <div className="relative z-10 w-full pb-12 flex flex-col items-center gap-6">
        <div className="w-full max-w-[160px] h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-loader"></div>
          <div className="h-full bg-brand-blue rounded-full w-[40%]"></div>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-xs font-medium tracking-wide">
            版本 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartupScreen;
