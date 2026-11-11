import type { RoomOption } from '../../slices/hotelDetailSlices';
import { formatRand } from '../../utils/formatUtils';

interface RoomListProps {
  rooms: RoomOption[];
  nights: number | null;
  chosenRoomId: number | null;
  onSelect: (roomId: number) => void;
}

function describeSleeps(room: RoomOption): string {
  let text = 'Sleeps ' + room.adults;
  if (room.children > 0) {
    text = text + ' + ' + room.children + ' children';
  }
  if (room.bedType !== null) {
    text = text + ' · ' + room.bedType;
  }
  return text;
}

export function RoomList({ rooms, nights, chosenRoomId, onSelect }: RoomListProps) {
  return (
    <ul className="rooms">
      {rooms.map((room) => {
        const soldOut = room.available === false;
        const tooSmall = !room.isValid;
        const chosen = room.id === chosenRoomId;
        const canSelect = !soldOut && !tooSmall;
        const fewLeft = room.available === true && room.unitsLeft !== null && room.unitsLeft <= 3;

        return (
          // Clicking anywhere on a room picks it. The Select button does the same for keyboard users.
          <li
            key={room.id}
            className={'room' + (chosen ? ' room-chosen' : '') + (canSelect ? ' room-selectable' : '')}
            onClick={canSelect ? () => onSelect(room.id) : undefined}
          >
            <div className="room-main">
              <h3 className="room-name">{room.name}</h3>
              <p className="room-meta">{describeSleeps(room)}</p>
              {room.description !== null && <p className="room-meta">{room.description}</p>}

              {soldOut && <span className="room-badge room-badge-bad">Sold out for your dates</span>}
              {tooSmall && !soldOut && <span className="room-badge room-badge-bad">Too small for your group</span>}
              {fewLeft && <span className="room-badge room-badge-warn">Only {room.unitsLeft} left</span>}
            </div>

            <div className="room-side">
              <p>
                <span className="room-amount">{formatRand(room.nightlyCents)}</span>
                <span className="room-small"> / night</span>
              </p>
              {room.totalCents !== null && nights !== null && (
                <p className="room-small">
                  {formatRand(room.totalCents)} for {nights} {nights === 1 ? 'night' : 'nights'}
                </p>
              )}
              <button
                type="button"
                className="detail-button"
                disabled={!canSelect}
                onClick={() => onSelect(room.id)}
              >
                {chosen ? 'Selected' : 'Select'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default RoomList;