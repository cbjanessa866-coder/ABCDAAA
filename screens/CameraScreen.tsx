
import * as React from 'react';
import { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePhoto } from '../services/geminiService';
import { PhotoAnalysis, Screen } from '../types';

interface CameraScreenProps {
  onBack: () => void;
  onCapture: (photo: string, analysis: PhotoAnalysis) => void;
  onNavigate: (screen: Screen) => void;
  lastPhoto: string | null;
}

type AspectRatio = '1:1' | '4:3' | '16:9' | 'full';
type FacingMode = 'user' | 'environment';
type ParamKey = 'aperture' | 'shutter' | 'iso' | 'ev';

// 默认相册缩略图（当没有最新照片时显示）
const defaultGalleryThumb = "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=200&h=200&q=80";

// Extracted RotatingIcon component to fix TypeScript errors and performance
interface RotatingIconProps {
  children: React.ReactNode;
  className?: string;
  rotation: number;
}

const RotatingIcon: React.FC<RotatingIconProps> = ({ children, className = "", rotation }) => (
  <motion.div 
    animate={{ rotate: rotation }} 
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    className={`flex items-center justify-center ${className}`}
  >
    {children}
  </motion.div>
);

const CameraScreen: React.FC<CameraScreenProps> = ({ onBack, onCapture, onNavigate, lastPhoto }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('full');
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [uiRotation, setUiRotation] = useState(0);
  const [cooldown, setCooldown] = useState(0); 
  const [showFlash, setShowFlash] = useState(false);
  const [isStreamLoading, setIsStreamLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // 相机参数
  const [activeParam, setActiveParam] = useState<ParamKey | null>(null);
  const [params, setParams] = useState({
    aperture: 'f/2.8',
    shutter: '1/200',
    iso: '400',
    ev: '+0.3'
  });

  const paramOptions: Record<ParamKey, string[]> = {
    aperture: ['f/1.4', 'f/1.8', 'f/2.0', 'f/2.8', 'f/4.0', 'f/5.6', 'f/8.0', 'f/11', 'f/16'],
    shutter: ['1/4000', '1/2000', '1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', '1/15', '1/8', '1/4', '1/2', '1"', '2"'],
    iso: ['100', '200', '400', '800', '1600', '3200', '6400', '12800'],
    ev: ['-2.0', '-1.3', '-0.7', '0', '+0.3', '+0.7', '+1.3', '+2.0']
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const cycleAspectRatio = () => {
    const ratios: AspectRatio[] = ['full', '1:1', '4:3', '16:9'];
    const currentIndex = ratios.indexOf(aspectRatio);
    setAspectRatio(ratios[(currentIndex + 1) % ratios.length]);
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsStreamLoading(true);
    
    // 清理旧流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // 显式触发播放，部分浏览器 muted autoPlay 仍需此操作
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.error("Video play failed:", playError);
        }
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("未获得摄像头权限，请在设置中开启。");
      } else {
        setCameraError("无法启动摄像头，请检查设备连接或刷新页面。");
      }
      setIsStreamLoading(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach(track => track.stop());
  }, [facingMode]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const handleOrientation = () => {
      const angle = window.screen?.orientation?.angle ?? 0;
      setUiRotation(-angle);
    };
    window.addEventListener('orientationchange', handleOrientation);
    handleOrientation();
    return () => window.removeEventListener('orientationchange', handleOrientation);
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || isCapturing || cooldown > 0 || isStreamLoading) return;
    
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (facingMode === 'user') { 
      ctx.translate(canvas.width, 0); 
      ctx.scale(-1, 1); 
    }
    ctx.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.6);
    setCapturedFrame(photoData); 
    setIsCapturing(true);
    
    try {
      const result = await analyzePhoto(photoData.split(',')[1]);
      onCapture(photoData, result);
    } catch (e: any) {
      if (e.status === 429) setCooldown(20);
      setIsCapturing(false);
    }
  };

  const frameDimensions = useMemo(() => {
    switch (aspectRatio) {
      case '1:1': return { width: '85%', paddingBottom: '85%' };
      case '4:3': return { width: '85%', paddingBottom: '113.33%' };
      case '16:9': return { width: '85%', paddingBottom: '151.11%' };
      default: return { width: '100%', paddingBottom: '216%' };
    }
  }, [aspectRatio]);

  const handleParamClick = (key: ParamKey) => {
    if (activeParam === key) {
      setActiveParam(null);
    } else {
      setActiveParam(key);
      setTimeout(() => {
        const index = paramOptions[key].indexOf(params[key]);
        const el = document.getElementById(`param-opt-${index}`);
        if (el && scrollRef.current) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 50);
    }
  };

  const updateParam = (key: ParamKey, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col items-center justify-center">
      {/* 核心视频取景器 */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        onLoadedData={() => setIsStreamLoading(false)}
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${capturedFrame ? 'opacity-0' : (isStreamLoading ? 'opacity-0' : 'opacity-100')}`} 
      />
      
      {/* 加载与错误状态 */}
      <AnimatePresence>
        {isStreamLoading && !cameraError && !capturedFrame && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10"
          >
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/30 border-t-primary mb-4"></div>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest">初始化影像引擎...</p>
          </motion.div>
        )}

        {cameraError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-[60] p-10 text-center"
          >
            <span className="material-symbols-outlined text-red-500 !text-6xl mb-6">videocam_off</span>
            <h3 className="text-white text-xl font-bold mb-4">摄像头不可用</h3>
            <p className="text-white/60 mb-8 leading-relaxed">{cameraError}</p>
            <button 
              onClick={startCamera}
              className="px-8 py-3 bg-primary text-deep-blue font-black rounded-2xl shadow-xl active:scale-95 transition-transform"
            >
              尝试重新连接
            </button>
            <button 
              onClick={onBack}
              className="mt-6 text-white/40 text-sm font-bold underline"
            >
              返回首页
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {capturedFrame && <img src={capturedFrame} className="absolute inset-0 w-full h-full object-cover z-0" />}
      {showFlash && <div className="absolute inset-0 bg-white z-[100]" />}
      
      {/* 构图引导层 */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <div style={{ width: aspectRatio === 'full' ? '100%' : frameDimensions.width }} className="relative transition-all duration-500">
          <div style={{ paddingBottom: aspectRatio === 'full' ? '216%' : frameDimensions.paddingBottom }} className={`relative border border-white/20 transition-all duration-500 ${aspectRatio !== 'full' ? 'shadow-[0_0_0_2000px_rgba(0,0,0,0.6)]' : ''}`}>
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full stroke-white fill-none stroke-[0.5]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <line x1="33.3" x2="33.3" y1="0" y2="100" /><line x1="66.6" x2="66.6" y1="0" y2="100" />
                <line x1="0" x2="100" y1="33.3" y2="33.3" /><line x1="0" x2="100" y1="66.6" y2="66.6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-50 flex flex-col">
        {/* Top Controls */}
        <div className="p-6 pt-12 flex justify-between items-start pointer-events-auto">
          <RotatingIcon rotation={uiRotation}>
            <button onClick={onBack} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center active:scale-90 transition-transform">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </RotatingIcon>
          
          <div className="flex flex-col gap-4 items-end">
            <RotatingIcon rotation={uiRotation}>
              <div className={`px-3 py-1 text-[10px] font-black rounded-full shadow-lg border border-white/20 uppercase tracking-tighter flex items-center gap-1 transition-colors ${cooldown > 0 ? 'bg-red-500 text-white' : 'bg-primary text-deep-blue'}`}>
                <span className="material-symbols-outlined !text-[12px] filled">{cooldown > 0 ? 'bolt' : 'auto_awesome'}</span>
                {cooldown > 0 ? `冷却中 (${cooldown}s)` : (isCapturing ? '分析中...' : 'AI 指导就绪')}
              </div>
            </RotatingIcon>
            
            <RotatingIcon rotation={uiRotation}>
              <button onClick={cycleAspectRatio} className="w-12 h-12 rounded-full bg-black/40 border border-white/10 text-white flex flex-col items-center justify-center active:scale-90 transition-transform">
                <span className="text-[9px] font-black uppercase">{aspectRatio}</span>
                <span className="material-symbols-outlined !text-[18px]">aspect_ratio</span>
              </button>
            </RotatingIcon>
          </div>
        </div>

        <div className="flex-1" />

        {/* 相机参数显示区 (OSD) */}
        {!isCapturing && !capturedFrame && !cameraError && (
          <div className="px-6 py-4 flex justify-center items-center gap-8 text-white/80 font-mono tracking-widest text-[11px] pointer-events-auto bg-black/20 backdrop-blur-sm rounded-full mx-6 mb-2">
            {(['aperture', 'shutter', 'iso', 'ev'] as ParamKey[]).map((key) => (
              <button 
                key={key} 
                onClick={() => handleParamClick(key)}
                className={`flex flex-col items-center transition-all duration-300 relative ${activeParam === key ? 'text-primary scale-110' : 'opacity-60'}`}
              >
                {activeParam === key && (
                  <motion.div layoutId="active-indicator" className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
                )}
                <RotatingIcon rotation={uiRotation}>
                  <div className="flex flex-col items-center">
                    <span className="opacity-40 text-[7px] mb-0.5 uppercase tracking-tighter">{key === 'aperture' ? 'AV' : key === 'shutter' ? 'TV' : key.toUpperCase()}</span>
                    <span className="font-bold text-[12px]">{params[key]}</span>
                  </div>
                </RotatingIcon>
              </button>
            ))}
          </div>
        )}

        {/* 参数调节滑动拨盘 */}
        <AnimatePresence>
          {activeParam && !cameraError && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full bg-black/80 backdrop-blur-2xl border-t border-white/10 pointer-events-auto py-8 relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[2px] bg-primary/40 pointer-events-none z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-primary"></div>
              </div>

              <div 
                ref={scrollRef}
                className="flex gap-0 overflow-x-auto no-scrollbar px-[50%] items-end h-16 snap-x snap-mandatory"
              >
                {paramOptions[activeParam].map((opt, idx) => (
                  <button
                    id={`param-opt-${idx}`}
                    key={opt}
                    onClick={() => updateParam(activeParam, opt)}
                    className={`snap-center shrink-0 w-20 h-full flex flex-col items-center justify-center transition-all duration-300 ${params[activeParam] === opt ? 'text-primary scale-125' : 'text-white/20'}`}
                  >
                    <RotatingIcon rotation={uiRotation} className="flex flex-col items-center">
                      <span className="text-xs font-black font-mono">{opt}</span>
                      <div className={`mt-2 w-[1px] rounded-full bg-current ${params[activeParam] === opt ? 'h-4' : 'h-2 opacity-40'}`} />
                    </RotatingIcon>
                  </button>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{activeParam === 'aperture' ? 'Aperture Value' : activeParam === 'shutter' ? 'Shutter Speed' : activeParam.toUpperCase()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Bar */}
        <div className="w-full pointer-events-auto bg-deep-blue/90 backdrop-blur-3xl rounded-t-[3xl] px-8 pb-10 pt-8 shadow-2xl relative z-20">
          <div className="flex items-center justify-between w-full max-w-md mx-auto">
            <RotatingIcon rotation={uiRotation}>
              {capturedFrame ? (
                <button onClick={() => {setCapturedFrame(null); setIsCapturing(false);}} disabled={isCapturing} className="size-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              ) : (
                <button onClick={() => onNavigate('gallery')} className="size-14 rounded-2xl border border-white/20 bg-white/10 overflow-hidden active:scale-90 transition-transform p-1">
                  <div className="w-full h-full rounded-xl bg-cover bg-center opacity-70" style={{backgroundImage: `url('${lastPhoto || defaultGalleryThumb}')`}}></div>
                </button>
              )}
            </RotatingIcon>
            
            <button onClick={captureAndAnalyze} disabled={isCapturing || cooldown > 0 || isStreamLoading || !!cameraError} className="relative active:scale-95 transition-all">
                <div className="absolute -inset-2 rounded-full border-2 border-white/20 scale-110"></div>
                <div className={`size-[76px] rounded-full flex items-center justify-center ${isCapturing ? 'bg-gray-600' : 'bg-primary'}`}>
                   {isCapturing ? <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" /> : <div className="size-[60px] rounded-full border-2 border-white/20" />}
                </div>
            </button>
            
            <RotatingIcon rotation={uiRotation}>
              <button onClick={() => { setFacingMode(prev => prev === 'environment' ? 'user' : 'environment'); }} disabled={isCapturing || !!capturedFrame || !!cameraError} className="size-14 rounded-full bg-white/5 text-white flex items-center justify-center active:scale-90 transition-transform">
                <span className="material-symbols-outlined !text-[28px]">cached</span>
              </button>
            </RotatingIcon>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;
