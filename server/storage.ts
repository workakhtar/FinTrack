import { 
  employees, type Employee, type InsertEmployee,
  projects, type Project, type InsertProject,
  billings, type Billing, type InsertBilling,
  partners, type Partner, type InsertPartner,
  bonuses, type Bonus, type InsertBonus,
  revenues, type Revenue, type InsertRevenue,
  profitDistributions, type ProfitDistribution, type InsertProfitDistribution,
  salaries, type Salary, type InsertSalary,
  expenses, type Expense, type InsertExpense,
  companySettings, type CompanySettings, type InsertCompanySettings
} from "@shared/schema";

import { eq, inArray } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // Employee operations
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  deleteEmployees(ids: number[]): Promise<boolean>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  deleteProjects(ids: number[]): Promise<boolean>;

  // Billing operations
  getBillings(): Promise<Billing[]>;
  getBillingsByProject(projectId: number): Promise<Billing[]>;
  getBilling(id: number): Promise<Billing | undefined>;
  createBilling(billing: InsertBilling): Promise<Billing>;
  updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined>;
  deleteBilling(id: number): Promise<boolean>;

  // Partner operations
  getPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: number): Promise<boolean>;

  // Bonus operations
  getBonuses(): Promise<Bonus[]>;
  getBonusesByProject(projectId: number): Promise<Bonus[]>;
  getBonusesByEmployee(employeeId: number): Promise<Bonus[]>;
  getBonus(id: number): Promise<Bonus | undefined>;
  createBonus(bonus: InsertBonus): Promise<Bonus>;
  updateBonus(id: number, bonus: Partial<InsertBonus>): Promise<Bonus | undefined>;
  deleteBonus(id: number): Promise<boolean>;
  finalizeAllBonuses(month: string, year: number): Promise<boolean>;

  // Revenue operations
  getRevenues(): Promise<Revenue[]>;
  getRevenue(id: number): Promise<Revenue | undefined>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  updateRevenue(id: number, revenue: Partial<InsertRevenue>): Promise<Revenue | undefined>;
  deleteRevenue(id: number): Promise<boolean>;

  // Profit Distribution operations
  getProfitDistributions(): Promise<ProfitDistribution[]>;
  getProfitDistributionsByPartner(partnerId: number): Promise<ProfitDistribution[]>;
  getProfitDistribution(id: number): Promise<ProfitDistribution | undefined>;
  createProfitDistribution(distribution: InsertProfitDistribution): Promise<ProfitDistribution>;
  updateProfitDistribution(id: number, distribution: Partial<InsertProfitDistribution>): Promise<ProfitDistribution | undefined>;
  deleteProfitDistribution(id: number): Promise<boolean>;

  // Salary operations
  getSalaries(): Promise<Salary[]>;
  getSalariesByEmployee(employeeId: number): Promise<Salary[]>;
  getSalariesByMonth(month: string, year: number): Promise<Salary[]>;
  getSalary(id: number): Promise<Salary | undefined>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined>;
  deleteSalary(id: number): Promise<boolean>;
  deleteSalaries(ids: number[]): Promise<boolean>;
  calculateNetSalary(salaryDetails: Partial<InsertSalary>): number;

  // Expense operations
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;

  // Dashboard data operations
  getDashboardData(month?: string, year?: number): Promise<any>;

  // Company Settings operations
  getCompanySettings(): Promise<CompanySettings | undefined>;
  createCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings>;
  updateCompanySettings(id: number, settings: Partial<InsertCompanySettings>): Promise<CompanySettings | undefined>;
  deleteCompanySettings(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private employees: Map<number, Employee>;
  private projects: Map<number, Project>;
  private billings: Map<number, Billing>;
  private partners: Map<number, Partner>;
  private bonuses: Map<number, Bonus>;
  private revenues: Map<number, Revenue>;
  private profitDistributions: Map<number, ProfitDistribution>;
  private salaries: Map<number, Salary>;
  private expenses: Map<number, Expense>;
  private companySettings = new Map<number, CompanySettings>();
  
  private currentEmployeeId: number;
  private currentProjectId: number;
  private currentBillingId: number;
  private currentPartnerId: number;
  private currentBonusId: number;
  private currentRevenueId: number;
  private currentProfitDistributionId: number;
  private currentSalaryId: number;
  private currentExpenseId: number;
  private currentCompanySettingsId = 1;

  constructor() {
    this.employees = new Map();
    this.projects = new Map();
    this.billings = new Map();
    this.partners = new Map();
    this.bonuses = new Map();
    this.revenues = new Map();
    this.profitDistributions = new Map();
    this.salaries = new Map();
    this.expenses = new Map();
    
    this.currentEmployeeId = 1;
    this.currentProjectId = 1;
    this.currentBillingId = 1;
    this.currentPartnerId = 1;
    this.currentBonusId = 1;
    this.currentRevenueId = 1;
    this.currentProfitDistributionId = 1;
    this.currentSalaryId = 1;
    this.currentExpenseId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample partners
    this.createPartner({
      name: "Partner A",
      email: "partnera@example.com",
      share: "40"
    });
    
    this.createPartner({
      name: "Partner B",
      email: "partnerb@example.com",
      share: "35"
    });
    
    this.createPartner({
      name: "Partner C",
      email: "partnerc@example.com",
      share: "25"
    });

    // Create sample projects with string values for `value` and `deadline`
this.createProject({
  name: "E-commerce Platform Redesign",
  client: "XYZ Corporation",
  status: "Active",
  progress: 75,
  managerId: 4,
  description: "Redesigning the e-commerce platform for better user experience",
  value: "30000.00", // changed to string
  deadline: "2025-08-15", // changed to ISO string
});

this.createProject({
  name: "Mobile App Development",
  client: "ABC Inc.",
  status: "In Progress",
  progress: 45,
  managerId: 2,
  description: "Developing a mobile app for client's business",
  value: "20000.00",
  deadline: "2025-09-01",
});

this.createProject({
  name: "CRM System Integration",
  client: "Global Solutions",
  status: "Planning",
  progress: 15,
  managerId: 4,
  description: "Integrating CRM system with existing infrastructure",
  value: "25000.00",
  deadline: "2025-10-10",
});

this.createProject({
  name: "Marketing Dashboard",
  client: "Marketing Pro",
  status: "Active",
  progress: 85,
  managerId: 3,
  description: "Creating a dashboard for marketing analytics",
  value: "18000.00",
  deadline: "2025-07-25",
});


    // Create sample employees
    this.createEmployee({
      firstName: "Leslie",
      lastName: "Alexander",
      email: "leslie.alexander@example.com",
      department: "Development",
      status: "Active",
      projectId: 1,
      salary: "45000",
      role: "Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    this.createEmployee({
      firstName: "Michael",
      lastName: "Johnson",
      email: "michael.johnson@example.com",
      department: "Design",
      status: "Active",
      projectId: 2,
      salary: "52000",
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    this.createEmployee({
      firstName: "Jennifer",
      lastName: "Wilson",
      email: "jennifer.wilson@example.com",
      department: "Marketing",
      status: "On Leave",
      projectId: 4,
      salary: "48000",
      role: "Marketing Specialist",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    this.createEmployee({
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@example.com",
      department: "Project Management",
      status: "Active",
      projectId: 3,
      salary: "62000",
      role: "Project Manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    // Additional employees
    for (let i = 5; i <= 28; i++) {
      const depts = ["Development", "Design", "Marketing", "Project Management", "Finance"];
      const statuses = ["Active", "On Leave", "Inactive"];
      const projects = [1, 2, 3, 4, null];
      
      this.createEmployee({
        firstName: "Employee",
        lastName: i.toString(),
        email: `employee${i}@example.com`,
        department: depts[Math.floor(Math.random() * depts.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        projectId: projects[Math.floor(Math.random() * projects.length)],
        salary: (30000 + Math.floor(Math.random() * 40000)).toString(),
        role: "Team Member",
        avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i % 10}.jpg`
      });
    }

    // Create sample billings
    this.createBilling({
      projectId: 1,
      month: "October",
      year: 2023,
      amount: "15000",
      status: "Paid",
      invoiceDate: "2023-10-01",
      paymentDate: "2023-10-15"
    });
    
    this.createBilling({
      projectId: 2,
      month: "October",
      year: 2023,
      amount: "20000",
      status: "Pending",
      invoiceDate: "2023-10-05",
      paymentDate: null
    });
    
    this.createBilling({
      projectId: 3,
      month: "October",
      year: 2023,
      amount: "10000",
      status: "Paid",
      invoiceDate: "2023-10-10",
      paymentDate: "2023-10-20"
    });
    
    this.createBilling({
      projectId: 4,
      month: "October",
      year: 2023,
      amount: "7500",
      status: "Overdue",
      invoiceDate: "2023-10-02",
      paymentDate: null
    });

    // Add May 2025 billing data for dashboard testing
    this.createBilling({
      projectId: 1,
      month: "May",
      year: 2025,
      amount: "20800",
      status: "Pending",
      invoiceDate: "2025-05-01",
      paymentDate: null
    });

    // Create sample bonuses
    this.createBonus({
      projectId: 1,
      employeeId: 1,
      month: "October",
      year: 2023,
      amount: "1500",
      percentage: "10",
      status: "Pending"
    });
    
    this.createBonus({
      projectId: 2,
      employeeId: 2,
      month: "October",
      year: 2023,
      amount: "2000",
      percentage: "10",
      status: "Approved"
    });
    
    this.createBonus({
      projectId: 4,
      employeeId: 3,
      month: "October",
      year: 2023,
      amount: "1000",
      percentage: "10",
      status: "Paid"
    });

    // Create revenue data
    this.createRevenue({
      month: "October",
      year: 2023,
      amount: "124892",
      expenses: "82675",
      profit: "42217"
    });
    
    this.createRevenue({
      month: "September",
      year: 2023,
      amount: "115425",
      expenses: "78437",
      profit: "36988"
    });
    
    this.createRevenue({
      month: "August",
      year: 2023,
      amount: "98762",
      expenses: "65400",
      profit: "33362"
    });
    
    this.createRevenue({
      month: "July",
      year: 2023,
      amount: "105320",
      expenses: "70150",
      profit: "35170"
    });

    // Create profit distributions
    this.createProfitDistribution({
      partnerId: 1,
      month: "October",
      year: 2023,
      amount: "16800",
      percentage: "40"
    });
    
    this.createProfitDistribution({
      partnerId: 2,
      month: "October",
      year: 2023,
      amount: "14700",
      percentage: "35"
    });
    
    this.createProfitDistribution({
      partnerId: 3,
      month: "October",
      year: 2023,
      amount: "10500",
      percentage: "25"
    });

    // Create sample salary details
    this.createSalary({
      employeeId: 1,
      month: "October",
      year: 2023,
      basicSalary: "3750",
      bonus: "1500",
      taxDeduction: "500",
      loanDeduction: "0",
      arrears: "0",
      travelAllowance: "300",
      netSalary: "5050",
      status: "Paid",
      paymentDate: "2023-10-30"
    });

    this.createSalary({
      employeeId: 2,
      month: "October",
      year: 2023,
      basicSalary: "4333",
      bonus: "2000",
      taxDeduction: "650",
      loanDeduction: "500",
      arrears: "0",
      travelAllowance: "400",
      netSalary: "5583",
      status: "Paid",
      paymentDate: "2023-10-30"
    });

    this.createSalary({
      employeeId: 3,
      month: "October",
      year: 2023,
      basicSalary: "4000",
      bonus: "1000",
      taxDeduction: "600",
      loanDeduction: "0",
      arrears: "750",
      travelAllowance: "250",
      netSalary: "5400",
      status: "Paid",
      paymentDate: "2023-10-30"
    });

    this.createSalary({
      employeeId: 4,
      month: "October",
      year: 2023,
      basicSalary: "5167",
      bonus: "0",
      taxDeduction: "775",
      loanDeduction: "1000",
      arrears: "0",
      travelAllowance: "500",
      netSalary: "3892",
      status: "Paid",
      paymentDate: "2023-10-30"
    });
    
    // Create sample expenses
    this.createExpense({
      date: "2023-10-05",
      month: "October",
      year: 2023,
      description: "Office Rent",
      amount: "4500",
      category: "Rent",
      paymentMethod: "Bank Transfer",
      receiptUrl: null,
      notes: "Monthly office rent"
    });
    
    this.createExpense({
      date: "2023-10-10",
      month: "October",
      year: 2023,
      description: "Electricity Bill",
      amount: "850",
      category: "Utilities",
      paymentMethod: "Credit Card",
      receiptUrl: null,
      notes: "Monthly electricity bill"
    });
    
    this.createExpense({
      date: "2023-10-12",
      month: "October",
      year: 2023,
      description: "Internet Service",
      amount: "750",
      category: "Utilities",
      paymentMethod: "Credit Card",
      receiptUrl: null,
      notes: "Monthly internet bill"
    });
    
    this.createExpense({
      date: "2023-10-15",
      month: "October",
      year: 2023,
      description: "Office Groceries",
      amount: "650",
      category: "Groceries",
      paymentMethod: "Cash",
      receiptUrl: null,
      notes: "Coffee, snacks, and kitchen supplies"
    });
    
    this.createExpense({
      date: "2023-10-18",
      month: "October",
      year: 2023,
      description: "Office Supplies",
      amount: "425",
      category: "Supplies",
      paymentMethod: "Credit Card",
      receiptUrl: null,
      notes: "Stationery, printer ink, etc."
    });
    
    this.createExpense({
      date: "2023-10-20",
      month: "October",
      year: 2023,
      description: "Software Subscriptions",
      amount: "1250",
      category: "Software",
      paymentMethod: "Credit Card",
      receiptUrl: null,
      notes: "Adobe, Microsoft, and other software subscriptions"
    });
    
    this.createExpense({
      date: "2023-10-25",
      month: "October",
      year: 2023,
      description: "Income Tax Payment",
      amount: "3500",
      category: "Taxes",
      paymentMethod: "Bank Transfer",
      receiptUrl: null,
      notes: "Quarterly tax payment"
    });
    
    // May 2025 expenses for testing
    this.createExpense({
      date: "2025-05-05",
      month: "May",
      year: 2025,
      description: "Office Rent",
      amount: "5200",
      category: "Rent",
      paymentMethod: "Bank Transfer",
      receiptUrl: null,
      notes: "Monthly office rent (increased)"
    });
    
    this.createExpense({
      date: "2025-05-10",
      month: "May",
      year: 2025,
      description: "Cloud Services",
      amount: "3800",
      category: "Software",
      paymentMethod: "Credit Card",
      receiptUrl: null,
      notes: "AWS, Azure, and other cloud services"
    });
    
    this.createExpense({
      date: "2025-05-15",
      month: "May",
      year: 2025,
      description: "Office Supplies",
      amount: "750",
      category: "Supplies",
      paymentMethod: "Credit Card",
      receiptUrl: null,
      notes: "Various office supplies"
    });
    
    this.createExpense({
      date: "2025-05-20",
      month: "May",
      year: 2025,
      description: "Team Building",
      amount: "1750",
      category: "HR",
      paymentMethod: "Credit Card",
      receiptUrl: null,
      notes: "Team building activities"
    });
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = {
      ...employee,
      id,
      projectId: employee.projectId || null,
      avatar: employee.avatar || null
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existingEmployee = this.employees.get(id);
    if (!existingEmployee) {
      return undefined;
    }
    const updatedEmployee: Employee = {
      ...existingEmployee,
      ...employee,
      projectId: employee.projectId !== undefined ? employee.projectId : existingEmployee.projectId,
      avatar: employee.avatar !== undefined ? employee.avatar : existingEmployee.avatar
    };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  async deleteEmployees(ids: number[]): Promise<boolean> {
    try {
      ids.forEach(id => {
        this.employees.delete(id);
      });
      return true;
    } catch (error) {
      console.error('Error deleting employees:', error);
      return false;
    }
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const newProject: Project = {
      ...project,
      id,
      description: project.description || null,
      managerId: project.managerId || null
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }
    const updatedProject: Project = {
      ...existingProject,
      ...project,
      description: project.description !== undefined ? project.description : existingProject.description,
      managerId: project.managerId !== undefined ? project.managerId : existingProject.managerId
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async deleteProjects(ids: number[]): Promise<boolean> {
    try {
      for (const id of ids) {
        await this.projects.delete(id);
      }
      return true;
    } catch (error) {
      console.error("Error deleting projects:", error);
      return false;
    }
  }

  async getBillings(): Promise<Billing[]> {
    return Array.from(this.billings.values());
  }

  async getBillingsByProject(projectId: number): Promise<Billing[]> {
    return Array.from(this.billings.values()).filter(
      (billing) => billing.projectId === projectId
    );
  }

  async getBilling(id: number): Promise<Billing | undefined> {
    return this.billings.get(id);
  }

  async createBilling(billing: InsertBilling): Promise<Billing> {
    const id = this.currentBillingId++;
    const newBilling: Billing = {
      ...billing,
      id,
      invoiceDate: billing.invoiceDate || null,
      paymentDate: billing.paymentDate || null
    };
    this.billings.set(id, newBilling);
    return newBilling;
  }

  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    const existingBilling = this.billings.get(id);
    if (!existingBilling) {
      return undefined;
    }
    const updatedBilling: Billing = {
      ...existingBilling,
      ...billing,
      invoiceDate: billing.invoiceDate !== undefined ? billing.invoiceDate : existingBilling.invoiceDate,
      paymentDate: billing.paymentDate !== undefined ? billing.paymentDate : existingBilling.paymentDate
    };
    this.billings.set(id, updatedBilling);
    return updatedBilling;
  }

  async deleteBilling(id: number): Promise<boolean> {
    return this.billings.delete(id);
  }

  async getPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const id = this.currentPartnerId++;
    const newPartner: Partner = {
      ...partner,
      id
    };
    this.partners.set(id, newPartner);
    return newPartner;
  }

  async updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    const existingPartner = this.partners.get(id);
    if (!existingPartner) {
      return undefined;
    }
    const updatedPartner: Partner = {
      ...existingPartner,
      ...partner
    };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  async deletePartner(id: number): Promise<boolean> {
    return this.partners.delete(id);
  }

  async getBonuses(): Promise<Bonus[]> {
    return Array.from(this.bonuses.values());
  }

  async getBonusesByProject(projectId: number): Promise<Bonus[]> {
    return Array.from(this.bonuses.values()).filter(
      (bonus) => bonus.projectId === projectId
    );
  }

  async getBonusesByEmployee(employeeId: number): Promise<Bonus[]> {
    return Array.from(this.bonuses.values()).filter(
      (bonus) => bonus.employeeId === employeeId
    );
  }

  async getBonus(id: number): Promise<Bonus | undefined> {
    return this.bonuses.get(id);
  }

  async createBonus(bonus: InsertBonus): Promise<Bonus> {
    const id = this.currentBonusId++;
    const newBonus: Bonus = {
      ...bonus,
      id
    };
    this.bonuses.set(id, newBonus);
    return newBonus;
  }

  async updateBonus(id: number, bonus: Partial<InsertBonus>): Promise<Bonus | undefined> {
    const existingBonus = this.bonuses.get(id);
    if (!existingBonus) {
      return undefined;
    }
    const updatedBonus: Bonus = {
      ...existingBonus,
      ...bonus
    };
    this.bonuses.set(id, updatedBonus);
    return updatedBonus;
  }

  async deleteBonus(id: number): Promise<boolean> {
    return this.bonuses.delete(id);
  }

  async finalizeAllBonuses(month: string, year: number): Promise<boolean> {
    try {
      // Get all bonuses for the specified month and year
      const monthBonuses = Array.from(this.bonuses.values()).filter(
        bonus => bonus.month === month && bonus.year === year
      );

      // Update each bonus to mark it as finalized
      for (const bonus of monthBonuses) {
        await this.updateBonus(bonus.id, {
          ...bonus,
          status: 'Finalized'
        });
      }

      return true;
    } catch (error) {
      console.error('Error finalizing bonuses:', error);
      return false;
    }
  }

  async getRevenues(): Promise<Revenue[]> {
    return Array.from(this.revenues.values());
  }

  async getRevenue(id: number): Promise<Revenue | undefined> {
    return this.revenues.get(id);
  }

  async createRevenue(revenue: InsertRevenue): Promise<Revenue> {
    const id = this.currentRevenueId++;
    const newRevenue: Revenue = {
      ...revenue,
      id
    };
    this.revenues.set(id, newRevenue);
    return newRevenue;
  }

  async updateRevenue(id: number, revenue: Partial<InsertRevenue>): Promise<Revenue | undefined> {
    const existingRevenue = this.revenues.get(id);
    if (!existingRevenue) {
      return undefined;
    }
    const updatedRevenue: Revenue = {
      ...existingRevenue,
      ...revenue
    };
    this.revenues.set(id, updatedRevenue);
    return updatedRevenue;
  }

  async deleteRevenue(id: number): Promise<boolean> {
    return this.revenues.delete(id);
  }

  async getProfitDistributions(): Promise<ProfitDistribution[]> {
    return Array.from(this.profitDistributions.values());
  }

  async getProfitDistributionsByPartner(partnerId: number): Promise<ProfitDistribution[]> {
    return Array.from(this.profitDistributions.values()).filter(
      (distribution) => distribution.partnerId === partnerId
    );
  }

  async getProfitDistribution(id: number): Promise<ProfitDistribution | undefined> {
    return this.profitDistributions.get(id);
  }

  async createProfitDistribution(distribution: InsertProfitDistribution): Promise<ProfitDistribution> {
    const id = this.currentProfitDistributionId++;
    const newDistribution: ProfitDistribution = {
      ...distribution,
      id
    };
    this.profitDistributions.set(id, newDistribution);
    return newDistribution;
  }

  async updateProfitDistribution(id: number, distribution: Partial<InsertProfitDistribution>): Promise<ProfitDistribution | undefined> {
    const existingDistribution = this.profitDistributions.get(id);
    if (!existingDistribution) {
      return undefined;
    }
    const updatedDistribution: ProfitDistribution = {
      ...existingDistribution,
      ...distribution
    };
    this.profitDistributions.set(id, updatedDistribution);
    return updatedDistribution;
  }

  async deleteProfitDistribution(id: number): Promise<boolean> {
    return this.profitDistributions.delete(id);
  }

  async getSalaries(): Promise<Salary[]> {
    return Array.from(this.salaries.values());
  }

  async getSalariesByEmployee(employeeId: number): Promise<Salary[]> {
    return Array.from(this.salaries.values()).filter(
      (salary) => salary.employeeId === employeeId
    );
  }

  async getSalariesByMonth(month: string, year: number): Promise<Salary[]> {
    return Array.from(this.salaries.values()).filter(
      (salary) => salary.month === month && salary.year === year
    );
  }

  async getSalary(id: number): Promise<Salary | undefined> {
    return this.salaries.get(id);
  }

  async createSalary(salary: InsertSalary): Promise<Salary> {
    const id = this.currentSalaryId++;
    const newSalary: Salary = {
      ...salary,
      id,
      paymentDate: salary.paymentDate || null,
      bonus: salary.bonus || null,
      taxDeduction: salary.taxDeduction || null,
      loanDeduction: salary.loanDeduction || null,
      arrears: salary.arrears || null,
      travelAllowance: salary.travelAllowance || null
    };
    this.salaries.set(id, newSalary);
    return newSalary;
  }

  async updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined> {
    const existingSalary = this.salaries.get(id);
    if (!existingSalary) {
      return undefined;
    }
    const updatedSalary: Salary = {
      ...existingSalary,
      ...salary,
      paymentDate: salary.paymentDate !== undefined ? salary.paymentDate : existingSalary.paymentDate,
      bonus: salary.bonus !== undefined ? salary.bonus : existingSalary.bonus,
      taxDeduction: salary.taxDeduction !== undefined ? salary.taxDeduction : existingSalary.taxDeduction,
      loanDeduction: salary.loanDeduction !== undefined ? salary.loanDeduction : existingSalary.loanDeduction,
      arrears: salary.arrears !== undefined ? salary.arrears : existingSalary.arrears,
      travelAllowance: salary.travelAllowance !== undefined ? salary.travelAllowance : existingSalary.travelAllowance
    };
    this.salaries.set(id, updatedSalary);
    return updatedSalary;
  }

  async deleteSalary(id: number): Promise<boolean> {
    return this.salaries.delete(id);
  }

  async deleteSalaries(ids: number[]): Promise<boolean> {
    try {
      for (const id of ids) {
        const success = await this.deleteSalary(id);
        if (!success) {
          console.error(`Failed to delete salary with ID ${id}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error deleting salaries:', error);
      return false;
    }
  }

  calculateNetSalary(salaryDetails: Partial<InsertSalary>): number {
    const basicSalary = parseFloat(salaryDetails.basicSalary || "0");
    const bonus = parseFloat(salaryDetails.bonus || "0");
    const taxDeduction = parseFloat(salaryDetails.taxDeduction || "0");
    const loanDeduction = parseFloat(salaryDetails.loanDeduction || "0");
    const arrears = parseFloat(salaryDetails.arrears || "0");
    const travelAllowance = parseFloat(salaryDetails.travelAllowance || "0");
    
    return basicSalary + bonus + arrears + travelAllowance - taxDeduction - loanDeduction;
  }

  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const newExpense: Expense = {
      ...expense,
      id,
      paymentMethod: expense.paymentMethod || null,
      receiptUrl: expense.receiptUrl || null,
      notes: expense.notes || null
    };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existingExpense = this.expenses.get(id);
    if (!existingExpense) {
      return undefined;
    }
    const updatedExpense: Expense = {
      ...existingExpense,
      ...expense,
      paymentMethod: expense.paymentMethod !== undefined ? expense.paymentMethod : existingExpense.paymentMethod,
      receiptUrl: expense.receiptUrl !== undefined ? expense.receiptUrl : existingExpense.receiptUrl,
      notes: expense.notes !== undefined ? expense.notes : existingExpense.notes
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getDashboardData(month?: string, year?: number): Promise<any> {
    try {
      // Import our utility functions for dashboard metrics
      const { prepareDashboardData } = await import('./dashboard-util');
      
      // Fetch all necessary data at once
      const employees = await this.getEmployees();
      const projects = await this.getProjects();
      const partners = await this.getPartners();
      const bonuses = await this.getBonuses(); 
      const profitDistributions = await this.getProfitDistributions();
      const expenses = await this.getExpenses();
      const billings = await this.getBillings();
      
      // Filter data by month and year if provided
      const filteredBillings = month && year 
        ? billings.filter(b => b.month === month && b.year === year)
        : billings;
      
      const filteredExpenses = month && year
        ? expenses.filter(e => e.month === month && e.year === year)
        : expenses;
      
      const filteredBonuses = month && year
        ? bonuses.filter(b => b.month === month && b.year === year)
        : bonuses;
      
      const filteredProfitDistributions = month && year
        ? profitDistributions.filter(p => p.month === month && p.year === year)
        : profitDistributions;
      
      console.log('DEBUG - Filtered data:', {
        billingsCount: filteredBillings.length,
        expensesCount: filteredExpenses.length,
        bonusesCount: filteredBonuses.length,
        profitDistributionsCount: filteredProfitDistributions.length
      });
      
      // Use the utility function to prepare dashboard data with filtered data
      return prepareDashboardData(
        employees, 
        projects, 
        filteredBillings, 
        filteredExpenses, 
        partners, 
        filteredProfitDistributions,
        filteredBonuses
      );
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return {
        metrics: {
          totalRevenue: 0,
          totalExpenses: 0,
          profit: 0,
          expenseRatio: "0.00",
          employeeCount: 0,
          projectCount: 0,
          activeProjectCount: 0
        },
        recentProjects: [],
        revenueChartData: [],
        teamInsights: [],
        partnerDistributions: [],
        projectBonuses: [],
        recentEmployees: [],
        totalBonusPool: 0
      };
    }
  }

  async getCompanySettings(): Promise<CompanySettings | undefined> {
    // Since we only have one company settings record, return the first one
    return Array.from(this.companySettings.values())[0];
  }

  async createCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    const id = this.currentCompanySettingsId++;
    const now = new Date().toISOString();
    
    const newSettings: CompanySettings = {
      ...settings,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.companySettings.set(id, newSettings);
    return newSettings;
  }

  async updateCompanySettings(id: number, settings: Partial<InsertCompanySettings>): Promise<CompanySettings | undefined> {
    const existingSettings = this.companySettings.get(id);
    if (!existingSettings) return undefined;
    
    const updatedSettings: CompanySettings = {
      ...existingSettings,
      ...settings,
      updatedAt: new Date().toISOString()
    };
    
    this.companySettings.set(id, updatedSettings);
    return updatedSettings;
  }

  async deleteCompanySettings(id: number): Promise<boolean> {
    return this.companySettings.delete(id);
  }
}

export class DbStorage implements IStorage {
  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const results = await db.select().from(employees).where(eq(employees.id, id));
    return results[0];
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const results = await db.insert(employees).values(employee).returning();
    return results[0];
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const results = await db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return results[0];
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const results = await db.delete(employees).where(eq(employees.id, id)).returning();
    return results.length > 0;
  }

  async deleteEmployees(ids: number[]): Promise<boolean> {
    try {
      const results = await db.delete(employees)
        .where(inArray(employees.id, ids))
        .returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting employees:', error);
      return false;
    }
  }

  async getProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const results = await db.insert(projects).values(project).returning();
    return results[0];
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const results = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return results[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    const results = await db.delete(projects).where(eq(projects.id, id)).returning();
    return results.length > 0;
  }

  async deleteProjects(ids: number[]): Promise<boolean> {
    try {
      for (const id of ids) {
        await db.delete(projects).where(eq(projects.id, id)).returning();
      }
      return true;
    } catch (error) {
      console.error("Error deleting projects:", error);
      return false;
    }
  }

  async getBillings(): Promise<Billing[]> {
    return db.select().from(billings);
  }

  async getBillingsByProject(projectId: number): Promise<Billing[]> {
    return db.select().from(billings).where(eq(billings.projectId, projectId));
  }

  async getBilling(id: number): Promise<Billing | undefined> {
    const results = await db.select().from(billings).where(eq(billings.id, id));
    return results[0];
  }

  async createBilling(billing: InsertBilling): Promise<Billing> {
    const results = await db.insert(billings).values(billing).returning();
    return results[0];
  }

  async updateBilling(id: number, billing: Partial<InsertBilling>): Promise<Billing | undefined> {
    const results = await db.update(billings).set(billing).where(eq(billings.id, id)).returning();
    return results[0];
  }

  async deleteBilling(id: number): Promise<boolean> {
    const results = await db.delete(billings).where(eq(billings.id, id)).returning();
    return results.length > 0;
  }

  async getPartners(): Promise<Partner[]> {
    return db.select().from(partners);
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
    const results = await db.update(partners).set(partner).where(eq(partners.id, id)).returning();
    return results[0];
  }

  async deletePartner(id: number): Promise<boolean> {
    const results = await db.delete(partners).where(eq(partners.id, id)).returning();
    return results.length > 0;
  }

  async getBonuses(): Promise<Bonus[]> {
    return db.select().from(bonuses);
  }

  async getBonusesByProject(projectId: number): Promise<Bonus[]> {
    return db.select().from(bonuses).where(eq(bonuses.projectId, projectId));
  }

  async getBonusesByEmployee(employeeId: number): Promise<Bonus[]> {
    return db.select().from(bonuses).where(eq(bonuses.employeeId, employeeId));
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
    const results = await db.update(bonuses).set(bonus).where(eq(bonuses.id, id)).returning();
    return results[0];
  }

  async deleteBonus(id: number): Promise<boolean> {
    const results = await db.delete(bonuses).where(eq(bonuses.id, id)).returning();
    return results.length > 0;
  }

  async finalizeAllBonuses(month: string, year: number): Promise<boolean> {
    try {
      // Update all bonuses for the specified month and year
      await db.update(bonuses)
        .set({ status: 'Finalized' })
        .where(eq(bonuses.month, month))
        .where(eq(bonuses.year, year));

      return true;
    } catch (error) {
      console.error('Error finalizing bonuses:', error);
      return false;
    }
  }

  async getRevenues(): Promise<Revenue[]> {
    return db.select().from(revenues);
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
    const results = await db.update(revenues).set(revenue).where(eq(revenues.id, id)).returning();
    return results[0];
  }

  async deleteRevenue(id: number): Promise<boolean> {
    const results = await db.delete(revenues).where(eq(revenues.id, id)).returning();
    return results.length > 0;
  }

  async getProfitDistributions(): Promise<ProfitDistribution[]> {
    return db.select().from(profitDistributions);
  }

  async getProfitDistributionsByPartner(partnerId: number): Promise<ProfitDistribution[]> {
    return db.select().from(profitDistributions).where(eq(profitDistributions.partnerId, partnerId));
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
    const results = await db.update(profitDistributions).set(distribution).where(eq(profitDistributions.id, id)).returning();
    return results[0];
  }

  async deleteProfitDistribution(id: number): Promise<boolean> {
    const results = await db.delete(profitDistributions).where(eq(profitDistributions.id, id)).returning();
    return results.length > 0;
  }

  async getSalaries(): Promise<Salary[]> {
    return db.select().from(salaries);
  }

  async getSalariesByEmployee(employeeId: number): Promise<Salary[]> {
    return db.select().from(salaries).where(eq(salaries.employeeId, employeeId));
  }

  async getSalariesByMonth(month: string, year: number): Promise<Salary[]> {
    const results = db.select().from(salaries)
      .where(eq(salaries.month, month))
      .where(eq(salaries.year, year));
    return results;
  }

  async getSalary(id: number): Promise<Salary | undefined> {
    const results = await db.select().from(salaries).where(eq(salaries.id, id));
    return results[0];
  }

  async createSalary(salary: InsertSalary): Promise<Salary> {
    const results = await db.insert(salaries).values(salary).returning();
    return results[0];
  }

  async updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined> {
    const results = await db.update(salaries).set(salary).where(eq(salaries.id, id)).returning();
    return results[0];
  }

  async deleteSalary(id: number): Promise<boolean> {
    const results = await db.delete(salaries).where(eq(salaries.id, id)).returning();
    return results.length > 0;
  }

  async deleteSalaries(ids: number[]): Promise<boolean> {
    try {
      const results = await db.delete(salaries)
        .where(inArray(salaries.id, ids))
        .returning();
      return results.length === ids.length;
    } catch (error) {
      console.error('Error deleting salaries:', error);
      return false;
    }
  }

  calculateNetSalary(salaryDetails: Partial<InsertSalary>): number {
    const basicSalary = parseFloat(salaryDetails.basicSalary || "0");
    const bonus = parseFloat(salaryDetails.bonus || "0");
    const taxDeduction = parseFloat(salaryDetails.taxDeduction || "0");
    const loanDeduction = parseFloat(salaryDetails.loanDeduction || "0");
    const arrears = parseFloat(salaryDetails.arrears || "0");
    const travelAllowance = parseFloat(salaryDetails.travelAllowance || "0");
    
    return basicSalary + bonus + arrears + travelAllowance - taxDeduction - loanDeduction;
  }

  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses);
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const results = await db.select().from(expenses).where(eq(expenses.id, id));
    return results[0];
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const results = await db.insert(expenses).values(expense).returning();
    return results[0];
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const results = await db.update(expenses).set(expense).where(eq(expenses.id, id)).returning();
    return results[0];
  }

  async deleteExpense(id: number): Promise<boolean> {
    const results = await db.delete(expenses).where(eq(expenses.id, id)).returning();
    return results.length > 0;
  }

  async getDashboardData(month?: string, year?: number): Promise<any> {
    try {
      const { prepareDashboardData } = await import('./dashboard-util');
      
      // Get all required data
      const employees = await this.getEmployees();
      const projects = await this.getProjects();
      const partners = await this.getPartners();
      const bonuses = await this.getBonuses(); 
      const profitDistributions = await this.getProfitDistributions();
      const expenses = await this.getExpenses();
      
      // Get all available billings
      const allBillings = await this.getBillings();
      
      // Log all billing entries for debugging
      console.log('ALL BILLING ENTRIES:');
      allBillings.forEach(b => {
        console.log(`Billing #${b.id}: month=${b.month}, year=${b.year}, amount=${b.amount}`);
      });
      
      // Initialize filtered billings with all billings
      let filteredBillings = [...allBillings];
      
      // Apply filtering if month and year are provided
      if (month && year) {
        const numericYear = Number(year);
        console.log(`FILTERING: Looking for billings from ${month} ${numericYear}`);
        
        // Create a new filtered array with only the billings for this month/year
        filteredBillings = allBillings.filter(billing => {
          const billingYear = typeof billing.year === 'string' 
            ? parseInt(billing.year) 
            : billing.year;
          
          const monthMatches = billing.month === month;
          const yearMatches = billingYear === numericYear;
          
          console.log(`Checking billing #${billing.id}: month=${monthMatches}, year=${yearMatches}`);
          
          return monthMatches && yearMatches;
        });
        
        console.log(`FILTERED: Found ${filteredBillings.length} billings for ${month} ${numericYear}`);
        filteredBillings.forEach(b => {
          console.log(`- ${b.month} ${b.year}: $${b.amount}`);
        });
      }
      
      // Generate the dashboard data using the filtered billings
      const dashboardData = prepareDashboardData(
        employees, 
        projects, 
        filteredBillings, // Use the filtered billings here!
        expenses, 
        partners, 
        profitDistributions,
        bonuses
      );
      
      // Log the metrics for debugging
      console.log(`DASHBOARD METRICS: Revenue=Rs${dashboardData.metrics.totalRevenue}, Expenses=Rs${dashboardData.metrics.totalExpenses}`);
      
      return dashboardData;
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return {
        metrics: {
          totalRevenue: 0,
          totalExpenses: 0,
          profit: 0,
          expenseRatio: "0.00",
          employeeCount: 0,
          projectCount: 0,
          activeProjectCount: 0
        },
        recentProjects: [],
        revenueChartData: [],
        expenseBreakdown: [],
        partnerDistributions: [],
        projectBonuses: [],
        recentEmployees: [],
        totalBonusPool: 0
      };
    }
  }

  async getCompanySettings(): Promise<CompanySettings | undefined> {
    const results = await db.select().from(companySettings);
    return results[0];
  }

  async createCompanySettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    const results = await db.insert(companySettings).values(settings).returning();
    return results[0];
  }

  async updateCompanySettings(id: number, settings: Partial<InsertCompanySettings>): Promise<CompanySettings | undefined> {
    const results = await db.update(companySettings)
      .set(settings)
      .where(eq(companySettings.id, id))
      .returning();
    return results[0];
  }

  async deleteCompanySettings(id: number): Promise<boolean> {
    const results = await db.delete(companySettings)
      .where(eq(companySettings.id, id))
      .returning();
    return results.length > 0;
  }
}

// Export an instance of the storage implementation
// Switch between memory storage and database storage here
// export const storage = new MemStorage();
export const storage = new DbStorage();
