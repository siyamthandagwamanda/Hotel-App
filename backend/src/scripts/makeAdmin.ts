// Makes an existing account an admin. Register on the site first, then run:
//   npm run make-admin -- you@example.com?
import { pool } from '../config/pool';

async function makeAdmin(): Promise<void> {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  if (email === '') {
    console.log('Usage: npm run make-admin -- you@example.com');
    process.exit(1);
  }

  const result = await pool.query(`UPDATE users SET role = 'admin' WHERE email = $1 RETURNING name`, [email]);
  if (result.rowCount === 0) {
    console.log(`No account found for ${email}. Register on the site first.`);
  } else {
    console.log(`${result.rows[0].name} is now an admin. Sign out and sign in again to pick it up.`);
  }
  await pool.end();
}

makeAdmin();