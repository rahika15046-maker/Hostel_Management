import { useEffect } from 'react';
import {
  Home, LayoutDashboard, DoorOpen, Users, LogOut,
  BedDouble, CheckCircle2, XCircle, Eye, Plus, Minus,
  Search, ChevronRight, Building2, Wifi, Wind, Star,
  AlertTriangle, RefreshCw, X
} from 'lucide-react';

/* ── Utilities ────────────────────────────────────── */
export const typeLabel = t => t === 'AC' ? 'AC' : 'Non-AC';
export const fmtDate = d => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
export const initials = n => (n || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
export { Home, LayoutDashboard, DoorOpen, Users, LogOut, BedDouble, Eye, Search, Building2 };

/* ── Brand Logo ───────────────────────────────────── */
export function Logo({ size = 32 }) {
  return (
    <div className="brand-icon" style={{ width: size, height: size, borderRadius: Math.round(size * 0.31) }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 18 18" fill="none">
        <path d="M9 2L2 6v6l7 4 7-4V6L9 2z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 2v10M2 6l7 4 7-4" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── ISO Room SVG ─────────────────────────────────── */
export function IsoRoom({ total = 2, beds, mine }) {
  const n = Math.max(1, Math.min(total, 12));
  const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols);
  const s = n > 6 ? 0.62 : n > 3 ? 0.8 : 1;
  const list = beds || Array.from({ length: n }, (_, i) => ({ bedNumber: i + 1, occupied: false }));
  return (
    <svg viewBox="0 -14 200 150" className="iso" role="img" aria-label={`Room with ${total} beds`}>
      <polygon points="20,80 100,40 100,-8 20,32" fill="#EDE9FE"/>
      <polygon points="100,40 180,80 180,32 100,-8" fill="#F0F1FF"/>
      <polygon points="122,8 158,26 158,52 122,34" fill="#BFDBFE" stroke="#fff" strokeWidth="3"/>
      <polygon points="100,120 20,80 100,40 180,80" fill="#FEF3C7"/>
      <polygon points="20,80 100,120 100,127 20,87" fill="#C7D2FE"/>
      <polygon points="100,120 180,80 180,87 100,127" fill="#A5B4FC"/>
      {list.slice(0, 12).map((b, i) => {
        const c = i % cols, r2 = Math.floor(i / cols);
        const x = 100 + (c - r2) * 26 * s, y = 80 + ((c + r2) - (cols + rows - 2) / 2) * 13 * s;
        const isMe = mine === b.bedNumber;
        const top = isMe ? '#FBBF24' : b.occupied ? '#8B5CF6' : '#10B981';
        const side = isMe ? '#D97706' : b.occupied ? '#6D28D9' : '#059669';
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <polygon points="-20,2 0,12 0,20 -20,10" fill={side}/>
            <polygon points="0,12 20,2 20,10 0,20" fill={side} opacity=".75"/>
            <polygon points="0,-8 20,2 0,12 -20,2" fill={top}/>
            <polygon points="-2,-3 8,2 -2,7 -12,2" fill="#fff" opacity=".9"/>
          </g>
        );
      })}
    </svg>
  );
}

/* ── ISO Building (Auth Art) ──────────────────────── */
export function IsoBuilding() {
  const wins = k => [0, 1, 2, 3].flatMap(r => [0, 1, 2].map(c => (
    <rect key={`${r}${c}`} x={10 + c * 22} y={10 + r * 24} width="14" height="16" rx="3"
      fill={(r * 3 + c + k) % 3 === 0 ? '#FEF3C7' : (r * 3 + c + k) % 3 === 1 ? '#DBEAFE' : '#EDE9FE'}/>
  )));
  return (
    <svg viewBox="0 0 260 260" className="iso-building" aria-hidden="true">
      {/* Shadow */}
      <ellipse cx="130" cy="228" rx="108" ry="16" fill="#C7D2FE" opacity=".45"/>
      {/* Building body */}
      <polygon points="50,70 130,110 130,210 50,170" fill="#EDE9FE"/>
      <polygon points="130,110 210,70 210,170 130,210" fill="#C7D2FE"/>
      <polygon points="130,28 210,70 130,110 50,70" fill="#F7F6FF"/>
      {/* Windows left */}
      <g transform="matrix(1 .5 0 1 50 70)">{wins(0)}</g>
      {/* Windows right */}
      <g transform="matrix(1 -.5 0 1 130 110)">{wins(1)}</g>
      {/* Roof accent */}
      <polygon points="130,28 210,70 130,110 50,70" fill="none" stroke="#A5B4FC" strokeWidth="1.5"/>
      {/* Trees */}
      <ellipse cx="32" cy="200" rx="16" ry="22" fill="#6EE7B7"/>
      <ellipse cx="38" cy="195" rx="10" ry="14" fill="#34D399"/>
      <ellipse cx="228" cy="204" rx="14" ry="19" fill="#A7F3D0"/>
      <ellipse cx="222" cy="200" rx="9" ry="12" fill="#6EE7B7"/>
      {/* Door */}
      <rect x="116" y="188" width="28" height="22" rx="4" fill="#818CF8"/>
      <rect x="118" y="190" width="12" height="20" rx="3" fill="#6366F1"/>
      {/* Flag */}
      <line x1="130" y1="28" x2="130" y2="8" stroke="#A5B4FC" strokeWidth="1.5"/>
      <polygon points="130,8 145,14 130,20" fill="#6366F1"/>
    </svg>
  );
}

/* ── Bed Dots ─────────────────────────────────────── */
export function Beds({ beds, tiles }) {
  if (tiles) {
    return (
      <div className="tiles">
        {beds.map(b => (
          <div key={b.bedNumber} className={`tile ${b.occupied ? 'occ' : 'free'}`}
            title={`Bed ${b.bedNumber}: ${b.occupied ? 'Occupied' : 'Available'}`}>
            <i/>
            <b>Bed {b.bedNumber}</b>
            <small>{b.occupied ? 'Occupied' : 'Available'}</small>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="dots">
      {beds.map(b => (
        <div key={b.bedNumber} className={`dot ${b.occupied ? 'occ' : 'free'}`}
          title={`Bed ${b.bedNumber}: ${b.occupied ? 'Occupied' : 'Available'}`}/>
      ))}
    </div>
  );
}

/* ── Status Badge ─────────────────────────────────── */
export function StatusBadge({ room }) {
  const label = room.status === 'FULL' ? 'Full' :
    room.status === 'AVAILABLE' ? 'Available' :
    `${room.availableBeds} bed${room.availableBeds > 1 ? 's' : ''} free`;
  return <span className={`badge ${room.status.toLowerCase()}`}>{label}</span>;
}

/* ── Occupancy Bar ────────────────────────────────── */
export function OccBar({ occupied, total }) {
  const pct = total ? Math.round(occupied / total * 100) : 0;
  return (
    <div className="occbar">
      <div>
        <span>{occupied} / {total} beds occupied</span>
        <b>{pct}%</b>
      </div>
      <div className="track"><i className="occ" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366F1,#8B7CF6)' }}/></div>
    </div>
  );
}

/* ── Ring Chart ───────────────────────────────────── */
export function Ring({ pct }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 130 130" role="img" aria-label={`${pct}% occupied`}>
        <defs>
          <linearGradient id="rg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#6366F1"/>
            <stop offset="1" stopColor="#8B7CF6"/>
          </linearGradient>
        </defs>
        <circle cx="65" cy="65" r={r} className="ring-bg"/>
        <circle cx="65" cy="65" r={r} className="ring-fg"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          transform="rotate(-90 65 65)"/>
      </svg>
      <div className="ring-text">
        <b>{pct}%</b>
        <span>occupied</span>
      </div>
    </div>
  );
}

/* ── Modal ────────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}
        onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">
          <X size={15}/>
        </button>
        {children}
      </div>
    </div>
  );
}

/* ── Skeleton Loader ──────────────────────────────── */
export function Skeleton({ n = 3, h = 180 }) {
  return (
    <div className="grid">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="skel" style={{ height: h }}/>
      ))}
    </div>
  );
}

/* ── Empty State ──────────────────────────────────── */
export function Empty({ title, text, children }) {
  return (
    <div className="empty">
      <IsoRoom total={2}/>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}

/* ── Room Card ────────────────────────────────────── */
export function RoomCard({ room, onOpen, onBook, booking, canBook, mine }) {
  const full = room.status === 'FULL';
  return (
    <article className={`room ${full ? 'is-full' : ''}`}>
      <div className="room-art">
        <IsoRoom total={room.totalBeds} beds={room.beds} mine={mine}/>
        <StatusBadge room={room}/>
      </div>
      <div className="room-body">
        <h3>{room.roomNumber}</h3>
        <div className="room-meta">
          <span>{typeLabel(room.roomType)}</span>
          <span className="room-meta-dot"/>
          <span>Floor {room.floor}</span>
          <span className="room-meta-dot"/>
          <span>{room.totalBeds} Beds</span>
        </div>
        <div className="occrow">
          <b>{room.occupiedBeds}/{room.totalBeds}</b>
          <Beds beds={room.beds}/>
          <span className="occrow-free">{room.availableBeds} free</span>
        </div>
        <div className="room-footer">
          <button className="btn ghost sm" onClick={() => onOpen(room)}>
            <Eye size={13}/> Details
          </button>
          {canBook && (
            <button className="btn sm" disabled={full || booking} onClick={() => onBook(room)}>
              {full ? 'Full' : booking ? 'Booking…' : 'Book Bed'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Room Modal ───────────────────────────────────── */
export function RoomModal({ room, onClose }) {
  return (
    <Modal title={`Room ${room.roomNumber}`} onClose={onClose}>
      <div className="modal-head">
        <div className="room-art sm">
          <IsoRoom total={room.totalBeds} beds={room.beds}/>
        </div>
        <div>
          <h2 style={{ marginBottom: 6 }}>Room {room.roomNumber}</h2>
          <div className="pills">
            <span className="pill">{typeLabel(room.roomType)}</span>
            <span className="pill sky">Floor {room.floor}</span>
            <StatusBadge room={room}/>
          </div>
        </div>
      </div>
      <h4>Bed allocation</h4>
      <Beds beds={room.beds} tiles/>
      <h4>Occupancy</h4>
      <OccBar occupied={room.occupiedBeds} total={room.totalBeds}/>
      {room.residents && <>
        <h4>Residents</h4>
        {room.residents.length === 0
          ? <p className="muted" style={{ fontSize: '0.875rem' }}>No residents allocated to this room.</p>
          : room.residents.map(r => (
            <div key={r.email} className="resident">
              <span className="avatar">{initials(r.name)}</span>
              <div>
                <b>{r.name}</b>
                <small>{r.email} · Bed {r.bedNumber}</small>
              </div>
            </div>
          ))}
      </>}
      <button className="btn ghost wide" style={{ marginTop: 18 }} onClick={onClose}>Close</button>
    </Modal>
  );
}
