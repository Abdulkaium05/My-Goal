import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Check, Star, Trash2, Loader2 } from 'lucide-react';
import { AppState, AnimeEntry } from '../types';
import { cn } from '../lib/utils';
import { Modal } from './Modal';

interface AnimePageProps {
  state: AppState;
  setState: (state: AppState) => void;
}

export const AnimePage = ({ state, setState }: AnimePageProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeList, setActiveList] = useState<'plan' | 'completed'>('plan');
  
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    animeId: number | null;
    rating: number;
  }>({
    isOpen: false,
    animeId: null,
    rating: 10,
  });

  const searchAnime = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=5`);
      const data = await resp.json();
      setResults(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addAnime = (anime: any) => {
    const entry: AnimeEntry = {
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      status: 'plan_to_watch',
      episodes: anime.episodes,
      rating: anime.score?.toString(),
      genres: anime.genres?.map((g: any) => g.name) || [],
    };
    if (!state.animeList.find(a => a.id === entry.id)) {
      setState({ ...state, animeList: [...state.animeList, entry] });
    }
    setSearch('');
    setResults([]);
  };

  const confirmComplete = () => {
    if (ratingModal.animeId === null) return;
    const updated = state.animeList.map(a => {
      if (a.id === ratingModal.animeId) {
        return { ...a, status: 'completed' as const, userRating: ratingModal.rating };
      }
      return a;
    });
    setState({ ...state, animeList: updated });
    setRatingModal({ ...ratingModal, isOpen: false });
  };

  const removeAnime = (id: number) => {
    if (window.confirm("Remove this anime from your list?")) {
      setState({ ...state, animeList: state.animeList.filter(a => a.id !== id) });
    }
  };

  const filteredList = state.animeList.filter(a => 
    activeList === 'plan' ? a.status === 'plan_to_watch' : a.status === 'completed'
  );

  const getGenreStats = () => {
    const genreCounts: Record<string, number> = {};
    let totalGenres = 0;

    state.animeList.forEach(anime => {
      anime.genres?.forEach(genre => {
        if (genre.toLowerCase() === 'award winning') return;
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        totalGenres++;
      });
    });

    if (totalGenres === 0) return [];

    return Object.entries(genreCounts)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / state.animeList.length) * 100),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 genres
  };

  const genreStats = getGenreStats();

  return (
    <div className="space-y-6 pb-24">
      <header>
        <h2 className="text-2xl font-bold text-accent">Anime Tracker</h2>
      </header>

      <div className="relative">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search anime..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent/50"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchAnime()}
            />
          </div>
          <button 
            onClick={searchAnime}
            disabled={loading}
            className="bg-accent text-slate-900 p-3 rounded-xl hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 z-[60] glass rounded-2xl overflow-hidden shadow-2xl"
            >
              {results.map(anime => (
                <button 
                  key={anime.mal_id}
                  onClick={() => addAnime(anime)}
                  className="w-full flex items-center p-3 hover:bg-white/10 text-left border-b border-white/5 last:border-0"
                >
                  <img src={anime.images.jpg.small_image_url} alt="" className="w-10 h-14 object-cover rounded-lg mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{anime.title}</p>
                    <p className="text-[10px] text-slate-400">{anime.type} • {anime.episodes || '?'} eps</p>
                  </div>
                  <Plus className="text-accent ml-2" size={18} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="glass-card space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Genre Breakdown</h3>
        {genreStats.length > 0 ? (
          <div className="space-y-2">
            {genreStats.map((stat) => (
              <div key={stat.name} className="space-y-1">
                <div className="flex justify-between text-[10px] font-medium">
                  <span>{stat.name}</span>
                  <span>{stat.percentage}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    className="h-full bg-accent transition-all duration-1000"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-500 italic">
            {state.animeList.length > 0 
              ? "Add new anime to see your genre statistics!" 
              : "Your genre breakdown will appear here once you add anime."}
          </p>
        )}
      </div>

      <div className="flex p-1 bg-white/5 rounded-xl">
        <button 
          onClick={() => setActiveList('plan')}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
            activeList === 'plan' ? "bg-accent text-slate-900" : "text-slate-400"
          )}
        >
          Plan to Watch
        </button>
        <button 
          onClick={() => setActiveList('completed')}
          className={cn(
            "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
            activeList === 'completed' ? "bg-accent text-slate-900" : "text-slate-400"
          )}
        >
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredList.map(anime => (
          <motion.div 
            layout
            key={anime.id}
            className="glass-card flex space-x-4"
          >
            <img src={anime.image} alt="" className="w-20 h-28 object-cover rounded-xl shadow-lg" />
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <h3 className="font-bold text-sm leading-tight line-clamp-2">{anime.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                    {anime.episodes || '?'} Episodes
                  </span>
                  {anime.rating && (
                    <div className="flex items-center text-[10px] text-warning">
                      <Star size={10} className="fill-warning mr-0.5" />
                      {anime.rating}
                    </div>
                  )}
                </div>
                {anime.genres && anime.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {anime.genres.slice(0, 3).map(genre => (
                      <span key={genre} className="text-[8px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full border border-accent/20">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                {activeList === 'plan' ? (
                  <button 
                    onClick={() => setRatingModal({ isOpen: true, animeId: anime.id, rating: 10 })}
                    className="flex items-center space-x-1 text-[10px] font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg hover:bg-success/20"
                  >
                    <Check size={12} />
                    <span>Complete</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 text-warning">
                    <Star size={12} className="fill-warning" />
                    <span className="text-xs font-bold">{anime.userRating || '?'}/10</span>
                  </div>
                )}
                <button 
                  onClick={() => removeAnime(anime.id)}
                  className="text-slate-500 hover:text-danger p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredList.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No anime in this list.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ ...ratingModal, isOpen: false })}
        title="Rate Anime"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="text-5xl font-black text-warning flex items-center">
              <Star size={40} className="fill-warning mr-2" />
              {ratingModal.rating}
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              className="w-full accent-warning"
              value={ratingModal.rating}
              onChange={e => setRatingModal({ ...ratingModal, rating: parseInt(e.target.value) })}
            />
            <div className="flex justify-between w-full text-xs text-slate-500">
              <span>1 - Poor</span>
              <span>10 - Masterpiece</span>
            </div>
          </div>
          <button 
            onClick={confirmComplete}
            className="w-full py-3 rounded-xl bg-accent text-slate-900 font-bold hover:bg-accent/90 transition-colors"
          >
            Mark as Completed
          </button>
        </div>
      </Modal>
    </div>
  );
};
