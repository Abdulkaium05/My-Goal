import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, TrendingUp, TrendingDown, Trash2, CheckCircle2 } from 'lucide-react';
import { AppState, FinanceGoal } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { Modal } from './Modal';

interface FinancePageProps {
  state: AppState;
  setState: (state: AppState) => void;
}

export const FinancePage = ({ state, setState }: FinancePageProps) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '' });
  
  const [transactionModal, setTransactionModal] = useState<{
    isOpen: boolean;
    goalId: string;
    type: 'saved' | 'expenses';
    amount: string;
  }>({
    isOpen: false,
    goalId: '',
    type: 'saved',
    amount: '',
  });

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target) return;
    const goal: FinanceGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoal.title,
      target: parseFloat(newGoal.target),
      saved: 0,
      expenses: 0,
    };
    setState({ ...state, financeGoals: [...state.financeGoals, goal] });
    setNewGoal({ title: '', target: '' });
    setShowAddGoal(false);
  };

  const updateGoal = () => {
    const { goalId, type, amount } = transactionModal;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;

    const updated = state.financeGoals.map(g => {
      if (g.id === goalId) {
        return { ...g, [type]: g[type] + numAmount };
      }
      return g;
    });
    setState({ ...state, financeGoals: updated });
    setTransactionModal({ ...transactionModal, isOpen: false, amount: '' });
  };

  const deleteGoal = (id: string) => {
    if (window.confirm("Delete this goal?")) {
      setState({ ...state, financeGoals: state.financeGoals.filter(g => g.id !== id) });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-success">Finance</h2>
        <button 
          onClick={() => setShowAddGoal(true)}
          className="p-2 rounded-full bg-success/20 text-success hover:bg-success/30 transition-colors"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="space-y-4">
        {state.financeGoals.map((goal) => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onOpenTransaction={(type) => setTransactionModal({
              isOpen: true,
              goalId: goal.id,
              type,
              amount: '',
            })}
            onDelete={deleteGoal}
          />
        ))}
        {state.financeGoals.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No goals yet. Start saving for something big!</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={showAddGoal} 
        onClose={() => setShowAddGoal(false)} 
        title="Add New Goal"
      >
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Goal Title (e.g. Buy Laptop)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-success/50"
            value={newGoal.title}
            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
          />
          <input 
            type="number" 
            placeholder="Target Amount (BDT)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-success/50"
            value={newGoal.target}
            onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
          />
          <button 
            onClick={addGoal}
            className="w-full py-3 rounded-xl bg-success text-slate-900 font-bold hover:bg-success/90 transition-colors"
          >
            Create Goal
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal({ ...transactionModal, isOpen: false })}
        title={transactionModal.type === 'saved' ? 'Add Savings' : 'Add Expense'}
      >
        <div className="space-y-3">
          <input 
            type="number" 
            placeholder="Amount (BDT)"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-success/50"
            value={transactionModal.amount}
            onChange={e => setTransactionModal({ ...transactionModal, amount: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && updateGoal()}
          />
          <button 
            onClick={updateGoal}
            className={cn(
              "w-full py-3 rounded-xl font-bold transition-colors",
              transactionModal.type === 'saved' ? "bg-success text-slate-900" : "bg-danger text-white"
            )}
          >
            Confirm {transactionModal.type === 'saved' ? 'Savings' : 'Expense'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

interface GoalCardProps {
  key?: string;
  goal: FinanceGoal;
  onOpenTransaction: (type: 'saved' | 'expenses') => void;
  onDelete: (id: string) => void;
}

const GoalCard = ({ goal, onOpenTransaction, onDelete }: GoalCardProps) => {
  const progress = Math.min((goal.saved / goal.target) * 100, 100);
  const isCompleted = progress >= 100;

  const getProgressColor = () => {
    if (progress < 50) return 'bg-warning';
    if (progress < 80) return 'bg-accent';
    return 'bg-success';
  };

  return (
    <motion.div 
      layout
      className="glass-card space-y-4 relative overflow-hidden"
    >
      {isCompleted && (
        <div className="absolute top-2 right-2 text-success">
          <CheckCircle2 size={20} />
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{goal.title}</h3>
          <p className="text-xs text-slate-400">Target: {formatCurrency(goal.target)}</p>
        </div>
        <button onClick={() => onDelete(goal.id)} className="text-slate-500 hover:text-danger p-1">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium">
          <span>{formatCurrency(goal.saved)} saved</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full transition-all duration-1000", getProgressColor())}
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <button 
          onClick={() => onOpenTransaction('saved')}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl bg-success/10 text-success text-sm font-medium hover:bg-success/20"
        >
          <TrendingUp size={16} />
          <span>Save</span>
        </button>
        <button 
          onClick={() => onOpenTransaction('expenses')}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20"
        >
          <TrendingDown size={16} />
          <span>Expense</span>
        </button>
      </div>
    </motion.div>
  );
};
