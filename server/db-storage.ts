import { db } from './db';
import { IStorage } from './storage';
import { 
  Employee, InsertEmployee, 
  Project, InsertProject, 
  Billing, InsertBilling, 
  Partner, InsertPartner, 
  Bonus, InsertBonus, 
  Revenue, InsertRevenue, 
  ProfitDistribution, InsertProfitDistribution, 
  Salary, InsertSalary,
  Expense, InsertExpense,
  employees, projects, billings, partners, bonuses, revenues, profitDistributions, salaries, expenses
} from '../shared/schema';
import { eq, and } from 'drizzle-orm';

export class DbStorage implements IStorage {
  // Helper methods for type conversion
  private ensureNullable<T>(value: T | undefined | null): T | null {
    return value === undefined ? null : value;
  }

  private ensureString(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return value.toString();
  }

  // Employee operations
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const results = await db.select().from(employees).where(eq(employees.id, id));
    return results[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    // Ensure proper types for optional fields
    const employeeData = {
      ...employee,
      projectId: this.ensureNullable(employee.projectId),
      avatar: this.ensureNullable(employee.avatar)
    };
    
    const results = await db.insert(employees).values(employeeData).returning();
    return results[0];
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    // Ensure proper types for optional fields
    const employeeData = {
      ...employee,
      projectId: employee.projectId !== undefined ? this.ensureNullable(employee.projectId) : undefined,
      avatar: employee.avatar !== undefined ? this.ensureNullable(employee.avatar) : undefined
    };
    
    const results = await db.update(employees)
      .set(employeeData)
      .where(eq(employees.id, id))
      .returning();
    
    return results[0];
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const results = await db.delete(employees)
      .where(eq(employees.id, id))
      .returning();
    
    return results.length > 0;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    // Ensure proper types for optional fields
    const projectData = {
      ...project,
      managerId: this.ensureNullable(project.managerId),
      description: this.ensureNullable(project.description)
    };
    
    const results = await db.insert(projects).values(projectData).returning();
    return results[0];
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    // Ensure proper types for optional fields
    const projectData = {
      ...project,
      managerId: project.managerId !== undefined ? this.ensureNullable(project.managerId) : undefined,
      description: project.description !== undefined ? this.ensureNullable(project.description) : undefined
    };
    
    const results = await db.update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    
    return results[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    const results = await db.delete(projects)
      .where(eq(projects.id, id))
      .returning();
    
    return results.length > 0;
  }

  // Billing operations
  async getBillings(): Promise<Billing[]> {
    return await db.select().from(billings);
  }

  async getBillingsByProject(projectId: number): Promise<Billing[]> {
    return await db.select().from(billings).where(eq(billings.projectId, projectId));
  }

  async getBilling(id: number): Promise<Billing | undefined> {
    const results = await db.select().from(billings).where(eq(billings.id, id));
    return results[0];
  }

  async createBilling(billing: InsertBilling): Promise<Billing> {
    // Ensure proper types for optional fields
    const billingData = {
      ...billing,
      invoiceDate: this.ensureNullable(billing.invoiceDate),
      paymentDate: this.ensureNullable(billing.paymentDate)
    };
    
    const results = await db.insert(billings).values(billingData).returning();
    return results[0];
  }

  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    // Ensure proper types for optional fields
    const billingData = {
      ...billing,
      invoiceDate: billing.invoiceDate !== undefined ? this.ensureNullable(billing.invoiceDate) : undefined,
      paymentDate: billing.paymentDate !== undefined ? this.ensureNullable(billing.paymentDate) : undefined
    };
    
    const results = await db.update(billings)
      .set(billingData)
      .where(eq(billings.id, id))
      .returning();
    
    return results[0];
  }

  async deleteBilling(id: number): Promise<boolean> {
    const results = await db.delete(billings)
      .where(eq(billings.id, id))
      .returning();
    
    return results.length > 0;
  }

