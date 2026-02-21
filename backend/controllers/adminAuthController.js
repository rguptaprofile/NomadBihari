/* ===== Admin Auth Controller ===== */

const bcryptjs = require('bcryptjs');

// Predefined admin credentials (with hashed passwords)
// These are the two admin accounts
const ADMIN_ACCOUNTS = [
    {
        id: 1,
        email: 'gupta.rahul.hru@gmail.com',
        name: 'Rahul Gupta',
        password: 'Admin1-9525.com'
    },
    {
        id: 2,
        email: 'kumarravi69600@gmail.com',
        name: 'Ravi Kumar',
        password: 'Chudail@143'
    }
];

// Verify admin credentials
async function verifyAdminCredentials(email, password) {
    const admin = ADMIN_ACCOUNTS.find(a => a.email === email);
    
    if (!admin) {
        return null;
    }
    
    // Compare plain text password with stored password (for demo purposes)
    // In production, use bcryptjs to hash and compare
    if (admin.password === password) {
        return {
            id: admin.id,
            email: admin.email,
            name: admin.name
        };
    }
    
    return null;
}

// Hash passwords for database storage (run once to generate proper hashes)
async function generateAdminPasswordHashes() {
    console.log('Admin Password Hashes:');
    for (const admin of ADMIN_ACCOUNTS) {
        const hash = await bcryptjs.hash(admin.password, 10);
        console.log(`Email: ${admin.email}`);
        console.log(`Password: ${admin.password}`);
        console.log(`Hash: ${hash}`);
        console.log(`Name: ${admin.name}`);
        console.log('---');
    }
}

module.exports = {
    verifyAdminCredentials,
    generateAdminPasswordHashes,
    ADMIN_ACCOUNTS
};
