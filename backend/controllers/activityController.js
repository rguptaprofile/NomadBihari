/* ===== Activity Logging Controller ===== */

/**
 * Log user or admin activity to the database
 * Activities include: login, logout, signup, post creation, post deletion, profile update, etc.
 */

async function logActivity(pool, userId, activityType, activityDescription, metadata = {}) {
    try {
        const connection = await pool.getConnection();
        
        await connection.execute(
            `INSERT INTO activity_logs 
             (user_id, activity_type, activity_description, metadata, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [userId, activityType, activityDescription, JSON.stringify(metadata)]
        );
        
        await connection.release();
        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
}

async function logAdminActivity(pool, adminId, activityType, activityDescription, metadata = {}) {
    try {
        const connection = await pool.getConnection();
        
        await connection.execute(
            `INSERT INTO admin_activity_logs 
             (admin_id, activity_type, activity_description, metadata, created_at)
             VALUES (?, ?, ?, ?, NOW())`,
            [adminId, activityType, activityDescription, JSON.stringify(metadata)]
        );
        
        await connection.release();
        return true;
    } catch (error) {
        console.error('Error logging admin activity:', error);
        return false;
    }
}

async function getUserActivity(pool, userId, limit = 50) {
    try {
        const connection = await pool.getConnection();
        
        const [activities] = await connection.execute(
            `SELECT * FROM activity_logs 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT ?`,
            [userId, limit]
        );
        
        await connection.release();
        return activities;
    } catch (error) {
        console.error('Error fetching user activities:', error);
        return [];
    }
}

async function getAdminActivity(pool, adminId, limit = 50) {
    try {
        const connection = await pool.getConnection();
        
        const [activities] = await connection.execute(
            `SELECT * FROM admin_activity_logs 
             WHERE admin_id = ? 
             ORDER BY created_at DESC 
             LIMIT ?`,
            [adminId, limit]
        );
        
        await connection.release();
        return activities;
    } catch (error) {
        console.error('Error fetching admin activities:', error);
        return [];
    }
}

async function getAllActivityLogs(pool, type = 'user', limit = 100) {
    try {
        const connection = await pool.getConnection();
        
        const table = type === 'admin' ? 'admin_activity_logs' : 'activity_logs';
        const [activities] = await connection.execute(
            `SELECT * FROM ${table} 
             ORDER BY created_at DESC 
             LIMIT ?`,
            [limit]
        );
        
        await connection.release();
        return activities;
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return [];
    }
}

module.exports = {
    logActivity,
    logAdminActivity,
    getUserActivity,
    getAdminActivity,
    getAllActivityLogs
};
