import logger from '#config/logger.js';
import {
  getALLUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.service.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getALLUsers();

    res.json({
      message: 'Successful retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validationResult = await userIdSchema.safeParseAsync(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    logger.info(`Getting user by ID: ${id}`);

    const user = await getUserById(id);

    res.json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (e) {
    logger.error('Error fetching user by ID:', { error: e.message });

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }

    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    // Validate user ID from params
    const idValidation = await userIdSchema.safeParseAsync(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidation.error),
      });
    }

    // Validate update data from body
    const updateValidation = await updateUserSchema.safeParseAsync(req.body);
    if (!updateValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(updateValidation.error),
      });
    }

    const { id } = idValidation.data;
    const updates = updateValidation.data;

    // Authorization: users can only update their own information
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admin users can change role
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admin users can change user roles',
      });
    }

    logger.info(`Updating user ID: ${id}`, { updates });

    const updatedUser = await updateUser(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user:', { error: e.message });

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }

    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const validationResult = await userIdSchema.safeParseAsync(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    // Authorization: users can only delete their own account or admin can delete any
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    logger.info(`Deleting user ID: ${id}`);

    const deletedUser = await deleteUser(id);

    res.json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (e) {
    logger.error('Error deleting user:', { error: e.message });

    if (e.message === 'User not found') {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user does not exist',
      });
    }

    next(e);
  }
};
