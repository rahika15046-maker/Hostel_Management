// Races N students for a 1-bed room against a running API: npm run test:concurrency
const base = process.env.API || 'http://localhost:5000/api';
const call = (p, body, t) => fetch(base + p, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) }, body: body && JSON.stringify(body) }).then(async r => ({ s: r.status, ...(await r.json()) }));
(async () => {
  const id = Date.now(), N = 8;
  const w = await call('/auth/register', { name: 'W', email: `w${id}@t.com`, password: 'Password123', role: 'warden' });
  const room = await call('/rooms', { roomNumber: `T-${id}`, floor: 1, roomType: 'AC', totalBeds: 1 }, w.data.token);
  const toks = await Promise.all(Array.from({ length: N }, (_, i) => call('/auth/register', { name: 'S' + i, email: `s${i}_${id}@t.com`, password: 'Password123', role: 'student' }).then(r => r.data.token)));
  const res = await Promise.all(toks.map(t => call('/allocations/book', { roomId: room.data.room._id }, t)));
  const wins = res.filter(r => r.s === 201).length;
  const after = await call('/rooms/' + room.data.room._id, null, w.data.token);
  const r = after.data.room;
  console.log('statuses:', res.map(x => x.s).join(','), '| room:', `${r.occupiedBeds}/${r.totalBeds}`, r.status);
  const pass = wins === 1 && r.occupiedBeds === 1; console.log(pass ? 'PASS' : 'FAIL'); process.exit(pass ? 0 : 1);
})();
