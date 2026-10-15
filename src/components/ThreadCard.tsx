import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Thread } from '../types';
import { 
  Pin, 
  Lock, 
  MessageSquare, 
  Repeat2, 
  Bookmark, 
  Heart, 
  Eye, 
  EyeOff,
  MoreVertical, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  Share2, 
  Check, 
  Smile,
  AlertCircle
} from 'lucide-react';

interface ThreadCardProps {
  thread: Thread;
  onOpenDetail: (thread: Thread) => void;
  onOpenEdit: (thread: Thread) => void;
  onDelete: (threadId: string) => void;
  onReact: (threadId: string, emotion?: string, type?: 'emotion' | 'repost' | 'bookmark') => void;
  onReport: (thread: Thread) => void;
}

export const ThreadCard: React.FC<ThreadCardProps> = ({
  thread,
  onOpenDetail,
  onOpenEdit,
  onDelete,
  onReact,
  onReport,
}) => {
  const { user } = useAuth();
  const [showEmotions, setShowEmotions] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ownershipNotice, setOwnershipNotice] = useState<string | null>(null);

  const isOwner = user?.id === thread.authorId;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner;
  const canDelete = isOwner || isAdmin;

  // Pantip emotion options
  const emotionsList = [
    { key: 'like', label: 'ถูกใจ', icon: '👍', color: 'text-blue-400' },
    { key: 'love', label: 'หลงรัก', icon: '❤️', color: 'text-red-400' },
    { key: 'laugh', label: 'ขำกลิ้ง', icon: '😂', color: 'text-amber-400' },
    { key: 'impressed', label: 'ทึ่ง', icon: '😲', color: 'text-purple-400' },
    { key: 'sad', label: 'ซึ้ง', icon: '🥺', color: 'text-cyan-400' },
    { key: 'scare', label: 'สยอง', icon: '😱', color: 'text-emerald-400' },
  ];

  // Calculate total reactions
  const totalReactions = Object.values(thread.reactions || {}).reduce(
    (sum, arr) => sum + (arr ? arr.length : 0),
    0
  );

  const handleUnauthorizedEdit = () => {
    setOwnershipNotice('⚠️ คุณไม่มีสิทธิ์แก้ไขกระทู้นี้ เฉพาะเจ้าของกระทู้ (@' + thread.author.username + ') เท่านั้น');
    setTimeout(() => setOwnershipNotice(null), 3500);
  };

  const handleUnauthorizedDelete = () => {
    setOwnershipNotice('⚠️ คุณไม่มีสิทธิ์ลบกระทู้ของสมาชิกท่านอื่น (ตามกฎความเป็นเจ้าของข้อมูล)');
    setTimeout(() => setOwnershipNotice(null), 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '#' + thread.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Masking presentation
  const isSelfOrAdmin = isOwner || isAdmin;
  const displayPhone = (revealedPhone && isSelfOrAdmin)
    ? thread.author.phoneNumber
    : thread.author.maskedPhone;

  return (
    <article className="relative bg-slate-900/90 border border-purple-900/40 hover:border-purple-700/60 rounded-2xl p-5 shadow-lg backdrop-blur-md transition-all duration-200">
      
      {/* Pinned or Locked Badge */}
      <div className="flex items-center gap-2 mb-3">
        {thread.isPinned && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm">
            <Pin className="w-3 h-3 fill-current" />
            ปักหมุดโดยแอดมิน
          </span>
        )}
        {thread.isLocked && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
            <Lock className="w-3 h-3" />
            ล็อคกระทู้ (งดตอบ)
          </span>
        )}
        {thread.roomInfo && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-950/80 text-purple-300 border border-purple-800/60">
            <span>{thread.roomInfo.icon}</span>
            <span>{thread.roomInfo.name}</span>
          </span>
        )}
        <span className="text-[11px] text-slate-500 ml-auto">
          {new Date(thread.createdAt).toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Ownership Violation Warning Popup */}
      {ownershipNotice && (
        <div className="mb-3 p-3 rounded-xl bg-amber-950/90 border border-amber-700 text-amber-200 text-xs flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{ownershipNotice}</span>
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={thread.author.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${thread.author.username}`}
            alt={thread.author.displayName}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-600/50 shadow"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-white text-sm hover:underline cursor-pointer" onClick={() => onOpenDetail(thread)}>
                {thread.author.displayName}
              </span>
              <span className="text-xs text-purple-400">@{thread.author.username}</span>
              {thread.author.role === 'admin' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-purple-900/90 text-purple-200 px-1.5 py-0.2 rounded border border-purple-600">
                  <ShieldCheck className="w-3 h-3 text-purple-300" /> แอดมิน
                </span>
              )}
            </div>

            {/* Masked Personal Data Badge (Demonstrating Requirement #5) */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-purple-900/60"
                title="ข้อมูลส่วนบุคคลถูกปกป้อง (Privacy Masking)"
              >
                <span className="text-purple-400">📱 {displayPhone}</span>
                {isSelfOrAdmin ? (
                  <button
                    onClick={() => setRevealedPhone(!revealedPhone)}
                    className="ml-1 text-purple-300 hover:text-white underline cursor-pointer flex items-center gap-0.5"
                    title={revealedPhone ? 'คลิกเพื่อซ่อน' : 'คลิกเพื่อดูข้อมูลจริง (เฉพาะเจ้าของ/แอดมิน)'}
                  >
                    {revealedPhone ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                    <span className="text-[9px]">{revealedPhone ? 'ซ่อน' : 'ดูจริง'}</span>
                  </button>
                ) : (
                  <span className="text-[9px] text-slate-500 font-sans">(Masked)</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Action Menu (Edit, Delete, Report) */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-48 rounded-xl bg-slate-950 border border-purple-800/80 shadow-2xl p-1.5 z-30 animate-in fade-in"
              onClick={() => setMenuOpen(false)}
            >
              {/* Edit Thread (Owner Only) */}
              {canModify ? (
                <button
                  onClick={() => onOpenEdit(thread)}
                  className="w-full text-left px-2.5 py-2 text-xs text-blue-300 hover:bg-purple-950/70 rounded-lg flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  แก้ไขกระทู้ (เจ้าของ)
                </button>
              ) : (
                <button
                  onClick={handleUnauthorizedEdit}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  แก้ไข (เฉพาะเจ้าของ)
                </button>
              )}

              {/* Delete Thread (Owner or Admin) */}
              {canDelete ? (
                <button
                  onClick={() => {
                    if (confirm('คุณต้องการลบกระทู้นี้ใช่หรือไม่?')) {
                      onDelete(thread.id);
                    }
                  }}
                  className="w-full text-left px-2.5 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-lg flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  {isOwner ? 'ลบกระทู้ของฉัน' : 'ลบกระทู้ (สิทธิ์แอดมิน)'}
                </button>
              ) : (
                <button
                  onClick={handleUnauthorizedDelete}
                  className="w-full text-left px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  ลบกระทู้ (เฉพาะเจ้าของ)
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="w-full text-left px-2.5 py-2 text-xs text-slate-300 hover:bg-purple-950/70 rounded-lg flex items-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-purple-400" />}
                {copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์กระทู้'}
              </button>

              <button
                onClick={() => onReport(thread)}
                className="w-full text-left px-2.5 py-2 text-xs text-amber-400 hover:bg-amber-950/40 rounded-lg flex items-center gap-2 border-t border-purple-950 mt-1 pt-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                แจ้งรายงานกระทู้
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Thread Title */}
      <h3
        onClick={() => onOpenDetail(thread)}
        className="text-base sm:text-lg font-bold text-slate-100 hover:text-purple-300 cursor-pointer mb-2 transition leading-snug"
      >
        {thread.title}
      </h3>

      {/* Thread Content Preview */}
      <p
        onClick={() => onOpenDetail(thread)}
        className="text-xs sm:text-sm text-slate-300/90 whitespace-pre-line line-clamp-3 mb-3 cursor-pointer leading-relaxed"
      >
        {thread.content}
      </p>

      {/* Image if present */}
      {thread.imageUrl && (
        <div 
          onClick={() => onOpenDetail(thread)}
          className="mb-3 rounded-xl overflow-hidden max-h-80 bg-slate-950 border border-purple-900/30 cursor-pointer"
        >
          <img
            src={thread.imageUrl}
            alt="Thread media"
            className="w-full h-full object-cover hover:scale-[1.01] transition duration-300"
          />
        </div>
      )}

      {/* Tags */}
      {thread.tags && thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {thread.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium text-purple-300 hover:text-blue-300 bg-purple-950/60 hover:bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-800/40 cursor-pointer transition"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions & Reactions Footer */}
      <div className="flex items-center justify-between border-t border-purple-900/30 pt-3 text-slate-400 text-xs">
        
        {/* Pantip Emotions Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowEmotions(!showEmotions)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition ${
              totalReactions > 0
                ? 'text-purple-300 bg-purple-950/60 font-semibold'
                : 'hover:bg-purple-950/40 hover:text-purple-200'
            }`}
          >
            <span>❤️</span>
            <span>{totalReactions > 0 ? totalReactions : 'แสดงอารมณ์'}</span>
          </button>

          {showEmotions && (
            <div
              className="absolute left-0 bottom-full mb-2 bg-slate-950 border border-purple-700 rounded-2xl shadow-2xl p-2 flex items-center gap-1.5 z-20 animate-in fade-in"
              onMouseLeave={() => setShowEmotions(false)}
            >
              {emotionsList.map((emo) => {
                const count = (thread.reactions[emo.key] || []).length;
                const hasReacted = user ? (thread.reactions[emo.key] || []).includes(user.id) : false;
                return (
                  <button
                    key={emo.key}
                    onClick={() => {
                      onReact(thread.id, emo.key, 'emotion');
                      setShowEmotions(false);
                    }}
                    className={`flex flex-col items-center p-1.5 rounded-xl hover:bg-purple-900/50 transition transform hover:scale-125 ${
                      hasReacted ? 'bg-purple-900/80 border border-purple-500' : ''
                    }`}
                    title={`${emo.label} (${count})`}
                  >
                    <span className="text-lg">{emo.icon}</span>
                    <span className="text-[9px] text-slate-300 mt-0.5">{emo.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments Count */}
        <button
          onClick={() => onOpenDetail(thread)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-950/40 hover:text-blue-300 transition"
        >
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span>{thread.commentsCount} ความเห็น</span>
        </button>

        {/* X Repost */}
        <button
          onClick={() => onReact(thread.id, undefined, 'repost')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition ${
            thread.userReactions.hasReposted
              ? 'text-emerald-400 bg-emerald-950/60 font-semibold'
              : 'hover:bg-purple-950/40 hover:text-emerald-300'
          }`}
          title="รีโพสต์กระทู้นี้สไตล์ X"
        >
          <Repeat2 className="w-4 h-4" />
          <span>{thread.reposts?.length || 0}</span>
        </button>

        {/* Views Count */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Eye className="w-3.5 h-3.5" />
          <span>{thread.views}</span>
        </div>

      </div>

    </article>
  );
};
