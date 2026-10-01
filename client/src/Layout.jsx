import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from './context';
import { Logo } from './ui';
import {
  LayoutDashboard, DoorOpen, Users, LogOut,
  Home, BedDouble, User
} from 'lucide-react';

const nav = {
  warden: [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['rooms', 'Rooms', DoorOpen],
    ['residents', 'Residents', Users],
  ],
  student: [
    ['dashboard', 'My Room', Home],
    ['rooms', 'Find Rooms', BedDouble],
  ],
};

export default function Layout() {
  const { user, signOut } = useApp(), go = useNavigate();
  const out = () => { signOut(); go('/login'); };
  const links = nav[user.role];
  const initials = n => (n || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="shell">
      <div className="bg-orbs" aria-hidden="true"><i/><i/><i/></div>

      {/* Sidebar */}
      <aside className="side">
        <div className="brand" style={{ textDecoration: 'none' }}>
          <Logo size={32}/>
          <span style={{ fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
            Hostel<span style={{ color: 'var(--pri)' }}>X</span>
          </span>
        </div>

        <div className="side-label">Navigation</div>
        <nav>
          {links.map(([path, label, Icon]) => (
            <NavLink key={path} to={`/${user.role}/${path}`}>
              <Icon size={17} className="nav-icon"/>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="side-bottom">
          <div className="side-user">
            <span className="avatar">{initials(user.name)}</span>
            <div className="side-user-info">
              <b>{user.name}</b>
              <small style={{ textTransform: 'capitalize' }}>{user.role}</small>
            </div>
          </div>
          <button className="side-logout" onClick={out}>
            <LogOut size={16} style={{ opacity: 0.7 }}/>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="brand topbar-brand">
              <Logo size={28}/>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                Hostel<span style={{ color: 'var(--pri)' }}>X</span>
              </span>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-chip">
              <span className="avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>{initials(user.name)}</span>
              <div>
                <b style={{ fontSize: '0.83rem', display: 'block', lineHeight: 1.2 }}>{user.name}</b>
                <span className="role-badge">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
        <Outlet/>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom">
        {links.map(([path, label, Icon]) => (
          <NavLink key={path} to={`/${user.role}/${path}`}>
            <Icon size={21}/>
            <span>{label}</span>
          </NavLink>
        ))}
        <button onClick={out}>
          <LogOut size={21}/>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
