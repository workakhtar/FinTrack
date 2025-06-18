-- Create expenses table for tracking detailed expenses
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT,
  receipt_url TEXT,
  notes TEXT
);