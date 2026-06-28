import { useState, useEffect } from 'react';
import { Github, Folder, File, ArrowLeft, Users, ChevronRight, CornerDownRight, Code2, AlertCircle } from 'lucide-react';

interface GithubRepoWidgetProps {
  githubUrl: string | undefined;
  manualParticipants?: string[];
  theme: 'light' | 'dark';
}

interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  url?: string;
  download_url?: string;
}

interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export default function GithubRepoWidget({ githubUrl, manualParticipants = [], theme }: GithubRepoWidgetProps) {
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  
  // File view state
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  // Contributors state
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Fallback simulated repository files (for private, rate-limited, or offline scenarios)
  const simulatedFiles: Record<string, RepoFile[]> = {
    '': [
      { name: 'src', path: 'src', type: 'dir' },
      { name: 'public', path: 'public', type: 'dir' },
      { name: 'package.json', path: 'package.json', type: 'file' },
      { name: 'tailwind.config.js', path: 'tailwind.config.js', type: 'file' },
      { name: 'README.md', path: 'README.md', type: 'file' }
    ],
    'src': [
      { name: 'components', path: 'src/components', type: 'dir' },
      { name: 'App.tsx', path: 'src/App.tsx', type: 'file' },
      { name: 'main.tsx', path: 'src/main.tsx', type: 'file' },
      { name: 'index.css', path: 'src/index.css', type: 'file' }
    ],
    'src/components': [
      { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file' },
      { name: 'Footer.tsx', path: 'src/components/Footer.tsx', type: 'file' },
      { name: 'Dashboard.tsx', path: 'src/components/Dashboard.tsx', type: 'file' }
    ],
    'public': [
      { name: 'favicon.ico', path: 'public/favicon.ico', type: 'file' },
      { name: 'logo.png', path: 'public/logo.png', type: 'file' }
    ]
  };

  const simulatedFileContents: Record<string, string> = {
    'package.json': `{
  "name": "developer-portfolio-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "lucide-react": "^0.450.0"
  }
}`,
    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}`,
    'README.md': `# 🚀 Project Showcase

This repository displays high-quality full-stack engineering deliverables.
Created with dedication, speed, and standard lint safety structures.

## Core Pillars
- Modern component decoupling.
- Standard client-side state caching.
- Seamless Tailwind layouts.

*Fully integrated with GitHub Live Actions.*`,
    'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    'src/index.css': `@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;
  --font-mono: "Fira Code", monospace;
}`,
    'src/App.tsx': `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center">
      <h1 className="text-4xl font-extrabold tracking-tight">System Boot Successful</h1>
      <p className="text-neutral-500 mt-2 font-mono">Running on Vercel Edge Serverless Engine</p>
    </div>
  );
}`,
    'src/components/Header.tsx': `export default function Header() {
  return (
    <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
      <span className="font-bold tracking-tight">WORKSPACE</span>
    </header>
  );
}`,
    'src/components/Footer.tsx': `export default function Footer() {
  return (
    <footer className="py-6 text-center text-xs text-neutral-500">
      &copy; Workspace Core. All rights reserved.
    </footer>
  );
}`,
    'src/components/Dashboard.tsx': `export default function Dashboard() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Workspace Overview</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">Active Threads</div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">Build Logs</div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">Uptime Metric</div>
      </div>
    </div>
  );
}`
  };

  // 1. Parse Owner & Repo
  useEffect(() => {
    if (!githubUrl) {
      setRepoInfo(null);
      return;
    }
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '');
      setRepoInfo({ owner, repo });
      setCurrentPath('');
      setSelectedFile(null);
    } else {
      setRepoInfo(null);
    }
  }, [githubUrl]);

  // 2. Fetch Files (API or Fallback)
  const fetchFiles = async (path: string) => {
    if (!repoInfo) {
      // No valid GitHub repo: show simulated files
      setFiles(simulatedFiles[path] || simulatedFiles['']);
      return;
    }

    setLoadingFiles(true);
    setApiError(null);
    try {
      const res = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`);
      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const formattedFiles: RepoFile[] = data.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type === 'dir' ? 'dir' : 'file',
          url: item.url,
          download_url: item.download_url
        }));
        setFiles(formattedFiles);
      } else {
        throw new Error('Expected array of files');
      }
    } catch (err) {
      console.warn('GitHub API failed, falling back to simulated sandbox files:', err);
      setApiError('GitHub API 레이트 제한 혹은 비공개 리포지토리입니다. 데모 모드로 파일 트리를 조회합니다.');
      // Fall back gracefully
      setFiles(simulatedFiles[path] || simulatedFiles['']);
    } finally {
      setLoadingFiles(false);
    }
  };

  // 3. Fetch Single File Content (API or Fallback)
  const fetchFileContent = async (file: RepoFile) => {
    setSelectedFile(file);
    setLoadingContent(true);
    try {
      if (file.download_url) {
        const res = await fetch(file.download_url);
        if (res.ok) {
          const text = await res.text();
          setFileContent(text);
          setLoadingContent(false);
          return;
        }
      }
      throw new Error('No download URL available');
    } catch (err) {
      console.warn('Could not fetch file content, falling back to template content:', err);
      // Fallback
      setFileContent(simulatedFileContents[file.path] || `// ${file.name}\n\n// Content preview is restricted or binary.`);
    } finally {
      setLoadingContent(false);
    }
  };

  // 4. Fetch Contributors
  useEffect(() => {
    if (!repoInfo) {
      setContributors([]);
      return;
    }

    const fetchContributors = async () => {
      setLoadingContributors(true);
      try {
        const res = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contributors`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setContributors(data.slice(0, 8)); // top 8 contributors
          }
        }
      } catch (err) {
        console.warn('Error fetching contributors:', err);
      } finally {
        setLoadingContributors(false);
      }
    };

    fetchContributors();
  }, [repoInfo]);

  // Initial files load
  useEffect(() => {
    fetchFiles(currentPath);
  }, [repoInfo, currentPath]);

  const handleDirectoryClick = (dirPath: string) => {
    setCurrentPath(dirPath);
    setSelectedFile(null);
  };

  const handleGoBack = () => {
    if (selectedFile) {
      setSelectedFile(null);
      return;
    }
    
    if (currentPath === '') return;
    
    const parts = currentPath.split('/');
    parts.pop();
    const parentPath = parts.join('/');
    setCurrentPath(parentPath);
  };

  return (
    <div className="space-y-6">
      {/* 1. Coworker / Participant Visualizer */}
      <div className={`p-6 rounded-2xl border ${
        theme === 'light' ? 'bg-neutral-50/50 border-neutral-200' : 'bg-[#181818] border-neutral-800'
      }`}>
        <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3.5 flex items-center gap-1.5">
          <Users size={14} className="text-emerald-500" />
          Project Contributors & Coworkers
        </h4>

        {/* Manual participants defined in Admin Panel */}
        {manualParticipants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 border-b border-neutral-500/5 pb-3">
            <span className="text-[10px] text-neutral-400 font-sans mr-1 mt-1">프로젝트 팀원:</span>
            {manualParticipants.map((p, idx) => (
              <span 
                key={idx} 
                className={`text-xs font-sans px-2.5 py-0.5 rounded-full ${
                  theme === 'light' ? 'bg-white border border-neutral-200 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {p}
              </span>
            ))}
          </div>
        )}

        {/* GitHub contributors live fetch */}
        {githubUrl ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-neutral-400 font-mono">GITHUB REPO COWORKERS (실시간 동기화)</span>
            </div>
            
            {loadingContributors ? (
              <div className="flex gap-2 items-center text-xs text-neutral-400 font-mono py-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                기여자 목록 로드 중...
              </div>
            ) : contributors.length === 0 ? (
              <p className="text-xs text-neutral-400 font-sans italic py-1">
                기여자 데이터를 불러오지 못했거나 1인 개발 리포지토리입니다.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {contributors.map((c) => (
                  <a
                    key={c.id}
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all hover:scale-[1.02] ${
                      theme === 'light' ? 'bg-white border-neutral-200 hover:border-neutral-400' : 'bg-[#1e1e1e] border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    <img 
                      src={c.avatar_url} 
                      alt={c.login} 
                      className="w-7 h-7 rounded-full border border-neutral-500/20"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold font-sans truncate">{c.login}</p>
                      <p className="text-[9px] text-neutral-400 font-mono truncate">{c.contributions} Commits</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          !manualParticipants.length && (
            <p className="text-xs text-neutral-500 font-sans italic">기입된 참가자가 없습니다.</p>
          )
        )}
      </div>

      {/* 2. GitHub Repository File Explorer Widget */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === 'light' ? 'bg-white border-neutral-200 shadow-sm' : 'bg-[#1c1c1c] border-neutral-800 shadow-lg'
      }`}>
        {/* Widget Header */}
        <div className="px-5 py-3.5 border-b border-neutral-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-neutral-500/5">
          <div className="flex items-center gap-2">
            <Github size={16} className="text-neutral-400" />
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Repository Repository Explorer
            </h4>
          </div>
          {repoInfo ? (
            <span className="text-[10px] font-mono bg-neutral-500/10 text-neutral-400 px-2.5 py-0.5 rounded">
              {repoInfo.owner}/{repoInfo.repo}
            </span>
          ) : (
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded font-semibold flex items-center gap-1">
              <Code2 size={11} /> DEMO WORKSPACE
            </span>
          )}
        </div>

        {apiError && (
          <div className="mx-4 mt-3 p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2 text-[10px] text-amber-500 font-sans leading-relaxed">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <p>{apiError}</p>
          </div>
        )}

        {/* File System layout */}
        <div className="h-[360px] flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-l divide-neutral-500/10">
          
          {/* File Tree Panel */}
          <div className="w-full md:w-5/12 p-3 overflow-y-auto h-1/2 md:h-full">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-500/5 mb-2">
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                DIRECTORY: /{currentPath}
              </span>
              {(currentPath !== '' || selectedFile) && (
                <button
                  onClick={handleGoBack}
                  className="text-[9px] font-mono flex items-center gap-0.5 px-2 py-0.5 rounded border border-neutral-500/20 hover:bg-neutral-500/10 cursor-pointer"
                >
                  <ArrowLeft size={10} /> Back
                </button>
              )}
            </div>

            {loadingFiles ? (
              <div className="flex items-center justify-center h-48 text-xs text-neutral-400 font-mono">
                파일 목록 동기화 중...
              </div>
            ) : (
              <div className="space-y-1">
                {files.map((file) => {
                  const isDir = file.type === 'dir';
                  return (
                    <button
                      key={file.path}
                      onClick={() => isDir ? handleDirectoryClick(file.path) : fetchFileContent(file)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-sans flex items-center justify-between group transition-colors cursor-pointer ${
                        selectedFile?.path === file.path
                          ? theme === 'light' ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'bg-neutral-800 text-white font-semibold'
                          : theme === 'light' ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800/50 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isDir ? (
                          <Folder size={14} className="text-yellow-500 shrink-0" />
                        ) : (
                          <File size={14} className="text-neutral-400 shrink-0" />
                        )}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Code Viewer Panel */}
          <div className="w-full md:w-7/12 p-4 overflow-hidden h-1/2 md:h-full flex flex-col justify-between bg-neutral-500/5">
            {selectedFile ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-500/10 mb-2">
                  <span className="text-[10px] font-mono font-semibold truncate flex items-center gap-1">
                    <CornerDownRight size={11} className="text-emerald-500" />
                    {selectedFile.name}
                  </span>
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                    CODE PREVIEW
                  </span>
                </div>

                <div className="flex-1 overflow-auto bg-black/10 dark:bg-black/40 border border-neutral-500/5 rounded-xl p-3 font-mono text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {loadingContent ? (
                    <div className="flex items-center justify-center h-full">코딩 로드 중...</div>
                  ) : (
                    <pre className="whitespace-pre">
                      {fileContent.split('\n').map((line, i) => (
                        <div key={i} className="table-row">
                          <span className="table-cell text-right pr-3 select-none text-neutral-400 opacity-60 w-6">{i + 1}</span>
                          <span className="table-cell break-all">{line}</span>
                        </div>
                      ))}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                <Code2 size={36} className="text-neutral-300 dark:text-neutral-700 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-sans font-bold">인터랙티브 파일 조회가 준비되었습니다</p>
                  <p className="text-[10px] font-sans text-neutral-400 max-w-xs leading-normal">
                    왼쪽 폴더 리스트에서 조회하고 싶은 소스 코드를 클릭해 보세요! 소스 코드의 세부 구현 사항을 실시간으로 분석합니다.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
