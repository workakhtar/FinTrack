import { pgTable, text, serial, integer, decimal, timestamp, boolean, json, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Employees table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  department: text("department").notNull(),
  status: text("status").notNull(),
  projectId: integer("project_id"),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  role: text("role").notNull(),
  avatar: text("avatar"),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  client: text("client").notNull(),
  status: text("status").notNull(),
  progress: integer("progress").notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(), // <- Added field
  deadline: date("deadline").notNull(),     // <- Added field
  managerId: integer("manager_id"),
  description: text("description"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Billing table
export const billings = pgTable("billings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(),
  invoiceDate: text("invoice_date"),
  paymentDate: text("payment_date"),
});

export const insertBillingSchema = createInsertSchema(billings).omit({
  id: true,
});

export type InsertBilling = z.infer<typeof insertBillingSchema>;
export type Billing = typeof billings.$inferSelect;

// Partners table
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  share: decimal("share", { precision: 5, scale: 2 }).notNull()
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

// Bonuses table
export const bonuses = pgTable("bonuses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  employeeId: integer("employee_id").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  status: text("status").notNull(),
});

export const insertBonusSchema = createInsertSchema(bonuses).omit({
  id: true,
});

export type InsertBonus = z.infer<typeof insertBonusSchema>;
export type Bonus = typeof bonuses.$inferSelect;

// Revenue table for tracking monthly revenue
export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  expenses: decimal("expenses", { precision: 10, scale: 2 }).notNull(),
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(),
});

export const insertRevenueSchema = createInsertSchema(revenues).omit({
  id: true,
});

export type InsertRevenue = z.infer<typeof insertRevenueSchema>;
export type Revenue = typeof revenues.$inferSelect;

// Profit Distribution table
export const profitDistributions = pgTable("profit_distributions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
});

export const insertProfitDistributionSchema = createInsertSchema(profitDistributions).omit({
  id: true,
});

export type InsertProfitDistribution = z.infer<typeof insertProfitDistributionSchema>;
export type ProfitDistribution = typeof profitDistributions.$inferSelect;

// Salaries table for detailed salary components
export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  basicSalary: decimal("basic_salary", { precision: 10, scale: 2 }).notNull(),
  bonus: decimal("bonus", { precision: 10, scale: 2 }).default("0"),
  taxDeduction: decimal("tax_deduction", { precision: 10, scale: 2 }).default("0"),
  loanDeduction: decimal("loan_deduction", { precision: 10, scale: 2 }).default("0"),
  arrears: decimal("arrears", { precision: 10, scale: 2 }).default("0"),
  travelAllowance: decimal("travel_allowance", { precision: 10, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentDate: text("payment_date"),
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
});

export type InsertSalary = z.infer<typeof insertSalarySchema>;
export type Salary = typeof salaries.$inferSelect;

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

// Company Settings table
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  taxId: text("tax_id").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  fiscalYearStart: text("fiscal_year_start").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;
