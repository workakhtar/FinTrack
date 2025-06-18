import { pgTable, text, serial, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Expenses table for detailed expense tracking
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // e.g., "Tax", "Rent", "Grocery", "Utilities"
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  date: text("date").notNull(), // Store the exact date for more detailed reporting
  paymentMethod: text("payment_method"), // e.g., "Bank Transfer", "Cash", "Credit Card"
  receiptUrl: text("receipt_url"), // Optional URL to uploaded receipt
  notes: text("notes"),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;