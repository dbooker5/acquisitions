import logger from "#config/logger.js";
import { db } from "#config/database.js";
import { users } from "#models/user.model.js";
import { eq } from "drizzle-orm";

export const getALLUsers = async () => {
    try {
        return await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            })
            .from(users);
    } catch (e) {
        logger.error("Error getting users", { error: e.message, stack: e.stack });
        throw e;
    }
};

export const getUserById = async (id) => {
    try {
        const user = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!user.length) {
            throw new Error('User not found');
        }

        return user[0];
    } catch (e) {
        logger.error("Error getting user by ID", { error: e.message, stack: e.stack, userId: id });
        throw e;
    }
};

export const updateUser = async (id, updates) => {
    try {
        // First check if user exists
        await getUserById(id);

        // Add updated_at timestamp
        const updateData = {
            ...updates,
            updated_at: new Date()
        };

        const updatedUser = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            });

        return updatedUser[0];
    } catch (e) {
        logger.error("Error updating user", { error: e.message, stack: e.stack, userId: id });
        throw e;
    }
};

export const deleteUser = async (id) => {
    try {
        // First check if user exists
        await getUserById(id);

        const deletedUser = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
            });

        return deletedUser[0];
    } catch (e) {
        logger.error("Error deleting user", { error: e.message, stack: e.stack, userId: id });
        throw e;
    }
};
