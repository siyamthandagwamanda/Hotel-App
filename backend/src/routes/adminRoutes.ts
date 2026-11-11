import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import * as reservations from '../controllers/adminReservationController';
import * as hotels from '../controllers/adminHotelController';

const router = Router();

// Only signed-in admins get past this line
router.use(requireAuth, requireRole('admin'));

router.get('/reservations', reservations.list);
router.get('/reservations/:reference', reservations.show);
router.post('/reservations/:reference/approve', reservations.approve);
router.post('/reservations/:reference/reject', reservations.reject);
router.post('/reservations/:reference/cancel', reservations.cancel);
router.post('/reservations/:reference/dates', reservations.changeDates);

router.get('/hotels', hotels.hotels);
router.post('/hotels', hotels.addHotel);
router.patch('/hotels/:hotelId', hotels.editHotel);
router.get('/hotels/:hotelId/rooms', hotels.rooms);
router.post('/hotels/:hotelId/rooms', hotels.addRoom);
router.patch('/rooms/:roomId', hotels.editRoom);
router.put('/rooms/:roomId/availability', hotels.availability);

export default router;