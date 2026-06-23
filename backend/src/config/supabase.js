const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = processLock.env.SUPABASE_URL;
const supabaseKey = processLock.env.SUPABASE_KEY;

if (!supabaseKey || !supabaseUrl) {
    console.error('Missing supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;