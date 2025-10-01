import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.coerce.number().int().positive('User ID must be a positive integer'),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(2).max(255).trim().optional(),
    email: z.string().email().max(255).toLowerCase().trim().optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine(
    data => {
      // At least one field must be provided for update
      return Object.values(data).some(value => value !== undefined);
    },
    {
      message: 'At least one field must be provided for update',
    }
  );
