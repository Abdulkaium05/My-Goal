import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Compass, BookOpen, Clock, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { QiblaCompass } from './QiblaCompass';

export const PrayerPage = () => {
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [showCompass, setShowCompass] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        console.error(err);
        // Default to Dhaka
        setLocation({ lat: 23.8103, lon: 90.4125 });
      }
    );
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchPrayers = async () => {
      try {
        const date = new Date();
        const resp = await fetch(`https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${location.lat}&longitude=${location.lon}&method=2`);
        const data = await resp.json();
        setPrayerTimes(data.data.timings);
        calculateNextPrayer(data.data.timings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayers();
  }, [location]);

  const calculateNextPrayer = (timings: any) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    const next = prayers.find(p => {
      const [h, m] = p.time.split(':').map(Number);
      return (h * 60 + m) > currentTime;
    }) || prayers[0];

    setNextPrayer(next);
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-warning">Prayer</h2>
          <p className="text-slate-400 text-xs flex items-center mt-1">
            <MapPin size={12} className="mr-1" />
            {location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : 'Detecting location...'}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-warning/10 text-warning">
          <Moon size={24} />
        </div>
      </header>

      {nextPrayer && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card bg-gradient-to-br from-warning/20 to-transparent border-warning/30 flex justify-between items-center"
        >
          <div>
            <p className="text-xs text-warning font-bold uppercase tracking-widest">Next Prayer</p>
            <h3 className="text-3xl font-black">{nextPrayer.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold">{nextPrayer.time}</p>
            <p className="text-[10px] text-slate-400">Local Time</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="glass-card h-16 animate-pulse" />
          ))
        ) : (
          prayerTimes && ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) => (
            <div key={name} className={cn(
              "glass-card flex justify-between items-center py-3 px-5",
              nextPrayer?.name === name && "border-warning/50 bg-warning/5"
            )}>
              <div className="flex items-center space-x-3">
                <Clock size={18} className={nextPrayer?.name === name ? "text-warning" : "text-slate-500"} />
                <span className="font-bold">{name}</span>
              </div>
              <span className="font-mono text-lg">{prayerTimes[name]}</span>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setShowCompass(true)}
          className="glass-card flex flex-col items-center justify-center space-y-2 py-6 hover:bg-white/10 transition-colors"
        >
          <Compass size={32} className="text-accent" />
          <span className="text-sm font-bold">Qibla</span>
          <span className="text-[10px] text-slate-500 text-center px-2">Use device sensor for direction</span>
        </button>
        <div className="glass-card flex flex-col items-center justify-center space-y-2 py-6">
          <BookOpen size={32} className="text-success" />
          <span className="text-sm font-bold">Hadith</span>
          <span className="text-[10px] text-slate-500 text-center px-2">Daily spiritual guidance</span>
        </div>
      </div>

      <div className="glass-card space-y-3">
        <h3 className="text-sm font-bold flex items-center space-x-2">
          <BookOpen size={16} className="text-success" />
          <span>Daily Hadith</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          "The best among you are those who have the best manners and character." (Sahih Bukhari)
        </p>
      </div>

      <AnimatePresence>
        {showCompass && location && (
          <QiblaCompass 
            onClose={() => setShowCompass(false)}
            userLat={location.lat}
            userLon={location.lon}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
