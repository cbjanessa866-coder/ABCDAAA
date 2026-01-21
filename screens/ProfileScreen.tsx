
import * as React from 'react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen, User } from '../types';

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
  user: User;
  onUpdateUser: (user: User) => void;
  onViewAnalysis?: (photo: string) => void;
  capturedPhotos?: string[];
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate, user, onUpdateUser, onViewAnalysis, capturedPhotos = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl);

  // 获取最近的三张照片
  const recentPhotos = useMemo(() => capturedPhotos.slice(0, 3), [capturedPhotos]);

  const handleSave = () => {
    onUpdateUser({ ...user, name: editName, avatarUrl: editAvatar });
    setIsEditing(false);
  };

  const cycleAvatar = () => {
    // 轮换使用几个高质量的头像图片
    const avatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80'
    ];
    const currentIndex = avatars.indexOf(editAvatar);
    // 如果当前头像不在列表中，默认为第一个，否则下一个
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % avatars.length;
    setEditAvatar(avatars[nextIndex]);
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
    <div className="bg-background-light text-[#1c190d] h-full flex flex-col overflow-x-hidden">
      <header className="flex items-center justify-between px-6 pt-12 pb-2 sticky top-0 z-10 bg-background-light/90 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-tight">{isEditing ? '编辑资料' : '个人中心'}</h1>
        <button onClick={() => setIsEditing(!isEditing)} className="w-10 h-10 rounded-full bg-white shadow-sm text-deep-blue flex items-center justify-center">
          <span className="material-symbols-outlined !text-[20px]">{isEditing ? 'close' : 'settings'}</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col gap-6 p-6 pb-40 w-full overflow-y-auto no-scrollbar">
        <section className="flex flex-col items-center justify-center py-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-1 bg-white shadow-md">
              <div 
                className="w-full h-full rounded-full bg-cover bg-center border-2 border-primary/20 overflow-hidden relative" 
                style={{backgroundImage: `url("${isEditing ? editAvatar : user.avatarUrl}")`}}
              >
                {isEditing && (
                  <button onClick={cycleAvatar} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white backdrop-blur-[2px]">
                    <span className="material-symbols-outlined">photo_camera</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 text-center w-full max-w-[240px]">
            {isEditing ? (
              <div className="space-y-3">
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full text-center text-xl font-bold bg-white border border-primary/30 rounded-xl px-4 py-2 outline-none" />
                <button onClick={handleSave} className="w-full bg-primary text-deep-blue font-bold py-3 rounded-xl shadow-lg">保存更改</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <div className="px-2 py-0.5 bg-deep-blue rounded text-[9px] text-primary font-black uppercase tracking-widest">{user.level}</div>
                </div>
              </>
            )}
          </div>
        </section>

        {!isEditing && (
          <div className="flex flex-col gap-6">
            {/* 详细等级统计 */}
            <section className="bg-white rounded-[32px] p-6 shadow-soft border border-gray-100">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">快门足迹</h3>
               <div className="flex items-end justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-deep-blue">{user.totalPhotos}</span>
                    <span className="text-[10px] font-bold text-gray-400">累计快门数</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-primary italic">Next: {nextLevelInfo.label}</span>
                    <p className="text-[10px] font-bold text-gray-400">距离晋升还需 {nextLevelInfo.next - user.totalPhotos} 次</p>
                  </div>
               </div>
               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} className="h-full bg-primary" />
               </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-end justify-between px-1">
                <h2 className="text-lg font-bold">我的作品</h2>
                <button onClick={() => onNavigate('gallery')} className="text-sm font-bold text-primary">更多</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {recentPhotos.length > 0 ? (
                  recentPhotos.map((src, i) => (
                    <div key={i} onClick={() => onViewAnalysis?.(src)} className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm active:scale-95 transition-transform cursor-pointer">
                      <img src={src} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-10 text-center bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-400 text-xs font-bold">暂无作品</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {!isEditing && (
        <div className="fixed bottom-8 left-0 right-0 z-50 px-8 flex justify-center">
          <div className="w-full max-w-sm h-20 bg-deep-blue/90 backdrop-blur-2xl rounded-[32px] shadow-xl border border-white/10 flex items-center justify-between px-6 relative">
            <button onClick={() => onNavigate('home')} className="flex flex-col items-center justify-center gap-1"><span className="material-symbols-outlined text-white/40 !text-[26px]">home</span></button>
            <button onClick={() => onNavigate('camera')} className="absolute left-1/2 -translate-x-1/2 -top-10 w-20 h-20 rounded-full bg-primary border-[6px] border-deep-blue shadow-xl flex items-center justify-center active:scale-90 transition-transform"><span className="material-symbols-outlined text-deep-blue text-4xl filled">photo_camera</span></button>
            <div className="w-12"></div>
            <button onClick={() => onNavigate('gallery')} className="flex flex-col items-center justify-center gap-1 group">
              <span className="material-symbols-outlined text-white/40 group-hover:text-primary !text-[26px]">photo_library</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
