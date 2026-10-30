import type { PoolClient } from 'pg';
import { pool } from '../config/pool.js';

type Setting = 'beach' | 'city' | 'safari' | 'mountain' | 'countryside';

type SeedRoom = {
  name: string;
  description: string;
  adults: number;
  children: number;
  bedType: string;
  priceCents: number;
  units: number;
};

type SeedHotel = {
  slug: string;
  name: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  setting: Setting;
  ratingAvg: number;
  reviewCount: number;
  amenities: string[];
  rooms: SeedRoom[];
};

function unsplash(photoId: string): string {
  return 'https://images.unsplash.com/' + photoId + '?auto=format&fit=crop&w=1200&q=80';
}


const imagePools: Record<Setting, string[]> = {
  beach: [
    unsplash('photo-1520250497591-112f2f40a3f4'),
    unsplash('photo-1566073771259-6a8506099945'),
    unsplash('photo-1571896349842-33c89424de2d'),
    unsplash('photo-1582719478250-c89cae4dc85b'),
  ],
  city: [
    unsplash('photo-1542314831-068cd1dbfeeb'),
    unsplash('photo-1551882547-ff40c63fe5fa'),
    unsplash('photo-1564501049412-61c2a3083791'),
    unsplash('photo-1578683010236-d716f9a3f461'),
  ],
  safari: [
    unsplash('photo-1516426122078-c23e76319801'),
    unsplash('photo-1523805009345-7448845a9e53'),
    unsplash('photo-1566073771259-6a8506099945'),
    unsplash('photo-1618773928121-c32242e63f39'),
  ],
  mountain: [
    unsplash('photo-1464822759023-fed622ff2c3b'),
    unsplash('photo-1445019980597-93fa8acb246c'),
    unsplash('photo-1582719478250-c89cae4dc85b'),
    unsplash('photo-1578683010236-d716f9a3f461'),
  ],
  countryside: [
    unsplash('photo-1445019980597-93fa8acb246c'),
    unsplash('photo-1564501049412-61c2a3083791'),
    unsplash('photo-1618773928121-c32242e63f39'),
    unsplash('photo-1578683010236-d716f9a3f461'),
  ],
};

const amenityNames: string[] = [
  'Ocean view', 'Fast Wi-Fi', 'Free parking', 'Pool', 'Breakfast',
  'Pet friendly', 'Spa', 'Braai area', 'Game drives',
];

const standardPolicies = [
  { type: 'cancellation', text: 'Free cancellation up to 72 hours before check-in.' },
  { type: 'pets', text: 'Pets are only allowed at properties listed as pet friendly.' },
  { type: 'children', text: 'Children of all ages are welcome.' },
];

function twoRooms(standardRand: number, bedType: string): SeedRoom[] {
  const suiteRand = Math.round((standardRand * 1.7) / 10) * 10;
  return [
    {
      name: 'Standard Room',
      description: 'Comfortable room with everything you need.',
      adults: 2,
      children: 1,
      bedType: bedType,
      priceCents: standardRand * 100,
      units: 6,
    },
    {
      name: 'Family Suite',
      description: 'Larger suite with a lounge, sleeps a family.',
      adults: 4,
      children: 2,
      bedType: 'Two queens',
      priceCents: suiteRand * 100,
      units: 3,
    },
  ];
}

