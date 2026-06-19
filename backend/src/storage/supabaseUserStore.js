const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

class SupabaseUserStore {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for Supabase storage.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const { data, error } = await this.supabase
      .from('users')
      .select('id, full_name, email, password_hash, role')
      .eq('email', normalizedEmail)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data
      ? {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          passwordHash: data.password_hash,
          role: data.role,
        }
      : null;
  }

  async createEmployee({ fullName, email, passwordHash }) {
    const normalizedEmail = email.toLowerCase().trim();
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          id: `user_${Date.now()}`,
          full_name: fullName,
          email: normalizedEmail,
          password_hash: passwordHash,
          role: 'employee',
        },
      ])
      .select('id, full_name, email, role')
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      role: data.role,
    };
  }

  async findById(id) {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, full_name, email, password_hash, role')
      .eq('id', id)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data
      ? {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          passwordHash: data.password_hash,
          role: data.role,
        }
      : null;
  }

  async updateProfile(id, { fullName }) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', id)
      .select('id, full_name, email, role')
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      role: data.role,
    };
  }

  async updatePassword(id, passwordHash) {
    const { error } = await this.supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }
}

module.exports = SupabaseUserStore;
