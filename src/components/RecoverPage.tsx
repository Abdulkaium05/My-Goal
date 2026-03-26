import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Trophy, ShieldAlert } from 'lucide-react';
import { AppState } from '../types';
import { cn } from '../lib/utils';

interface RecoverPageProps {
  state: AppState;
  setState: (state: AppState) => void;
}

export const RecoverPage = ({ state, setState }: RecoverPageProps) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const lastReset = new Date(state.lastReset);
  const diff = Math.max(0, Math.floor((now.getTime() - lastReset.getTime()) / 1000));

  const days = Math.floor(diff / (24 * 3600));
  const hours = Math.floor((diff % (24 * 3600)) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your streak? Stay strong!")) {
      setState({ ...state, lastReset: new Date().toISOString() });
    }
  };

  const milestones = [
    { label: '1 Day', days: 1 },
    { label: '3 Days', days: 3 },
    { label: '7 Days', days: 7 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
  ];

  return (
    <div className="space-y-8 pb-24 flex flex-col items-center">
      <header className="w-full">
        <h2 className="text-2xl font-bold text-danger">Iron Will</h2>
        <p className="text-slate-400 text-sm">Break the habit, build the man.</p>
      </header>

      <div className="flex flex-col items-center space-y-6 py-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-danger/20 blur-3xl rounded-full" />
          <div className="relative glass-card w-64 h-64 rounded-full flex flex-col items-center justify-center border-danger/30">
            <ShieldAlert className="text-danger mb-2" size={32} />
            <div className="text-4xl font-black tracking-tighter flex items-baseline">
              {days}<span className="text-sm font-normal text-slate-500 ml-1">D</span>
            </div>
            <div className="text-slate-400 font-mono text-sm mt-1">
              {hours.toString().padStart(2, '0')}:
              {minutes.toString().padStart(2, '0')}:
              {seconds.toString().padStart(2, '0')}
            </div>
          </div>
        </motion.div>

        <button 
          onClick={handleReset}
          className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-danger text-white font-bold shadow-lg shadow-danger/20 hover:bg-danger/90 transition-all active:scale-95"
        >
          <RefreshCw size={20} />
          <span>Reset Timer</span>
        </button>
      </div>

      <div className="w-full space-y-4">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <Trophy size={20} className="text-warning" />
          <span>Milestones</span>
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {milestones.map((m) => {
            const isReached = days >= m.days;
            return (
              <div 
                key={m.label}
                className={cn(
                  "glass-card flex justify-between items-center py-3",
                  isReached ? "border-success/30 bg-success/5" : "opacity-50"
                )}
              >
                <span className="font-medium">{m.label}</span>
                {isReached ? (
                  <span className="text-success text-xs font-bold uppercase tracking-widest">Achieved</span>
                ) : (
                  <span className="text-slate-500 text-xs">{m.days - days} days left</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