const hotels: SeedHotel[] = [
  {
    slug: 'sea-breeze', name: 'Manzini-Resort',
    description: 'Wake to Indian Ocean views at this easygoing coastal hideaway, with a saltwater pool and the promenade within reach.',
    city: 'Durban', province: 'KwaZulu-Natal', address: '12 Lighthouse Road, Umhlanga',
    latitude: -29.7268, longitude: 31.0856, starRating: 4.5, setting: 'beach',
    ratingAvg: 9.1, reviewCount: 124,
    amenities: ['Ocean view', 'Fast Wi-Fi', 'Free parking', 'Pool', 'Breakfast'],
    rooms: twoRooms(1450, 'King'),
  },

  {
    slug: 'gwamanda-pulse',
    name: 'GwamandaPulse',
    description: 'A relaxed, pet-friendly boutique inn nestled in the scenic hills of Chase Valley, just minutes from the Liberty Midlands Mall and central Pietermaritzburg.',
    city: 'Pietermaritzburg',
    province: 'KwaZulu-Natal',
    address: '42 Chase Valley Road, Chase Valley, Pietermaritzburg',
    latitude: -29.5694,
    longitude: 30.2985,
    starRating: 3.5,
    setting: 'city',
    ratingAvg: 8.2,
    reviewCount: 86,
    amenities: ['Fast Wi-Fi', 'Pool', 'Pet friendly', 'Free parking'],
    rooms: twoRooms(780, 'Queen'),
  },

  {
    slug: 'abathwa-lodge', name: 'Abathwa Lodge',
    description: 'Boutique lodge between the dunes and the sea in Ballito, with a spa and sunset terrace.',
    city: 'Ballito', province: 'KwaZulu-Natal', address: '5 Dune Crescent, Ballito',
    latitude: -29.539, longitude: 31.214, starRating: 4, setting: 'beach',
    ratingAvg: 8.8, reviewCount: 97,
    amenities: ['Ocean view', 'Spa', 'Pool', 'Breakfast', 'Fast Wi-Fi'],
    rooms: twoRooms(1600, 'King'),
  },

  {
    slug: 'marina-lodge', name: 'Marina Lodge',
    description: 'Wooden lodge on the Knysna lagoon with a sun deck and a pool that looks over the water.',
    city: 'Knysna', province: 'Western Cape', address: '21 Waterfront Drive, Knysna',
    latitude: -34.0357, longitude: 23.0471, starRating: 4, setting: 'beach',
    ratingAvg: 9.0, reviewCount: 143,
    amenities: ['Pool', 'Breakfast', 'Fast Wi-Fi', 'Free parking', 'Braai area'],
    rooms: twoRooms(1200, 'Queen'),
  },

  {
    slug: 'ridge-stay', name: 'Ridge Stay',
    description: 'Mountain-view cabins above the Drakensberg valley, with a deck for every unit.',
    city: 'Drakensberg', province: 'KwaZulu-Natal', address: 'Champagne Valley Road, Winterton',
    latitude: -29.075, longitude: 29.375, starRating: 4, setting: 'mountain',
    ratingAvg: 9.3, reviewCount: 71,
    amenities: ['Fast Wi-Fi', 'Braai area', 'Free parking', 'Pet friendly', 'Breakfast'],
    rooms: twoRooms(950, 'Queen'),
  },

  {
    slug: 'city-loft', name: 'City Loft',
    description: 'Bright, modern loft apartments in the heart of Cape Town, close to restaurants and the waterfront.',
    city: 'Cape Town', province: 'Western Cape', address: '14 Loop Street, Cape Town',
    latitude: -33.9249, longitude: 18.4241, starRating: 4, setting: 'city',
    ratingAvg: 8.7, reviewCount: 210,
    amenities: ['Fast Wi-Fi', 'Free parking', 'Breakfast'],
    rooms: twoRooms(850, 'Queen'),
  },

  {
    slug: 'safari-camp', name: 'Kruger Safari Camp',
    description: 'Tented suites on the edge of the reserve, with guided game drives at dawn and dusk.',
    city: 'Hluhluwe', province: 'KwaZulu-Natal', address: 'Reserve Gate Road, Hluhluwe',
    latitude: -28.02, longitude: 32.27, starRating: 5, setting: 'safari',
    ratingAvg: 9.5, reviewCount: 188,
    amenities: ['Game drives', 'Pool', 'Breakfast', 'Braai area', 'Spa'],
    rooms: twoRooms(3200, 'King'),
  },

  {
    slug: 'table-view', name: 'Table View Suites',
    description: 'Contemporary suites with a view of Table Mountain, a rooftop pool and a short walk to the V&A Waterfront.',
    city: 'Cape Town', province: 'Western Cape', address: '3 Beach Road, Sea Point',
    latitude: -33.9150, longitude: 18.3870, starRating: 4.5, setting: 'city',
    ratingAvg: 8.9, reviewCount: 176,
    amenities: ['Fast Wi-Fi', 'Pool', 'Breakfast', 'Free parking'],
    rooms: twoRooms(1350, 'King'),
  },

  {
    slug: 'jozi-central', name: 'Jozi Central Hotel',
    description: 'Friendly city hotel in Braamfontein, close to the Gautrain and the cultural district.',
    city: 'Johannesburg', province: 'Gauteng', address: '40 De Korte Street, Braamfontein',
    latitude: -26.1929, longitude: 28.0305, starRating: 4, setting: 'city',
    ratingAvg: 8.4, reviewCount: 132,
    amenities: ['Fast Wi-Fi', 'Free parking', 'Breakfast'],
    rooms: twoRooms(990, 'Queen'),
  },

  {
    slug: 'sandton-sky', name: 'Sandton Sky Lofts',
    description: 'Luxury high-rise lofts in Sandton with skyline views, a spa and a heated pool.',
    city: 'Johannesburg', province: 'Gauteng', address: '1 Rivonia Road, Sandton',
    latitude: -26.1076, longitude: 28.0567, starRating: 5, setting: 'city',
    ratingAvg: 9.2, reviewCount: 98,
    amenities: ['Fast Wi-Fi', 'Pool', 'Spa', 'Breakfast', 'Free parking'],
    rooms: twoRooms(2100, 'King'),
  },

  {
    slug: 'winelands', name: 'Winelands Guesthouse',
    description: 'Pet friendly guesthouse among the vineyards of Stellenbosch, with a pool and tasting terrace.',
    city: 'Stellenbosch', province: 'Western Cape', address: '7 Vineyard Lane, Stellenbosch',
    latitude: -33.9321, longitude: 18.8602, starRating: 4, setting: 'countryside',
    ratingAvg: 9.1, reviewCount: 156,
    amenities: ['Pool', 'Breakfast', 'Pet friendly', 'Fast Wi-Fi', 'Free parking'],
    rooms: twoRooms(1250, 'Queen'),
  },

  {
    slug: 'zanokuhle-stars', name: 'Zanokuhle Stars Lodge',
    description: 'Quiet pet friendly lodge under the Karoo sky, famous for stargazing and slow mornings.',
    city: 'Prince Albert', province: 'Western Cape', address: '9 Church Street, Prince Albert',
    latitude: -33.2247, longitude: 22.0296, starRating: 3.5, setting: 'countryside',
    ratingAvg: 8.6, reviewCount: 64,
    amenities: ['Pet friendly', 'Braai area', 'Breakfast', 'Free parking'],
    rooms: twoRooms(690, 'Queen'),
  },

  {
    slug: 'manelisi-mist', name: 'Manelisi Mist Cottages',
    description: 'Cosy pet friendly cottages on the Midlands Meander, with fireplaces and misty morning walks.',
    city: 'Howick', province: 'KwaZulu-Natal', address: 'Old Main Road, Howick',
    latitude: -29.4783, longitude: 30.2339, starRating: 4, setting: 'countryside',
    ratingAvg: 9.0, reviewCount: 82,
    amenities: ['Pet friendly', 'Braai area', 'Fast Wi-Fi', 'Free parking'],
    rooms: twoRooms(880, 'Queen'),
  },

  {
    slug: 'nzuzwenhle-ridge', name: 'Nzuzwenhle Ridge Lodge',
    description: 'Safari lodge overlooking a waterhole, with game drives and open-air dining.',
    city: 'Mtubatuba', province: 'KwaZulu-Natal', address: 'Reserve Road, Mtubatuba',
    latitude: -28.4167, longitude: 32.1833, starRating: 4, setting: 'safari',
    ratingAvg: 9.2, reviewCount: 54,
    amenities: ['Game drives', 'Pool', 'Breakfast', 'Braai area'],
    rooms: twoRooms(1950, 'King'),
  },
];

