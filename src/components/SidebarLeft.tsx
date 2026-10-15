import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RoomCategory } from '../types';
import { 
  Home, 
  Flame, 
  Bookmark, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Eye, 
  HelpCircle,
  Hash
} from 'lucide-react';

interface SidebarLeftProps {
  rooms: RoomCategory[];
  activeRoom: string;
  onSelectRoom: (roomId: string) => void;
  activeView: string;
  onSelectView: (view: string) => void;
  onOpenAuthModal: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  rooms,
  activeRoom,
  onSelectRoom,
  activeView,
  onSelectView,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();

  return (
    <aside className="w-full lg:w-64 space-y-6">
      
      {/* Primary Navigation */}
      <div className="bg-slate-900/70 border border-purple-900/30 rounded-2xl p-3 shadow-lg backdrop-blur-md">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
          เมนูหลัก (Feeds & Nav)
        </div>
        <div className="space-y-1 mt-1">
          <button
            onClick={() => onSelectView('home')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'home'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-purple-300" />
            <span>หน้าแรก (Timeline)</span>
          </button>

          <button
            onClick={() => onSelectView('trending')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'trending'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>กระทู้เด็ด / มาแรง (X Hot)</span>
          </button>

          {/* User's own threads (CRUD Ownership inspection) */}
          <button
            onClick={() => {
              if (!user) {
                onOpenAuthModal();
              } else {
                onSelectView('my-threads');
              }
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'my-threads'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-indigo-300" />
              <span>กระทู้ของฉัน (My Posts)</span>
            </div>
            {!user && <Lock className="w-3 h-3 text-slate-500" />}
          </button>

          {/* Admin Dashboard (Requirement 6 & Requirement 2 RBAC) */}
          <button
            onClick={() => onSelectView('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeView === 'admin'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white shadow-md shadow-purple-600/40 border border-purple-400/30'
                : 'text-purple-300 hover:bg-purple-950/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>แดชบอร์ดแอดมิน (Admin)</span>
            </div>
            {user?.role === 'admin' ? (
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded font-mono">
                ADMIN
              </span>
            ) : (
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> ล็อค
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Pantip Rooms List */}
      <div className="bg-slate-900/70 border border-purple-900/30 rounded-2xl p-3 shadow-lg backdrop-blur-md">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
          <span>ห้องสนทนาสไตล์พันทิป</span>
          <span className="text-[10px] text-slate-400 font-normal">7 ห้อง</span>
        </div>
        <div className="space-y-1 mt-1">
          {rooms.map((room) => {
            const isSelected = activeRoom === room.id && activeView !== 'admin';
            return (
              <button
                key={room.id}
                onClick={() => {
                  onSelectRoom(room.id);
                  if (activeView === 'admin') onSelectView('home');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition text-left group ${
                  isSelected
                    ? 'bg-purple-950/80 text-white border border-purple-600/60 shadow-sm'
                    : 'text-slate-300 hover:bg-purple-950/40 hover:text-white'
                }`}
              >
                <span className="text-base group-hover:scale-110 transition transform">{room.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-semibold">{room.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{room.englishName}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Masking & PDPA Info Card (Highlighting Requirement 5) */}
      <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-800/40 rounded-2xl p-4 text-xs text-slate-300 shadow-md">
        <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-1.5">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>นโยบายปกป้องข้อมูล (Masking)</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          เบอร์โทรศัพท์และอีเมลของสมาชิกจะแสดงผลแบบ <span className="text-purple-300 font-mono">08x-***-xxxx</span> ให้บุคคลทั่วไป เฉพาะเจ้าของบัญชีหรือแอดมินเท่านั้นที่จะสามารถดูข้อมูลเต็มได้
        </p>
      </div>

    </aside>
  );
};
