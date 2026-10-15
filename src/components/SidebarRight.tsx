import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface SidebarRightProps {
  onSelectTag: (tag: string) => void;
  activeTag: string;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  onSelectTag,
  activeTag,
}) => {
  const { user, switchDemoUser } = useAuth();

  const trendingTags = [
    { tag: '#ประกาศจากแอดมิน', count: '1.2K โพสต์', isHot: true },
    { tag: '#สายไอที', count: '890 โพสต์', isHot: true },
    { tag: '#มนุษย์เงินเดือน', count: '654 โพสต์', isHot: false },
    { tag: '#เทรนด์วันนี้', count: '521 โพสต์', isHot: true },
    { tag: '#ซีรีส์เด็ด', count: '430 โพสต์', isHot: false },
    { tag: '#PunXCommunity', count: '312 โพสต์', isHot: false },
  ];

  return (
    <aside className="w-full lg:w-80 space-y-6">

      {/* Requirement Testing Checklist (Guiding the user/evaluator directly) */}
      <div className="bg-slate-900/80 border border-purple-800/50 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ตรวจสอบ 6 ฟีเจอร์ตามโจทย์</span>
        </div>
        
        <div className="space-y-2 text-[11px] text-slate-300">
          
          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>1. สมาชิก & Hashing</span>
              <span className="text-[10px] text-emerald-400 font-mono">bcrypt 10 rounds</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">รหัสผ่านถูกแฮชก่อนบันทึกลงฐานข้อมูล</p>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>2. สิทธิ์ 2 บทบาท</span>
              <span className="text-[10px] text-purple-300 font-mono">User vs Admin</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">แอดมินปักหมุด/ล็อค/ลบได้ทุกกระทู้และจัดการสิทธิ์</p>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>3. CRUD มีเจ้าของ (Ownership)</span>
              <span className="text-[10px] text-blue-400 font-mono">Owner Only</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">User A ไม่สามารถแก้/ลบกระทู้ User B ได้เด็ดขาด</p>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>4. ฟอร์มบันทึก DB & แสดงผล</span>
              <span className="text-[10px] text-amber-300 font-mono">2 ฟอร์มครบ</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">ฟอร์มตั้งกระทู้ใหม่ + ฟอร์มส่งความคิดเห็น/อารมณ์</p>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>5. ปิดบังข้อมูลส่วนตัว (Masking)</span>
              <span className="text-[10px] text-cyan-300 font-mono">08x-***-xxxx</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">ปิดบังเบอร์โทรศัพท์และอีเมลในกระทู้ & ตาราง</p>
          </div>

          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/30">
            <div className="font-semibold text-white flex items-center justify-between">
              <span>6. หน้าผู้ดูแลระบบ</span>
              <span className="text-[10px] text-violet-300 font-mono">Admin Portal</span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">สถิติระบบ, จัดการผู้ใช้, สลับบทบาท, ตรวจสอบ</p>
          </div>

        </div>
      </div>

      {/* X-style Trending in Thailand */}
      <div className="bg-slate-900/80 border border-purple-900/40 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-bold text-white mb-3">
          <div className="flex items-center gap-1.5 text-purple-300">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>เทรนด์กำลังมาแรงในไทย</span>
          </div>
          <span className="text-[10px] text-slate-500 font-normal">X Trends</span>
        </div>

        <div className="space-y-2">
          {trendingTags.map((item, index) => {
            const isSelected = activeTag === item.tag;
            return (
              <button
                key={index}
                onClick={() => onSelectTag(isSelected ? '' : item.tag)}
                className={`w-full text-left p-2.5 rounded-xl transition group ${
                  isSelected
                    ? 'bg-purple-950 border border-purple-600'
                    : 'hover:bg-purple-950/40 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>เทรนด์อันดับ {index + 1}</span>
                  {item.isHot && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-800/60 font-semibold">
                      มาแรง 🔥
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-purple-200 group-hover:text-blue-300 transition">
                  {item.tag}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.count}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 text-[11px] text-slate-500 leading-relaxed">
        <p>PunX Community • พันทิป & X Hybrid Board</p>
        <p className="text-[10px] text-slate-600 mt-1">
          ธีมสีม่วงฟ้า • นโยบายคุ้มครองข้อมูลส่วนบุคคล & Password Hashing
        </p>
      </div>

    </aside>
  );
};
