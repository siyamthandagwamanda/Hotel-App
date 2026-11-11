import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { addHotel, addRoom, changeHotelStatus, loadAdminHotels, loadAdminRooms, saveAvailability } from '../../slices/adminSlice';
import { formatRand } from '../../utils/formatUtils';

const STATUSES = ['draft', 'published', 'retired'];
const SETTINGS = ['beach', 'city', 'safari', 'mountain', 'countryside'];

const emptyHotel = {
  name: '', description: '', city: '', province: '', address: '',
  latitude: '', longitude: '', starRating: '4', setting: 'city',
};
const emptyRoom = { name: '', adults: '2', children: '0', bedType: '', price: '', totalUnits: '1' };
const emptyAvailability = { from: '', to: '', units: '', price: '' };

export function HotelsPanel() {
  const dispatch = useAppDispatch();
  const { hotels, rooms, roomsHotelId, status } = useAppSelector((state) => state.admin);
  const busy = status === 'loading';

  const [showHotelForm, setShowHotelForm] = useState(false);
  const [hotelForm, setHotelForm] = useState(emptyHotel);
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [availability, setAvailability] = useState(emptyAvailability);
  const [availabilityRoomId, setAvailabilityRoomId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(loadAdminHotels());
  }, [dispatch]);

  async function handleAddHotel(event: FormEvent) {
    event.preventDefault();
    const result = await dispatch(
      addHotel({
        name: hotelForm.name,
        description: hotelForm.description,
        city: hotelForm.city,
        province: hotelForm.province,
        address: hotelForm.address,
        latitude: Number(hotelForm.latitude),
        longitude: Number(hotelForm.longitude),
        starRating: Number(hotelForm.starRating),
        setting: hotelForm.setting,
      }),
    );
    if (addHotel.fulfilled.match(result)) {
      setHotelForm(emptyHotel);
      setShowHotelForm(false);
    }
  }

  async function handleAddRoom(event: FormEvent, hotelId: number) {
    event.preventDefault();
    const result = await dispatch(
      addRoom({
        hotelId: hotelId,
        name: roomForm.name,
        adults: Number(roomForm.adults),
        children: Number(roomForm.children),
        bedType: roomForm.bedType,
        basePriceCents: Math.round(Number(roomForm.price) * 100),
        totalUnits: Number(roomForm.totalUnits),
      }),
    );
    if (addRoom.fulfilled.match(result)) {
      setRoomForm(emptyRoom);
    }
  }

  async function handleAvailability(event: FormEvent, roomId: number) {
    event.preventDefault();
    // Only send what was filled in: rooms free, a special price, or both
    const changes: { units?: number; priceCents?: number } = {};
    if (availability.units !== '') changes.units = Number(availability.units);
    if (availability.price !== '') changes.priceCents = Math.round(Number(availability.price) * 100);

    const result = await dispatch(saveAvailability({ roomId: roomId, from: availability.from, to: availability.to, ...changes }));
    if (saveAvailability.fulfilled.match(result)) {
      setAvailability(emptyAvailability);
    }
  }

  function updateHotelForm(field: keyof typeof emptyHotel, value: string) {
    setHotelForm({ ...hotelForm, [field]: value });
  }

  return (
    <section>
      <button type="button" className="admin-button" onClick={() => setShowHotelForm(!showHotelForm)}>
        {showHotelForm ? 'Close' : 'Add a hotel'}
      </button>

      {showHotelForm && (
        <form className="admin-form" onSubmit={handleAddHotel}>
          <label className="admin-field">Name
            <input required value={hotelForm.name} onChange={(e) => updateHotelForm('name', e.target.value)} />
          </label>
          <label className="admin-field">Description
            <textarea required rows={3} value={hotelForm.description} onChange={(e) => updateHotelForm('description', e.target.value)} />
          </label>
          <div className="admin-row">
            <label className="admin-field">City
              <input required value={hotelForm.city} onChange={(e) => updateHotelForm('city', e.target.value)} />
            </label>
            <label className="admin-field">Province
              <input required value={hotelForm.province} onChange={(e) => updateHotelForm('province', e.target.value)} />
            </label>
          </div>
          <label className="admin-field">Address
            <input required value={hotelForm.address} onChange={(e) => updateHotelForm('address', e.target.value)} />
          </label>
          <div className="admin-row">
            <label className="admin-field">Latitude
              <input required type="number" step="any" value={hotelForm.latitude} onChange={(e) => updateHotelForm('latitude', e.target.value)} />
            </label>
            <label className="admin-field">Longitude
              <input required type="number" step="any" value={hotelForm.longitude} onChange={(e) => updateHotelForm('longitude', e.target.value)} />
            </label>
            <label className="admin-field">Stars
              <input required type="number" min="1" max="5" step="0.5" value={hotelForm.starRating} onChange={(e) => updateHotelForm('starRating', e.target.value)} />
            </label>
            <label className="admin-field">Setting
              <select value={hotelForm.setting} onChange={(e) => updateHotelForm('setting', e.target.value)}>
                {SETTINGS.map((setting) => <option key={setting} value={setting}>{setting}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" className="admin-button" disabled={busy}>Save as draft</button>
        </form>
      )}

      <ul className="admin-list">
        {hotels.map((hotel) => (
          <li key={hotel.id} className="admin-item">
            <div className="admin-item-top">
              <strong>{hotel.name}</strong>
              <select
                aria-label={'Status of ' + hotel.name}
                value={hotel.status}
                disabled={busy}
                onChange={(event) => dispatch(changeHotelStatus({ hotelId: hotel.id, status: event.target.value }))}
              >
                {STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <p className="booking-muted">{hotel.city}, {hotel.province} · {hotel.roomTypes} room types</p>

            <button
              type="button"
              className="admin-link"
              onClick={() => (roomsHotelId === hotel.id ? undefined : dispatch(loadAdminRooms(hotel.id)))}
            >
              {roomsHotelId === hotel.id ? 'Rooms shown below' : 'Manage rooms'}
            </button>

            {roomsHotelId === hotel.id && (
              <div className="admin-rooms">
                {rooms.map((room) => (
                  <div key={room.id} className="admin-room">
                    <p>
                      <strong>{room.name}</strong> · {formatRand(room.basePriceCents)} / night · {room.totalUnits} rooms · sleeps {room.adults}
                    </p>
                    {availabilityRoomId === room.id ? (
                      <form className="admin-row" onSubmit={(event) => handleAvailability(event, room.id)}>
                        <label className="admin-field">From
                          <input required type="date" value={availability.from} onChange={(e) => setAvailability({ ...availability, from: e.target.value })} />
                        </label>
                        <label className="admin-field">Up to (not including)
                          <input required type="date" value={availability.to} onChange={(e) => setAvailability({ ...availability, to: e.target.value })} />
                        </label>
                        <label className="admin-field">Rooms free (0 closes)
                          <input type="number" min="0" max={room.totalUnits} value={availability.units} onChange={(e) => setAvailability({ ...availability, units: e.target.value })} />
                        </label>
                        <label className="admin-field">Special price (R)
                          <input type="number" min="1" value={availability.price} onChange={(e) => setAvailability({ ...availability, price: e.target.value })} />
                        </label>
                        <button type="submit" className="admin-button" disabled={busy}>Save</button>
                        <button type="button" className="admin-link" onClick={() => setAvailabilityRoomId(null)}>Close</button>
                      </form>
                    ) : (
                      <button type="button" className="admin-link" onClick={() => setAvailabilityRoomId(room.id)}>
                        Set availability or price
                      </button>
                    )}
                  </div>
                ))}

                <form className="admin-form" onSubmit={(event) => handleAddRoom(event, hotel.id)}>
                  <p className="admin-item-title">Add a room type</p>
                  <div className="admin-row">
                    <label className="admin-field">Name
                      <input required value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
                    </label>
                    <label className="admin-field">Bed
                      <input value={roomForm.bedType} onChange={(e) => setRoomForm({ ...roomForm, bedType: e.target.value })} />
                    </label>
                    <label className="admin-field">Adults
                      <input required type="number" min="1" value={roomForm.adults} onChange={(e) => setRoomForm({ ...roomForm, adults: e.target.value })} />
                    </label>
                    <label className="admin-field">Children
                      <input required type="number" min="0" value={roomForm.children} onChange={(e) => setRoomForm({ ...roomForm, children: e.target.value })} />
                    </label>
                    <label className="admin-field">Price per night (R)
                      <input required type="number" min="1" value={roomForm.price} onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} />
                    </label>
                    <label className="admin-field">Rooms of this type
                      <input required type="number" min="1" value={roomForm.totalUnits} onChange={(e) => setRoomForm({ ...roomForm, totalUnits: e.target.value })} />
                    </label>
                  </div>
                  <button type="submit" className="admin-button" disabled={busy}>Add room</button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default HotelsPanel;