import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FinancePage } from './components/FinancePage';
import { RecoverPage } from './components/RecoverPage';
import { AnimePage } from './components/AnimePage';
import { PrayerPage } from './components/PrayerPage';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [state, setState] = useLocalStorage();

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard state={state} onNavigate={setActiveTab} />;
      case 'finance':
        return <FinancePage state={state} setState={setState} />;
      case 'recover':
        return <RecoverPage state={state} setState={setState} />;
      case 'anime':
        return <AnimePage state={state} setState={setState} />;
      case 'prayer':
        return <PrayerPage />;
      default:
        return <Dashboard state={state} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative px-4 pt-8">
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
