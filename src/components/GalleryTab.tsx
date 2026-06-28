import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { GalleryItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, MessageSquare, Heart, X, Send, Camera, Sparkles, Calendar } from 'lucide-react';

interface GalleryTabProps {
  theme: 'light' | 'dark';
}

export default function GalleryTab({ theme }: GalleryTabProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  
  // Comment Form States
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('gallery_likes');
    return saved ? JSON.parse(saved) : {};
  });

  // Fetch Gallery Items
  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const galleryList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          imageUrl: data.imageUrl || '',
          title: data.title || '',
          comment: data.comment || '',
          location: data.location || '',
          createdAt: data.createdAt || Date.now(),
          comments: data.comments || []
        } as unknown as GalleryItem & { comments?: Array<{ name: string; text: string; createdAt: number }> };
      });
      setItems(galleryList);
      setLoading(false);
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, 'gallery');
    });

    return () => unsubscribe();
  }, []);

  // Update selectedItem if list updates (to keep comments real-time in lightbox)
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find(i => i.id === selectedItem.id);
      if (updated) {
        setSelectedItem(updated);
      }
    }
  }, [items]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentLikes = likes[id] || 0;
    if (currentLikes > 0) return; // limit to 1 like per device
    
    const newLikes = { ...likes, [id]: 1 };
    setLikes(newLikes);
    localStorage.setItem('gallery_likes', JSON.stringify(newLikes));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !commentName.trim() || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const photoDocRef = doc(db, 'gallery', selectedItem.id);
      const newComment = {
        name: commentName.trim(),
        text: commentText.trim(),
        createdAt: Date.now()
      };

      await updateDoc(photoDocRef, {
        comments: arrayUnion(newComment)
      });

      setCommentText('');
      // Keep Name cached for user convenience
      localStorage.setItem('commenter_name', commentName.trim());
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Preset commenter name
  useEffect(() => {
    const savedName = localStorage.getItem('commenter_name');
    if (savedName) setCommentName(savedName);
  }, []);

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      {/* Visual Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-500 font-semibold uppercase tracking-wider">
          <Camera size={12} /> Curated Moments
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-sans font-black tracking-tight">
            Aesthetic Archive/Gallery
          </h2>
          <p className="text-sm font-sans text-neutral-500 uppercase tracking-widest">
            여행, 삶의 소중한 순간들, 시선이 머문 풍경의 감성 기록물
          </p>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-24 text-sm text-neutral-500 font-mono">
          아카이브에서 소중한 순간들을 꺼내는 중...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-neutral-500/20 rounded-2xl max-w-xl mx-auto space-y-4">
          <p className="text-neutral-500 font-sans">등록된 갤러리 사진이 없습니다.</p>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            관리자 패널(STUDIO)에서 새로운 추억을 등록해 보세요! <br />
            여행, 일상의 단편을 기록하고 코멘트를 남길 수 있습니다.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
          {items.map((item) => {
            const hasLiked = (likes[item.id] || 0) > 0;
            const commentsCount = (item as any).comments?.length || 0;
            
            return (
              <motion.div
                key={item.id}
                layoutId={`gallery-card-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className={`break-inside-avoid rounded-2xl border overflow-hidden cursor-pointer group relative flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${
                  theme === 'light' 
                    ? 'bg-white border-neutral-200/60 shadow-sm' 
                    : 'bg-[#181818] border-neutral-800/80 shadow-md'
                }`}
                whileHover={{ y: -4 }}
              >
                {/* Photo Layer */}
                <div className="overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                    <div className="flex justify-between items-start">
                      {item.location && (
                        <span className="text-[10px] font-mono bg-white/10 backdrop-blur-md text-white px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                          <MapPin size={10} />
                          {item.location}
                        </span>
                      )}
                      <span className="text-[9px] font-mono text-white/70">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-lg leading-tight font-sans">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-xs font-sans line-clamp-2 leading-relaxed">
                        {item.comment}
                      </p>
                      
                      <div className="flex items-center gap-3 pt-2 text-white/90 text-xs font-mono">
                        <button
                          onClick={(e) => handleLike(item.id, e)}
                          className={`flex items-center gap-1 transition-colors ${
                            hasLiked ? 'text-red-400' : 'hover:text-red-400'
                          }`}
                        >
                          <Heart size={13} fill={hasLiked ? 'currentColor' : 'none'} />
                          <span>{hasLiked ? 1 : 0}</span>
                        </button>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={13} />
                          <span>{commentsCount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plain/Caption bar for always visible metadata (Framer-style elegant info) */}
                <div className="p-4 flex justify-between items-center border-t border-neutral-500/5">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs truncate">{item.title}</h4>
                    {item.location && (
                      <p className="text-[10px] text-neutral-400 font-sans flex items-center gap-0.5 mt-0.5">
                        <MapPin size={8} /> {item.location}
                      </p>
                    )}
                  </div>
                  <span className="text-[9px] text-neutral-400 font-mono shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Comment Modal Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              layoutId={`gallery-card-${selectedItem.id}`}
              className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col md:flex-row max-h-[90vh] ${
                theme === 'light' ? 'bg-[#FAF9F6] border-neutral-200' : 'bg-[#1e1e1e] border-neutral-800'
              }`}
            >
              {/* Photo Side */}
              <div className="md:w-3/5 bg-black/30 flex items-center justify-center overflow-hidden relative min-h-[300px] md:max-h-[90vh]">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain max-h-[40vh] md:max-h-[90vh]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Close Button on Image Side for mobile */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 left-4 p-2.5 rounded-full bg-black/60 text-white/90 hover:text-white hover:scale-105 transition-all md:hidden cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Info & Comments Side */}
              <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[90vh] border-t md:border-t-0 md:border-l border-neutral-500/10">
                
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      {selectedItem.location && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                          <MapPin size={10} />
                          {selectedItem.location}
                        </span>
                      )}
                      <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(selectedItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="hidden md:block p-2 rounded-full hover:bg-neutral-500/10 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <h3 className="text-xl md:text-2xl font-serif font-medium tracking-tight">
                    {selectedItem.title}
                  </h3>

                  <p className="text-sm text-neutral-600 dark:text-neutral-300 font-sans leading-relaxed whitespace-pre-line border-b border-neutral-500/10 pb-4">
                    {selectedItem.comment}
                  </p>
                </div>

                {/* Comments List (Live update) */}
                <div className="flex-1 my-6 space-y-4 overflow-y-auto max-h-[220px] pr-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <MessageSquare size={12} />
                    코멘트 / 방명록 ({((selectedItem as any).comments || []).length})
                  </h4>

                  {((selectedItem as any).comments || []).length === 0 ? (
                    <p className="text-xs text-neutral-400 italic font-sans py-4">
                      이 사진에 남겨진 코멘트가 없습니다. 첫 코멘트를 남겨보세요!
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {((selectedItem as any).comments || []).map((c: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="p-3 rounded-xl border border-neutral-500/5 bg-neutral-500/5 text-xs font-sans space-y-1 animate-fade-in"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#222222] dark:text-[#FAF9F6]">{c.name}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-neutral-500/10">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="이름"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className={`col-span-1 px-3 py-2 rounded-lg text-xs font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                    <input
                      type="text"
                      required
                      placeholder="소중한 코멘트를 남겨주세요..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className={`col-span-2 px-3 py-2 rounded-lg text-xs font-sans border focus:outline-none ${
                        theme === 'light' ? 'bg-white border-neutral-200 focus:border-neutral-900' : 'bg-neutral-900 border-neutral-800 focus:border-white'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className={`w-full py-2 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-95 cursor-pointer disabled:opacity-50 ${
                      theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                    }`}
                  >
                    <Send size={12} />
                    {submittingComment ? '보내는 중...' : '코멘트 작성하기'}
                  </button>
                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
