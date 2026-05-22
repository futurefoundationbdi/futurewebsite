import React, { useState, useEffect, useRef } from 'react';
import { db } from "../firebaseConfig";
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";

type ReadingMode = 'normal' | 'sepia' | 'night';

const contents = {
  reads: [
    { id: 1, title: "Le jeu de la Vie et comment le jouer", author: "Florence Scovel Shinn", cover: "/covers/J de la vie.webp", fileUrl: "/books/Le jeu de la Vie et comment le jouer.pdf", type: "pdf", review: "Commencez dès aujourd’hui à croire en vous et laissez-vous guider avec bonheur dans tous les domaines de votre vie!" },
    { id: 2, title: "La Science de la Grandeur", author: "Wallace D. Wattles", cover: "/covers/S de la G.webp", fileUrl: "/books/La science de la Grandeur.pdf", type: "pdf", review: "Apprenez comment croire en la grandeur de votre propre esprit et comment agir avec grandeur." },
    { id: 3, title: "L'Homme le plus riche de Babylone", author: "George S. Clason", cover: "/covers/riche.webp", fileUrl: "/books/homme-riche.pdf", type: "pdf", review: "Des principes millénaires toujours d'actualité." },
    { id: 4, title: "Réfléchissez et devenez riche", author: "Napoleon Hill", cover: "/covers/R et DR.webp", fileUrl: "/books/Réfléchissez et devenez riche.pdf", type: "pdf", review: "Le classique absolu sur la force de la pensée." },
    { id: 5, title: "La Science de l'Enrechissement", author: "Wallace D. Wattles", cover: "/covers/la S de l'E.webp", fileUrl: "/books/La science de l'Enrichissement.pdf", type: "pdf", review:"Le fondement de la mentalité d'abondance."},
    { id: 6, title: "L'Art d'avoir toujours raison", author: "Arthur Schopenhauer", cover: "/covers/à lire.webp", fileUrl: "/books/Lart davoir toujours raison.pdf", type: "pdf", review: "Outil puissant pour détecter les manipulations." }
  ],
  audios: [
    { id: 7, title: "La chèvre de ma mère: Les secrets de la prospérité financière-Ricardo Kaniama", source: "NoteBookLM Podcast", duration: "15 min", audioSrc: "/audio/lachevre.mp3", type: "audio", cover: "/covers/La chèvre.webp" },
    { id: 8, title: "MARIÉS ET APRÈS-Dr Myles Munroe ?", source: "NoteBookLM Podcast", duration: "08 min", audioSrc: "/audio/marriageetapres.mp3", type: "audio", cover: "/covers/MARIÉS ET APRÈS _.webp" },
    { id: 9, title: "L'échelle magique vers le succès-Napoleon Hill", source: "AUDIBLE", duration: "1h 09 min", audioSrc: "/audio/xxxx", type: "audio", cover: "/covers/echelle.webp" },
    { id: 10, title: "L'effet Cumulé-Darren Hardy", source: "NoteBookLM Podcast", duration: "13 min", audioSrc: "/audio/effet.mp3", type: "audio", cover: "/covers/effet.webp" }
  ]
};

const ambiances = [
  { id: 'none', name: '🔇', url: '' },
  { id: 'nature', name: '🍃 Nature', url: '/audio/nature.mp3' },
  { id: 'rain', name: '🌧️ Pluie', url: '/audio/rain.mp3' },
  { id: 'ocean', name: 'Waves', url: '/audio/waves.mp3' },
];

