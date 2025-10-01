import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';

const router = express.Router();

// Get all users - requires authentication and admin role
router.get('/', authenticateToken, requireRole(['admin']), fetchAllUsers);

// Get user by ID - requires authentication
router.get('/:id', authenticateToken, fetchUserById);

// Update user by ID - requires authentication
router.put('/:id', authenticateToken, updateUserById);

// Delete user by ID - requires authentication
router.delete('/:id', authenticateToken, deleteUserById);

export default router;
