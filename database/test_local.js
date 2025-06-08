#!/usr/bin/env node

// Local database testing script for FitnessWebApp
// This script tests the database schema using a local SQLite database

const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

// Create local test database
const dbPath = path.join(__dirname, '..', 'test_fitness_app.db');

// Remove existing test database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Previous test database removed');
}

const db = new sqlite3.Database(dbPath);

async function runTests() {
  try {
    console.log('🚀 Starting database schema tests...\n');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Creating database schema...');
    await execQuery(schema);
    console.log('✅ Schema created successfully\n');

    // Read and execute test queries
    const testPath = path.join(__dirname, 'test_queries.sql');
    const testQueries = fs.readFileSync(testPath, 'utf8');
    
    // Split queries and execute non-comment lines
    const queries = testQueries
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));

    console.log('🧪 Running test queries...');
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.toUpperCase().startsWith('SELECT')) {
        console.log(`\n📋 Query ${i + 1} results:`);
        const results = await queryAll(query);
        console.table(results);
      } else if (query.toUpperCase().startsWith('INSERT')) {
        await execQuery(query);
        console.log(`✅ Insert query ${i + 1} executed`);
      }
    }

    console.log('\n🎉 All database tests completed successfully!');
    console.log(`📍 Test database created at: ${dbPath}`);

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    db.close();
  }
}

// Helper functions
function execQuery(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function queryAll(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Check if sqlite3 is available
try {
  require.resolve('sqlite3');
  runTests();
} catch (e) {
  console.log('📦 sqlite3 not found. To run local database tests:');
  console.log('npm install sqlite3');
  console.log('\nAlternatively, you can test the schema directly with D1:');
  console.log('npx wrangler d1 execute fitness-app-db --file=./database/migrations/001_initial.sql');
}