export default function Library() {
  // 1. ÉTATS
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window === 'undefined') return 45 * 60;
    const saved = localStorage.getItem('future_library_time');
    const lastDate = localStorage.getItem('future_library_last_date');
    const now = Date.now();
    if (lastDate && now - parseInt(lastDate) > 24 * 60 * 60 * 1000) {
      localStorage.setItem('future_library_last_date', now.toString());
      return 45 * 60;
    }
    return saved ? parseInt(saved) : 45 * 60;
  });

  const [currentBookId, setCurrentBookId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('future_library_book_id');
    return saved ? parseInt(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'reads' | 'audios'>('reads');
  const [isPressing, setIsPressing] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [confirmItem, setConfirmItem] = useState<any>(null); 
  const [selectedAmbiance, setSelectedAmbiance] = useState(ambiances[0]);
  const [volume, setVolume] = useState(0.5);
  const [showAdvice, setShowAdvice] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('future_library_viewing_url');
  });

  const [readMode, setReadMode] = useState<ReadingMode>('normal');
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioTimeInfo, setAudioTimeInfo] = useState({ current: '00:00', total: '00:00' });
  const [reviews, setReviews] = useState<{ [key: number]: any[] }>({});
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [activeView, setActiveView] = useState<'player' | 'reviews'>('player');

  const ambianceRef = useRef<HTMLAudioElement | null>(null);
  const bookAudioRef = useRef<HTMLAudioElement | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 2. FONCTIONS (Déclarées AVANT les useEffect)
  const togglePlay = () => {
    if (bookAudioRef.current) {
      if (isAudioPlaying) bookAudioRef.current.pause();
      else bookAudioRef.current.play();
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const seek = (amount: number) => {
    if (bookAudioRef.current) bookAudioRef.current.currentTime += amount;
  };

  const handleSubmitReview = async (bookId: number) => {
    if (userRating === 0 || userComment.trim() === "") return;
    try {
      await addDoc(collection(db, "reviews"), {
        bookId: bookId,
        rating: userRating,
        comment: userComment,
        createdAt: serverTimestamp(),
        userName: "Membre Future Foundation"
      });
      setUserComment("");
      setUserRating(0);
    } catch (e) {
      console.error("Erreur Firebase : ", e);
    }
  };

  const formatAudioTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const updateProgress = () => {
    if (bookAudioRef.current) {
      const current = bookAudioRef.current.currentTime;
      const total = bookAudioRef.current.duration || 0;
      setAudioProgress((current / total) * 100);
      setAudioTimeInfo({
        current: formatAudioTime(current),
        total: formatAudioTime(total)
      });
    }
  };

  // 3. EFFECTs
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviewsData: { [key: number]: any[] } = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const bId = data.bookId;
        if (!reviewsData[bId]) reviewsData[bId] = [];
        reviewsData[bId].push({
          id: doc.id,
          ...data,
          date: data.createdAt?.toDate().toLocaleDateString('fr-FR') || "À l'instant"
        });
      });
      setReviews(reviewsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (viewingFile) localStorage.setItem('future_library_viewing_url', viewingFile);
    else localStorage.removeItem('future_library_viewing_url');
  }, [viewingFile]);

  useEffect(() => {
    if ('mediaSession' in navigator && currentBookId) {
      const activeBook = [...contents.reads, ...contents.audios].find(b => b.id === currentBookId);
      if (activeBook) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: activeBook.title,
          artist: (activeBook as any).author || (activeBook as any).source,
          artwork: [{ src: activeBook.cover, sizes: '512x512', type: 'image/webp' }]
        });
        navigator.mediaSession.setActionHandler('play', togglePlay);
        navigator.mediaSession.setActionHandler('pause', togglePlay);
        navigator.mediaSession.setActionHandler('seekbackward', () => seek(-10));
        navigator.mediaSession.setActionHandler('seekforward', () => seek(10));
      }
    }
  }, [currentBookId, isAudioPlaying]);

  useEffect(() => {
    const isReadingBook = viewingFile && activeTab === 'reads';
    if (isReadingBook && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev: number) => {
          const newTime = prev - 1;
          localStorage.setItem('future_library_time', newTime.toString());
          localStorage.setItem('future_library_last_date', Date.now().toString());
          return newTime;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [viewingFile, activeTab, timeLeft]);

  // 4. HANDLERS
  const handleActionStart = (item: any) => {
    if (item.type === 'pdf' && timeLeft <= 0) return;
    if (item.type === 'audio') {
      setConfirmItem(item);
      return;
    }
    const isAPdfLocked = currentBookId !== null && contents.reads.some(r => r.id === currentBookId);
    if (!isAPdfLocked) {
      setConfirmItem(item);
    } else if (currentBookId === item.id) {
      setIsPressing(true);
      pressTimerRef.current = setTimeout(() => {
        setViewingFile(item.fileUrl);
        setIsPressing(false);
      }, 2000);
    } else {
      setShowAdvice(true);
      setTimeout(() => setShowAdvice(false), 4000);
    }
  };

  const confirmChoice = () => {
    if (confirmItem) {
      setCurrentBookId(confirmItem.id);
      localStorage.setItem('future_library_book_id', confirmItem.id.toString());
      if (confirmItem.type === 'pdf') {
        setViewingFile(confirmItem.fileUrl);
      } else {
        setViewingFile(confirmItem.audioSrc);
        setIsAudioPlaying(false);
        setAudioProgress(0);
      }
      setConfirmItem(null);
    }
  };

  const getFilterStyle = () => {
    switch(readMode) {
      case 'sepia': return 'sepia(0.8) contrast(0.9) brightness(0.9)';
      case 'night': return 'invert(0.9) hue-rotate(180deg) brightness(0.8)';
      default: return 'none';
    }
  };

  return (
    <div id="bibliotheque" className="aurora-bg relative min-h-screen text-slate-100 p-6 md:p-12 font-sans select-none overflow-x-hidden scroll-mt-20">
      <style>{`
        .cd-rotate { animation: spin 6s linear infinite; }
        .cd-pause { animation-play-state: paused; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .aurora-bg { background: radial-gradient(circle at top right, #051923, #020617); position: relative; overflow: hidden; }
        .aurora-bg::before { content: ""; position: absolute; inset: -100%; background: radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 40%); filter: blur(80px); animation: aurora-flow 25s infinite alternate ease-in-out; }
        @keyframes aurora-flow { 0% { transform: scale(1); } 100% { transform: scale(1.2) translate(5%, 2%); } }
      `}</style>

      <audio ref={ambianceRef} src={selectedAmbiance.url} loop autoPlay={!!viewingFile} />
      <audio 
        ref={bookAudioRef} 
        key={viewingFile}
        src={activeTab === 'audios' ? (viewingFile || '') : ''} 
        loop={isLooping}
        onTimeUpdate={updateProgress}
        onPlay={() => setIsAudioPlaying(true)}
        onPause={() => setIsAudioPlaying(false)}
        autoPlay={activeTab === 'audios' && !!viewingFile}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 bg-black/40 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-blue-500 uppercase italic">Future Library</h1>
            <div className="flex gap-4 mt-4 bg-white/5 p-1.5 rounded-full w-fit">
              <button onClick={() => setActiveTab('reads')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${activeTab === 'reads' ? 'bg-emerald-500 text-black' : 'text-white/40'}`}>📚 Livres</button>
              <button onClick={() => setActiveTab('audios')} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${activeTab === 'audios' ? 'bg-emerald-500 text-black' : 'text-white/40'}`}>🎧 Audio</button>
            </div>
          </div>
          <div className={activeTab === 'reads' ? 'opacity-100' : 'opacity-0'}>
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-[1.8rem] text-center">
              <span className="text-4xl font-mono font-black text-white">{Math.floor(timeLeft / 60)}m {timeLeft % 60}s</span>
            </div>
          </div>
        </div>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-x-auto pb-12">
          {[...contents.reads, ...contents.audios]
            .filter(item => item.type === (activeTab === 'reads' ? 'pdf' : 'audio'))
            .map(item => {
              const isLocked = activeTab === 'reads' && currentBookId !== null && currentBookId !== item.id && contents.reads.some(r => r.id === currentBookId);
              const shouldRotate = activeTab === 'audios' && currentBookId === item.id && isAudioPlaying;

              return (
                <div key={item.id} className={`min-w-[85vw] md:min-w-0 bg-white/[0.03] p-6 rounded-[2.2rem] border transition-all ${currentBookId === item.id ? 'border-emerald-500/40 shadow-lg' : 'border-white/10'}`}>
                  <div className="relative overflow-hidden rounded-[1.8rem] mb-6 aspect-[3/4] flex items-center justify-center bg-black/40">
                    {item.type === 'pdf' ? (
                      <img src={item.cover} className="w-full h-full object-contain p-2" alt="" />
                    ) : (
                      <div className={`relative w-4/5 aspect-square rounded-full border-4 border-white/10 overflow-hidden ${shouldRotate ? 'cd-rotate' : 'cd-rotate cd-pause'}`}>
                        <img src={item.cover} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 bg-black rounded-full border-4 border-white/10" /></div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-xl text-white italic line-clamp-1">{item.title}</h3>
                  <p className="text-emerald-500/60 text-[9px] font-black uppercase mb-4">{(item as any).author || (item as any).source}</p>

                  {activeTab === 'audios' && currentBookId === item.id && viewingFile && (
                    <div className="bg-white/5 p-4 rounded-2xl mb-4 border border-white/10">
                      <div className="flex gap-4 mb-4 border-b border-white/5 pb-2">
                        <button onClick={() => setActiveView('player')} className={`text-[9px] font-black uppercase ${activeView === 'player' ? 'text-emerald-400' : 'text-white/20'}`}>▶ Lecteur</button>
                        <button onClick={() => setActiveView('reviews')} className={`text-[9px] font-black uppercase ${activeView === 'reviews' ? 'text-emerald-400' : 'text-white/20'}`}>💬 Avis ({reviews[item.id]?.length || 0})</button>
                      </div>
                      {activeView === 'player' ? (
                        <>
                          <div className="flex justify-between text-[10px] font-mono text-emerald-400 mb-2"><span>{audioTimeInfo.current}</span><span>{audioTimeInfo.total}</span></div>
                          <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${audioProgress}%` }} /></div>
                          <div className="flex justify-center items-center gap-6">
                            <button onClick={() => seek(-10)} className="text-white/40 text-xs">-10s</button>
                            <button onClick={togglePlay} className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-black">
                              {isAudioPlaying ? 'II' : '▶'}
                            </button>
                            <button onClick={() => seek(10)} className="text-white/40 text-xs">+10s</button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
                          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                            <div className="flex gap-1 mb-2">
                              {[1,2,3,4,5].map(s => <button key={s} onClick={() => setUserRating(s)} className={`text-sm ${userRating >= s ? 'text-yellow-400' : 'text-white/10'}`}>★</button>)}
                            </div>
                            <textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} placeholder="Votre avis..." className="w-full bg-transparent text-[10px] text-white outline-none mb-2" />
                            <button onClick={() => handleSubmitReview(item.id)} className="text-[8px] font-black uppercase bg-emerald-500 text-black px-3 py-1 rounded-lg">Publier</button>
                          </div>
                          {reviews[item.id]?.map((rev: any) => (
                            <div key={rev.id} className="border-l-2 border-emerald-500/30 pl-3 py-1">
                              <span className="text-yellow-400 text-[10px]">{'★'.repeat(rev.rating)}</span>
                              <p className="text-[10px] text-slate-300 italic">"{rev.comment}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button 
                    onMouseDown={() => handleActionStart(item)}
                    onMouseUp={() => { setIsPressing(false); if(pressTimerRef.current) clearTimeout(pressTimerRef.current); }}
                    className={`w-full py-4 rounded-2xl font-black uppercase text-[9px] ${isLocked ? 'bg-white/5 text-white/20' : 'bg-emerald-500 text-black'}`}
                  >
                    {item.type === 'audio' ? (currentBookId === item.id && viewingFile ? 'En lecture' : 'Écouter') : (isLocked ? 'Verrouillé' : (currentBookId === item.id ? 'Maintenir pour ouvrir' : 'Choisir'))}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {confirmItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80">
          <div className="bg-[#0a121e] border border-emerald-500/30 p-8 rounded-[2.5rem] max-w-sm w-full text-center">
            <h3 className="text-xl font-black text-white mb-2 uppercase italic">Confirmer ?</h3>
            <button onClick={confirmChoice} className="w-full py-4 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-xl mb-3">Confirmer</button>
            <button onClick={() => setConfirmItem(null)} className="w-full py-4 text-white/40 text-[10px] font-bold">Annuler</button>
          </div>
        </div>
      )}

      {viewingFile && activeTab === 'reads' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-8 bg-black/90">
          <div className="relative w-full max-w-6xl h-full bg-black border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex flex-wrap justify-between items-center bg-white/5 gap-4">
              <div className="flex gap-2">
                {['normal', 'sepia', 'night'].map(mode => (
                  <button key={mode} onClick={() => setReadMode(mode as any)} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${readMode === mode ? 'bg-white text-black' : 'text-white/40'}`}>{mode}</button>
                ))}
              </div>
              <button onClick={() => setViewingFile(null)} className="bg-red-500/20 text-red-500 px-6 py-2 rounded-full text-[9px] font-black uppercase">Fermer</button>
            </div>
            <div className="w-full h-full relative bg-white">
              <iframe 
                src={typeof window !== 'undefined' ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + viewingFile)}&embedded=true` : ''} 
                className="w-full h-full border-none" 
                style={{ filter: getFilterStyle() }} 
              />
            </div>
          </div>
        </div>
      )}
      {showAdvice && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-8 py-4 rounded-full font-black text-[10px] uppercase">💡 Un livre à la fois.</div>}
    </div>
  );
}
