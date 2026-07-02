import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BlogPost, BlogCategory } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Calendar, Tag, ArrowLeft, Search, Filter, Sparkles, Image as ImageIcon, X, ChevronDown, Check } from 'lucide-react';

interface BlogTabProps {
  theme: 'light' | 'dark';
}

export default function BlogTab({ theme }: BlogTabProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<string[]>(['개발일지', '일상', '작품감상평']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Subscribe to blogs collection
  useEffect(() => {
    const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BlogPost));
      setPosts(blogsList);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'blogs');
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to custom categories in real-time
  useEffect(() => {
    const unsubscribeCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(d => d.data().name || d.id);
        const merged = Array.from(new Set(['개발일지', '일상', '작품감상평', ...list])).filter(Boolean);
        setCategories(merged);
      } else {
        setCategories(['개발일지', '일상', '작품감상평']);
      }
    }, (err) => {
      console.warn('Error listening to categories:', err);
    });
    return () => unsubscribeCats();
  }, []);

  // Filter posts based on search & multi-selected categories
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(post.category);
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (selectedPost) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-4">
        {/* Back Button */}
        <button
          id="back-to-blogs-btn"
          onClick={() => setSelectedPost(null)}
          className={`flex items-center gap-2 text-sm font-sans font-semibold mb-6 hover:opacity-75 transition-opacity cursor-pointer ${
            theme === 'light' ? 'text-[#222222]' : 'text-[#FAF9F6]'
          }`}
        >
          <ArrowLeft size={18} />
          목록으로 돌아가기
        </button>

        {/* Detailed Post Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold ${
              selectedPost.category === '개발일지' ? 'bg-blue-500/10 text-blue-500' :
              selectedPost.category === '일상' ? 'bg-amber-500/10 text-amber-500' :
              'bg-purple-500/10 text-purple-500'
            }`}>
              {selectedPost.category}
            </span>
            <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
              <Calendar size={12} />
              {new Date(selectedPost.createdAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight leading-tight">
            {selectedPost.title}
          </h1>

          {/* Optional Cover Image */}
          {selectedPost.imageUrl && (
            <div className="w-full max-h-[450px] overflow-hidden rounded-2xl border border-neutral-500/15 shadow-md">
              <img
                src={selectedPost.imageUrl}
                alt={selectedPost.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Markdown Rendered Content */}
        <div className={`p-8 rounded-2xl border ${
          theme === 'light' ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}>
          <MarkdownRenderer content={selectedPost.content} attachments={selectedPost.attachments} />
        </div>

        {/* Attached Photos Gallery */}
        {selectedPost.attachments && selectedPost.attachments.length > 0 && (
          <div className="space-y-4 pt-4 animate-fade-in">
            <h3 className="text-sm font-semibold font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <ImageIcon size={14} className="text-neutral-500" />
              첨부 이미지 ({selectedPost.attachments.length}개)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedPost.attachments.map((url, idx) => (
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

        {/* Tags */}
        {selectedPost.tags && selectedPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {selectedPost.tags.map((tag, i) => (
              <span 
                key={i} 
                className={`text-xs font-mono px-3 py-1 rounded-lg border flex items-center gap-1 ${
                  theme === 'light' ? 'bg-[#FAF9F6] border-neutral-200 text-neutral-600' : 'bg-[#222222] border-neutral-800 text-neutral-400'
                }`}
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}

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
    <div className="space-y-12">
      {/* Search and Filters Grid */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-sans font-black tracking-tight">Blog Insights</h2>
          <p className="text-sm font-sans text-neutral-500 uppercase tracking-widest">배건우의 생각, 경험, 기술 정리가 담긴 공간</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-3.5 text-neutral-500" size={18} />
            <input
              id="blog-search-input"
              type="text"
              placeholder="제목이나 본문 내용을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm font-sans border focus:outline-none focus:ring-1 ${
                theme === 'light'
                  ? 'bg-[#FAF9F6] border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 text-neutral-800'
                  : 'bg-[#222222] border-neutral-800 focus:border-white focus:ring-white text-neutral-200'
              }`}
            />
          </div>

          {/* Filters */}
          <div className="md:col-span-6 flex md:justify-end relative">
            <div className="relative w-full md:w-auto">
              <button
                id="filter-category-btn"
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`w-full md:w-auto px-4 py-3 rounded-xl text-xs font-semibold font-sans border transition-all cursor-pointer flex items-center justify-between md:justify-start gap-2 shadow-sm ${
                  selectedCategories.length > 0
                    ? (theme === 'light' ? 'bg-[#222222] border-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] border-[#FAF9F6] text-[#222222]')
                    : (theme === 'light' ? 'border-neutral-200 hover:bg-neutral-100 text-neutral-600 bg-white' : 'border-neutral-800 hover:bg-neutral-800 text-neutral-400 bg-[#222222]')
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Filter size={13} />
                  <span>
                    {selectedCategories.length === 0
                      ? '모든 카테고리'
                      : selectedCategories.length === 1
                      ? selectedCategories[0]
                      : `${selectedCategories[0]} 외 ${selectedCategories.length - 1}개`}
                  </span>
                </span>
                <ChevronDown size={13} className={`transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Card */}
              {isFilterDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-[10]" onClick={() => setIsFilterDropdownOpen(false)} />
                  <div
                    id="category-filter-dropdown"
                    className={`absolute right-0 mt-2 w-full md:w-64 rounded-xl border p-2 shadow-xl z-[20] space-y-1 ${
                      theme === 'light' 
                        ? 'bg-white border-neutral-200 text-neutral-800' 
                        : 'bg-neutral-900 border-neutral-800 text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-500/10 mb-1">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">카테고리 복수 선택</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategories([])}
                        className="text-[10px] text-blue-500 hover:underline font-semibold cursor-pointer"
                      >
                        전체 선택 (초기화)
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                      {categories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCategories(selectedCategories.filter(c => c !== cat));
                              } else {
                                setSelectedCategories([...selectedCategories, cat]);
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-sans font-medium flex items-center justify-between transition-colors hover:bg-neutral-500/10 cursor-pointer`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>
                                {cat === '개발일지' ? '💻' :
                                 cat === '일상' ? '☕' :
                                 cat === '작품감상평' ? '🎨' : '🔖'}
                              </span>
                              <span>{cat}</span>
                            </span>
                            {isSelected && <Check size={14} className="text-emerald-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="text-center py-24 text-sm text-neutral-500 font-mono">데이터 로딩 중...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-neutral-500/20 rounded-2xl max-w-xl mx-auto space-y-4">
          <p className="text-neutral-500 font-sans">
            {searchQuery ? '검색 결과에 일치하는 블로그 글이 없습니다.' : '아직 등록된 블로그 글이 없습니다.'}
          </p>
          {!searchQuery && (
            <p className="text-xs text-neutral-400 font-sans">
              우측 상단의 관리자 패널(Admin)을 통해 첫 글을 업로드해보세요!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              id={`blog-card-${post.id}`}
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`rounded-2xl border overflow-hidden cursor-pointer group flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${
                theme === 'light' 
                  ? 'bg-white border-neutral-200/70' 
                  : 'bg-neutral-900 border-neutral-800/80'
              }`}
            >
              {/* Card Image */}
              {post.imageUrl && (
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold uppercase shadow-sm ${
                      post.category === '개발일지' ? 'bg-blue-500 text-white' :
                      post.category === '일상' ? 'bg-amber-500 text-white' :
                      'bg-purple-500 text-white'
                    }`}>
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] text-neutral-500 font-mono">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <h3 className="font-bold text-lg leading-snug group-hover:underline font-sans line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 font-sans leading-relaxed">
                    {post.content.replace(/[#*`\-[\]()]/g, '')}
                  </p>
                </div>

                {/* Card Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span 
                        key={i} 
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                          theme === 'light' ? 'bg-neutral-100 text-neutral-500' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
