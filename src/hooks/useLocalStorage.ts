import { useState, useEffect } from 'react';
import { AppState, INITIAL_STATE } from '../types';

export function useLocalStorage() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('akaium_goal_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('akaium_goal_state', JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
}