export async function seedDatabase(): Promise<void> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

   
    const amenityMap = new Map<string, number>();
    for (const name of amenityNames) {
      const res = await client.query(
        'INSERT INTO amenities (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
        [name],
      );
      amenityMap.set(name, Number(res.rows[0].id));
    }

    for (const hotel of hotels) {
      
      const existing = await client.query('SELECT id FROM hotels WHERE name = $1', [hotel.name]);
      if (existing.rowCount && existing.rowCount > 0) continue;

      const hotelRes = await client.query(
        `INSERT INTO hotels
           (name, description, city, province, address, latitude, longitude,
            star_rating, setting, status, rating_avg, review_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10,$11)
         RETURNING id`,
        [
          hotel.name, hotel.description, hotel.city, hotel.province, hotel.address,
          hotel.latitude, hotel.longitude, hotel.starRating, hotel.setting,
          hotel.ratingAvg, hotel.reviewCount,
        ],
      );
      const hotelId = hotelRes.rows[0].id;

      for (const amenityName of hotel.amenities) {
        const amenityId = amenityMap.get(amenityName);
        if (amenityId) {
          await client.query(
            'INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [hotelId, amenityId],
          );
        }
      }

      for (const policy of standardPolicies) {
        await client.query(
          'INSERT INTO hotel_policies (hotel_id, type, text) VALUES ($1, $2, $3)',
          [hotelId, policy.type, policy.text],
        );
      }

      const photos = imagePools[hotel.setting];
      for (let i = 0; i < photos.length; i++) {
        await client.query(
          'INSERT INTO hotel_images (hotel_id, url, alt_text, position) VALUES ($1, $2, $3, $4)',
          [hotelId, photos[i], hotel.name + ' photo ' + (i + 1), i],
        );
      }

      for (const room of hotel.rooms) {
        const roomRes = await client.query(
          `INSERT INTO room_types
             (hotel_id, name, description, adults, children, bed_type, base_price_cents, total_units)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           RETURNING id`,
          [hotelId, room.name, room.description, room.adults, room.children,
           room.bedType, room.priceCents, room.units],
        );

        //night for the next 365 days
        await client.query(
          `INSERT INTO rooms_inventory (room_type_id, stay_date, units_available)
           SELECT $1, d::date, $2
           FROM generate_series(CURRENT_DATE, CURRENT_DATE + 364, interval '1 day') AS d
           ON CONFLICT DO NOTHING`,
          [roomRes.rows[0].id, room.units],
        );
      }
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed! Rolled back changes:', error);
    throw error;

  } finally {
    client.release();
  }
}