  // Partner operations
  async getPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const results = await db.select().from(partners).where(eq(partners.id, id));
    return results[0];
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const results = await db.insert(partners).values(partner).returning();
    return results[0];
  }

  async updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    const results = await db.update(partners)
      .set(partner)
      .where(eq(partners.id, id))
      .returning();
    
    return results[0];
  }

  async deletePartner(id: number): Promise<boolean> {
    const results = await db.delete(partners)
      .where(eq(partners.id, id))
      .returning();
    
    return results.length > 0;
  }

  // Bonus operations
  async getBonuses(): Promise<Bonus[]> {
    return await db.select().from(bonuses);
  }

  async getBonusesByProject(projectId: number): Promise<Bonus[]> {
    return await db.select().from(bonuses).where(eq(bonuses.projectId, projectId));
  }

  async getBonusesByEmployee(employeeId: number): Promise<Bonus[]> {
    return await db.select().from(bonuses).where(eq(bonuses.employeeId, employeeId));
  }

  async getBonus(id: number): Promise<Bonus | undefined> {
    const results = await db.select().from(bonuses).where(eq(bonuses.id, id));
    return results[0];
  }

  async createBonus(bonus: InsertBonus): Promise<Bonus> {
    const results = await db.insert(bonuses).values(bonus).returning();
    return results[0];
  }

  async updateBonus(id: number, bonus: Partial<InsertBonus>): Promise<Bonus | undefined> {
    const results = await db.update(bonuses)
      .set(bonus)
      .where(eq(bonuses.id, id))
      .returning();
    
    return results[0];
  }

  async deleteBonus(id: number): Promise<boolean> {
    const results = await db.delete(bonuses)
      .where(eq(bonuses.id, id))
      .returning();
    
    return results.length > 0;
  }

  // Revenue operations
  async getRevenues(): Promise<Revenue[]> {
    return await db.select().from(revenues);
  }

  async getRevenue(id: number): Promise<Revenue | undefined> {
    const results = await db.select().from(revenues).where(eq(revenues.id, id));
    return results[0];
  }

  async createRevenue(revenue: InsertRevenue): Promise<Revenue> {
    const results = await db.insert(revenues).values(revenue).returning();
    return results[0];
  }

  async updateRevenue(id: number, revenue: Partial<InsertRevenue>): Promise<Revenue | undefined> {
    const results = await db.update(revenues)
      .set(revenue)
      .where(eq(revenues.id, id))
      .returning();
    
    return results[0];
  }

  async deleteRevenue(id: number): Promise<boolean> {
    const results = await db.delete(revenues)
      .where(eq(revenues.id, id))
      .returning();
    
    return results.length > 0;
  }

  // Profit Distribution operations
  async getProfitDistributions(): Promise<ProfitDistribution[]> {
    return await db.select().from(profitDistributions);
  }

  async getProfitDistributionsByPartner(partnerId: number): Promise<ProfitDistribution[]> {
    return await db.select().from(profitDistributions).where(eq(profitDistributions.partnerId, partnerId));
  }

  async getProfitDistribution(id: number): Promise<ProfitDistribution | undefined> {
    const results = await db.select().from(profitDistributions).where(eq(profitDistributions.id, id));
    return results[0];
  }

  async createProfitDistribution(distribution: InsertProfitDistribution): Promise<ProfitDistribution> {
    const results = await db.insert(profitDistributions).values(distribution).returning();
    return results[0];
  }

  async updateProfitDistribution(id: number, distribution: Partial<InsertProfitDistribution>): Promise<ProfitDistribution | undefined> {
    const results = await db.update(profitDistributions)
      .set(distribution)
      .where(eq(profitDistributions.id, id))
      .returning();
    
    return results[0];
  }

  async deleteProfitDistribution(id: number): Promise<boolean> {
    const results = await db.delete(profitDistributions)
      .where(eq(profitDistributions.id, id))
      .returning();
    
    return results.length > 0;
  }

  // Salary operations
  async getSalaries(): Promise<Salary[]> {
    return await db.select().from(salaries);
  }

  async getSalariesByEmployee(employeeId: number): Promise<Salary[]> {
    return await db.select().from(salaries).where(eq(salaries.employeeId, employeeId));
  }

  async getSalariesByMonth(month: string, year: number): Promise<Salary[]> {
    return await db.select().from(salaries).where(
      and(
        eq(salaries.month, month),
        eq(salaries.year, year)
      )
    );
  }

  async getSalary(id: number): Promise<Salary | undefined> {
    const results = await db.select().from(salaries).where(eq(salaries.id, id));
    return results[0];
  }

  async createSalary(salary: InsertSalary): Promise<Salary> {
    // Calculate net salary
    const netSalary = this.calculateNetSalary(salary);
    
    // Ensure proper types for optional fields
    const salaryData = {
      ...salary,
      status: salary.status || 'pending',
      paymentDate: this.ensureNullable(salary.paymentDate),
      bonus: this.ensureNullable(salary.bonus) || '0',
      taxDeduction: this.ensureNullable(salary.taxDeduction) || '0',
      loanDeduction: this.ensureNullable(salary.loanDeduction) || '0',
      arrears: this.ensureNullable(salary.arrears) || '0',
      travelAllowance: this.ensureNullable(salary.travelAllowance) || '0',
      netSalary: this.ensureString(netSalary)
    };
    
    const results = await db.insert(salaries).values(salaryData).returning();
    return results[0];
  }

  async updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined> {
    // Get the existing salary record
    const existingSalary = await this.getSalary(id);
    if (!existingSalary) {
      return undefined;
    }
    
    // Calculate new net salary based on updated values
    const updatedSalary = {
      ...existingSalary,
      ...salary
    };
    
    const netSalary = this.calculateNetSalary(updatedSalary);
    
    // Ensure proper types for optional fields
    const salaryData = {
      ...salary,
      paymentDate: salary.paymentDate !== undefined ? this.ensureNullable(salary.paymentDate) : undefined,
      bonus: salary.bonus !== undefined ? this.ensureNullable(salary.bonus) : undefined,
      taxDeduction: salary.taxDeduction !== undefined ? this.ensureNullable(salary.taxDeduction) : undefined,
      loanDeduction: salary.loanDeduction !== undefined ? this.ensureNullable(salary.loanDeduction) : undefined,
      arrears: salary.arrears !== undefined ? this.ensureNullable(salary.arrears) : undefined,
      travelAllowance: salary.travelAllowance !== undefined ? this.ensureNullable(salary.travelAllowance) : undefined,
      netSalary: this.ensureString(netSalary)
    };
    
    const results = await db.update(salaries)
      .set(salaryData)
      .where(eq(salaries.id, id))
      .returning();
    
    return results[0];
  }

  async deleteSalary(id: number): Promise<boolean> {
    const results = await db.delete(salaries)
      .where(eq(salaries.id, id))
      .returning();
    
    return results.length > 0;
  }

  calculateNetSalary(salaryDetails: Partial<InsertSalary>): number {
    const basicSalary = parseFloat(salaryDetails.basicSalary || '0');
    const bonus = parseFloat(salaryDetails.bonus || '0');
    const taxDeduction = parseFloat(salaryDetails.taxDeduction || '0');
    const loanDeduction = parseFloat(salaryDetails.loanDeduction || '0');
    const arrears = parseFloat(salaryDetails.arrears || '0');
    const travelAllowance = parseFloat(salaryDetails.travelAllowance || '0');
    
    return basicSalary + bonus + arrears + travelAllowance - taxDeduction - loanDeduction;
  }

  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses);
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const result = await db.select().from(expenses).where(eq(expenses.id, id));
    return result[0];
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const result = await db.insert(expenses).values(expense).returning();
    return result[0];
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const result = await db
      .update(expenses)
      .set(expense)
      .where(eq(expenses.id, id))
      .returning();
      
    return result[0];
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning({ id: expenses.id });
      
    return result.length > 0;
  }

  // Dashboard data operations
  async getDashboardData(): Promise<any> {
    // Get total revenue
    const allRevenues = await this.getRevenues();
    const totalRevenue = allRevenues.reduce((sum, revenue) => sum + parseFloat(revenue.amount), 0);
    
    // Get total expenses (salaries + bonuses + operating expenses)
    const allSalaries = await this.getSalaries();
    const totalSalaries = allSalaries.reduce((sum, salary) => sum + parseFloat(salary.netSalary), 0);
    
    const allBonuses = await this.getBonuses();
    const totalBonuses = allBonuses.reduce((sum, bonus) => sum + parseFloat(bonus.amount), 0);
    
    // Get monthly operating expenses (rent, utilities, etc.)
    const allExpenses = await this.getExpenses();
    const totalOperatingExpenses = allExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const totalExpenses = totalSalaries + totalBonuses + totalOperatingExpenses;
    
    // Get expense breakdown by category
    const expenseCategories = allExpenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(expense.amount);
      return acc;
    }, {} as Record<string, number>);
    
    const expenseBreakdown = Object.entries(expenseCategories).map(([name, value]) => ({
      name,
      value
    }));
    
    // Get employee count
    const employees = await this.getEmployees();
    const employeeCount = employees.length;
    
    // Get project count
    const projects = await this.getProjects();
    const projectCount = projects.length;
    const activeProjectCount = projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
    
    // Calculate expense ratio
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
    
    // Return dashboard data
    return {
      metrics: {
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
        expenseRatio: expenseRatio.toFixed(2),
        employeeCount,
        projectCount,
        activeProjectCount
      },
      expenseBreakdown,
      recentProjects: projects.slice(0, 5),
      recentEmployees: employees.slice(0, 5)
    };
  }
}