-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  status TEXT NOT NULL,
  project_id INTEGER,
  salary NUMERIC(10, 2) NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL,
  deadline TEXT NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  manager_id INTEGER,
  description TEXT
);

-- Create billings table
CREATE TABLE IF NOT EXISTS billings (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL,
  invoice_date TEXT,
  payment_date TEXT
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  share NUMERIC(5, 2) NOT NULL
);

-- Create bonuses table
CREATE TABLE IF NOT EXISTS bonuses (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  status TEXT NOT NULL
);

-- Create revenues table
CREATE TABLE IF NOT EXISTS revenues (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  expenses NUMERIC(10, 2) NOT NULL,
  profit NUMERIC(10, 2) NOT NULL
);

-- Create profit_distributions table
CREATE TABLE IF NOT EXISTS profit_distributions (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL
);

-- Create salaries table
CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  basic_salary NUMERIC(10, 2) NOT NULL,
  bonus NUMERIC(10, 2) DEFAULT 0,
  tax_deduction NUMERIC(10, 2) DEFAULT 0,
  loan_deduction NUMERIC(10, 2) DEFAULT 0,
  arrears NUMERIC(10, 2) DEFAULT 0,
  travel_allowance NUMERIC(10, 2) DEFAULT 0,
  net_salary NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date TEXT
);