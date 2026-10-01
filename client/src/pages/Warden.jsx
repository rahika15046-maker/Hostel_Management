import { useEffect, useMemo, useState, useCallback } from 'react';
import api, { errMsg } from '../api';
import { useApp } from '../context';
import {
  Ring, Skeleton, Empty, RoomCard, RoomModal, StatusBadge,
  IsoRoom, typeLabel, fmtDate, initials, OccBar, Beds
} from '../ui';
import {
  DoorOpen, Users, BedDouble, LayoutDashboard,
  Plus, Minus, Search, RefreshCw, TrendingUp
} from 'lucide-react';

/* ── Data Hook ────────────────────────────────────── */
function useRooms() {
  const [rooms, setRooms] = useState(null), [stats, setStats] = useState(null), [error, setError] = useState(false);
  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api.get('/rooms'), api.get('/rooms/stats')]);
      setRooms(a.data.data.rooms);
      setStats(b.data.data.stats);
      setError(false);
    } catch { setError(true); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { rooms, stats, error, load };
}

const hour = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

/* ═══════════════════════════════════════════════════════
   WARDEN DASHBOARD — Overview
   ═══════════════════════════════════════════════════════ */
export function Overview() {
  const { user } = useApp(), { rooms, stats, error, load } = useRooms(), [open, setOpen] = useState(null);
  const pct = stats && stats.totalBeds ? Math.round(stats.occupiedBeds / stats.totalBeds * 100) : 0;

  const statCards = stats && [
    { label: 'Total Rooms', value: stats.totalRooms, cls: 'lav', icon: DoorOpen, sub: 'All hostel rooms' },
    { label: 'Total Beds', value: stats.totalBeds, cls: 'sky', icon: BedDouble, sub: 'Bed capacity' },
    { label: 'Occupied', value: stats.occupiedBeds, cls: 'mint', icon: Users, sub: 'Beds filled' },
    { label: 'Available', value: stats.availableBeds, cls: 'peach', icon: TrendingUp, sub: 'Beds free' },
    { label: 'Full Rooms', value: stats.fullRooms, cls: 'pink', icon: LayoutDashboard, sub: 'At capacity' },
  ];

  const by = s => (rooms || []).filter(r => r.status === s).length;
  const n = (rooms || []).length || 1;
  const recent = useMemo(() =>
    [...(rooms || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    [rooms]
  );

  return (
    <>
      <header className="head">
        <h1>{hour()}, {user.name.split(' ')[0]} 👋</h1>
        <p className="muted">Here's what's happening in your hostel today.</p>
      </header>

      {error ? (
        <Empty title="Couldn't load hostel data" text="Check your connection and try again.">
          <button className="btn" onClick={load}><RefreshCw size={14}/> Retry</button>
        </Empty>
      ) : !stats || !rooms ? (
        <>
          <div className="stats">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="skel" style={{ height: 110 }}/>)}
          </div>
          <Skeleton n={2} h={220}/>
        </>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stats">
            {statCards.map(({ label, value, cls, icon: Icon, sub }) => (
              <div key={label} className={`stat ${cls}`}>
                <div className="stat-icon"><Icon size={20}/></div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
                <div className="stat-sub">{sub}</div>
              </div>
            ))}
          </div>

          {/* Occupancy + Status */}
          <div className="two">
            <div className="two-card">
              <h3>Hostel Occupancy</h3>
              <div className="occ">
                <Ring pct={pct}/>
                <ul className="legend">
                  <li><i className="d occ"/> Occupied <b>{stats.occupiedBeds}</b></li>
                  <li><i className="d free"/> Available <b>{stats.availableBeds}</b></li>
                  <li><i className="d tot"/> Total <b>{stats.totalBeds}</b></li>
                </ul>
              </div>
            </div>
            <div className="two-card">
              <h3>Room Status Overview</h3>
              <div className="split">
                <div className="bars">
                  {[
                    ['Available', by('AVAILABLE'), 'free'],
                    ['Partially Filled', by('PARTIALLY_FILLED'), 'part'],
                    ['Full', by('FULL'), 'full'],
                  ].map(([label, val, cls]) => (
                    <div key={label}>
                      <div className="bl">
                        <span><i className={`d ${cls}`}/> {label}</span>
                        <b>{val}</b>
                      </div>
                      <div className="track"><i className={cls} style={{ width: `${val / n * 100}%` }}/></div>
                    </div>
                  ))}
                </div>
                <div className="room-art sm" style={{ background: 'var(--grad-soft)', borderRadius: 'var(--r-lg)', padding: '12px' }}>
                  {rooms[0]
                    ? <IsoRoom total={rooms[0].totalBeds} beds={rooms[0].beds}/>
                    : <IsoRoom total={2}/>}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Rooms Table */}
          <h2 className="sec">Recent Rooms</h2>
          {recent.length === 0 ? (
            <Empty title="No rooms yet" text="Create your first room from the Rooms page."/>
          ) : (
            <div className="tablewrap">
              <div className="tablewrap-inner">
                <table>
                  <thead>
                    <tr>
                      <th>Room No.</th>
                      <th>Floor</th>
                      <th>Type</th>
                      <th>Total Beds</th>
                      <th>Occupied</th>
                      <th>Available</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r._id}>
                        <td><span className="table-cell-bold">{r.roomNumber}</span></td>
                        <td>{r.floor}</td>
                        <td>{typeLabel(r.roomType)}</td>
                        <td>{r.totalBeds}</td>
                        <td>{r.occupiedBeds}</td>
                        <td>{r.availableBeds}</td>
                        <td><StatusBadge room={r}/></td>
                        <td>
                          <button className="btn ghost sm" onClick={() => setOpen(r)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {open && <RoomModal room={open} onClose={() => setOpen(null)}/>}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   WARDEN ROOMS — Manage + Add
   ═══════════════════════════════════════════════════════ */
export function Rooms() {
  const { toast } = useApp(), { rooms, error, load } = useRooms();
  const [form, setForm] = useState({ roomNumber: '', floor: '', roomType: 'AC', totalBeds: 2 });
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const [q, setQ] = useState(''), [flt, setFlt] = useState('ALL'), [open, setOpen] = useState(null);

  const shown = useMemo(() => (rooms || []).filter(r =>
    r.roomNumber.includes(q.trim().toUpperCase()) &&
    (flt === 'ALL' ||
      (flt === 'FULL' ? r.status === 'FULL' :
        flt === 'AVAILABLE' ? r.availableBeds > 0 : r.roomType === flt))
  ), [rooms, q, flt]);

  const create = async e => {
    e.preventDefault(); setErr('');
    if (!form.roomNumber.trim()) return setErr('Room number is required.');
    if (form.floor === '' || Number(form.floor) < 0) return setErr('Enter a valid floor number.');
    setBusy(true);
    try {
      await api.post('/rooms', { ...form, floor: Number(form.floor) });
      toast('Room created successfully.');
      setForm({ ...form, roomNumber: '', floor: '' });
      load();
    } catch (x) {
      const m = errMsg(x);
      setErr(m);
      toast(m, 'error');
    } finally { setBusy(false); }
  };

  return (
    <>
      <header className="head">
        <h1>Rooms</h1>
        <p className="muted">Create and monitor all hostel rooms from one place.</p>
      </header>

      {/* Add Room Form */}
      <div className="create">
        <div className="create-inner">
          <div className="create-form">
            <h3>Add New Room</h3>
            <p className="muted" style={{ fontSize: '0.875rem' }}>Create a hostel room with capacity details.</p>
            <form onSubmit={create} noValidate>
              <div className="fields">
                <div>
                  <label htmlFor="rn">Room Number</label>
                  <input id="rn" value={form.roomNumber}
                    onChange={e => setForm({ ...form, roomNumber: e.target.value })}
                    placeholder="e.g. A-101" style={{ marginTop: 6 }}/>
                </div>
                <div>
                  <label htmlFor="rf">Floor</label>
                  <input id="rf" type="number" min="0" value={form.floor}
                    onChange={e => setForm({ ...form, floor: e.target.value })}
                    placeholder="e.g. 1" style={{ marginTop: 6 }}/>
                </div>
              </div>
              <div className="fields" style={{ marginTop: 14 }}>
                <div>
                  <div className="lbl" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink-3)' }}>Room Type</div>
                  <div className="tabs sm">
                    {[['AC', 'AC'], ['NON_AC', 'Non-AC']].map(([k, l]) => (
                      <button key={k} type="button" className={form.roomType === k ? 'on' : ''}
                        onClick={() => setForm({ ...form, roomType: k })}>{l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="lbl" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.01em', color: 'var(--ink-3)', marginBottom: 6 }}>Bed Capacity</div>
                  <div className="stepper">
                    <button type="button" aria-label="Decrease"
                      onClick={() => setForm({ ...form, totalBeds: Math.max(1, form.totalBeds - 1) })}>
                      <Minus size={14}/>
                    </button>
                    <b>{form.totalBeds}</b>
                    <button type="button" aria-label="Increase"
                      onClick={() => setForm({ ...form, totalBeds: Math.min(20, form.totalBeds + 1) })}>
                      <Plus size={14}/>
                    </button>
                  </div>
                </div>
              </div>
              {err && <div className="err" role="alert">{err}</div>}
              <button className="btn wide" disabled={busy} style={{ marginTop: 18 }}>
                {busy ? 'Creating…' : 'Create Room →'}
              </button>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="preview">
            <h4 style={{ margin: '0 0 14px', textAlign: 'left' }}>Room Preview</h4>
            <div style={{ maxWidth: 180, width: '100%' }}>
              <IsoRoom total={form.totalBeds}/>
            </div>
            <b style={{ marginTop: 12 }}>{form.roomNumber.trim().toUpperCase() || 'A-101'}</b>
            <p className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
              Floor {form.floor || '—'} · {typeLabel(form.roomType)} · {form.totalBeds} Beds
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <input type="search" placeholder="Search room number…" aria-label="Search room number"
          value={q} onChange={e => setQ(e.target.value)}/>
        <div className="chips">
          {[['ALL', 'All'], ['AC', 'AC'], ['NON_AC', 'Non-AC'], ['AVAILABLE', 'Available'], ['FULL', 'Full']].map(([k, l]) => (
            <button key={k} className={flt === k ? 'on' : ''} onClick={() => setFlt(k)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      {error ? (
        <Empty title="Couldn't load rooms" text="Please try again.">
          <button className="btn" onClick={load}><RefreshCw size={14}/> Retry</button>
        </Empty>
      ) : !rooms ? <Skeleton/> :
        shown.length === 0 ? (
          <Empty title="No rooms found" text="Adjust your search or filters, or add a room above."/>
        ) : (
          <div className="grid">
            {shown.map(r => <RoomCard key={r._id} room={r} onOpen={setOpen}/>)}
          </div>
        )}

      {open && <RoomModal room={open} onClose={() => setOpen(null)}/>}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   WARDEN RESIDENTS — Residents Table
   ═══════════════════════════════════════════════════════ */
export function Residents() {
  const [list, setList] = useState(null), [error, setError] = useState(false);
  useEffect(() => {
    api.get('/allocations')
      .then(r => setList(r.data.data.allocations))
      .catch(() => setError(true));
  }, []);

  return (
    <>
      <header className="head">
        <h1>Residents</h1>
        <p className="muted">Everyone currently allocated a bed in the hostel.</p>
      </header>

      {error ? (
        <Empty title="Couldn't load residents" text="Please try again."/>
      ) : !list ? (
        <Skeleton n={1} h={280}/>
      ) : list.length === 0 ? (
        <Empty title="No residents yet" text="Allocations will appear here once students book beds."/>
      ) : (
        <div className="tablewrap">
          <div className="tablewrap-inner">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Room</th>
                  <th>Bed</th>
                  <th>Type</th>
                  <th>Allocated On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="resident">
                        <span className="avatar">{initials(a.name)}</span>
                        <div>
                          <b>{a.name}</b>
                          <small>{a.email}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="table-cell-bold">{a.roomNumber}</span></td>
                    <td>Bed {a.bedNumber}</td>
                    <td>{typeLabel(a.roomType)}</td>
                    <td>{fmtDate(a.allocatedAt)}</td>
                    <td><span className="badge allocated">Allocated</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
