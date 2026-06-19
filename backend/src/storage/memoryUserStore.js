const bcrypt = require('bcryptjs');

class MemoryUserStore {
  constructor() {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@cleaniq.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234';

    this.users = [
      {
        id: 'user_admin',
        fullName: 'CleanIQ Admin',
        email: adminEmail,
        passwordHash: bcrypt.hashSync(adminPassword, 10),
        role: 'employer',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async findByEmail(email) {
    return this.users.find(user => user.email === email.toLowerCase()) || null;
  }

  async findById(id) {
    return this.users.find(user => user.id === id) || null;
  }

  async updateProfile(id, { fullName }) {
    const user = this.users.find(u => u.id === id);
    if (!user) return null;

    user.fullName = fullName;
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }

  async updatePassword(id, passwordHash) {
    const user = this.users.find(u => u.id === id);
    if (!user) return false;

    user.passwordHash = passwordHash;
    return true;
  }

  async createEmployee({ fullName, email, passwordHash }) {
    const user = {
      id: `user_${Date.now()}`,
      fullName,
      email,
      passwordHash,
      role: 'employee',
      createdAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }
}

module.exports = MemoryUserStore;