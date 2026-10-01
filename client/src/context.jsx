import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
export function AppProvider({ children }) {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false), [toasts, setToasts] = useState([]);
  useEffect(() => {
    if (!localStorage.getItem('hx_token')) return setReady(true);
    api.get('/auth/me').then(r => setUser(r.data.data.user)).catch(() => localStorage.removeItem('hx_token')).finally(() => setReady(true));
  }, []);
  const toast = useCallback((message, type = 'success') => {
    const id = Math.random(); setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  const signIn = (data) => { localStorage.setItem('hx_token', data.token); setUser(data.user); };
  const signOut = () => { localStorage.removeItem('hx_token'); setUser(null); };
  return <Ctx.Provider value={{ user, ready, signIn, signOut, toast }}>{children}
    <div className="toasts" role="status" aria-live="polite">{toasts.map(t => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}</div></Ctx.Provider>;
}
