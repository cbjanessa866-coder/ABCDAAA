
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen, PhotoAnalysis, User } from './types';
import StartupScreen from './screens/StartupScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import AnalysisResultScreen from './screens/AnalysisResultScreen';
import ProfileScreen from './screens/ProfileScreen';
import GalleryScreen from './screens/GalleryScreen';
import TutorialScreen from './screens/TutorialScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('startup');
  const [lastAnalysis, setLastAnalysis] = useState<PhotoAnalysis | null>(null);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [prevScreen, setPrevScreen] = useState<Screen>('home');
  const [galleryTab, setGalleryTab] = useState<'mine' | 'master'>('mine');
  const [initialMasterpieceId, setInitialMasterpieceId] = useState<string | null>(null);
  
  // 存储用户拍摄的照片列表
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&w=600",
    "https://images.unsplash.com/photo-1510342938507-6c8ef85c13c7?auto=format&fit=crop&w=600",
    "https://images.unsplash.com/photo-1662955677098-bc1c2514d45d?auto=format&fit=crop&w=600",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600"
  ]);

  const [userData, setUserData] = useState({
    name: '摄影师',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
    totalPhotos: 128,
    daysActive: 12,
    goldenRatio: 85,
    ruleOfThirds: 92
  });

  // 等级计算规则
  const user = useMemo((): User => {
    const count = userData.totalPhotos;
    let levelTitle = '';
    if (count < 10) levelTitle = 'Lv.1 初学者';
    else if (count < 30) levelTitle = 'Lv.2 摄影爱好者';
    else if (count < 80) levelTitle = 'Lv.3 视觉捕手';
    else if (count < 200) levelTitle = 'Lv.4 资深摄影师';
    else levelTitle = 'Lv.5 构图大师';

    return {
      name: userData.name,
      level: levelTitle,
      avatarUrl: userData.avatarUrl,
      totalPhotos: count,
      progress: {
        goldenRatio: userData.goldenRatio,
        ruleOfThirds: userData.ruleOfThirds,
        daysActive: userData.daysActive
      }
    };
  }, [userData]);

  useEffect(() => {
    if (currentScreen === 'startup') {
      const timer = setTimeout(() => {
        setCurrentScreen('home');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const navigateTo = (screen: Screen, options?: { tab?: 'mine' | 'master', masterpieceId?: string }) => {
    if (options?.tab) setGalleryTab(options.tab);
    if (options?.masterpieceId) setInitialMasterpieceId(options.masterpieceId);
    else if (screen !== 'gallery') setInitialMasterpieceId(null);

    setPrevScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const handleCapture = (photo: string, analysis: PhotoAnalysis) => {
    setLastPhoto(photo);
    setLastAnalysis(analysis);
    // 保存照片到列表并增加计数
    setCapturedPhotos(prev => [photo, ...prev]);
    setUserData(prev => ({ ...prev, totalPhotos: prev.totalPhotos + 1 }));
    setCurrentScreen('analysis');
  };

  const handleUpdateUser = (newUserInfo: User) => {
    setUserData(prev => ({
      ...prev,
      name: newUserInfo.name,
      avatarUrl: newUserInfo.avatarUrl
    }));
  };

  const handleViewPastAnalysis = (photo: string) => {
    setLastPhoto(photo);
    const mockAnalysis: PhotoAnalysis = {
      score: 88 + Math.floor(Math.random() * 10),
      composition: "黄金分割",
      explanation: "这张照片展示了极佳的视觉平衡，AI 深度点评认为其具备典型的大师级光影质感。",
      critique: {
        artistic: "色彩对比强烈，明暗过渡极其自然，展现了极高的艺术张力。",
        technical: "主体精确落点在黄金分割线上，背景的线条引导有力地增强了空间纵深感。",
        emotional: "冷暖色调的交织营造出一种宁静而略显孤独的电影感叙事氛围。"
      },
      proTip: "目前的表达已经非常成熟。建议在拍摄类似场景时，尝试捕捉更极端的自然光效以增强情绪爆发力。"
    };
    setLastAnalysis(mockAnalysis);
    navigateTo('analysis');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'startup':
        return <StartupScreen />;
      case 'home':
        return <HomeScreen onNavigate={navigateTo} user={user} onAnalyzeImage={handleCapture} />;
      case 'camera':
        return (
          <CameraScreen 
            onBack={() => navigateTo('home')} 
            onCapture={handleCapture}
            onNavigate={navigateTo}
            lastPhoto={lastPhoto}
          />
        );
      case 'analysis':
        return (
          <AnalysisResultScreen 
            photo={lastPhoto} 
            analysis={lastAnalysis} 
            onBack={() => navigateTo(prevScreen)} 
            onRetake={() => navigateTo('camera')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            onNavigate={navigateTo} 
            user={user} 
            onUpdateUser={handleUpdateUser} 
            onViewAnalysis={handleViewPastAnalysis}
            capturedPhotos={capturedPhotos}
          />
        );
      case 'gallery':
        return (
          <GalleryScreen 
            onBack={() => navigateTo(prevScreen === 'camera' ? 'camera' : 'home')} 
            onStartCamera={() => navigateTo('camera')}
            onViewAnalysis={handleViewPastAnalysis}
            initialTab={galleryTab}
            initialMasterpieceId={initialMasterpieceId}
            capturedPhotos={capturedPhotos}
          />
        );
      case 'tutorial':
        return (
          <TutorialScreen 
            onBack={() => navigateTo('home')} 
            onStartCamera={() => navigateTo('camera')}
            onNavigate={navigateTo}
          />
        );
      default:
        return <HomeScreen onNavigate={navigateTo} user={user} onAnalyzeImage={handleCapture} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen relative bg-background-light dark:bg-background-dark overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait" custom={currentScreen}>
        <motion.div
          key={currentScreen}
          custom={currentScreen}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="h-full w-full absolute inset-0"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default App;
