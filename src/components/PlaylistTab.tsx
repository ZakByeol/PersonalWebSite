import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PlaylistItem } from '../types';
import { Music, Radio, Youtube, Disc, ListMusic, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface PlaylistTabProps {
  theme: 'light' | 'dark';
}

interface PlaylistConfig {
  playlistId: string;
  title: string;
  description: string;
  updatedAt?: number;
}

export default function PlaylistTab({ theme }: PlaylistTabProps) {
  const [config, setConfig] = useState<PlaylistConfig>({
    playlistId: 'PLMC9KNkIncKseYxEr26u6Cx61-Vq5yLAL', // Default beautiful lofi coding playlist
    title: 'Late Night Coding / Lofi Beats',
    description: '집중력을 높여주는 배건우의 최애 YouTube Music 플레이리스트'
  });
  const [tracks, setTracks] = useState<PlaylistItem[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [activeTrack, setActiveTrack] = useState<PlaylistItem | null>(null);

  // Subscribe to Playlist Config (YouTube Playlist ID)
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'playlist_config'), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as PlaylistConfig);
      }
      setLoadingConfig(false);
    }, (error) => {
      setLoadingConfig(false);
      handleFirestoreError(error, OperationType.GET, 'settings/playlist_config');
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to individual tracks collection
  useEffect(() => {
    const q = query(collection(db, 'playlist_tracks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PlaylistItem));
      setTracks(trackList);
      if (trackList.length > 0 && !activeTrack) {
        setActiveTrack(trackList[0]);
      }
      setLoadingTracks(false);
    }, (error) => {
      setLoadingTracks(false);
      handleFirestoreError(error, OperationType.GET, 'playlist_tracks');
    });

    return () => unsubscribe();
  }, []);

  // Parse playlist ID from URL
  const getEmbedUrl = (playlistId: string) => {
    const cleanId = playlistId.includes('list=') 
      ? playlistId.split('list=')[1].split('&')[0] 
      : playlistId;
    return `https://www.youtube-nocookie.com/embed/videoseries?list=${cleanId}&autoplay=0&hl=ko&disablekb=1`;
  };

  const getSingleVideoId = (url: string) => {
    if (!url) return null;
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else if (url.includes('shorts/')) {
      videoId = url.split('shorts/')[1].split('?')[0];
    }
    return videoId || null;
  };

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-neutral-500/10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#FF0000]/10 text-[#FF0000] dark:text-[#ff3333] font-semibold uppercase tracking-wider">
            <Radio size={12} className="animate-pulse" /> Live Sound Deck
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-sans font-black tracking-tight">
              YouTube Music / Playlist
            </h2>
            <p className="text-sm font-sans text-neutral-500 uppercase tracking-widest">
              실시간 동기화되는 배건우의 노동요 & 큐레이션 트랙
            </p>
          </div>
        </div>

        {/* Dynamic visualizer element */}
        <div className="flex items-center gap-1 h-8 px-4 rounded-xl border border-neutral-500/10 bg-neutral-500/5 select-none text-xs font-mono text-neutral-400">
          <Volume2 size={12} className="text-emerald-500" />
          <span>SOUNDWAVE ACTIVE</span>
          <div className="flex items-end gap-0.5 h-3 ml-2">
            <span className="w-0.5 h-1 bg-emerald-500 animate-[bounce_0.8s_infinite_100ms]" />
            <span className="w-0.5 h-3 bg-emerald-500 animate-[bounce_0.8s_infinite_300ms]" />
            <span className="w-0.5 h-2 bg-emerald-500 animate-[bounce_0.8s_infinite_200ms]" />
            <span className="w-0.5 h-1.5 bg-emerald-500 animate-[bounce_0.8s_infinite_400ms]" />
            <span className="w-0.5 h-2.5 bg-emerald-500 animate-[bounce_0.8s_infinite_150ms]" />
          </div>
        </div>
      </div>

      {/* Main Layout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player and YouTube Music Embed */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-md relative overflow-hidden flex flex-col ${
            theme === 'light' ? 'bg-white border-neutral-200' : 'bg-[#181818] border-neutral-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-bold text-lg flex items-center gap-2">
                <Youtube className="text-[#FF0000]" size={20} />
                {config.title || '나의 플레이리스트'}
              </h3>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                YOUTUBE MUSIC INTEGRATED
              </span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-sans mb-5 leading-relaxed">
              {config.description || '이 플레이리스트는 YouTube Music과 실시간으로 연동되어 언제든지 청취하실 수 있습니다.'}
            </p>

            {/* Responsive Iframe Embed Wrapper */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-neutral-500/10 shadow-inner bg-black">
              {loadingConfig ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-mono">
                  연동 정보를 로딩 중...
                </div>
              ) : (
                <iframe
                  title="YouTube Music Playlist"
                  src={getEmbedUrl(config.playlistId)}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] text-neutral-400 font-sans leading-relaxed bg-neutral-500/5 p-3.5 rounded-xl border border-neutral-500/5">
              <AlertCircle size={14} className="text-amber-500 shrink-0" />
              <p>
                플레이리스트는 YouTube 및 YouTube Music 앱에서 곡을 추가하면 실시간으로 자동 업데이트됩니다. 관리자 패널(STUDIO)에서 플레이리스트 ID만 바꾸면 여러분만의 음악으로 변경할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Curated Track Highlights list */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col ${
            theme === 'light' ? 'bg-white border-neutral-200' : 'bg-[#181818] border-neutral-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-500/5 mb-4">
              <h3 className="font-sans font-bold text-base flex items-center gap-2 text-[#222222] dark:text-[#FAF9F6]">
                <ListMusic size={18} className="text-emerald-500" />
                배건우 추천 큐레이션 트랙
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium bg-neutral-500/10 text-neutral-500">
                {tracks.length} Songs
              </span>
            </div>

            {loadingTracks ? (
              <div className="text-center py-16 text-xs text-neutral-400 font-mono">큐레이션 추천곡 목록을 불러오는 중...</div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-neutral-500/10 rounded-2xl space-y-3">
                <Disc size={28} className="mx-auto text-neutral-400 animate-spin" style={{ animationDuration: '6s' }} />
                <p className="text-xs text-neutral-500 font-sans">추가된 개별 추천 트랙이 없습니다.</p>
                <p className="text-[10px] text-neutral-400 font-sans px-4 leading-relaxed">
                  STUDIO의 플레이리스트 탭에서 최애 단일곡들을 등록하고 감성 코멘트를 달아 방문자들과 나누어 보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {tracks.map((track) => {
                  const isActive = activeTrack?.id === track.id;
                  const vId = getSingleVideoId(track.youtubeUrl);
                  
                  return (
                    <div
                      key={track.id}
                      onClick={() => setActiveTrack(track)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-4 items-center group relative overflow-hidden ${
                        isActive
                          ? theme === 'light'
                            ? 'bg-emerald-50/40 border-emerald-500/30'
                            : 'bg-emerald-950/10 border-emerald-500/30'
                          : theme === 'light'
                            ? 'bg-white border-neutral-200/60 hover:bg-neutral-50'
                            : 'bg-[#1f1f1f] border-neutral-800 hover:bg-neutral-800/50'
                      }`}
                    >
                      {/* Album Art Placeholder with Play Overlay */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-500/10 relative shrink-0 flex items-center justify-center border border-neutral-500/10">
                        {vId ? (
                          <img
                            src={`https://img.youtube.com/vi/${vId}/hqdefault.jpg`}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Disc size={18} className="text-neutral-400 group-hover:rotate-180 transition-transform duration-1000" />
                        )}
                        
                        {isActive && (
                          <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                            <Music size={14} className="text-emerald-500 animate-bounce" />
                          </div>
                        )}
                      </div>

                      {/* Track Details */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-bold text-xs truncate ${isActive ? 'text-emerald-500' : ''}`}>
                            {track.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-sans truncate">{track.artist}</p>
                        {track.comment && (
                          <p className="text-[10px] text-neutral-500 font-sans line-clamp-1 italic pt-0.5 border-t border-neutral-500/5 mt-0.5">
                            "{track.comment}"
                          </p>
                        )}
                      </div>

                      {/* Action Icon / YT Link */}
                      {track.youtubeUrl && (
                        <a
                          href={track.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg hover:bg-neutral-500/10 text-neutral-400 hover:text-[#FF0000] transition-all shrink-0 cursor-pointer"
                          title="YouTube에서 직접 듣기"
                        >
                          <Youtube size={14} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
