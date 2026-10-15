import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Phone, User, ShieldCheck, CheckCircle2, AlertCircle, Key, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, switchDemoUser, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!username || !password) {
          throw new Error('กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน');
        }
        await login(username, password);
        onClose();
      } else {
        // Register validations
        if (!username || !password || !email) {
          throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
        }
        if (password.length < 6) {
          throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        }
        if (password !== confirmPassword) {
          throw new Error('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        }

        await register({
          username,
          displayName: displayName || username,
          password,
          email,
          phoneNumber,
          citizenId,
          bio,
        });

        setSuccess('สมัครสมาชิกสำเร็จ! บันทึกรหัสผ่านด้วย bcrypt Hashing เรียบร้อยแล้ว');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (usr: string) => {
    setError(null);
    setLoading(true);
    try {
      await switchDemoUser(usr);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-800/60 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 mb-3 shadow-lg shadow-purple-600/30">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'เข้าสู่ระบบ PunX' : 'สมัครสมาชิกใหม่'}
          </h2>
          <p className="text-xs text-purple-300/80 mt-1">
            {mode === 'login'
              ? 'ยินดีต้อนรับกลับสู่เว็ปบอร์ดไฮบริดม่วงฟ้า'
              : 'สร้างบัญชีเพื่อตั้งกระทู้และแลกเปลี่ยนความเห็น'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-4 border border-purple-900/40">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              mode === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            สมัครสมาชิก (Password Hashing)
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/70 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Username / Login ID */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {mode === 'login' ? 'ชื่อผู้ใช้ หรือ อีเมล' : 'ชื่อผู้ใช้ (Username)'}
                <span className="text-red-400 ml-0.5">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'เช่น somchai_pantip หรือ admin_official' : 'เช่น pun_x_lover'}
                  className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Register Extra Fields */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ชื่อแสดงผล (Display Name)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น คุณหมอสายไอที หรือ สาวกเฉลิมไทย"
                    className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    อีเมล (Email) <span className="text-red-400">*</span>
                    <span className="text-[10px] text-purple-400 ml-1.5">(จะถูก Masking ปกปิด)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Personal Data Field to be Masked: Phone Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-300">
                      เบอร์โทรศัพท์ (Phone Number)
                    </label>
                    <span className="text-[10px] text-purple-400 font-semibold bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/50">
                      🔒 ปิดบัง 08x-***-xxxx (Masked)
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="เช่น 0891234567"
                      className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    เบอร์โทรศัพท์จะถูกซ่อนจากผู้ใช้อื่น และแสดงแบบ Masking เพื่อความปลอดภัย
                  </p>
                </div>

                {/* Citizen ID or Pantip Member Verification ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    เลขบัตรประชาชน / สมาชิกยืนยันตัวตน
                    <span className="text-[10px] text-purple-400 ml-1.5">(Masking อัตโนมัติ)</span>
                  </label>
                  <input
                    type="text"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    placeholder="เช่น 1-1002-34567-89-0"
                    className="w-full bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  รหัสผ่าน (Password) <span className="text-red-400">*</span>
                </label>
                {mode === 'register' && (
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    bcrypt Hashed
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                  className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ยืนยันรหัสผ่านอีกครั้ง <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านเดิมให้ตรงกัน"
                    className="w-full bg-slate-950 border border-purple-900/50 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300/90 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
              <div>
                <strong>การรักษาความปลอดภัย:</strong> รหัสผ่านจะถูกเข้ารหัสด้วย <code>bcrypt.hash</code> แบบ One-way Salted Hash ระบบไม่เก็บรหัสผ่านเป็น Plaintext เด็ดขาด
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/30 transition disabled:opacity-50 mt-2"
            >
              {loading
                ? 'กำลังดำเนินการ...'
                : mode === 'login'
                ? 'เข้าสู่ระบบ'
                : 'สร้างบัญชีผู้ใช้'}
            </button>

            {/* Google Firebase Login Button */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-purple-900/40"></div>
              <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase tracking-wider">หรือ</span>
              <div className="flex-grow border-t border-purple-900/40"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await loginWithGoogle();
                  onClose();
                } catch (err: any) {
                  setError(err.message || 'การเข้าสู่ระบบด้วย Google ล้มเหลว');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-900 transition flex items-center justify-center gap-2 shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>เข้าสู่ระบบด้วย Google (Firebase Auth)</span>
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          {mode === 'login' && (
            <div className="mt-5 pt-4 border-t border-purple-900/30">
              <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>⚡ บัญชีทดสอบระบบพร้อมใช้ (1-Click):</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin_official')}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-purple-950/60 text-left border border-purple-900/40 text-xs flex items-center justify-between group transition"
                >
                  <span className="font-semibold text-purple-300">🛡️ Admin (แอดมินระบบ)</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white">คลิกเพื่อล็อกอิน →</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('somchai_pantip')}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-blue-950/60 text-left border border-blue-900/40 text-xs flex items-center justify-between group transition"
                >
                  <span className="font-semibold text-blue-300">👤 สมชาย เซียนพันทิป (User A)</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white">คลิกเพื่อล็อกอิน →</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('nong_x_trendy')}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-pink-950/60 text-left border border-pink-900/40 text-xs flex items-center justify-between group transition"
                >
                  <span className="font-semibold text-pink-300">👤 น้องเอ็กซ์ สายเทรนด์ (User B)</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-white">คลิกเพื่อล็อกอิน →</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
