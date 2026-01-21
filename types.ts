
export type Screen = 'startup' | 'home' | 'camera' | 'analysis' | 'profile' | 'gallery' | 'tutorial';

export interface PhotoAnalysis {
  score: number;
  composition: string;
  explanation: string;
  critique: {
    artistic: string;   // 艺术表现
    technical: string;  // 画面构图
    emotional: string;  // 氛围意境
  };
  proTip: string;
}

export interface LiveCompositionAdvice {
  x: number;
  y: number;
  width: number;
  height: number;
  reason: string;
  subjectLabel: string;
}

export interface User {
  name: string;
  level: string;
  avatarUrl: string;
  totalPhotos: number;
  progress: {
    goldenRatio: number;
    ruleOfThirds: number;
    daysActive: number;
  };
}
