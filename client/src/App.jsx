import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context';
import Layout from './Layout';
import Auth from './pages/Auth';
import * as W from './pages/Warden';
import * as S from './pages/Student';
function Guard({ role }) {
  const { user, ready } = useApp();
  if (!ready) return <div className="boot">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? <Layout /> : <Navigate to={`/${user.role}/dashboard`} replace />;
}
function Public({ mode }) { const { user, ready } = useApp(); return ready && user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Auth mode={mode} />; }
export default function App() {
  return <BrowserRouter><AppProvider><Routes>
    <Route path="/login" element={<Public mode="login" />} /><Route path="/register" element={<Public mode="register" />} />
    <Route path="/warden" element={<Guard role="warden" />}><Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<W.Overview />} /><Route path="rooms" element={<W.Rooms />} /><Route path="residents" element={<W.Residents />} /></Route>
    <Route path="/student" element={<Guard role="student" />}><Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<S.Dashboard />} /><Route path="rooms" element={<S.Browse />} /></Route>
    <Route path="*" element={<Navigate to="/login" replace />} /></Routes></AppProvider></BrowserRouter>;
}
