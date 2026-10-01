import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useApp } from '../context';
import { Skeleton, Empty, RoomCard, RoomModal, Modal, IsoRoom, IsoBuilding, typeLabel, fmtDate } from '../ui';
import { ArrowRight, CheckCircle, Home, RefreshCw, BedDouble, Calendar } from 'lucide-react';

/* ── Allocation Hook ──────────────────────────────── */
export function useAllocation() {
  const [alloc, setAlloc] = useState(undefined), [error, setError] = useState(false);
  const load = useCallback(() =>
    api.get('/allocations/me')
      .then(r => { setAlloc(r.data.data.allocation); setError(false); })
      .catch(() => setError(true)),
    []
  );
  useEffect(() => { load(); }, [load]);
  return { alloc, error, load };
}

/* ═══════════════════════════════════════════════════════
   STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════ */
export function Dashboard() {
  const { user } = useApp(), { alloc, error } = useAllocation(), [room, setRoom] = useState(null);
  useEffect(() => {
    if (alloc) api.get(`/rooms/${alloc.roomId}`).then(r => setRoom(r.data.data.room)).catch(() => {});
  }, [alloc]);

  return (
    <>
      <header className="head">
        <h1>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
        <p className="muted">Manage your hostel room and explore available options.</p>
      </header>

      {error ? (
        <Empty title="Couldn't load your allocation" text="Please refresh and try again."/>
      ) : alloc === undefined ? (
        <Skeleton n={1} h={280}/>
      ) : alloc ? (
        /* ── Has Allocation ── */
        <section className="hero">
          <div className="room-art" style={{ background: 'var(--grad-soft)', borderRadius: 'var(--r-xl)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IsoRoom total={room?.totalBeds || 2} beds={room?.beds} mine={alloc.bedNumber}/>
          </div>
          <div>
            <span className="badge allocated">✓ Allocated</span>
            <h2 style={{ marginTop: 8, marginBottom: 2 }}>Room {alloc.roomNumber}</h2>
            <p className="muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
              Floor {alloc.floor} · {typeLabel(alloc.roomType)} · Bed {alloc.bedNumber}
            </p>
            <dl className="facts">
              <div>
                <dt>Room Type</dt>
                <dd>{typeLabel(alloc.roomType)}</dd>
              </div>
              <div>
                <dt>Your Bed</dt>
                <dd>Bed {alloc.bedNumber}</dd>
              </div>
              {room && <>
                <div>
                  <dt>Total Beds</dt>
                  <dd>{room.totalBeds}</dd>
                </div>
                <div>
                  <dt>Roommates</dt>
                  <dd>{Math.max(room.occupiedBeds - 1, 0)}</dd>
                </div>
              </>}
            </dl>
            <p className="muted" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13}/>
              Allocated on {fmtDate(alloc.allocatedAt)}
            </p>
          </div>
        </section>
      ) : (
        /* ── No Allocation ── */
        <>
          {/* Welcome Hero */}
          <div className="student-hero">
            <div>
              <span className="badge" style={{ background: 'rgba(255,255,255,.7)', color: 'var(--pri)', marginBottom: 8 }}>
                ✦ Find Your Room
              </span>
              <h2>Find your perfect room</h2>
              <p>Browse available rooms and book your bed in seconds. Simple, fast, and hassle-free.</p>
              <Link to="/student/rooms" className="btn" style={{ marginTop: 16 }}>
                Browse Rooms <ArrowRight size={15}/>
              </Link>
            </div>
            <IsoBuilding/>
          </div>

          <div className="glass pad" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏠</div>
            <h3 style={{ marginBottom: 8 }}>You haven't booked a room yet</h3>
            <p className="muted" style={{ marginBottom: 20, maxWidth: '36ch', margin: '0 auto 20px' }}>
              Browse available rooms and claim an available bed to get started.
            </p>
            <Link to="/student/rooms" className="btn">Find a Room →</Link>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   STUDENT BROWSE — Available Rooms
   ═══════════════════════════════════════════════════════ */
export function Browse() {
  const { toast } = useApp(), go = useNavigate();
  const { alloc, load: loadAlloc } = useAllocation();
  const [rooms, setRooms] = useState(null), [error, setError] = useState(false);
  const [q, setQ] = useState(''), [flt, setFlt] = useState('ALL');
  const [open, setOpen] = useState(null), [booking, setBooking] = useState(null), [done, setDone] = useState(null);
  const [confirmRoom, setConfirmRoom] = useState(null);

  const load = useCallback(() =>
    api.get('/rooms')
      .then(r => { setRooms(r.data.data.rooms); setError(false); })
      .catch(() => setError(true)),
    []
  );
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (rooms || []).filter(r =>
    r.roomNumber.includes(q.trim().toUpperCase()) &&
    (flt === 'ALL' ||
      (flt === 'AVAILABLE' ? r.availableBeds > 0 : r.roomType === flt))
  ), [rooms, q, flt]);

  const book = async room => {
    setBooking(room._id);
    setConfirmRoom(null);
    try {
      const { data } = await api.post('/allocations/book', { roomId: room._id });
      setDone(data.data.allocation);
      loadAlloc();
      load();
    } catch (x) {
      toast(
        x.response ? errMsg(x) : "We couldn't complete your booking. The room may have just become full.",
        'error'
      );
      load();
      loadAlloc();
    } finally { setBooking(null); }
  };

  return (
    <>
      <header className="head">
        <h1>Available Rooms</h1>
        <p className="muted">Find a comfortable room with an available bed.</p>
      </header>

      {alloc && (
        <div className="notice">
          ℹ️ You already have Room {alloc.roomNumber}, Bed {alloc.bedNumber}. Booking another room is not possible.
        </div>
      )}

      <div className="toolbar">
        <input type="search" placeholder="Search room number…" aria-label="Search room number"
          value={q} onChange={e => setQ(e.target.value)}/>
        <div className="chips">
          {[['ALL', 'All Rooms'], ['AC', 'AC'], ['NON_AC', 'Non-AC'], ['AVAILABLE', 'Available']].map(([k, l]) => (
            <button key={k} className={flt === k ? 'on' : ''} onClick={() => setFlt(k)}>{l}</button>
          ))}
        </div>
      </div>

      {error ? (
        <Empty title="Couldn't load rooms" text="Please try again.">
          <button className="btn" onClick={load}><RefreshCw size={14}/> Retry</button>
        </Empty>
      ) : !rooms ? <Skeleton/> :
        shown.length === 0 ? (
          <Empty title="No rooms available" text="Try changing your filters or check back later."/>
        ) : (
          <div className="grid">
            {shown.map(r => (
              <RoomCard
                key={r._id} room={r}
                onOpen={setOpen}
                onBook={() => setConfirmRoom(r)}
                booking={booking === r._id}
                canBook={!alloc}
                mine={alloc?.roomId === r._id ? alloc.bedNumber : null}
              />
            ))}
          </div>
        )}

      {/* Room Detail Modal */}
      {open && <RoomModal room={open} onClose={() => setOpen(null)}/>}

      {/* Confirm Booking Modal */}
      {confirmRoom && !booking && (
        <Modal title="Confirm Booking" onClose={() => setConfirmRoom(null)}>
          <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
            <div style={{ background: 'var(--grad-soft)', borderRadius: 'var(--r-xl)', padding: '20px', marginBottom: 20 }}>
              <IsoRoom total={confirmRoom.totalBeds} beds={confirmRoom.beds}/>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Confirm Your Booking</h2>
            <div className="pills" style={{ justifyContent: 'center', marginBottom: 12 }}>
              <span className="pill">{confirmRoom.roomNumber}</span>
              <span className="pill">{typeLabel(confirmRoom.roomType)}</span>
              <span className="pill sky">Floor {confirmRoom.floor}</span>
            </div>
            <p className="muted" style={{ fontSize: '0.875rem', marginBottom: 24 }}>
              You will be allocated one available bed in Room {confirmRoom.roomNumber}.
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => setConfirmRoom(null)}>
                Cancel
              </button>
              <button className="btn" style={{ flex: 1 }} onClick={() => book(confirmRoom)}
                disabled={!!booking}>
                {booking === confirmRoom._id ? 'Booking…' : 'Confirm Booking →'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {done && (
        <Modal title="Booking Successful" onClose={() => go('/student/dashboard')}>
          <div className="success">
            <div style={{ background: 'var(--grad-soft)', borderRadius: 'var(--r-xl)', padding: '16px', maxWidth: 180 }}>
              <IsoRoom total={2}/>
            </div>
            <span className="check">✓</span>
            <h2 style={{ marginTop: 4 }}>Bed booked successfully!</h2>
            <p className="muted" style={{ fontSize: '0.875rem' }}>
              You have been allocated <strong>Bed {done.bedNumber}</strong> in <strong>Room {done.roomNumber}</strong>.
            </p>
            <button className="btn wide" onClick={() => go('/student/dashboard')}>
              <Home size={15}/> View My Allocation
            </button>
            <button className="btn ghost wide" onClick={() => setDone(null)}>
              Back to Rooms
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
