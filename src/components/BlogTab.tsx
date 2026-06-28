import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BlogPost, BlogCategory } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Calendar, Tag, ArrowLeft, Search, Filter, Sparkles } from 'lucide-react';

interface BlogTabProps {
  theme: 'light' | 'dark';
}

export default function BlogTab({ theme }: BlogTabProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | '전체'>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

  // Filter posts based on search & category
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: (BlogCategory | '전체')[] = ['전체', '개발일지', '일상', '작품감상평'];

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
          <MarkdownRenderer content={selectedPost.content} />
        </div>

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
          <div className="md:col-span-6 flex flex-wrap gap-2 md:justify-end">
            {categories.map((cat) => (
              <button
                id={`filter-${cat}`}
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? (theme === 'light' ? 'bg-[#222222] border-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] border-[#FAF9F6] text-[#222222]')
                    : (theme === 'light' ? 'border-neutral-200 hover:bg-neutral-100 text-neutral-600' : 'border-neutral-800 hover:bg-neutral-800 text-neutral-400')
                }`}
              >
                {cat === '개발일지' ? '💻 개발일지' :
                 cat === '일상' ? '☕ 일상' :
                 cat === '작품감상평' ? '🎨 작품감상평' : '모두'}
              </button>
            ))}
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
