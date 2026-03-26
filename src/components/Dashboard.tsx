import { motion } from 'motion/react';
import { Wallet, Timer, Film, Moon, Quote } from 'lucide-react';
import { AppState } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useEffect, useState } from 'react';

const MOTIVATION_QUOTES = [
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "Your future is created by what you do today, not tomorrow.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Hard work beats talent when talent doesn't work hard.",
];

interface DashboardProps {
  state: AppState;
  onNavigate: (tab: string) => void;
}

export const Dashboard = ({ state, onNavigate }: DashboardProps) => {
  const [quote, setQuote] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setQuote(MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSaved = state.financeGoals.reduce((acc, goal) => acc + goal.saved, 0);
  const totalTarget = state.financeGoals.reduce((acc, goal) => acc + goal.target, 0);
  const financeProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const lastResetDate = new Date(state.lastReset);
  const diff = Math.floor((new Date().getTime() - lastResetDate.getTime()) / 1000);
  const days = Math.floor(diff / (24 * 3600));

  const completedAnime = state.animeList.filter(a => a.status === 'completed').length;
  const planAnime = state.animeList.filter(a => a.status === 'plan_to_watch').length;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col space-y-1">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
        >
          Good Morning, {state.userName}
        </motion.h1>
        <p className="text-slate-400 text-sm">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card flex items-start space-x-4 italic text-slate-300 relative overflow-hidden"
      >
        <Quote className="text-accent/40 absolute -right-2 -bottom-2 w-16 h-16" />
        <div className="relative z-10">
          <p className="text-sm leading-relaxed">"{quote}"</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <Widget 
          icon={Wallet} 
          label="Finance" 
          value={`${Math.round(financeProgress)}%`} 
          subValue={formatCurrency(totalSaved)}
          color="text-success"
          onClick={() => onNavigate('finance')}
        />
        <Widget 
          icon={Timer} 
          label="Recovery" 
          value={`${days} Days`} 
          subValue="Current Streak"
          color="text-danger"
          onClick={() => onNavigate('recover')}
        />
        <Widget 
          icon={Film} 
          label="Anime" 
          value={completedAnime.toString()} 
          subValue={`${planAnime} Planned`}
          color="text-accent"
          onClick={() => onNavigate('anime')}
        />
        <Widget 
          icon={Moon} 
          label="Next Prayer" 
          value="Dhuhr" 
          subValue="in 2h 15m"
          color="text-warning"
          onClick={() => onNavigate('prayer')}
        />
      </div>
    </div>
  );
};

const Widget = ({ icon: Icon, label, value, subValue, color, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="glass-card text-left flex flex-col space-y-2"
  >
    <div className={cn("p-2 rounded-xl bg-white/5 w-fit", color)}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-slate-500">{subValue}</p>
    </div>
  </motion.button>
);
