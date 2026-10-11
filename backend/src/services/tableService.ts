import type { PoolClient } from "pg";
import { pool } from "../config/pool";

async function createEnum( client: PoolClient, name: string, values: string[],): Promise<void>{

    const list = values.map((val) => `'${val}'`).join(',');

    await client.query(`
        DO $$ BEGIN
            CREATE TYPE ${name} AS ENUM (${list});
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$
   `);
}

async function createEnums(client: PoolClient): Promise<void>{

    await createEnum(client, 'user_role', ['guest', 'admin']);

    await createEnum(client, 'hotel_status', ['draft', 'published', 'retired']);

    await createEnum(client, 'hotel_setting', ['beach', 'city', 'safari', 'mountain', 'countryside']);

    await createEnum(client, 'booking_status', ['held', 'paid_pending_approval', 'confirmed', 'rejected', 'cancelled', 'expired', 'completed']);

    await createEnum(client, 'payment_status', ['pending', 'paid', 'failed', 'refunded']);
}

async function createTables(client: PoolClient): Promise<void>{

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
            id BIGNIT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            email  TEXT NOT NULL UNIQUE,
            name   TEXT NOT NULL,
            phone  TEXT,
            avatar_url TEXT,
            role   user_role NOT NULL DEFAULT 'guest',
            oauth_provider TEXT,
            oauth_id    TEXT,
            password_hash   TEXT,
            consent_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (oauth_provider, oauth_id),
            CHECK   (oauth_id IS NOT NULL OR password_hash IS NOT NULL)
        );

      CREATE TABLE IF NOT EXISTS admin_invites (
            id BIGNIT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            code_hash TEXT NOT NULL UNIQUE,
            created_by BIGINT REFERENCES users(id),
            used_by BIGINT REFERENCES users(id),
            used_at TIMESTAMPTZ,
            expires_at TIMESTAMPTZ NOT NULL
        );

      CREATE TABLE IF NOT EXISTS hotels (
            id  BIGNIT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name    TEXT NOT NULL,
            description TEXT NOT NULL,
            city    TEXT NOT NULL,
            province    TEXT NOT NULL,
            address TEXT NOT NULL,
            latitude    NUMERC(9, 6) NOT NULL,
            longitude NUMERIC(9, 6) NOT NULL,
            star_rating NUMERIC(2,1) NOT NULL CHECK (star_rating BETWEEN 1 AND 5)
            setting hotel_setting NOT NULL,
            check_in_time   TIME NOT NULL DEFAULT '14:00',
            check_out_time  NOT NULL DEFAULT '10:00',
            status hotel_status NOT NULL DEFAULT 'draft',
            rating_avg  NUMERIC(3,1) NOT NULL DEFAULT 0,
            review_count    INTEGER NOT NULL DEFAULT 0,
            created_by  BIGINT REFERENCES users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now() 
        );
      
      CREATE TABLE IF NOT EXISTS amenities (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name    TEXT NOT NULL UNIQUE,
            icon    TEXT,
            category TEXT
        );

      CREATE TABLE IF NOT EXISTS hotel_amenities (
            hotel_id   BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
            amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
            PRIMARY KEY (hotel_id, amenity_id)
        );

      CREATE TABLE IF NOT EXISTS hotel_policies (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            hotel_id    BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            text TEXT NOT NULL
        );
      
      CREATE TABLE IF NOT EXISTS room_types (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            hotel_id    BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            adults  INTEGER NOT NULL CHECK (adults > 0),
            children    INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
            bed_type    TEXT,
            base_price_cents INTEGER NOT NULL CHECK (base_price_cents > 0),
            total_units INTEGER NOT NULL CHECK (total_units > 0)
        );

      CREATE TABLE IF NOT EXISTS rooms_types (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            hotel_id    BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
            name    TEXT NOT NULL,
            description TEXT,
            adults  INTEGER NOT NULL CHECK (adults > 0),
            children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
            bed_type TEXT,
            base_price_cents    INTEGER NOT NULL CHECK (base_price_cents > 0),
            total_units INTEGER NOT NULL CHECK (total_units > 0)
        );

      CREATE TABLE IF NOT EXISTS rooms_inventory (
            room_type_id    BIGINT NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
            stay_date   DATE NOT NULL,
            units_available INTERGER NOT NULL CHECK (units_available >= 0),
            price_override_cents INTEGER CHECK (price_override_cents > 0),
            PRIMARY KEY (room_type_id, stay_date)
        );

      CREATE TABLE IF NOT EXISTS bookings (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            reference   TEXT NOT NULL UNIQUE,
            user_id BIGINT NOT NULL REFERENCES users(id),
            hotel_id    BIGINT NOT NULL REFERENCES hotels(id),
            check_in DATE NOT NULL,
            check_out DATE NOT NULL,
            adults INTEGER NOT NULL CHECK (adults > 0),
            children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
            status  booking_status NOT NULL DEFAULT 'held',
            total_amount_cents  INTEGER NOT NULL CHECK (total_amounts_cents >= 0),
            currency    CHAR(3) NOT NULL DEFAULT 'ZAR',
            hold_expires_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CHECK (check_out > check_in)
        );

      CREATE TABLE IF NOT EXISTS booking_items (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            booking_id  BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
            room_type_id    BIGINT NOT NULL REFERENCES room_types(id),
            quantity    INTEGER NOT NULL CHECK (quantity > 0),
            nightly_price_snapshot_cents    INTEGER NOT NULL CHECK (nightly_price_snapshot_cents > 0)
        );

      CREATE TABLE IF NOT EXISTS payments (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            booking_id BIGINT NOT NULL REFERENCES bookings(id),
            provider    TEXT NOT NULL,
            provider_ref    TEXT UNQUE,
            amounts_cents   INTEGER NOT NULL CHECK (amounts_cents > 0),
            status  payment_status NOT NULL DEFAULT 'pending',
            paid_at TIMESTAMPTZ
        );
      
      CREATE TABLE IF NOT EXISTS favourites (
            user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            PRIMARY KEY (user_id)
        );

      CREATE TABLE IF NOT EXISTS reviews (
            id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            user_id BIGINT NOT NULL REFERENCES users(id);
            hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    `)
}

export async function runMigrations(): Promise<void> {

  const client = await pool.connect();
  try {

    await client.query('BEGIN');
    await createEnums(client);
    await createTables(client);
    await client.query('COMMIT');
    
    console.log('Database schema migrations executed successfully.');

  } catch (error) {

    await client.query('ROLLBACK');
    console.error('Migration failed! Rolling back changes:', error);
    throw error;

  } finally {
    client.release();
  }
}