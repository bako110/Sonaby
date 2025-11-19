const userService = require('./user.service');
const { createUserSchema, updateUserSchema } = require('./user.schema');
const { asyncHandler } = require('../../middleware/asyncHandler');

class UserController {
  createUser = asyncHandler(async (req, res) => {
    const validated = createUserSchema.parse(req.body);
    const user = await userService.createUser(validated);
    res.status(201).json(user);
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });

  updateUser = asyncHandler(async (req, res) => {
    const validated = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, validated);
    res.json(user);
  });

  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  });
}

module.exports = new UserController();
