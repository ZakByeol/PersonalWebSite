import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ActiveTab, Theme, Profile } from './types';

// Components
import CanvasBackground from './components/CanvasBackground';
import LandingTab from './components/LandingTab';
import BlogTab from './components/BlogTab';
import ProjectTab from './components/ProjectTab';
import GalleryTab from './components/GalleryTab';
import PlaylistTab from './components/PlaylistTab';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

// Icons
import { Sun, Moon, Shield, Sparkles, UserCheck, Menu, X, LogOut, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Monitor Profile State
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'profile', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as Profile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'profile/main');
    });
    return () => unsubscribe();
  }, []);

  // Update theme cache
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div 
      className={`min-h-screen relative flex flex-col transition-colors duration-1000 ${
        theme === 'light' 
          ? 'bg-[#FAF9F6] text-[#222222]' 
          : 'bg-[#222222] text-[#FAF9F6]'
      }`}
    >
      {/* Interactive 3D Canvas Background */}
      <CanvasBackground theme={theme} />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-500/10 backdrop-blur-md bg-transparent transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <button 
            id="logo-home-btn"
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm transition-transform group-hover:rotate-6 ${
              theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
            }`}>
              B
            </div>
            <span className="font-sans font-black tracking-tight text-lg">
              배건우<span className="text-emerald-400 font-bold">.</span>
            </span>
          </button>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              id="nav-home"
              onClick={() => setActiveTab('home')}
              className={`text-sm font-sans font-bold transition-colors cursor-pointer relative py-1 ${
                activeTab === 'home' ? 'text-inherit' : 'text-neutral-400 hover:text-inherit'
              }`}
            >
              소개
              {activeTab === 'home' && (
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded ${theme === 'light' ? 'bg-[#222222]' : 'bg-[#FAF9F6]'}`} />
              )}
            </button>

            <button
              id="nav-blog"
              onClick={() => setActiveTab('blog')}
              className={`text-sm font-sans font-bold transition-colors cursor-pointer relative py-1 ${
                activeTab === 'blog' ? 'text-inherit' : 'text-neutral-400 hover:text-inherit'
              }`}
            >
              블로그
              {activeTab === 'blog' && (
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded ${theme === 'light' ? 'bg-[#222222]' : 'bg-[#FAF9F6]'}`} />
              )}
            </button>

            <button
              id="nav-projects"
              onClick={() => setActiveTab('projects')}
              className={`text-sm font-sans font-bold transition-colors cursor-pointer relative py-1 ${
                activeTab === 'projects' ? 'text-inherit' : 'text-neutral-400 hover:text-inherit'
              }`}
            >
              프로젝트
              {activeTab === 'projects' && (
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded ${theme === 'light' ? 'bg-[#222222]' : 'bg-[#FAF9F6]'}`} />
              )}
            </button>

            <button
              id="nav-gallery"
              onClick={() => setActiveTab('gallery')}
              className={`text-sm font-sans font-bold transition-colors cursor-pointer relative py-1 ${
                activeTab === 'gallery' ? 'text-inherit' : 'text-neutral-400 hover:text-inherit'
              }`}
            >
              갤러리
              {activeTab === 'gallery' && (
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded ${theme === 'light' ? 'bg-[#222222]' : 'bg-[#FAF9F6]'}`} />
              )}
            </button>

            <button
              id="nav-playlist"
              onClick={() => setActiveTab('playlist')}
              className={`text-sm font-sans font-bold transition-colors cursor-pointer relative py-1 ${
                activeTab === 'playlist' ? 'text-inherit' : 'text-neutral-400 hover:text-inherit'
              }`}
            >
              플레이리스트
              {activeTab === 'playlist' && (
                <span className={`absolute bottom-0 left-0 w-full h-[2px] rounded ${theme === 'light' ? 'bg-[#222222]' : 'bg-[#FAF9F6]'}`} />
              )}
            </button>
          </nav>

          {/* Toolbar Actions */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                theme === 'light' 
                  ? 'bg-white border-neutral-200 text-neutral-800' 
                  : 'bg-neutral-900 border-neutral-800 text-neutral-200'
              }`}
              aria-label="테마 전환"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Admin Session Workspace */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="header-admin-panel-btn"
                  onClick={() => setIsAdminPanelOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold font-mono tracking-wider uppercase border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/20 transition-colors"
                >
                  <Sparkles size={12} className="animate-spin" />
                  STUDIO
                </button>
                <button
                  id="header-logout-btn"
                  onClick={handleSignOut}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:text-red-500 ${
                    theme === 'light' ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-900'
                  }`}
                  title="관리자 로그아웃"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => setIsLoginModalOpen(true)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-105 ${
                  theme === 'light' 
                    ? 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-800' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-100'
                }`}
                aria-label="관리자 로그인"
              >
                <Shield size={16} />
              </button>
            )}
          </div>

          {/* Mobile Menu Action */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              id="mobile-theme-toggle"
              onClick={toggleTheme}
              className={`p-2 rounded-xl border ${
                theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border ${
                theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Slider Menu */}
      {mobileMenuOpen && (
        <div className={`fixed inset-x-0 top-16 z-30 md:hidden border-b transition-all duration-300 ${
          theme === 'light' ? 'bg-[#FAF9F6] border-neutral-200' : 'bg-[#222222] border-neutral-800'
        }`}>
          <div className="px-6 py-4 flex flex-col gap-4">
            <button
              id="mobile-nav-home"
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`text-left text-sm font-semibold font-sans flex items-center justify-between ${
                activeTab === 'home' ? 'text-emerald-400' : 'text-inherit'
              }`}
            >
              소개 <ChevronRight size={14} />
            </button>
            <button
              id="mobile-nav-blog"
              onClick={() => { setActiveTab('blog'); setMobileMenuOpen(false); }}
              className={`text-left text-sm font-semibold font-sans flex items-center justify-between ${
                activeTab === 'blog' ? 'text-emerald-400' : 'text-inherit'
              }`}
            >
              블로그 <ChevronRight size={14} />
            </button>
            <button
              id="mobile-nav-projects"
              onClick={() => { setActiveTab('projects'); setMobileMenuOpen(false); }}
              className={`text-left text-sm font-semibold font-sans flex items-center justify-between ${
                activeTab === 'projects' ? 'text-emerald-400' : 'text-inherit'
              }`}
            >
              프로젝트 <ChevronRight size={14} />
            </button>

            <button
              id="mobile-nav-gallery"
              onClick={() => { setActiveTab('gallery'); setMobileMenuOpen(false); }}
              className={`text-left text-sm font-semibold font-sans flex items-center justify-between ${
                activeTab === 'gallery' ? 'text-emerald-400' : 'text-inherit'
              }`}
            >
              갤러리 <ChevronRight size={14} />
            </button>

            <button
              id="mobile-nav-playlist"
              onClick={() => { setActiveTab('playlist'); setMobileMenuOpen(false); }}
              className={`text-left text-sm font-semibold font-sans flex items-center justify-between ${
                activeTab === 'playlist' ? 'text-emerald-400' : 'text-inherit'
              }`}
            >
              플레이리스트 <ChevronRight size={14} />
            </button>

            {currentUser ? (
              <div className="pt-2 border-t border-neutral-500/10 flex items-center justify-between gap-2">
                <button
                  id="mobile-studio-btn"
                  onClick={() => { setIsAdminPanelOpen(true); setMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 rounded-xl text-center text-xs font-semibold bg-emerald-500 text-white flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={12} />
                  창작자 스튜디오
                </button>
                <button
                  id="mobile-logout-btn"
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-red-500 ${
                    theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                  }`}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                id="mobile-login-btn"
                onClick={() => { setIsLoginModalOpen(true); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 rounded-xl text-center text-xs font-semibold font-sans border ${
                  theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                관리자 인증 로그인
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Page Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 z-10">
        {activeTab === 'home' && (
          <LandingTab theme={theme} profile={profile} onNavigate={(tab) => setActiveTab(tab)} />
        )}
        {activeTab === 'blog' && (
          <BlogTab theme={theme} />
        )}
        {activeTab === 'projects' && (
          <ProjectTab theme={theme} />
        )}
        {activeTab === 'gallery' && (
          <GalleryTab theme={theme} />
        )}
        {activeTab === 'playlist' && (
          <PlaylistTab theme={theme} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-500/10 py-10 z-10 mt-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p className="text-xs text-neutral-500 font-sans">
              &copy; {new Date().getFullYear()} 배건우. All rights reserved.
            </p>
            <p className="text-[10px] text-neutral-400 font-mono">
              PROUDLY DEPLOYED ON GOOGLE CLOUD PLATFORM (GCP e2-micro)
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              id="footer-nav-home"
              onClick={() => setActiveTab('home')} 
              className="text-xs font-sans text-neutral-500 hover:text-inherit transition-colors cursor-pointer"
            >
              소개
            </button>
            <button 
              id="footer-nav-blog"
              onClick={() => setActiveTab('blog')} 
              className="text-xs font-sans text-neutral-500 hover:text-inherit transition-colors cursor-pointer"
            >
              블로그
            </button>
            <button 
              id="footer-nav-projects"
              onClick={() => setActiveTab('projects')} 
              className="text-xs font-sans text-neutral-500 hover:text-inherit transition-colors cursor-pointer"
            >
              프로젝트
            </button>
            <button 
              id="footer-nav-gallery"
              onClick={() => setActiveTab('gallery')} 
              className="text-xs font-sans text-neutral-500 hover:text-inherit transition-colors cursor-pointer"
            >
              갤러리
            </button>
            <button 
              id="footer-nav-playlist"
              onClick={() => setActiveTab('playlist')} 
              className="text-xs font-sans text-neutral-500 hover:text-inherit transition-colors cursor-pointer"
            >
              플레이리스트
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal Overlay */}
      {isLoginModalOpen && (
        <AdminLogin 
          currentUser={currentUser} 
          theme={theme}
          onClose={() => setIsLoginModalOpen(false)} 
        />
      )}

      {/* Creator Studio Control Hub Overlay */}
      {isAdminPanelOpen && (
        <AdminPanel 
          theme={theme}
          onClose={() => setIsAdminPanelOpen(false)} 
        />
      )}
    </div>
  );
}
