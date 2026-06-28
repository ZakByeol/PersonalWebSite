import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BlogPost, Project, BlogCategory, Profile, Milestone } from '../types';
import { Plus, Edit2, Trash2, X, Sparkles, Check, Newspaper, FolderGit2, User, Bold, Italic, Heading1, Heading2, Code, Quote, Link, Image as ImageIcon, Eye, Camera, Music, Radio, ListMusic, AlertCircle, Briefcase } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface AdminPanelProps {
  onClose: () => void;
  theme: 'light' | 'dark';
}

export default function AdminPanel({ onClose, theme }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'blogs' | 'projects' | 'gallery' | 'playlist' | 'profile' | 'milestones'>('blogs');
  const [isWritingBlog, setIsWritingBlog] = useState(false);
  const [isWritingProject, setIsWritingProject] = useState(false);
  const [isWritingMilestone, setIsWritingMilestone] = useState(false);
  
  // Milestone form states
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneId, setMilestoneId] = useState<string | null>(null);
  const [milestoneYear, setMilestoneYear] = useState('');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneRole, setMilestoneRole] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneType, setMilestoneType] = useState<'work' | 'served' | 'edu'>('work');

  // Blog form states
  const [blogId, setBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState<BlogCategory>('개발일지');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogTags, setBlogTags] = useState('');

  // Project form states
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectContent, setProjectContent] = useState('');
  const [projectTechStack, setProjectTechStack] = useState('');
  const [projectImageUrl, setProjectImageUrl] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [projectPeriod, setProjectPeriod] = useState('');
  const [projectGithub, setProjectGithub] = useState('');
  const [projectLive, setProjectLive] = useState('');
  const [projectParticipants, setProjectParticipants] = useState('');

  // Profile form states
  const [profName, setProfName] = useState('배건우');
  const [profTitle, setProfTitle] = useState('Interactive Full-Stack Dev');
  const [profBio, setProfBio] = useState('아름다운 인터랙션과 타협 없는 안정성을 지향하는 풀스택 개발자 배건우입니다. 사용자가 감동하는 정교한 프론트엔드와 최적화된 백엔드 시스템을 하나로 연결합니다.');
  const [profImageUrl, setProfImageUrl] = useState('');
  const [profGithubUrl, setProfGithubUrl] = useState('https://github.com');
  const [profEmail, setProfEmail] = useState('heoha78@gmail.com');
  const [profInstagramUrl, setProfInstagramUrl] = useState('');
  const [profCustomUrl, setProfCustomUrl] = useState('https://repov.me/ko/profile?id=00B7319E53');

  // Gallery form states
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryComment, setGalleryComment] = useState('');
  const [galleryLocation, setGalleryLocation] = useState('');
  const [galleryItems, setGalleryItems] = useState<any[]>([]);

  // Playlist Config states
  const [playlistIdInput, setPlaylistIdInput] = useState('PLMC9KNkIncKseYxEr26u6Cx61-Vq5yLAL');
  const [playlistTitleInput, setPlaylistTitleInput] = useState('Late Night Coding / Lofi Beats');
  const [playlistDescInput, setPlaylistDescInput] = useState('집중력을 높여주는 배건우의 최애 YouTube Music 플레이리스트');

  // Playlist Tracks states
  const [trackId, setTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackUrl, setTrackUrl] = useState('');
  const [trackComment, setTrackComment] = useState('');
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);

  // Loaded items for list editing
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showPublishSheet, setShowPublishSheet] = useState(false);
  const [showProjectPublishSheet, setShowProjectPublishSheet] = useState(false);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Fetch blogs, projects, gallery, and playlists
  const fetchData = async () => {
    setLoading(true);
    
    // Fetch blogs
    try {
      const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const blogsSnap = await getDocs(blogsQuery);
      const blogsList = blogsSnap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
      setBlogs(blogsList);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'blogs');
    }

    // Fetch projects
    try {
      const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const projectsSnap = await getDocs(projectsQuery);
      const projectsList = projectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
      setProjects(projectsList);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'projects');
    }

    // Fetch Gallery
    try {
      const galleryQuery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
      const gallerySnap = await getDocs(galleryQuery);
      const galleryList = gallerySnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGalleryItems(galleryList);
    } catch (err) {
      console.warn('Error fetching gallery items:', err);
    }

    // Fetch Playlist Config settings
    try {
      const playlistConfigSnap = await getDoc(doc(db, 'settings', 'playlist_config'));
      if (playlistConfigSnap.exists()) {
        const pData = playlistConfigSnap.data();
        setPlaylistIdInput(pData.playlistId || '');
        setPlaylistTitleInput(pData.title || '');
        setPlaylistDescInput(pData.description || '');
      }
    } catch (err) {
      console.warn('Error fetching playlist config:', err);
    }

    // Fetch individual playlist tracks
    try {
      const tracksQuery = query(collection(db, 'playlist_tracks'), orderBy('createdAt', 'desc'));
      const tracksSnap = await getDocs(tracksQuery);
      const tracksList = tracksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlaylistTracks(tracksList);
    } catch (err) {
      console.warn('Error fetching playlist tracks:', err);
    }

    // Fetch profile data
    try {
      const profileSnap = await getDoc(doc(db, 'profile', 'main'));
      if (profileSnap.exists()) {
        const p = profileSnap.data() as Profile;
        setProfName(p.name || '배건우');
        setProfTitle(p.title || 'Interactive Full-Stack Dev');
        setProfBio(p.bio || '');
        setProfImageUrl(p.imageUrl || '');
        setProfGithubUrl(p.githubUrl || 'https://github.com');
        setProfEmail(p.email || 'heoha78@gmail.com');
        setProfInstagramUrl(p.instagramUrl || '');
        setProfCustomUrl(p.customUrl || 'https://repov.me/ko/profile?id=00B7319E53');
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'profile/main');
    }

    // Fetch milestones
    try {
      const milestonesQuery = query(collection(db, 'milestones'), orderBy('createdAt', 'desc'));
      const milestonesSnap = await getDocs(milestonesQuery);
      const milestonesList = milestonesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Milestone));
      setMilestones(milestonesList);
    } catch (err) {
      console.warn('Error fetching milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const triggerNotification = (message: string) => {
    setActionSuccess(message);
    setActionError(null);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const triggerError = (message: string) => {
    setActionError(message);
    setActionSuccess(null);
    setTimeout(() => setActionError(null), 5000);
  };

  // Submit Blog Post
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedTags = blogTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const postData = {
        title: blogTitle,
        content: blogContent,
        category: blogCategory,
        imageUrl: blogImageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
        tags: parsedTags,
        createdAt: blogId ? blogs.find(b => b.id === blogId)?.createdAt || Date.now() : Date.now(),
      };

      if (blogId) {
        // Update existing post
        const docRef = doc(db, 'blogs', blogId);
        try {
          await updateDoc(docRef, postData);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `blogs/${blogId}`);
        }
        triggerNotification('블로그 포스트가 성공적으로 수정되었습니다.');
      } else {
        // Create new post
        try {
          await addDoc(collection(db, 'blogs'), postData);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'blogs');
        }
        triggerNotification('새 블로그 포스트가 등록되었습니다.');
      }

      // Reset Form
      clearBlogForm();
      setIsWritingBlog(false);
      fetchData();
    } catch (err) {
      console.error('Error in blog submit flow:', err);
    }
  };

  // Submit Project Post
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedTech = projectTechStack.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const parsedParticipants = projectParticipants.split(',').map(p => p.trim()).filter(p => p.length > 0);
      const projData = {
        title: projectTitle,
        description: projectDescription,
        content: projectContent,
        techStack: parsedTech,
        imageUrl: projectImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
        role: projectRole || '개인 개발',
        period: projectPeriod || '2026',
        githubUrl: projectGithub || '',
        liveUrl: projectLive || '',
        participants: parsedParticipants,
        createdAt: projectId ? projects.find(p => p.id === projectId)?.createdAt || Date.now() : Date.now(),
      };

      if (projectId) {
        const docRef = doc(db, 'projects', projectId);
        try {
          await updateDoc(docRef, projData);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}`);
        }
        triggerNotification('프로젝트가 성공적으로 수정되었습니다.');
      } else {
        try {
          await addDoc(collection(db, 'projects'), projData);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'projects');
        }
        triggerNotification('새 프로젝트가 등록되었습니다.');
      }

      clearProjectForm();
      setIsWritingProject(false);
      fetchData();
    } catch (err) {
      console.error('Error in project submit flow:', err);
    }
  };

  const insertMarkdown = (textareaId: string, beforeText: string, afterText: string = '') => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = beforeText + selected + afterText;
    const newValue = text.substring(0, start) + replacement + text.substring(end);

    if (textareaId === 'blog-content-input') {
      setBlogContent(newValue);
    } else if (textareaId === 'proj-content-input') {
      setProjectContent(newValue);
    }

    // Refocus and reset cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + beforeText.length, start + beforeText.length + selected.length);
    }, 0);
  };

  const clearBlogForm = () => {
    setBlogId(null);
    setBlogTitle('');
    setBlogContent('');
    setBlogCategory('개발일지');
    setBlogImageUrl('');
    setBlogTags('');
    setShowPublishSheet(false);
  };

  const clearProjectForm = () => {
    setProjectId(null);
    setProjectTitle('');
    setProjectDescription('');
    setProjectContent('');
    setProjectTechStack('');
    setProjectImageUrl('');
    setProjectRole('');
    setProjectPeriod('');
    setProjectGithub('');
    setProjectLive('');
    setProjectParticipants('');
    setShowProjectPublishSheet(false);
  };

  // Edit action triggers
  const editBlog = (post: BlogPost) => {
    setBlogId(post.id);
    setBlogTitle(post.title);
    setBlogContent(post.content);
    setBlogCategory(post.category);
    setBlogImageUrl(post.imageUrl || '');
    setBlogTags(post.tags ? post.tags.join(', ') : '');
    setActiveTab('blogs');
    setIsWritingBlog(true);
    document.getElementById('admin-panel-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editProject = (proj: Project) => {
    setProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectDescription(proj.description);
    setProjectContent(proj.content);
    setProjectTechStack(proj.techStack.join(', '));
    setProjectImageUrl(proj.imageUrl || '');
    setProjectRole(proj.role);
    setProjectPeriod(proj.period);
    setProjectGithub(proj.githubUrl || '');
    setProjectLive(proj.liveUrl || '');
    setProjectParticipants(proj.participants ? proj.participants.join(', ') : '');
    setActiveTab('projects');
    setIsWritingProject(true);
    document.getElementById('admin-panel-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete actions
  const deleteBlogDoc = (id: string) => {
    showConfirm('블로그 글 삭제', '정말로 이 블로그 글을 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'blogs', id));
        triggerNotification('블로그 글이 삭제되었습니다.');
        fetchData();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `blogs/${id}`);
      }
    });
  };

  const deleteProjectDoc = (id: string) => {
    showConfirm('프로젝트 삭제', '정말로 이 프로젝트를 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'projects', id));
        triggerNotification('프로젝트가 삭제되었습니다.');
        fetchData();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      }
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pData: Profile = {
        name: profName,
        title: profTitle,
        bio: profBio,
        imageUrl: profImageUrl,
        githubUrl: profGithubUrl,
        email: profEmail,
        instagramUrl: profInstagramUrl,
        customUrl: profCustomUrl,
      };
      await setDoc(doc(db, 'profile', 'main'), pData);
      triggerNotification('프로필 정보가 성공적으로 업데이트되었습니다.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'profile/main');
    }
  };

  // Submit Gallery Item
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!galleryImageUrl.trim()) {
        alert('이미지 URL을 입력해주세요.');
        return;
      }
      const itemData = {
        title: galleryTitle || '풍경 및 기념 사진',
        imageUrl: galleryImageUrl,
        comment: galleryComment || '',
        location: galleryLocation || '',
        likes: 0,
        comments: [],
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'gallery'), itemData);
      triggerNotification('갤러리 이미지가 성공적으로 업로드되었습니다.');
      // Reset
      setGalleryImageUrl('');
      setGalleryTitle('');
      setGalleryComment('');
      setGalleryLocation('');
      fetchData();
    } catch (err: any) {
      console.error('Error submitting gallery:', err);
      alert('갤러리 등록 실패: 관리자 권한이 없거나 오류가 발생했습니다. ' + (err?.message || err));
    }
  };

  const deleteGalleryItem = (id: string) => {
    showConfirm('사진 삭제', '정말로 이 사진을 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'gallery', id));
        triggerNotification('갤러리 사진이 삭제되었습니다.');
        fetchData();
      } catch (err: any) {
        console.error('Error deleting gallery item:', err);
        triggerError('삭제 실패: ' + (err?.message || err));
      }
    });
  };

  // Save Playlist Config
  const handlePlaylistConfigSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      if (!playlistIdInput.trim()) {
        triggerError('플레이리스트 ID를 입력해주세요.');
        return;
      }
      const configRef = doc(db, 'settings', 'playlist_config');
      await setDoc(configRef, {
        playlistId: playlistIdInput.trim(),
        title: playlistTitleInput || 'My YouTube Music Playlist',
        description: playlistDescInput || ''
      });
      triggerNotification('플레이리스트 연동 설정이 성공적으로 저장 및 반영되었습니다.');
      fetchData();
    } catch (err: any) {
      console.error('Error saving playlist config:', err);
      const errMsg = err?.message || String(err);
      triggerError('설정 저장 실패: ' + errMsg);
    }
  };

  // Submit Playlist Track
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!trackTitle.trim() || !trackArtist.trim() || !trackUrl.trim()) {
        triggerError('곡 제목, 아티스트, YouTube URL을 모두 입력해주세요.');
        return;
      }
      const trackData = {
        title: trackTitle,
        artist: trackArtist,
        youtubeUrl: trackUrl,
        comment: trackComment || '',
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'playlist_tracks'), trackData);
      triggerNotification('추천 곡이 플레이리스트에 추가되었습니다.');
      setTrackTitle('');
      setTrackArtist('');
      setTrackUrl('');
      setTrackComment('');
      fetchData();
    } catch (err: any) {
      console.error('Error submitting track:', err);
      triggerError('추천 트랙 등록 실패: 관리자 권한이 없거나 오류가 발생했습니다. ' + (err?.message || err));
    }
  };

  const deleteTrack = (id: string) => {
    showConfirm('추천 곡 삭제', '정말로 이 추천 곡을 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'playlist_tracks', id));
        triggerNotification('추천 곡이 삭제되었습니다.');
        fetchData();
      } catch (err: any) {
        console.error('Error deleting track:', err);
        triggerError('삭제 실패: ' + (err?.message || err));
      }
    });
  };

  // Milestone/Journey CRUD methods
  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!milestoneYear.trim() || !milestoneTitle.trim() || !milestoneRole.trim() || !milestoneDesc.trim()) {
        triggerError('모든 필드(연도, 제목, 역할, 설명)를 입력해주세요.');
        return;
      }
      
      const milestoneData: any = {
        year: milestoneYear.trim(),
        title: milestoneTitle.trim(),
        role: milestoneRole.trim(),
        desc: milestoneDesc.trim(),
        type: milestoneType,
      };

      if (milestoneId) {
        // Edit existing
        const milestoneRef = doc(db, 'milestones', milestoneId);
        await updateDoc(milestoneRef, milestoneData);
        triggerNotification('Professional Journey 항목이 수정되었습니다.');
      } else {
        // Create new
        milestoneData.createdAt = Date.now();
        await addDoc(collection(db, 'milestones'), milestoneData);
        triggerNotification('Professional Journey 항목이 성공적으로 등록되었습니다.');
      }

      // Reset states
      setIsWritingMilestone(false);
      setMilestoneId(null);
      setMilestoneYear('');
      setMilestoneTitle('');
      setMilestoneRole('');
      setMilestoneDesc('');
      setMilestoneType('work');
      fetchData();
    } catch (err: any) {
      console.error('Error submitting milestone:', err);
      triggerError('등록 실패: ' + (err?.message || err));
    }
  };

  const deleteMilestone = (id: string) => {
    showConfirm('여정 항목 삭제', '정말로 이 Professional Journey 항목을 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'milestones', id));
        triggerNotification('여정 항목이 삭제되었습니다.');
        fetchData();
      } catch (err: any) {
        console.error('Error deleting milestone:', err);
        triggerError('삭제 실패: ' + (err?.message || err));
      }
    });
  };

  const startEditMilestone = (milestone: Milestone) => {
    setMilestoneId(milestone.id);
    setMilestoneYear(milestone.year);
    setMilestoneTitle(milestone.title);
    setMilestoneRole(milestone.role);
    setMilestoneDesc(milestone.desc);
    setMilestoneType(milestone.type);
    setIsWritingMilestone(true);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-50 flex items-center justify-center p-4 md:p-8">
      <div 
        id="admin-management-panel"
        className={`w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden border shadow-2xl transition-all duration-300 ${
          theme === 'light' 
            ? 'bg-[#FAF9F6] border-neutral-200 text-[#222222]' 
            : 'bg-[#222222] border-neutral-800 text-[#FAF9F6]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-500/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'}`}>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-sans tracking-tight">배건우 창작자 스튜디오</h1>
              <p className="text-xs text-neutral-500 font-mono">ADMIN CONTROL HUB</p>
            </div>
          </div>
          <button 
            id="close-admin-panel-btn"
            onClick={onClose} 
            className="p-1.5 hover:opacity-75 transition-opacity"
            aria-label="스튜디오 닫기"
          >
            <X size={22} />
          </button>
        </div>

        {/* Studio Tabs */}
        <div className="flex border-b border-neutral-500/10 bg-neutral-500/5 px-4">
          <button
            id="admin-tab-blogs"
            onClick={() => setActiveTab('blogs')}
            className={`px-5 py-3 text-sm font-sans font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'blogs' 
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Newspaper size={16} />
            블로그 관리
          </button>
          <button
            id="admin-tab-projects"
            onClick={() => setActiveTab('projects')}
            className={`px-5 py-3 text-sm font-sans font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'projects' 
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FolderGit2 size={16} />
            프로젝트 관리
          </button>
          <button
            id="admin-tab-gallery"
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-3 text-sm font-sans font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'gallery' 
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Camera size={16} />
            갤러리 관리
          </button>
          <button
            id="admin-tab-playlist"
            onClick={() => setActiveTab('playlist')}
            className={`px-5 py-3 text-sm font-sans font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'playlist' 
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Music size={16} />
            플레이리스트 관리
          </button>
          <button
            id="admin-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3 text-sm font-sans font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile' 
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <User size={16} />
            프로필 설정
          </button>
          <button
            id="admin-tab-milestones"
            onClick={() => setActiveTab('milestones')}
            className={`px-5 py-3 text-sm font-sans font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'milestones' 
                ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white' 
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Briefcase size={16} />
            여정 관리
          </button>
        </div>

        {/* Action success alert */}
        {actionSuccess && (
          <div className="bg-emerald-500 text-white px-6 py-3 text-sm font-medium font-sans flex items-center justify-between transition-all animate-fade-in">
            <span className="flex items-center gap-2">
              <Check size={18} /> {actionSuccess}
            </span>
          </div>
        )}

        {/* Action error alert */}
        {actionError && (
          <div className="bg-red-500 text-white px-6 py-3 text-sm font-medium font-sans flex items-center justify-between transition-all animate-fade-in">
            <span className="flex items-center gap-2">
              <AlertCircle size={18} /> {actionError}
            </span>
          </div>
        )}

        {/* Main Workspace Scrollable */}
        <div id="admin-panel-content" className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          {activeTab === 'blogs' && (
            <div className="h-full flex flex-col">
              {!isWritingBlog ? (
                /* 1. Blog List View */
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-500/10">
                    <div>
                      <h3 className="text-lg font-bold font-sans">등록된 블로그 포스트</h3>
                      <p className="text-xs text-neutral-500 font-sans mt-0.5">총 {blogs.length}개의 글이 발행되었습니다.</p>
                    </div>
                    <button
                      id="start-new-blog-btn"
                      onClick={() => {
                        clearBlogForm();
                        setIsWritingBlog(true);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-sans font-semibold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                      }`}
                    >
                      <Plus size={16} />
                      새 블로그 글 작성
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12 text-sm text-neutral-500 font-mono">데이터 로딩 중...</div>
                  ) : blogs.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-500/10 rounded-2xl">
                      <Newspaper size={36} className="mx-auto text-neutral-400 mb-3" />
                      <p className="text-sm font-sans text-neutral-500">발행된 블로그 글이 없습니다.</p>
                      <button
                        onClick={() => {
                          clearBlogForm();
                          setIsWritingBlog(true);
                        }}
                        className="mt-4 text-xs underline text-neutral-600 dark:text-neutral-400 hover:text-inherit"
                      >
                        첫 번째 글 작성하기
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
                      {blogs.map(post => (
                        <div
                          key={post.id}
                          className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                            theme === 'light' ? 'bg-white border-neutral-200' : 'bg-[#181818] border-neutral-800'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-sans font-medium ${
                                post.category === '개발일지' ? 'bg-blue-500/10 text-blue-500' :
                                post.category === '일상' ? 'bg-amber-500/10 text-amber-500' :
                                'bg-purple-500/10 text-purple-500'
                              }`}>
                                {post.category}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="font-bold text-base mt-2 line-clamp-1">{post.title}</h4>
                            <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2 leading-relaxed">
                              {post.content.replace(/[#*`>_\-]/g, '')}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-neutral-500/5">
                            <div className="flex gap-1">
                              {post.tags?.slice(0, 3).map(t => (
                                <span key={t} className="text-[10px] text-neutral-400 font-mono mr-1">#{t}</span>
                              ))}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                id={`edit-blog-${post.id}`}
                                onClick={() => editBlog(post)}
                                className="p-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition-colors cursor-pointer"
                                title="수정"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                id={`delete-blog-${post.id}`}
                                onClick={() => deleteBlogDoc(post.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                                title="삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* 2. Velog-style Split Editor View */
                <div className="flex flex-col h-[70vh] animate-fade-in relative">
                  {/* Title & Top section */}
                  <div className="space-y-3 pb-3 border-b border-neutral-500/10">
                    <input
                      id="blog-title-input"
                      type="text"
                      required
                      placeholder="제목을 입력하세요 (Velog 스타일)"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="w-full bg-transparent text-2xl font-bold font-sans border-none outline-none focus:ring-0 placeholder-neutral-400"
                    />
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span className="font-mono">TAGS:</span>
                        <input
                          id="blog-tags-input"
                          type="text"
                          placeholder="태그 입력 (쉼표로 구분, 예: React, 회고)"
                          value={blogTags}
                          onChange={(e) => setBlogTags(e.target.value)}
                          className={`px-3 py-1 text-xs rounded-lg border focus:outline-none bg-transparent ${
                            theme === 'light' ? 'border-neutral-200 focus:border-neutral-900' : 'border-neutral-800 focus:border-white'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Markdown Editor Toolbar */}
                  <div className="flex items-center gap-1 py-2 border-b border-neutral-500/10 text-neutral-500">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '### ')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Heading 3 (###)"
                    >
                      <Heading1 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '## ')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Heading 2 (##)"
                    >
                      <Heading2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '**', '**')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Bold (**text**)"
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '*', '*')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Italic (*text*)"
                    >
                      <Italic size={15} />
                    </button>
                    <div className="h-4 w-px bg-neutral-500/20 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '```\n', '\n```')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Code Block"
                    >
                      <Code size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '> ')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Quote"
                    >
                      <Quote size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '[링크 이름]', '(https://)')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Link"
                    >
                      <Link size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('blog-content-input', '![이미지 설명]', '(https://)')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Image"
                    >
                      <ImageIcon size={15} />
                    </button>
                  </div>

                  {/* Workspace Grid */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 min-h-0 overflow-hidden">
                    {/* Write Section */}
                    <div className="flex flex-col h-full">
                      <textarea
                        id="blog-content-input"
                        required
                        placeholder="당신의 이야기를 적어보세요... (마크다운 지원)"
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        className={`w-full flex-1 p-4 rounded-xl text-sm font-mono border focus:outline-none resize-none overflow-y-auto ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-350' : 'bg-neutral-900 border-neutral-800 focus:border-neutral-700'
                        }`}
                      />
                    </div>

                    {/* Preview Section */}
                    <div className={`hidden lg:flex flex-col h-full p-4 rounded-xl border overflow-y-auto ${
                      theme === 'light' ? 'bg-white border-neutral-100' : 'bg-neutral-900 border-neutral-850'
                    }`}>
                      <div className="text-xs text-neutral-400 font-mono mb-2 uppercase tracking-widest border-b border-neutral-500/10 pb-1 flex items-center gap-1.5">
                        <Eye size={12} /> Live Preview
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {blogContent ? (
                          <MarkdownRenderer content={blogContent} />
                        ) : (
                          <p className="text-neutral-400 text-sm font-sans italic">여기에 실시간 미리보기가 표시됩니다.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action bar */}
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-500/10 mt-4 bg-transparent">
                    <button
                      type="button"
                      onClick={() => {
                        clearBlogForm();
                        setIsWritingBlog(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-sans text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      ← 작성 취소 및 목록으로
                    </button>
                    
                    {/* Publishing Sheet trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!blogTitle.trim()) {
                          alert('제목을 먼저 입력해 주세요.');
                          return;
                        }
                        if (!blogContent.trim()) {
                          alert('내용을 먼저 입력해 주세요.');
                          return;
                        }
                        // Open the slide-up publish settings
                        setShowPublishSheet(true);
                      }}
                      className={`px-6 py-2.5 rounded-xl text-sm font-sans font-semibold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                      }`}
                    >
                      <Check size={16} />
                      발행하기 설정 (Publish)
                    </button>
                  </div>

                  {/* Velog-style Publish Config Sheet overlay */}
                  {showPublishSheet && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-fade-in">
                      <div className={`w-full max-w-xl p-8 rounded-2xl border shadow-2xl transition-all ${
                        theme === 'light' ? 'bg-[#FAF9F6] border-neutral-200 text-[#222222]' : 'bg-[#222222] border-neutral-800 text-[#FAF9F6]'
                      }`}>
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-500/10 mb-6">
                          <h4 className="text-lg font-bold font-sans">최종 포스트 발행 설정</h4>
                          <button
                            type="button"
                            onClick={() => setShowPublishSheet(false)}
                            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={handleBlogSubmit} className="space-y-6">
                          {/* Thumbnail preview & input */}
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">포스트 대표 이미지 (Thumbnail)</label>
                            <div className="flex gap-4 items-center">
                              <div className="w-24 h-24 rounded-lg overflow-hidden border border-neutral-500/10 bg-neutral-500/5 shrink-0">
                                {blogImageUrl ? (
                                  <img src={blogImageUrl} alt="Thumbnail preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 font-sans text-center px-2">대표 이미지 없음</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="https://images.unsplash.com/..."
                                  value={blogImageUrl}
                                  onChange={(e) => setBlogImageUrl(e.target.value)}
                                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                                    theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                                  }`}
                                />
                                <p className="text-[10px] text-neutral-400 mt-1">포스트의 대표 이미지 URL 주소를 입력해 주세요.</p>
                              </div>
                            </div>
                          </div>

                          {/* Category select */}
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">카테고리</label>
                            <select
                              value={blogCategory}
                              onChange={(e) => setBlogCategory(e.target.value as BlogCategory)}
                              className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                                theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                              }`}
                            >
                              <option value="개발일지">개발일지 💻</option>
                              <option value="일상">일상 ☕</option>
                              <option value="작품감상평">작품감상평 🎨</option>
                            </select>
                          </div>

                          {/* Final details summary */}
                          <div className="p-4 rounded-xl bg-neutral-500/5 border border-neutral-500/10 space-y-1.5 text-xs text-neutral-500 font-sans">
                            <p><strong>제목:</strong> <span className="font-semibold text-[#222222] dark:text-[#FAF9F6]">{blogTitle}</span></p>
                            <p><strong>태그:</strong> <span className="font-mono">{blogTags || '없음'}</span></p>
                            <p><strong>글자 수:</strong> <span>공백 포함 약 {blogContent.length}자</span></p>
                          </div>

                          {/* Publish / Cancel */}
                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowPublishSheet(false)}
                              className="flex-1 py-3 border border-neutral-500/20 hover:bg-neutral-500/5 rounded-xl text-sm font-sans font-medium transition-colors cursor-pointer"
                            >
                              취소 및 뒤로
                            </button>
                            <button
                              type="submit"
                              className={`flex-1 py-3 rounded-xl text-sm font-sans font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-95 cursor-pointer ${
                                theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                              }`}
                            >
                              <Check size={16} />
                              {blogId ? '수정 완료하기' : '진짜 발행하기'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="h-full flex flex-col">
              {!isWritingProject ? (
                /* 1. Project List View */
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center pb-4 border-b border-neutral-500/10">
                    <div>
                      <h3 className="text-lg font-bold font-sans">등록된 프로젝트</h3>
                      <p className="text-xs text-neutral-500 font-sans mt-0.5">총 {projects.length}개의 프로젝트가 등록되어 있습니다.</p>
                    </div>
                    <button
                      id="start-new-project-btn"
                      onClick={() => {
                        clearProjectForm();
                        setIsWritingProject(true);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-sans font-semibold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                      }`}
                    >
                      <Plus size={16} />
                      새 프로젝트 등록
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-12 text-sm text-neutral-500 font-mono">데이터 로딩 중...</div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-500/10 rounded-2xl">
                      <FolderGit2 size={36} className="mx-auto text-neutral-400 mb-3" />
                      <p className="text-sm font-sans text-neutral-500">등록된 프로젝트가 없습니다.</p>
                      <button
                        onClick={() => {
                          clearProjectForm();
                          setIsWritingProject(true);
                        }}
                        className="mt-4 text-xs underline text-neutral-600 dark:text-neutral-400 hover:text-inherit"
                      >
                        첫 번째 프로젝트 등록하기
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
                      {projects.map(proj => (
                        <div
                          key={proj.id}
                          className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                            theme === 'light' ? 'bg-white border-neutral-200' : 'bg-[#181818] border-neutral-800'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium bg-neutral-500/10 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                {proj.period}
                              </span>
                              <span className="text-xs text-neutral-400 font-sans">
                                {proj.role}
                              </span>
                            </div>
                            <h4 className="font-bold text-base mt-2 line-clamp-1">{proj.title}</h4>
                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                              {proj.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t border-neutral-500/5">
                            <div className="flex flex-wrap gap-1">
                              {proj.techStack?.slice(0, 3).map(t => (
                                <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-neutral-500/5 text-neutral-400 font-mono">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                id={`edit-project-${proj.id}`}
                                onClick={() => editProject(proj)}
                                className="p-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition-colors cursor-pointer"
                                title="수정"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                id={`delete-project-${proj.id}`}
                                onClick={() => deleteProjectDoc(proj.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                                title="삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* 2. Project Split Editor View */
                <div className="flex flex-col h-[70vh] animate-fade-in relative">
                  {/* Title & Top section */}
                  <div className="space-y-3 pb-3 border-b border-neutral-500/10">
                    <input
                      id="proj-title-input"
                      type="text"
                      required
                      placeholder="프로젝트명을 입력하세요"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full bg-transparent text-2xl font-bold font-sans border-none outline-none focus:ring-0 placeholder-neutral-400"
                    />
                    
                    <input
                      id="proj-desc-input"
                      type="text"
                      required
                      placeholder="프로젝트 요약 설명 (한 줄로 간결하게)"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className={`w-full px-3 py-1.5 text-xs rounded-xl border focus:outline-none bg-transparent ${
                        theme === 'light' ? 'border-neutral-200 focus:border-neutral-900' : 'border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>

                  {/* Writing Templates Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 py-2.5 border-b border-neutral-500/10 text-xs">
                    <span className="text-[10px] text-neutral-400 font-sans mr-1 font-semibold">글쓰기 템플릿:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const template = `## 📌 프로젝트 소개 (Introduction)
- **개발 동기**: 
- **핵심 역할**: 
- **한 줄 요약**: 

## 🛠️ 사용된 기술 및 도구 (Tech Stack & Architecture)
- **Frontend**: React, Tailwind CSS, Lucide
- **Backend/DB**: Firestore, Firebase Auth
- **Deployment**: Google Cloud Run

## 💡 핵심 기능 및 구현 (Key Features)
- **실시간 소스 코드 트리 조회**: GitHub API를 연동하여 리포지토리 파일 내용을 스튜디오에서 바로 브라우징할 수 있습니다.
- **기여자 분석**: 커밋 데이터를 기준으로 실시간 공동 작업자를 랭킹화하여 보여줍니다.

## 🚀 개발 과정 및 트러블 슈팅 (Development Process & Troubleshooting)
- **문제 발생**: 
- **원인 분석**: 
- **해결 방안**: 

## 📈 성과 및 배운 점 (Outcome & Learnings)
- **성과**: 
- **배운 점**: `;
                        showConfirm('템플릿 적용', '작성 중이던 내용이 있다면 템플릿 양식으로 덮어씌워집니다. 진행하시겠습니까?', () => {
                          setProjectContent(template);
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-sans transition-all cursor-pointer hover:scale-[1.02] ${
                        theme === 'light' 
                          ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900' 
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      }`}
                    >
                      🚀 기본 포트폴리오
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const template = `## 🔍 문제 상황 & 트러블 슈팅 (Troubleshooting Log)

### 1. 현상 파악 (Symptom)
- **무엇이 잘못되었는가**: 
- **재현 경로**: 

### 2. 원인 분석 (Root Cause)
- **가설 설정**: 
- **검증 방법 및 결과**: 

### 3. 해결 방안 탐색 (Alternative Solutions)
1. **대안 A**: 
   - 장점: 
   - 단점: 
2. **대안 B**: 
   - 장점: 
   - 단점: 

### 4. 최종 해결책 적용 (Resolution)
\`\`\`typescript
// 해결된 소스 코드 조각
\`\`\`

### 5. 결과 및 재발 방지책 (Key Takeaway)
- **성과**: 
- **재발 방지 계획**: `;
                        showConfirm('템플릿 적용', '작성 중이던 내용이 있다면 템플릿 양식으로 덮어씌워집니다. 진행하시겠습니까?', () => {
                          setProjectContent(template);
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-sans transition-all cursor-pointer hover:scale-[1.02] ${
                        theme === 'light' 
                          ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900' 
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      }`}
                    >
                      💡 트러블슈팅 일지
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const template = `## 📈 기획 의도 및 지표 분석 (Product Strategy & Analytics)

### 1. 제품 기획적 목표 (Product Goals)
- **타겟 유저**: 
- **핵심 가치 제안 (Value Proposition)**: 

### 2. 주요 기능 사양 (Feature Specification)
- **기능 1**: 
- **기능 2**: 

### 3. 기술적 비즈니스 기여도 (Business Impact)
- **성과 지표 (KPIs)**: 
- **최적화 전후 대비**: 
  - 로딩 시간: \`2.4s\` → \`0.3s\` (87% 단축)
  - 이탈률: \`12%\` → \`4%\`

### 4. 향후 로드맵 (Future Roadmap)
- **Milestone 1**: 
- **Milestone 2**: `;
                        showConfirm('템플릿 적용', '작성 중이던 내용이 있다면 템플릿 양식으로 덮어씌워집니다. 진행하시겠습니까?', () => {
                          setProjectContent(template);
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-sans transition-all cursor-pointer hover:scale-[1.02] ${
                        theme === 'light' 
                          ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900' 
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      }`}
                    >
                      📊 기획 & 성과 분석
                    </button>
                  </div>

                  {/* Markdown Editor Toolbar */}
                  <div className="flex items-center gap-1 py-2 border-b border-neutral-500/10 text-neutral-500">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '### ')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Heading 3 (###)"
                    >
                      <Heading1 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '## ')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Heading 2 (##)"
                    >
                      <Heading2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '**', '**')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Bold (**text**)"
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '*', '*')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Italic (*text*)"
                    >
                      <Italic size={15} />
                    </button>
                    <div className="h-4 w-px bg-neutral-500/20 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '```\n', '\n```')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Code Block"
                    >
                      <Code size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '> ')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Quote"
                    >
                      <Quote size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '[링크 이름]', '(https://)')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Link"
                    >
                      <Link size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('proj-content-input', '![이미지 설명]', '(https://)')}
                      className="p-1.5 rounded hover:bg-neutral-500/10 hover:text-inherit cursor-pointer"
                      title="Image"
                    >
                      <ImageIcon size={15} />
                    </button>
                  </div>

                  {/* Workspace Grid */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 min-h-0 overflow-hidden">
                    {/* Write Section */}
                    <div className="flex flex-col h-full">
                      <textarea
                        id="proj-content-input"
                        required
                        placeholder="상세 개발 이야기를 여기에 마음껏 적어보세요... (마크다운 지원)"
                        value={projectContent}
                        onChange={(e) => setProjectContent(e.target.value)}
                        className={`w-full flex-1 p-4 rounded-xl text-sm font-mono border focus:outline-none resize-none overflow-y-auto ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-350' : 'bg-neutral-900 border-neutral-800 focus:border-neutral-700'
                        }`}
                      />
                    </div>

                    {/* Preview Section */}
                    <div className={`hidden lg:flex flex-col h-full p-4 rounded-xl border overflow-y-auto ${
                      theme === 'light' ? 'bg-white border-neutral-100' : 'bg-neutral-900 border-neutral-850'
                    }`}>
                      <div className="text-xs text-neutral-400 font-mono mb-2 uppercase tracking-widest border-b border-neutral-500/10 pb-1 flex items-center gap-1.5">
                        <Eye size={12} /> Live Preview
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {projectContent ? (
                          <MarkdownRenderer content={projectContent} />
                        ) : (
                          <p className="text-neutral-400 text-sm font-sans italic">여기에 실시간 미리보기가 표시됩니다.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action bar */}
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-500/10 mt-4 bg-transparent">
                    <button
                      type="button"
                      onClick={() => {
                        clearProjectForm();
                        setIsWritingProject(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-sans text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      ← 작성 취소 및 목록으로
                    </button>
                    
                    {/* Publishing Sheet trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!projectTitle.trim()) {
                          alert('프로젝트명을 입력해 주세요.');
                          return;
                        }
                        if (!projectDescription.trim()) {
                          alert('요약 설명을 입력해 주세요.');
                          return;
                        }
                        if (!projectContent.trim()) {
                          alert('상세 개발 내용을 입력해 주세요.');
                          return;
                        }
                        setShowProjectPublishSheet(true);
                      }}
                      className={`px-6 py-2.5 rounded-xl text-sm font-sans font-semibold flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                      }`}
                    >
                      <Check size={16} />
                      메타데이터 설정 및 등록
                    </button>
                  </div>

                  {/* Velog-style Project Publish Config Sheet overlay */}
                  {showProjectPublishSheet && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md animate-fade-in">
                      <div className={`w-full max-w-xl p-8 rounded-2xl border shadow-2xl transition-all max-h-[85vh] overflow-y-auto ${
                        theme === 'light' ? 'bg-[#FAF9F6] border-neutral-200 text-[#222222]' : 'bg-[#222222] border-neutral-800 text-[#FAF9F6]'
                      }`}>
                        <div className="flex justify-between items-center pb-4 border-b border-neutral-500/10 mb-6">
                          <h4 className="text-lg font-bold font-sans">프로젝트 메타데이터 설정</h4>
                          <button
                            type="button"
                            onClick={() => setShowProjectPublishSheet(false)}
                            className="p-1 hover:opacity-75 transition-opacity cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={handleProjectSubmit} className="space-y-4">
                          {/* Role & Period */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">수행 역할 (Role)</label>
                              <input
                                type="text"
                                placeholder="Full-Stack Developer"
                                value={projectRole}
                                onChange={(e) => setProjectRole(e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                                  theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">수행 기간 (Period)</label>
                              <input
                                type="text"
                                placeholder="2026.01 - 2026.03"
                                value={projectPeriod}
                                onChange={(e) => setProjectPeriod(e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                                  theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Tech stack */}
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">기술 스택 (쉼표 구분)</label>
                            <input
                              type="text"
                              placeholder="React, TypeScript, Firebase"
                              value={projectTechStack}
                              onChange={(e) => setProjectTechStack(e.target.value)}
                              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                                theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                              }`}
                            />
                          </div>

                          {/* Cover Image */}
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">대표 이미지 URL (Thumbnail)</label>
                            <div className="flex gap-4 items-center">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-500/10 bg-neutral-500/5 shrink-0">
                                {projectImageUrl ? (
                                  <img src={projectImageUrl} alt="Project Cover preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400 font-sans text-center px-1">이미지 없음</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="https://images.unsplash.com/..."
                                  value={projectImageUrl}
                                  onChange={(e) => setProjectImageUrl(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                                    theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Github / Live demo URLs */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">GitHub 저장소</label>
                              <input
                                type="text"
                                placeholder="https://github.com/..."
                                value={projectGithub}
                                onChange={(e) => setProjectGithub(e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                                  theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">라이브 데모</label>
                              <input
                                type="text"
                                placeholder="https://..."
                                value={projectLive}
                                onChange={(e) => setProjectLive(e.target.value)}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                                  theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Participants */}
                          <div>
                            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">참가 팀원 이름 (쉼표 구분)</label>
                            <input
                              type="text"
                              placeholder="배건우, 김민수, 이지민"
                              value={projectParticipants}
                              onChange={(e) => setProjectParticipants(e.target.value)}
                              className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                                theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                              }`}
                            />
                            <p className="text-[10px] text-neutral-400 font-sans mt-1">
                              * 본인을 포함해 공동 작업자들의 이름을 적어보세요. GitHub 저장소를 연동하면 실시간 커밋 기여자도 동기화됩니다.
                            </p>
                          </div>

                          {/* Publish / Cancel */}
                          <div className="flex gap-3 pt-4 border-t border-neutral-500/10">
                            <button
                              type="button"
                              onClick={() => setShowProjectPublishSheet(false)}
                              className="flex-1 py-2.5 border border-neutral-500/20 hover:bg-neutral-500/5 rounded-xl text-xs font-sans font-medium transition-colors cursor-pointer"
                            >
                              취소 및 뒤로
                            </button>
                            <button
                              type="submit"
                              className={`flex-1 py-2.5 rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-95 cursor-pointer ${
                                theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                              }`}
                            >
                              <Check size={14} />
                              {projectId ? '수정 완료하기' : '프로젝트 최종 등록'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8 animate-fade-in">
              <div className="pb-4 border-b border-neutral-500/15">
                <h3 className="text-lg font-bold font-sans">갤러리 사진 업로드 및 관리</h3>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">여행, 풍경 및 일상의 소중한 사진들을 업로드하고 관리합니다.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Add Photo Form */}
                <div className={`p-6 rounded-2xl border h-fit ${
                  theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                }`}>
                  <h4 className="text-sm font-bold font-sans mb-4 flex items-center gap-1.5">
                    <Camera size={16} className="text-emerald-500" />
                    새 사진 등록하기
                  </h4>
                  <form onSubmit={handleGallerySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">사진 제목</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 강릉 밤바다"
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">이미지 주소 (Image URL)</label>
                      <input
                        type="text"
                        required
                        placeholder="https://images.unsplash.com/..."
                        value={galleryImageUrl}
                        onChange={(e) => setGalleryImageUrl(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">촬영 장소 (Location)</label>
                      <input
                        type="text"
                        placeholder="예: 강원도 강릉시 안목해변"
                        value={galleryLocation}
                        onChange={(e) => setGalleryLocation(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">기록/코멘트 (Comment)</label>
                      <textarea
                        rows={3}
                        placeholder="사진에 얽힌 짧은 추억이나 감상을 적어보세요."
                        value={galleryComment}
                        onChange={(e) => setGalleryComment(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none resize-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-95 ${
                        theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                      }`}
                    >
                      <Plus size={14} />
                      갤러리 사진 등록
                    </button>
                  </form>
                </div>

                {/* 2. Photo List Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold font-sans mb-1">등록된 갤러리 목록 ({galleryItems.length})</h4>
                  
                  {galleryItems.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-500/10 rounded-2xl">
                      <Camera size={32} className="mx-auto text-neutral-400 mb-2" />
                      <p className="text-xs font-sans text-neutral-500">등록된 사진이 없습니다. 첫 기념 사진을 올려보세요!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                      {galleryItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`group relative rounded-xl overflow-hidden border flex flex-col justify-between ${
                            theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                          }`}
                        >
                          <div className="aspect-square relative overflow-hidden bg-neutral-100">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => deleteGalleryItem(item.id)}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer shadow-md"
                              title="삭제"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="p-3">
                            <h5 className="text-[11px] font-bold font-sans truncate">{item.title}</h5>
                            <p className="text-[9px] text-neutral-400 font-mono truncate">{item.location || '위치 미지정'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playlist' && (
            <div className="space-y-8 animate-fade-in">
              <div className="pb-4 border-b border-neutral-500/15">
                <h3 className="text-lg font-bold font-sans">플레이리스트 & 추천 곡 연동</h3>
                <p className="text-xs text-neutral-500 font-sans mt-0.5">본인의 YouTube Music 플레이리스트를 실시간으로 연동하고, 방문객들에게 들려주고 싶은 소울 트랙을 등록합니다.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. YouTube Playlist ID settings */}
                <div className={`p-6 rounded-2xl border h-fit space-y-4 ${
                  theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                }`}>
                  <h4 className="text-sm font-bold font-sans flex items-center gap-1.5">
                    <Radio size={16} className="text-emerald-500" />
                    YouTube Music 연동 설정
                  </h4>
                  <form onSubmit={handlePlaylistConfigSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">플레이리스트 ID</label>
                      <input
                        type="text"
                        required
                        placeholder="예: PLbXwK_I8X93z8R8Zf_F8... (YouTube 재생목록 ID)"
                        value={playlistIdInput}
                        onChange={(e) => setPlaylistIdInput(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                        }`}
                      />
                      <p className="text-[9px] text-neutral-400 font-sans mt-1">
                        * YouTube 재생목록 공유 주소의 list= 파라미터 뒷부분 값을 입력해주세요.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">전시 타이틀</label>
                      <input
                        type="text"
                        placeholder="예: 배건우의 코딩 셋리스트"
                        value={playlistTitleInput}
                        onChange={(e) => setPlaylistTitleInput(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">플레이리스트 한 줄 설명</label>
                      <input
                        type="text"
                        placeholder="예: 새벽 코딩을 할 때 영감을 불어넣는 힙합/로파이 모음집입니다."
                        value={playlistDescInput}
                        onChange={(e) => setPlaylistDescInput(e.target.value)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      onClick={handlePlaylistConfigSubmit}
                      className={`w-full py-3 rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-95 ${
                        theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                      }`}
                    >
                      <Check size={14} />
                      재생목록 연동 저장
                    </button>
                  </form>
                </div>

                {/* 2. Track Recommendation Form & List */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Track Add Form */}
                  <div className={`p-6 rounded-2xl border ${
                    theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                  }`}>
                    <h4 className="text-sm font-bold font-sans mb-3.5 flex items-center gap-1.5">
                      <ListMusic size={16} className="text-emerald-500" />
                      추천 트랙 추가하기 (방문객 소통용)
                    </h4>
                    <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">곡 제목 (Title)</label>
                        <input
                          type="text"
                          required
                          placeholder="예: Hype Boy"
                          value={trackTitle}
                          onChange={(e) => setTrackTitle(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                            theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">아티스트 (Artist)</label>
                        <input
                          type="text"
                          required
                          placeholder="예: NewJeans"
                          value={trackArtist}
                          onChange={(e) => setTrackArtist(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                            theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">YouTube 비디오/음악 URL</label>
                        <input
                          type="text"
                          required
                          placeholder="예: https://www.youtube.com/watch?v=T--6HB1XN10"
                          value={trackUrl}
                          onChange={(e) => setTrackUrl(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                            theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">한 줄 코멘트</label>
                        <input
                          type="text"
                          placeholder="예: 들으면 무조건 코딩 생산성이 200% 증가하는 명곡!"
                          value={trackComment}
                          onChange={(e) => setTrackComment(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-sans border focus:outline-none ${
                            theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-950 border-neutral-850 focus:border-white'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2 pt-1">
                        <button
                          type="submit"
                          className={`w-full py-2.5 rounded-xl text-xs font-sans font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-95 ${
                            theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                          }`}
                        >
                          <Plus size={14} />
                          추천 곡 리스트에 장착
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Recommendations list */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-neutral-400">등록된 추천 트랙 ({playlistTracks.length})</h5>
                    {playlistTracks.length === 0 ? (
                      <p className="text-xs text-neutral-500 font-sans italic">등록된 추천 곡이 없습니다.</p>
                    ) : (
                      <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                        {playlistTracks.map((track) => (
                          <div
                            key={track.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 ${
                              theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold font-sans truncate">{track.title} <span className="font-normal text-neutral-400 text-[10px] font-mono">by {track.artist}</span></p>
                              <p className="text-[10px] text-neutral-400 font-sans truncate mt-0.5 italic">"{track.comment || '코멘트가 없습니다.'}"</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteTrack(track.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-500/15">
                <div>
                  <h3 className="text-lg font-bold font-sans">프로필 카드 및 소개 설정</h3>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">랜딩 페이지에 보여지는 본인의 사진, 한 줄 소개 및 세부 정보를 관리합니다.</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">이름 (Korean)</label>
                    <input
                      id="prof-name-input"
                      type="text"
                      required
                      placeholder="예: 배건우"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">전문 분야 / 직함 (English)</label>
                    <input
                      id="prof-title-input"
                      type="text"
                      required
                      placeholder="예: Interactive Full-Stack Dev"
                      value={profTitle}
                      onChange={(e) => setProfTitle(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">프로필 이미지 URL</label>
                    <input
                      id="prof-image-input"
                      type="text"
                      placeholder="https://images.unsplash.com/... (비워두면 GW 아바타가 표시됩니다)"
                      value={profImageUrl}
                      onChange={(e) => setProfImageUrl(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                    <p className="text-[10px] text-neutral-400 mt-1 font-sans">실제 본인의 프로필 사진 주소를 입력하면 포트폴리오에 예쁘게 장착됩니다.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">이메일 주소</label>
                    <input
                      id="prof-email-input"
                      type="email"
                      required
                      placeholder="예: heoha78@gmail.com"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">GitHub 프로필 URL</label>
                    <input
                      id="prof-github-url"
                      type="text"
                      placeholder="https://github.com/..."
                      value={profGithubUrl}
                      onChange={(e) => setProfGithubUrl(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">Instagram 프로필 URL</label>
                    <input
                      id="prof-instagram-url"
                      type="text"
                      placeholder="https://instagram.com/..."
                      value={profInstagramUrl}
                      onChange={(e) => setProfInstagramUrl(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">기타 링크 URL</label>
                    <input
                      id="prof-custom-url"
                      type="text"
                      placeholder="https://repov.me/ko/profile?id=00B7319E53"
                      value={profCustomUrl}
                      onChange={(e) => setProfCustomUrl(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">자기소개 한 줄 / 바이오 (Bio)</label>
                  <textarea
                    id="prof-bio-input"
                    required
                    rows={4}
                    placeholder="본인의 개발 철학이나 인삿말을 멋지게 표현해 보세요."
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-sans border focus:outline-none resize-none ${
                      theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                    }`}
                  />
                </div>

                <button
                  id="profile-submit-btn"
                  type="submit"
                  className={`w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-95 ${
                    theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                  }`}
                >
                  <Check size={16} />
                  프로필 정보 변경 사항 저장
                </button>
              </form>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="max-w-3xl mx-auto space-y-6 h-full flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-500/15">
                <div>
                  <h3 className="text-lg font-bold font-sans">Professional Journey 관리</h3>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">랜딩 페이지에 노출될 본인의 여정(경력, 활동, 교육 등)을 등록하고 관리합니다.</p>
                </div>
                {!isWritingMilestone && (
                  <button
                    onClick={() => {
                      setMilestoneId(null);
                      setMilestoneYear('');
                      setMilestoneTitle('');
                      setMilestoneRole('');
                      setMilestoneDesc('');
                      setMilestoneType('work');
                      setIsWritingMilestone(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-opacity ${
                      theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                    }`}
                  >
                    <Plus size={14} /> 새 여정 추가
                  </button>
                )}
              </div>

              {isWritingMilestone ? (
                <form onSubmit={handleMilestoneSubmit} className="space-y-4 border rounded-xl p-5 bg-neutral-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-neutral-400">
                      {milestoneId ? '여정 수정하기' : '새 여정 추가하기'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsWritingMilestone(false)}
                      className="text-neutral-500 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">연도 / 기간</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 2024.03 - 현재"
                        value={milestoneYear}
                        onChange={(e) => setMilestoneYear(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">여정 구분 (Type)</label>
                      <select
                        value={milestoneType}
                        onChange={(e) => setMilestoneType(e.target.value as any)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                        }`}
                      >
                        <option value="work">WORK</option>
                        <option value="served">SERVED</option>
                        <option value="edu">EDUCATION</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">역할 (Role)</label>
                      <input
                        type="text"
                        required
                        placeholder="예: Software Engineer"
                        value={milestoneRole}
                        onChange={(e) => setMilestoneRole(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-sans border focus:outline-none ${
                          theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">기관 / 제목 (Title)</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 영남대학교 컴퓨터공학과"
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1">세부 설명 (Description)</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="수행한 작업, 배운 내용 등을 간단히 기록하세요."
                      value={milestoneDesc}
                      onChange={(e) => setMilestoneDesc(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-sans border focus:outline-none resize-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-950' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-opacity hover:opacity-90 ${
                        theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                      }`}
                    >
                      <Check size={14} /> {milestoneId ? '수정 내용 저장' : '여정 등록'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWritingMilestone(false)}
                      className={`px-4 py-2 rounded-lg text-xs border font-medium cursor-pointer ${
                        theme === 'light' ? 'border-neutral-200 hover:bg-neutral-50' : 'border-neutral-800 hover:bg-neutral-800'
                      }`}
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                  {milestones.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-2xl border-neutral-500/20 text-neutral-500">
                      등록된 Professional Journey 항목이 없습니다. 첫 여정을 등록해 보세요!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((milestone) => (
                        <div 
                          key={milestone.id}
                          className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                            theme === 'light' 
                              ? 'bg-white border-neutral-100 shadow-sm hover:border-neutral-300' 
                              : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-neutral-400 font-bold">{milestone.year}</span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-medium ${
                                milestone.type === 'work' 
                                  ? 'bg-emerald-500/15 text-emerald-500' 
                                  : milestone.type === 'served'
                                  ? 'bg-rose-500/15 text-rose-500'
                                  : 'bg-indigo-500/15 text-indigo-500'
                              }`}>
                                {milestone.type.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold font-sans tracking-tight">{milestone.title}</h4>
                            <p className="text-xs text-neutral-500 font-mono">{milestone.role}</p>
                            <p className="text-xs text-neutral-400 font-sans leading-relaxed mt-1 line-clamp-2">{milestone.desc}</p>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditMilestone(milestone)}
                              className="p-1.5 hover:text-emerald-500 transition-colors cursor-pointer"
                              title="수정"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMilestone(milestone.id)}
                              className="p-1.5 hover:text-red-500 transition-colors cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div 
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl transition-all scale-100 ${
              theme === 'light' 
                ? 'bg-[#FAF9F6] border-neutral-200 text-[#222222]' 
                : 'bg-[#222222] border-neutral-800 text-[#FAF9F6]'
            }`}
          >
            <h3 className="text-base font-sans font-bold mb-2 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              {confirmModal.title}
            </h3>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className={`px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                  theme === 'light' 
                    ? 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50' 
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
