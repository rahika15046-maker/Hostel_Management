import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useApp } from '../context';
import { IsoBuilding, Logo } from '../ui';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function Auth({ mode }) {
  const reg = mode === 'register';
  const { signIn, toast } = useApp(), go = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', role: 'student' });
  const [show, setShow] = useState(false), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault(); setErr('');
    if (reg && !f.name.trim()) return setErr('Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.');
    if (f.password.length < 8) return setErr('Password must be at least 8 characters.');
    if (reg && f.password !== f.confirm) return setErr('Passwords do not match.');
    setBusy(true);
    try {
      const { data } = await api.post(
        reg ? '/auth/register' : '/auth/login',
        reg
          ? { name: f.name, email: f.email, password: f.password, role: f.role }
          : { email: f.email, password: f.password }
      );
      const u = data.data.user;
      if (!reg && u.role !== f.role) {
        localStorage.removeItem('hx_token');
        return setErr(`This is a ${u.role} account. Switch to the ${u.role === 'warden' ? 'Warden' : 'Student'} tab.`);
      }
      signIn(data.data);
      toast(reg ? 'Account created successfully!' : 'Welcome back!');
      go(`/${u.role}/dashboard`);
    } catch (x) { setErr(errMsg(x)); }
    finally { setBusy(false); }
  };

  const features = [
    'Secure & Reliable',
    'Easy Room Booking',
    'Real-time Availability',
  ];

  return (
    <div className="auth">
      {/* Left Art Panel */}
      <section className="auth-art">
        <div className="auth-art-orb o1"/>
        <div className="auth-art-orb o2"/>
        <div className="brand">
          <Logo size={34}/>
          <span style={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', fontSize: '1.5rem' }}>
            Hostel<span style={{ color: 'var(--pri)' }}>X</span>
          </span>
        </div>
        <h1>
          {reg ? <>Your home<br/><span>away from home.</span></> : <>Your home<br/><span>away from home.</span></>}
        </h1>
        <p>Simple, secure and smarter hostel room management — built for students and wardens alike.</p>
        <IsoBuilding/>
        <ul className="feats">
          {features.map(feat => (
            <li key={feat}>
              <span className="feats-check">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5L4.5 8L9 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {feat}
            </li>
          ))}
        </ul>
      </section>

      {/* Right Auth Panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="brand" style={{ marginBottom: 24 }}>
            <Logo size={28}/>
            <span style={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', fontSize: '1.25rem' }}>
              Hostel<span style={{ color: 'var(--pri)' }}>X</span>
            </span>
          </div>
          <h2>{reg ? 'Create your account' : 'Welcome back!'}</h2>
          <p className="muted" style={{ marginTop: 4, fontSize: '0.9rem' }}>
            {reg ? 'Join HostelX and get started today.' : 'Log in to manage your hostel experience.'}
          </p>

          {/* Role Selector */}
          <div className="tabs" role="tablist" aria-label="Select role">
            {[['student', 'Student'], ['warden', 'Warden']].map(([r, label]) => (
              <button
                key={r} type="button" role="tab"
                aria-selected={f.role === r}
                className={f.role === r ? 'on' : ''}
                onClick={() => setF({ ...f, role: r })}
              >{label}</button>
            ))}
          </div>

          <form onSubmit={submit} noValidate style={{ marginTop: 8 }}>
            {reg && (
              <div className="input-wrap">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name" value={f.name} onChange={set('name')}
                  autoComplete="name" placeholder="Priya Kumari"
                />
              </div>
            )}
            <div className="input-wrap">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email" type="email" value={f.email} onChange={set('email')}
                autoComplete="email" placeholder="you@college.edu"
              />
            </div>
            <div className="input-wrap">
              <label htmlFor="auth-password">Password</label>
              <div className="pw">
                <input
                  id="auth-password"
                  type={show ? 'text' : 'password'}
                  value={f.password} onChange={set('password')}
                  autoComplete={reg ? 'new-password' : 'current-password'}
                  placeholder="At least 8 characters"
                />
                <button type="button" className="pw-toggle" onClick={() => setShow(!show)}
                  aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {reg && (
              <div className="input-wrap">
                <label htmlFor="auth-confirm">Confirm password</label>
                <input
                  id="auth-confirm" type="password" value={f.confirm} onChange={set('confirm')}
                  autoComplete="new-password" placeholder="Re-enter your password"
                />
              </div>
            )}

            {err && (
              <div className="err" role="alert">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {err}
              </div>
            )}

            <button className="btn wide" disabled={busy} style={{ marginTop: 20 }}>
              {busy ? 'Please wait…' : reg ? 'Create Account →' : 'Log in →'}
            </button>
          </form>

          {!reg && (
            <>
              <div className="auth-divider">OR</div>
              <Link to="/register" className="btn ghost wide" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                Create an account
              </Link>
            </>
          )}

          <p className="auth-footer">
            {reg ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={reg ? '/login' : '/register'}>
              {reg ? 'Log in' : 'Register'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
