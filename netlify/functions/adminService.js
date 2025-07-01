const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

let users = [];

exports.AdminService = {
  addUser: async (userData, password) => {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), ...userData, password: hashed };
    users.push(newUser);
    return { success: true, message: 'User added', user: newUser };
  },

  updateUser: async (updated) => {
    const index = users.findIndex((u) => u.id === updated.id);
    if (index === -1) return { success: false, message: 'User not found' };
    users[index] = { ...users[index], ...updated };
    return { success: true, user: users[index] };
  },

  deleteUser: async (id) => {
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return { success: false, message: 'User not found' };
    users.splice(index, 1);
    return { success: true };
  },

  getSystemStats: async () => {
    return {
      totalUsers: users.length,
      admins: users.filter((u) => u.role === 'admin').length
    };
  }
};
