/**
 * Creates the default employer/admin account in Supabase.
 * Run once after schema.sql:
 *   node scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const email = (process.env.ADMIN_EMAIL || 'admin@cleaniq.com').toLowerCase();
const password = process.env.ADMIN_PASSWORD || 'Admin1234';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function main() {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const { error } = await supabase.from('users').insert([
    {
      id: 'user_admin',
      full_name: 'CleanIQ Admin',
      email,
      password_hash: passwordHash,
      role: 'employer',
    },
  ]);

  if (error) {
    console.error('Failed to seed admin:', error.message);
    process.exit(1);
  }

  console.log(`Admin created: ${email}`);
}

main();
