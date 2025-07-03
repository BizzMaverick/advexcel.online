const users = []; // Replace with DB integration if needed

exports.AuthService = {
  findUserById: async (id) => users.find((u) => u.id === id),
  getAllUsers: async () => users
};
