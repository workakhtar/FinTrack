// Simple logging function to replace vite import
function log(message: string, type: string = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import sql from './db-direct';

// Get __dirname equivalent for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  try {
    log('Running database migrations...', 'db');
    
    // Get all migration files from the migrations directory
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    
    // Make sure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      log('Migrations directory not found. Creating it now.', 'db');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Get all SQL files in the migrations directory
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in correct order
    
    if (migrationFiles.length === 0) {
      log('No migration files found.', 'db');
      return;
    }
    
    // Create migrations table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    
    // Get already executed migrations
    const executedMigrations = await sql`SELECT name FROM migrations`;
    
    const executedMigrationNames = new Set<string>();
    executedMigrations.forEach(row => {
      executedMigrationNames.add(row.name);
    });
    
    // Execute migrations that haven't been run yet
    for (const migrationFile of migrationFiles) {
      if (!executedMigrationNames.has(migrationFile)) {
        log(`Executing migration: ${migrationFile}`, 'db');
        
        const migrationPath = path.join(migrationsDir, migrationFile);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute the migration in a transaction
        await sql.begin(async (tx) => {
          await tx.unsafe(migrationSql);
          await tx`INSERT INTO migrations (name) VALUES (${migrationFile})`;
        });
        
        log(`Migration completed: ${migrationFile}`, 'db');
      } else {
        log(`Migration already executed: ${migrationFile}`, 'db');
      }
    }
    
    log('All migrations completed successfully!', 'db');
  } catch (error) {
    log(`Migration error: ${error}`, 'db');
    throw error;
  }
}

export async function seedDatabase() {
  try {
    // Check if database is already seeded
    const employeeCount = await sql`SELECT COUNT(*) as count FROM employees`;
    
    if (parseInt(employeeCount[0].count) > 0) {
      log('Database already has data, skipping seed', 'db');
      return;
    }
    
    log('Seeding database with initial data...', 'db');
    
    // Start a transaction for all seed data
    await sql.begin(async (tx) => {
      // Seed employees
      await tx.unsafe(`
        INSERT INTO employees (first_name, last_name, email, department, status, salary, role)
        VALUES 
          ('John', 'Doe', 'john@example.com', 'Engineering', 'Active', '5000', 'Developer'),
          ('Jane', 'Smith', 'jane@example.com', 'Design', 'Active', '4800', 'UI Designer'),
          ('Mark', 'Johnson', 'mark@example.com', 'Engineering', 'Active', '6000', 'Lead Developer'),
          ('Emily', 'Brown', 'emily@example.com', 'Sales', 'Active', '4500', 'Sales Manager'),
          ('David', 'Wilson', 'david@example.com', 'Management', 'Active', '8000', 'CTO');
      `);
      
      // Seed projects
      await tx.unsafe(`
        INSERT INTO projects (name, client, status, progress)
        VALUES 
          ('E-commerce Website', 'ABC Corp', 'Active', 75),
          ('Mobile Banking App', 'FinTech Inc', 'Active', 50),
          ('CRM System', 'Sales Masters', 'Planning', 20),
          ('Inventory Management', 'Retail Solutions', 'Completed', 100);
      `);
      
      // Seed partners
      await tx.unsafe(`
        INSERT INTO partners (name, email, share)
        VALUES 
          ('Michael Scott', 'michael@example.com', 40),
          ('Pam Beesly', 'pam@example.com', 30),
          ('Jim Halpert', 'jim@example.com', 30);
      `);
      
      // Seed billings for projects
      await tx.unsafe(`
        INSERT INTO billings (project_id, month, year, amount, status, invoice_date)
        VALUES 
          (1, 'January', 2024, 5000, 'Paid', '2024-01-15'),
          (1, 'February', 2024, 5000, 'Paid', '2024-02-15'),
          (2, 'January', 2024, 8000, 'Paid', '2024-01-10'),
          (2, 'February', 2024, 8000, 'Paid', '2024-02-10'),
          (3, 'February', 2024, 6000, 'Pending', '2024-02-25');
      `);
      
      // Seed expenses
      await tx.unsafe(`
        INSERT INTO expenses (category, description, amount, month, year, date, payment_method, notes)
        VALUES 
          ('Rent', 'Office Rent', 4500, 'January', 2024, '2024-01-05', 'Bank Transfer', 'Monthly office rent'),
          ('Utilities', 'Electricity Bill', 850, 'January', 2024, '2024-01-10', 'Credit Card', 'Monthly electricity bill'),
          ('Software', 'Software Subscriptions', 1250, 'January', 2024, '2024-01-15', 'Credit Card', 'Various software subscriptions');
      `);
      
      // Seed salaries
      await tx.unsafe(`
        INSERT INTO salaries (employee_id, month, year, basic_salary, bonus, tax_deduction, net_salary, status)
        VALUES 
          (1, 'January', 2024, 5000, 500, 500, 5000, 'Paid'),
          (2, 'January', 2024, 4800, 300, 400, 4700, 'Paid'),
          (3, 'January', 2024, 6000, 800, 600, 6200, 'Paid'),
          (4, 'January', 2024, 4500, 200, 350, 4350, 'Paid'),
          (5, 'January', 2024, 8000, 1000, 800, 8200, 'Paid');
      `);
    });
    
    log('Database seeded successfully!', 'db');
  } catch (error) {
    log(`Seeding error: ${error}`, 'db');
    throw error;
  }
}