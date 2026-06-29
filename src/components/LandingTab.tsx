import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { ArrowUpRight, Github, Mail, Sparkles, Code2, Layers, Cpu, Server, Briefcase, Instagram, Link } from 'lucide-react';
import { Theme, Profile, Milestone } from '../types';

interface LandingTabProps {
  theme: Theme;
  profile: Profile | null;
  onNavigate: (tab: 'home' | 'blog' | 'projects') => void;
}

export default function LandingTab({ theme, profile, onNavigate }: LandingTabProps) {
  const name = profile?.name || '배건우';
  const title = profile?.title || 'GAME DEVELOPER';
  const bio = profile?.bio || '';
  const imageUrl = profile?.imageUrl || '';
  const githubUrl = profile?.githubUrl || 'https://github.com/ZakByeol';
  const email = profile?.email || 'macaron010@naver.com';
  const instagramUrl = profile?.instagramUrl || '';
  const customUrl = profile?.customUrl || 'https://repov.me/ko/profile?id=00B7319E53';

  const [dbMilestones, setDbMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'milestones'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone));
      setDbMilestones(list);
    }, (err) => {
      console.error('Error listening to milestones:', err);
    });
    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const skills = [
    { name: 'Game Developer', desc: 'Unity, Unreal Engine, C#, 2D/3D Graphics, Game Physics & Performance Optimization', icon: Code2 },
    { name: 'AI Stack', desc: 'Gemini API Integration, Development by using LLM Agent, Design or 3D Model using AI', icon: Server },
    { name: 'Database / Cloud', desc: 'Firebase Firestore, GCP (Compute Engine, GCS), Docker', icon: Cpu },
    { name: 'Cowork', desc: 'Notion, Discord, Git/GitHub, Documentation & Agile Team Collaboration', icon: Layers },
  ];

  const defaultMilestones: Milestone[] = [
    {
      id: 'default-1',
      year: '2024.03 - 현재',
      title: '영남대학교 컴퓨터공학과',
      role: 'Software Engineering Graduate',
      desc: '알고리즘, 데이터 구조, 분산 시스템, 웹 설계 등의 컴퓨터 공학 핵심 지식 이수.',
      type: 'work',
      createdAt: 1,
    },
    {
      id: 'default-2',
      year: '2025.06 - 2026.12',
      title: '군 복무',
      role: 'Army Served',
      desc: '국토방위에 힘 쓰며, Computer Science 지식을 학습',
      type: 'served',
      createdAt: 2,
    },
    {
      id: 'default-3',
      year: '2024.03 - 현재',
      title: '영남대학교 컴퓨터공학과',
      role: 'Software Engineering Graduate',
      desc: '알고리즘, 데이터 구조, 분산 시스템, 웹 설계 등의 컴퓨터 공학 핵심 지식 이수.',
      type: 'edu',
      createdAt: 3,
    },
  ];

  const milestones = dbMilestones.length > 0 ? dbMilestones : defaultMilestones;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-24 pb-20"
    >
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Info */}
          <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase border border-neutral-500/20 bg-neutral-500/5">
              <Sparkles size={12} className="text-emerald-500 animate-pulse" />
              {title}
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-sans font-black tracking-tight leading-[1.05]">
              Hello, <br className="hidden sm:block" />
              I am <span className="underline decoration-wavy decoration-emerald-400 decoration-2 underline-offset-8">{name}</span>
            </h1>

            <p className="text-lg md:text-xl font-sans font-bold leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-xl">
              {bio}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                id="hero-go-projects"
                onClick={() => onNavigate('projects')}
                className={`px-6 py-3.5 rounded-xl text-sm font-semibold font-sans flex items-center gap-2 cursor-pointer transition-all shadow-md hover:-translate-y-0.5 ${
                  theme === 'light'
                    ? 'bg-[#222222] text-[#FAF9F6]'
                    : 'bg-[#FAF9F6] text-[#222222]'
                }`}
              >
                포트폴리오 감상
                <ArrowUpRight size={16} />
              </button>
              
              <button
                id="hero-go-blog"
                onClick={() => onNavigate('blog')}
                className={`px-6 py-3.5 rounded-xl text-sm font-semibold font-sans border flex items-center gap-2 cursor-pointer transition-all hover:bg-neutral-500/10 ${
                  theme === 'light'
                    ? 'border-neutral-200 text-[#222222]'
                    : 'border-neutral-800 text-[#FAF9F6]'
                }`}
              >
                블로그 구독
              </button>
            </div>
          </motion.div>

          {/* Hero Right: Profile Visual */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="relative group w-80 h-96">
              {/* Decorative Frame */}
              <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-emerald-400/40 rotate-3 scale-102 group-hover:rotate-6 transition-transform duration-500" />
              
              <div 
                id="profile-image-container"
                className={`absolute inset-0 rounded-2xl overflow-hidden border shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1 ${
                  theme === 'light' 
                    ? 'bg-neutral-100 border-neutral-200' 
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                  {imageUrl ? (
                    /* Real Profile Photo */
                    <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-emerald-400/30 p-1 bg-[#FAF9F6] shadow-xl mb-4">
                      <img 
                        src={imageUrl} 
                        alt={name} 
                        className="w-full h-full object-cover rounded-full filter saturate-105 hover:scale-105 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    /* Clean Developer Avatar/Placeholder Illustration */
                    <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-500 flex items-center justify-center p-1.5 shadow-xl mb-4">
                      <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden font-bold text-3xl text-white">
                        {name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <h3 className="text-lg font-bold font-sans tracking-tight">{name}</h3>
                  <p className="text-xs text-neutral-400 font-sans mt-1">POHANG, SOUTH KOREA</p>

                  <div className="flex gap-2.5 mt-6">
                    <a 
                      id="hero-github-link"
                      href={githubUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`p-2 rounded-lg border transition-colors ${
                        theme === 'light' ? 'hover:bg-neutral-200 border-neutral-200' : 'hover:bg-neutral-800 border-neutral-800'
                      }`}
                      title="GitHub"
                    >
                      <Github size={16} />
                    </a>
                    <a 
                      id="hero-mail-link"
                      href={`mailto:${email}`} 
                      className={`p-2 rounded-lg border transition-colors ${
                        theme === 'light' ? 'hover:bg-neutral-200 border-neutral-200' : 'hover:bg-neutral-800 border-neutral-800'
                      }`}
                      title="이메일"
                    >
                      <Mail size={16} />
                    </a>
                    <a 
                      id="hero-instagram-link"
                      href={instagramUrl || 'https://www.instagram.com/9unw._212/'} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`p-2 rounded-lg border transition-colors ${
                        theme === 'light' ? 'hover:bg-neutral-200 border-neutral-200' : 'hover:bg-neutral-800 border-neutral-800'
                      }`}
                      title="Instagram"
                    >
                      <Instagram size={16} />
                    </a>
                    <a 
                      id="hero-custom-link"
                      href={customUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`p-2 rounded-lg border transition-colors ${
                        theme === 'light' ? 'hover:bg-neutral-200 border-neutral-200' : 'hover:bg-neutral-800 border-neutral-800'
                      }`}
                      title="Repov"
                    >
                      <Link size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Horizontal Infinite Marquee */}
      <section className="relative overflow-hidden w-screen -mx-[4vw] md:-mx-[8vw] py-6 border-y border-neutral-500/15 bg-neutral-500/5 rotate-[-1deg]">
        <div className="flex whitespace-nowrap animate-marquee font-sans font-black text-2xl md:text-3xl tracking-widest uppercase opacity-75">
          <span className="mx-4">CREATIVE CODE •</span>
          <span className="mx-4 text-emerald-400">GAME DEVELOPER •</span>
          <span className="mx-4">MULTI-PLATFORM •</span>
          <span className="mx-4 text-indigo-400">SERVER MANAGER •</span>
          <span className="mx-4">JPOP LOVER •</span>
          
          {/* Duplicate for infinite effect */}
          <span className="mx-4">CREATIVE CODE •</span>
          <span className="mx-4 text-emerald-400">GAME DEVELOPER •</span>
          <span className="mx-4">MULTI-PLATFORM •</span>
          <span className="mx-4 text-indigo-400">SERVER MANAGER •</span>
          <span className="mx-4">JPOP LOVER •</span>
        </div>
      </section>

      {/* 3. Skills Bento Grid */}
      <section className="space-y-10">
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight">Core Competencies</h2>
          <p className="text-sm font-sans text-neutral-500 uppercase tracking-widest">기술적 역량 및 도구</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill, idx) => {
            const Icon = skill.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-md ${
                  theme === 'light' 
                    ? 'bg-[#FAF9F6]/75 border-neutral-200/60 shadow-sm' 
                    : 'bg-[#222222]/75 border-neutral-800/60 shadow-lg'
                }`}
              >
                <div className={`p-3 rounded-xl inline-block mb-5 ${
                  theme === 'light' ? 'bg-[#222222] text-[#FAF9F6]' : 'bg-[#FAF9F6] text-[#222222]'
                }`}>
                  <Icon size={20} />
                </div>
                <h3 className="text-xl font-bold font-sans tracking-tight mb-2">{skill.name}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">{skill.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. Timeline / Journey */}
      <section className="space-y-12">
        <motion.div variants={itemVariants} className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight">Professional Journey</h2>
          <p className="text-sm font-sans text-neutral-500 uppercase tracking-widest">발자취 및 경력</p>
        </motion.div>

        <div className="relative border-l border-neutral-500/20 ml-4 md:ml-6 space-y-10 pl-6 md:pl-8 py-2">
          {milestones.map((milestone, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="relative group"
            >
              {/* Circle Marker */}
              <div className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform duration-300 group-hover:scale-125 ${
                theme === 'light' 
                  ? 'bg-[#FAF9F6] border-[#222222]' 
                  : 'bg-[#222222] border-[#FAF9F6]'
              }`} />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">
                    {milestone.year}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    milestone.type === 'work' 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : milestone.type === 'served'
                      ? 'bg-rose-500/10 text-rose-500'
                      : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {milestone.type === 'work' ? 'WORK' : milestone.type === 'served' ? 'SERVED' : 'EDUCATION'}
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-bold font-sans tracking-tight">
                  {milestone.title}
                </h3>
                <h4 className="text-sm font-medium text-neutral-500 font-mono">
                  {milestone.role}
                </h4>
                <p className="text-sm text-neutral-400 dark:text-neutral-400 leading-relaxed max-w-2xl font-sans">
                  {milestone.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Creator Values Grid */}
      <section className={`p-8 md:p-12 rounded-3xl border text-center space-y-6 relative overflow-hidden backdrop-blur-md ${
        theme === 'light' 
          ? 'bg-[#FAF9F6]/80 border-neutral-200/80 shadow-md text-[#222222]' 
          : 'bg-[#222222]/80 border-neutral-800/80 shadow-2xl text-[#FAF9F6]'
      }`}>
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-black font-sans tracking-tight">"더 나은 자신이 되기 위해"</h2>
          <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
            매일, 매순간 부끄럽지 않은 행동을 하며 나날을 살아가기!. 
            이를 실천하기 위해 만든 배건우의 개인 활동 웹사이트.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <a
              id="footer-github"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase border px-4 py-2 rounded-lg hover:bg-neutral-500/10 transition-all`}
            >
              <Github size={14} /> Github
            </a>
            <a
              id="footer-mail"
              href={`mailto:${email}`}
              className={`flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase border px-4 py-2 rounded-lg hover:bg-neutral-500/10 transition-all`}
            >
              <Mail size={14} /> Contact Me
            </a>
            <a
              id="footer-instagram"
              href={instagramUrl || 'https://instagram.com'}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase border px-4 py-2 rounded-lg hover:bg-neutral-500/10 transition-all`}
            >
              <Instagram size={14} /> Instagram
            </a>
            <a
              id="footer-custom"
              href={customUrl}
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2 text-xs font-mono font-semibold tracking-wider uppercase border px-4 py-2 rounded-lg hover:bg-neutral-500/10 transition-all`}
            >
              <Link size={14} /> Repov
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
