#!/usr/bin/env node

/**
 * Crown Stores RMS - Quick Start Script
 * Automates the setup and testing process
 * Run: node quickstart.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function runCommand(cmd, description) {
    return new Promise((resolve) => {
        console.log(`\n📍 ${description}...`);
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`   ❌ Error: ${error.message}`);
                resolve(false);
            } else {
                console.log(`   ✅ Done`);
                resolve(true);
            }
        });
    });
}

async function checkFile(filePath, name) {
    if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${name} exists`);
        return true;
    } else {
        console.log(`   ⚠️  ${name} not found`);
        return false;
    }
}

async function main() {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     CROWN STORES RMS - QUICK START                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Step 1: Check environment
    console.log('📋 Step 1: Checking project setup...');
    await checkFile('./package.json', 'package.json');
    await checkFile('./app.js', 'app.js');
    
    const envExists = await checkFile('./.env', '.env file');
    if (!envExists) {
        console.log('\n   📝 Creating .env from .env.example...');
        if (fs.existsSync('./.env.example')) {
            fs.copyFileSync('./.env.example', './.env');
            console.log('   ✅ .env created. Please update with your MongoDB URI');
        }
    }

    // Step 2: Install dependencies
    const installDeps = await question('\n❓ Install npm dependencies? (y/n): ');
    if (installDeps.toLowerCase() === 'y') {
        await runCommand('npm install', 'Installing dependencies');
    }

    // Step 3: Configure MongoDB
    console.log('\n📋 Step 2: MongoDB Configuration');
    const dbChoice = await question('Use (1) Local MongoDB or (2) MongoDB Atlas? (1/2): ');
    
    let mongoUri = '';
    if (dbChoice === '1') {
        mongoUri = 'mongodb://localhost:27017/crown-stores-rms';
    } else {
        mongoUri = await question('Enter your MongoDB Atlas URI: ');
    }

    // Update .env
    let envContent = fs.readFileSync('./.env', 'utf8');
    envContent = envContent.replace(/MONGO_URI=.*/, `MONGO_URI=${mongoUri}`);
    fs.writeFileSync('./.env', envContent);
    console.log('   ✅ .env updated');

    // Step 4: Seed users
    const seedUsers = await question('\n❓ Seed test users to database? (y/n): ');
    if (seedUsers.toLowerCase() === 'y') {
        console.log('\n   🌱 Seeding test users...');
        await new Promise((resolve) => {
            exec('node seed-users.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`   ❌ Seeding failed: ${error.message}`);
                } else {
                    console.log(stdout);
                }
                resolve();
            });
        });
    }

    // Step 5: Start server
    const startServer = await question('\n❓ Start the server now? (y/n): ');
    if (startServer.toLowerCase() === 'y') {
        console.log('\n🚀 Starting server...\n');
        exec('node app.js', (error, stdout, stderr) => {
            // This will keep running
        });
        
        // Wait a moment and provide instructions
        setTimeout(() => {
            console.log('\n✅ Server should be running!');
            console.log('📖 Open: http://localhost:3000');
            console.log('👤 Login with: cashier / 123456\n');
        }, 2000);
    } else {
        console.log('\n✅ Setup complete!');
        console.log('📖 To start the server, run: node app.js');
        console.log('📖 To run tests, run: node test-auth.js\n');
    }

    rl.close();
}

main().catch(console.error);
