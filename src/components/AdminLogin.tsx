import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import { X, LogIn, LogOut, UserPlus, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  currentUser: User | null;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export default function AdminLogin({ currentUser, onClose, theme }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ALLOWED_ADMINS = ['heoha78@gmail.com', 'macaron010@naver.com'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    if (!ALLOWED_ADMINS.includes(trimmedEmail)) {
      setError('지정된 포트폴리오 소유자(관리자) 이메일이 아닙니다. 보안을 위해 다른 계정은 관리자로 가입하거나 로그인할 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // Registering a new admin account
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        // Logging in
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('존재하지 않는 계정입니다. 최초 가입이 필요합니다.');
      } else if (err.code === 'auth/wrong-password') {
        setError('비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 최소 6자리 이상이어야 합니다.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('이미 등록된 이메일입니다. 로그인 창을 이용해 주세요.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('현재 Firebase 콘솔에서 [이메일/비밀번호] 로그인 공급업체가 활성화되어 있지 않습니다. Firebase 콘솔 -> Authentication -> Sign-in method 메뉴에서 [이메일/비밀번호] 상태를 [사용 설정]으로 활성화해주시면 바로 가입/로그인이 가능합니다.');
      } else {
        setError(err.message || '인증 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div 
        id="admin-auth-card"
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-[#FAF9F6] border-neutral-200 text-[#222222]' 
            : 'bg-[#222222] border-neutral-800 text-[#FAF9F6]'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'}`}>
              <ShieldAlert size={18} />
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight">
              {currentUser ? '관리자 프로필' : (isRegistering ? '관리자 가입' : '관리자 로그인')}
            </h2>
          </div>
          <button 
            id="close-login-btn"
            onClick={onClose} 
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-500 font-sans">
            {error}
          </div>
        )}

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-neutral-500/5 border border-neutral-500/10">
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-mono">현재 로그인된 관리자</p>
              <p className="font-semibold font-sans mt-1 break-all">{currentUser.email}</p>
              <p className="text-xs text-green-500 mt-2 flex items-center gap-1 font-mono">
                ● AUTHORIZED WRITER
              </p>
            </div>
            
            <button
              id="admin-logout-btn"
              onClick={handleSignOut}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-sans font-medium text-sm border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                이메일 주소
              </label>
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gunwoo@example.com"
                className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none focus:ring-1 ${
                  theme === 'light'
                    ? 'bg-white border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900'
                    : 'bg-neutral-900 border-neutral-800 focus:border-white focus:ring-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">
                비밀번호
              </label>
              <input
                id="admin-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none focus:ring-1 ${
                  theme === 'light'
                    ? 'bg-white border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900'
                    : 'bg-neutral-900 border-neutral-800 focus:border-white focus:ring-white'
                }`}
              />
            </div>

            <button
              id="admin-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-sans font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-95'
              } ${
                theme === 'light'
                  ? 'bg-[#222222] text-[#FAF9F6]'
                  : 'bg-[#FAF9F6] text-[#222222]'
              }`}
            >
              {isRegistering ? <UserPlus size={16} /> : <LogIn size={16} />}
              {loading ? '인증 진행 중...' : (isRegistering ? '관리자 가입하기' : '관리자 로그인')}
            </button>

            <div className="pt-3 text-center border-t border-neutral-500/10 mt-4 space-y-2">
              <button
                id="toggle-register-btn"
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs hover:underline text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-all font-sans cursor-pointer font-medium"
              >
                {isRegistering ? '이미 관리자 계정이 있으신가요? 로그인' : '최초 관리자이신가요? 가입하기'}
              </button>
              <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                * 지정된 관리자 이메일(heoha78@gmail.com / macaron010@naver.com)만 가입/로그인이 허용됩니다. 다른 주소는 차단됩니다.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
