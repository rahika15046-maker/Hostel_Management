const Room = require('../models/Room');
const Alloc = require('../models/RoomAllocation');
const { ApiError, ok, wrap } = require('../utils/http');
async function withBeds(rooms, includeResidents) {
  const list = Array.isArray(rooms) ? rooms : [rooms];
  const allocs = await Alloc.find({ room: { $in: list.map(r => r._id) } }).populate('student', 'name email');
  return list.map(r => {
    const mine = allocs.filter(a => String(a.room) === String(r._id));
    const taken = new Set(mine.map(a => a.bedNumber));
    const o = r.toObject();
    o.beds = Array.from({ length: r.totalBeds }, (_, i) => ({ bedNumber: i + 1, occupied: taken.has(i + 1) }));
    if (includeResidents) o.residents = mine.sort((a, b) => a.bedNumber - b.bedNumber).map(a => ({
      name: a.student?.name, email: a.student?.email, bedNumber: a.bedNumber, allocatedAt: a.allocatedAt }));
    return o;
  });
}
exports.create = wrap(async (req, res) => {
  const { roomNumber, floor, roomType, totalBeds } = req.body;
  if (!roomNumber?.trim()) throw new ApiError(400, 'Room number is required.');
  if (floor === '' || floor == null || !Number.isInteger(Number(floor)) || Number(floor) < 0) throw new ApiError(400, 'Floor must be a whole number (0 or more).');
  if (!['AC', 'NON_AC'].includes(roomType)) throw new ApiError(400, 'Room type must be AC or NON_AC.');
  if (!Number.isInteger(Number(totalBeds)) || Number(totalBeds) < 1) throw new ApiError(400, 'Total beds must be at least 1.');
  const num = roomNumber.trim().toUpperCase();
  if (await Room.exists({ roomNumber: num })) throw new ApiError(409, 'Room number already exists.');
  const room = await Room.create({ roomNumber: num, floor: Number(floor), roomType, totalBeds: Number(totalBeds) });
  ok(res, { room }, 'Room created successfully', 201);
});
exports.list = wrap(async (req, res) => {
  const rooms = await Room.find().sort({ floor: 1, roomNumber: 1 });
  ok(res, { rooms: await withBeds(rooms, req.user.role === 'warden') });
});
exports.available = wrap(async (req, res) => {
  const rooms = await Room.find({ availableBeds: { $gt: 0 } }).sort({ floor: 1, roomNumber: 1 });
  ok(res, { rooms: await withBeds(rooms, false) });
});
exports.get = wrap(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found.');
  ok(res, { room: (await withBeds(room, req.user.role === 'warden'))[0] });
});
exports.stats = wrap(async (req, res) => {
  const [s] = await Room.aggregate([{ $group: { _id: null, totalRooms: { $sum: 1 }, totalBeds: { $sum: '$totalBeds' },
    occupiedBeds: { $sum: '$occupiedBeds' }, availableBeds: { $sum: '$availableBeds' },
    fullRooms: { $sum: { $cond: [{ $eq: ['$status', 'FULL'] }, 1, 0] } } } }, { $project: { _id: 0 } }]);
  ok(res, { stats: s || { totalRooms: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, fullRooms: 0 } });
});
