import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Project } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import GithubRepoWidget from './GithubRepoWidget';
import { ArrowLeft, Github, Globe, Calendar, Briefcase, Search, ArrowRight, Image as ImageIcon, X } from 'lucide-react';

interface ProjectTabProps {
  theme: 'light' | 'dark';
}

export default function ProjectTab({ theme }: ProjectTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Subscribe to projects collection
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      setProjects(projList);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'projects');
    });

    return () => unsubscribe();
  }, []);

  // Filter based on search query
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  if (selectedProj) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-4 animate-fade-in">
        {/* Back Button */}
        <button
          id="back-to-projects-btn"
          onClick={() => setSelectedProj(null)}
          className={`flex items-center gap-2 text-sm font-sans font-semibold mb-4 hover:opacity-75 transition-opacity cursor-pointer ${
            theme === 'light' ? 'text-[#222222]' : 'text-[#FAF9F6]'
          }`}
        >
          <ArrowLeft size={18} />
          프로젝트 전체 목록
        </button>

        {/* Project Expanded Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 items-center text-xs font-mono text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {selectedProj.period}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {selectedProj.role}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight leading-tight">
            {selectedProj.title}
          </h1>

          <p className="text-base md:text-lg text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed">
            {selectedProj.description}
          </p>

          {/* External Action Buttons */}
          <div className="flex flex-wrap gap-3.5 pt-2">
            {selectedProj.githubUrl && (
              <a
                id="proj-detail-github-link"
                href={selectedProj.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-3 rounded-xl text-sm font-semibold font-mono flex items-center gap-2 border transition-all ${
                  theme === 'light' 
                    ? 'border-neutral-200 hover:bg-neutral-100 text-neutral-800' 
                    : 'border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                }`}
              >
                <Github size={16} />
                SOURCE CODE
              </a>
            )}

            {selectedProj.liveUrl && (
              <a
                id="proj-detail-live-link"
                href={selectedProj.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-3 rounded-xl text-sm font-semibold font-mono flex items-center gap-2 transition-all hover:opacity-90 ${
                  theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                }`}
              >
                <Globe size={16} />
                LIVE DEMO
              </a>
            )}
          </div>

          {/* Project Image Banner */}
          {selectedProj.imageUrl && (
            <div className="w-full max-h-[480px] overflow-hidden rounded-2xl border border-neutral-500/15 shadow-md">
              <img
                src={selectedProj.imageUrl}
                alt={selectedProj.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Detailed Project Story via Markdown */}
        <div className={`p-8 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <div className="border-b border-neutral-500/15 pb-4 mb-6">
            <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">Technical Core</h3>
            <div className="flex flex-wrap gap-2">
              {selectedProj.techStack.map((tech, idx) => (
                <span 
                  key={idx} 
                  className={`text-xs font-mono px-3 py-1 rounded-lg ${
                    theme === 'light' ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-4">Project Narrative & Outcome</h3>
          <MarkdownRenderer content={selectedProj.content} attachments={selectedProj.attachments} />

          {/* Attached Photos Gallery */}
          {selectedProj.attachments && selectedProj.attachments.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-neutral-500/15 mt-8 animate-fade-in">
              <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-2">
                <ImageIcon size={14} className="text-neutral-500" />
                첨부 이미지 ({selectedProj.attachments.length}개)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedProj.attachments.map((url, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setLightboxImage(url)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-neutral-500/10 bg-neutral-500/5 shadow-sm hover:shadow-md transition-all cursor-zoom-in"
                  >
                    <img
                      src={url}
                      alt={`attachment-${idx}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-sans font-semibold bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">크게 보기</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GitHub Repository Explorer & Contributors Widget */}
        <GithubRepoWidget 
          githubUrl={selectedProj.githubUrl} 
          manualParticipants={selectedProj.participants} 
          theme={theme} 
        />

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-[#FAF9F6] hover:opacity-75 transition-opacity"
              onClick={() => setLightboxImage(null)}
              aria-label="닫기"
            >
              <X size={28} />
            </button>
            <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl" onClick={e => e.stopPropagation()}>
              <img 
                src={lightboxImage} 
                alt="Lightbox View" 
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
                referrerPolicy="no-referrer" 
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Intro and Search */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-sans font-black tracking-tight">Engineering Works</h2>
          <p className="text-sm font-sans text-neutral-500 uppercase tracking-widest">배건우의 실전 개발 아카이브 및 가치 입증</p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-3.5 text-neutral-500" size={18} />
          <input
            id="project-search-input"
            type="text"
            placeholder="기술 스택이나 프로젝트명으로 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm font-sans border focus:outline-none focus:ring-1 ${
              theme === 'light'
                ? 'bg-[#FAF9F6] border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 text-neutral-800'
                : 'bg-[#222222] border-neutral-800 focus:border-white focus:ring-white text-neutral-200'
            }`}
          />
        </div>
      </div>

      {/* Projects Display Grid */}
      {loading ? (
        <div className="text-center py-24 text-sm text-neutral-500 font-mono">프로젝트 불러오는 중...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-neutral-500/20 rounded-2xl max-w-xl mx-auto space-y-4">
          <p className="text-neutral-500 font-sans">
            {searchQuery ? '일치하는 프로젝트가 없습니다.' : '아직 등록된 프로젝트가 없습니다.'}
          </p>
          {!searchQuery && (
            <p className="text-xs text-neutral-400 font-sans">
              우측 상단의 관리자 패널(Admin)을 클릭하여 새 가치를 업로드 해보세요!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((proj) => (
            <div
              id={`project-card-${proj.id}`}
              key={proj.id}
              onClick={() => setSelectedProj(proj)}
              className={`rounded-2xl border overflow-hidden cursor-pointer group flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                theme === 'light' 
                  ? 'bg-white border-neutral-200/80 shadow-sm' 
                  : 'bg-neutral-900 border-neutral-800/80 shadow-lg'
              }`}
            >
              <div className="flex flex-col">
                {/* Cover Image */}
                {proj.imageUrl && (
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="text-[10px] bg-neutral-900/80 backdrop-blur-md text-[#FAF9F6] px-3 py-1 rounded-full font-mono font-semibold tracking-wider">
                        {proj.period}
                      </span>
                    </div>
                  </div>
                )}

                {/* Info Area */}
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center gap-2.5 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                    <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">
                      {proj.role}
                    </span>
                  </div>

                  <h3 className="font-bold text-xl md:text-2xl font-sans tracking-tight group-hover:underline">
                    {proj.title}
                  </h3>

                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-sans leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>
                </div>
              </div>

              {/* Bottom Tech Tags & Navigation Trigger */}
              <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-col gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.slice(0, 4).map((tech, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-lg ${
                        theme === 'light' ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-800/80 text-neutral-300'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                  {proj.techStack.length > 4 && (
                    <span className="text-[10px] font-mono text-neutral-500 px-1 py-1">
                      +{proj.techStack.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold font-sans group-hover:translate-x-1 transition-transform">
                  자세히 보기
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
