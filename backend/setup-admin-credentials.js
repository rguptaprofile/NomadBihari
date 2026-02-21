#!/usr/bin/env node

/**
 * Setup Admin Credentials
 * Run this script once to hash admin passwords and generate SQL INSERT statements
 * Usage: node setup-admin-credentials.js
 */

const bcryptjs = require('bcryptjs');

const ADMIN_ACCOUNTS = [
    {
        email: 'gupta.rahul.hru@gmail.com',
        name: 'Rahul Gupta',
        password: 'Admin1-9525.com'
    },
    {
        email: 'kumarravi69600@gmail.com',
        name: 'Ravi Kumar',
        password: 'Chudail@143'
    }
];

async function generateAdminCredentials() {
    console.log('='.repeat(80));
    console.log('NOMAD BIHARI - ADMIN CREDENTIALS SETUP');
    console.log('='.repeat(80));
    console.log('\nGenerating hashed passwords for admin accounts...\n');

    const sqlStatements = [];

    for (let i = 0; i < ADMIN_ACCOUNTS.length; i++) {
        const admin = ADMIN_ACCOUNTS[i];
        try {
            const hash = await bcryptjs.hash(admin.password, 10);
            
            console.log(`Admin ${i + 1}:`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  Name: ${admin.name}`);
            console.log(`  Password: ${admin.password}`);
            console.log(`  Hash: ${hash}\n`);

            // Create SQL INSERT statement
            const sqlStatement = `INSERT INTO admin (email, password_hash, admin_name, created_at, updated_at) 
VALUES ('${admin.email}', '${hash}', '${admin.name}', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();`;

            sqlStatements.push(sqlStatement);
        } catch (error) {
            console.error(`Error hashing password for ${admin.email}:`, error);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('SQL STATEMENTS FOR DATABASE:');
    console.log('='.repeat(80) + '\n');

    sqlStatements.forEach(stmt => {
        console.log(stmt);
        console.log('');
    });

    console.log('Copy the above SQL statements and run them in your MySQL database.');
    console.log('\n' + '='.repeat(80));
}

generateAdminCredentials().catch(error => {
    console.error('Setup error:', error);
    process.exit(1);
});
