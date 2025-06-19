import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertEmployeeSchema, 
  insertProjectSchema, 
  insertBillingSchema, 
  insertPartnerSchema, 
  insertBonusSchema,
  insertSalarySchema,
  insertExpenseSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API base route
  const apiBase = "/api";

  // Dashboard route with month/year filtering
  app.get(`${apiBase}/dashboard`, async (req, res) => {
    try {
      // Get month and year from query parameters
      const month = req.query.month as string;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      console.log(`Dashboard requested with filters - Month: ${month}, Year: ${year}`);
      
      // Add more detailed logging for request params
      console.log(`Dashboard request params - month: '${month}' (${typeof month}), year: '${year}' (${typeof year})`);
      
      const dashboardData = await storage.getDashboardData(month, year);
      res.json(dashboardData);
    } catch (error) {
      console.error('Error in dashboard route:', error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Employees routes
  app.get(`${apiBase}/employees`, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post(`${apiBase}/employees/bulk-delete`, async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Invalid employee IDs" });
      }

      const success = await storage.deleteEmployees(ids);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete employees" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error in bulk delete employees:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get(`${apiBase}/employees/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.post(`${apiBase}/employees/bulk-upload`, async (req, res) => {
    try {
      const { employees } = req.body;

      if (!Array.isArray(employees)) {
        return res.status(400).json({ error: 'Invalid request body. Expected an array of employees.' });
      }

      const results = [];
      const errors = [];

      for (const employee of employees) {
        try {
          // Validate required fields
          const missingFields = [];
          if (!employee.firstName) missingFields.push('firstName');
          if (!employee.lastName) missingFields.push('lastName');
          if (!employee.email) missingFields.push('email');
          if (!employee.department) missingFields.push('department');
          if (!employee.salary) missingFields.push('salary');

          if (missingFields.length > 0) {
            errors.push({
              employee,
              error: `Missing required fields: ${missingFields.join(', ')}`
            });
            continue;
          }

          // Ensure salary is a string
          if (typeof employee.salary === 'number') {
            employee.salary = employee.salary.toString();
          }

          // Ensure status is set if empty
          if (!employee.status || employee.status.trim() === '') {
            employee.status = 'Active';
          }

          // Validate data with schema
          const validatedData = insertEmployeeSchema.parse(employee);
          
          // Create the employee record
          const createdEmployee = await storage.createEmployee(validatedData);
          results.push(createdEmployee);
        } catch (error) {
          errors.push({
            employee,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return res.status(200).json({
        success: true,
        created: results.length,
        failed: errors.length,
        results,
        errors
      });
    } catch (error) {
      console.error('Error in bulk employee upload:', error);
      return res.status(500).json({
        error: 'Failed to process employee uploads',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post(`${apiBase}/employees`, async (req, res) => {
    try {
      let employeeData = {...req.body};
      
      // Ensure salary is a string as required by schema
      if (typeof employeeData.salary === 'number') {
        employeeData.salary = employeeData.salary.toString();
      }
      
      // Ensure status is set if empty
      if (!employeeData.status || employeeData.status.trim() === '') {
        employeeData.status = 'Active';
      }
      
      console.log('Creating employee with data:', employeeData);
      const validatedData = insertEmployeeSchema.parse(employeeData);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.put(`${apiBase}/employees/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      let employeeData = {...req.body};
      
      // Ensure salary is a string as required by schema
      if (typeof employeeData.salary === 'number') {
        employeeData.salary = employeeData.salary.toString();
      }
      
      // Ensure status is set if empty
      if (employeeData.status !== undefined && (!employeeData.status || employeeData.status.trim() === '')) {
        employeeData.status = 'Active';
      }
      
      console.log('Updating employee with data:', employeeData);
      const validatedData = insertEmployeeSchema.partial().parse(employeeData);
      const updatedEmployee = await storage.updateEmployee(id, validatedData);
      
      if (!updatedEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete(`${apiBase}/employees/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmployee(id);
      
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Projects routes
  app.get(`${apiBase}/projects`, async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get(`${apiBase}/projects/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post(`${apiBase}/projects`, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put(`${apiBase}/projects/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, validatedData);
      
      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete(`${apiBase}/projects/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  app.post(`${apiBase}/projects/bulk-delete`, async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Invalid project IDs" });
      }

      const success = await storage.deleteProjects(ids);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete projects" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error in bulk delete projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Billings routes
  app.get(`${apiBase}/billings`, async (req, res) => {
    try {
      const billings = await storage.getBillings();
      res.json(billings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billings" });
    }
  });

  app.get(`${apiBase}/billings/project/:projectId`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const billings = await storage.getBillingsByProject(projectId);
      res.json(billings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billings for project" });
    }
  });

  app.get(`${apiBase}/billings/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const billing = await storage.getBilling(id);
      
      if (!billing) {
        return res.status(404).json({ error: "Billing not found" });
      }
      
      res.json(billing);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch billing" });
    }
  });

  app.post(`${apiBase}/billings`, async (req, res) => {
    try {
      const validatedData = insertBillingSchema.parse(req.body);
      const billing = await storage.createBilling(validatedData);
      res.status(201).json(billing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create billing" });
    }
  });

  app.put(`${apiBase}/billings/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBillingSchema.partial().parse(req.body);
      const updatedBilling = await storage.updateBilling(id, validatedData);
      
      if (!updatedBilling) {
        return res.status(404).json({ error: "Billing not found" });
      }
      
      res.json(updatedBilling);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update billing" });
    }
  });

  app.delete(`${apiBase}/billings/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBilling(id);
      
      if (!success) {
        return res.status(404).json({ error: "Billing not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete billing" });
    }
  });

  // Partners routes
  app.get(`${apiBase}/partners`, async (req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.get(`${apiBase}/partners/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const partner = await storage.getPartner(id);
      
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partner" });
    }
  });

  app.post(`${apiBase}/partners`, async (req, res) => {
    try {
      const validatedData = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(validatedData);
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  app.put(`${apiBase}/partners/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPartnerSchema.partial().parse(req.body);
      const updatedPartner = await storage.updatePartner(id, validatedData);
      
      if (!updatedPartner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      res.json(updatedPartner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  app.delete(`${apiBase}/partners/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePartner(id);
      
      if (!success) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete partner" });
    }
  });

  // Bonuses routes
  app.get(`${apiBase}/bonuses`, async (req, res) => {
    try {
      const bonuses = await storage.getBonuses();
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });

  app.get(`${apiBase}/bonuses/project/:projectId`, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const bonuses = await storage.getBonusesByProject(projectId);
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonuses for project" });
    }
  });

  app.get(`${apiBase}/bonuses/employee/:employeeId`, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const bonuses = await storage.getBonusesByEmployee(employeeId);
      res.json(bonuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonuses for employee" });
    }
  });

  app.get(`${apiBase}/bonuses/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bonus = await storage.getBonus(id);
      
      if (!bonus) {
        return res.status(404).json({ error: "Bonus not found" });
      }
      
      res.json(bonus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bonus" });
    }
  });

  app.post(`${apiBase}/bonuses`, async (req, res) => {
    try {
      const validatedData = insertBonusSchema.parse(req.body);
      const bonus = await storage.createBonus(validatedData);
      res.status(201).json(bonus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create bonus" });
    }
  });

  app.put(`${apiBase}/bonuses/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBonusSchema.partial().parse(req.body);
      const updatedBonus = await storage.updateBonus(id, validatedData);
      
      if (!updatedBonus) {
        return res.status(404).json({ error: "Bonus not found" });
      }
      
      res.json(updatedBonus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update bonus" });
    }
  });

  app.delete(`${apiBase}/bonuses/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBonus(id);
      
      if (!success) {
        return res.status(404).json({ error: "Bonus not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bonus" });
    }
  });
  
  // Calculate quarterly bonuses
  app.post(`${apiBase}/bonuses/calculate-quarterly`, async (req, res) => {
    try {
      const { quarter, year, projectIds, employeeIds, percentages } = req.body;
      
      // Get the months for this quarter
      const quarterMonths = [];
      const startMonth = (quarter - 1) * 3;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      for (let i = 0; i < 3; i++) {
        quarterMonths.push(monthNames[startMonth + i]);
      }
      
      // Get all projects or filter by provided projectIds
      let projects = await storage.getProjects();
      if (projectIds && projectIds.length > 0) {
        projects = projects.filter(project => projectIds.includes(project.id));
      }
      
      // Get all employees or filter by provided employeeIds
      let employees = await storage.getEmployees();
      if (employeeIds && employeeIds.length > 0) {
        employees = employees.filter(employee => employeeIds.includes(employee.id));
      }
      
      // Get all billings for the specified quarter and year
      const allBillings = await storage.getBillings();
      const quarterBillings = allBillings.filter(billing => 
        quarterMonths.includes(billing.month) && 
        billing.year === year
      );
      
      // Calculate project totals for the quarter
      const projectTotals = {};
      for (const billing of quarterBillings) {
        if (!projectTotals[billing.projectId]) {
          projectTotals[billing.projectId] = 0;
        }
        projectTotals[billing.projectId] += parseFloat(billing.amount);
      }
      
      // Create bonuses based on custom percentages provided by the user
      const createdBonuses = [];
      
      // Check if custom percentages are provided
      if (percentages && Object.keys(percentages).length > 0) {
        // Process each employee-project combination with custom percentages
        for (const key in percentages) {
          // Skip if no percentage value was set
          const percentageValue = parseFloat(percentages[key]);
          if (!percentageValue || percentageValue <= 0) continue;
          
          // Parse the employee and project IDs from the key (format: employeeId-projectId)
          const [employeeIdStr, projectIdStr] = key.split('-');
          const employeeId = parseInt(employeeIdStr);
          const projectId = parseInt(projectIdStr);
          
          // Skip if employee or project are not in the selected sets
          if ((employeeIds && employeeIds.length > 0 && !employeeIds.includes(employeeId)) ||
              (projectIds && projectIds.length > 0 && !projectIds.includes(projectId))) {
            continue;
          }
          
          // Skip if no billing for this project in the quarter
          if (!projectTotals[projectId] || projectTotals[projectId] <= 0) continue;
          
          // Calculate bonus amount using the custom percentage
          const projectTotal = projectTotals[projectId];
          const bonusAmount = (projectTotal * percentageValue) / 100;
          
          // Only create a bonus if the amount is greater than zero
          if (bonusAmount <= 0) continue;
          
          // Create a bonus record for the last month of the quarter
          const bonusMonth = quarterMonths[2]; // Last month of the quarter
          
          const bonusData = {
            projectId: projectId,
            employeeId: employeeId,
            month: bonusMonth,
            year: year,
            amount: bonusAmount.toFixed(2),
            percentage: percentageValue.toString(),
            status: 'Pending'
          };
        
          const newBonus = await storage.createBonus(bonusData);
          createdBonuses.push(newBonus);
        }
      }
      
      res.status(201).json({
        message: `Successfully calculated quarterly bonuses for ${createdBonuses.length} employees.`,
        bonuses: createdBonuses
      });
    } catch (error) {
      console.error("Error calculating quarterly bonuses:", error);
      res.status(500).json({ error: "Failed to calculate quarterly bonuses" });
    }
  });

  // Revenue routes
  app.get(`${apiBase}/revenues`, async (req, res) => {
    try {
      const revenues = await storage.getRevenues();
      res.json(revenues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenues" });
    }
  });

  // Profit Distributions routes
  app.get(`${apiBase}/profit-distributions`, async (req, res) => {
    try {
      const distributions = await storage.getProfitDistributions();
      res.json(distributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profit distributions" });
    }
  });

  app.get(`${apiBase}/profit-distributions/partner/:partnerId`, async (req, res) => {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const distributions = await storage.getProfitDistributionsByPartner(partnerId);
      res.json(distributions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profit distributions for partner" });
    }
  });

  // Salary routes
  app.get(`${apiBase}/salaries`, async (req, res) => {
    try {
      const salaries = await storage.getSalaries();
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries" });
    }
  });

  app.post(`${apiBase}/salaries/bulk-upload`, async (req, res) => {
    try {
      const { salaries } = req.body;

      if (!Array.isArray(salaries)) {
        return res.status(400).json({ error: 'Invalid request body. Expected an array of salaries.' });
      }

      // Get all existing employees first
      const existingEmployees = await storage.getEmployees();
      const existingEmployeeIds = new Set(existingEmployees.map(emp => emp.id));

      const results = [];
      const errors = [];

      for (const salary of salaries) {
        try {
          // Validate required fields
          const missingFields = [];
          if (!salary.employeeId) missingFields.push('employeeId');
          if (!salary.month) missingFields.push('month');
          if (!salary.year) missingFields.push('year');
          if (!salary.basicSalary) missingFields.push('basicSalary');

          if (missingFields.length > 0) {
            errors.push({
              salary,
              error: `Missing required fields: ${missingFields.join(', ')}`
            });
            continue;
          }

          // Validate data types
          if (isNaN(Number(salary.employeeId))) {
            errors.push({
              salary,
              error: 'employeeId must be a number'
            });
            continue;
          }

          if (isNaN(Number(salary.year))) {
            errors.push({
              salary,
              error: 'year must be a number'
            });
            continue;
          }

          if (isNaN(Number(salary.basicSalary))) {
            errors.push({
              salary,
              error: 'basicSalary must be a number'
            });
            continue;
          }

          // Validate employee exists
          const employeeId = Number(salary.employeeId);
          if (!existingEmployeeIds.has(employeeId)) {
            errors.push({
              salary,
              error: `Employee with ID ${employeeId} does not exist`
            });
            continue;
          }

          // Create the salary record
          const createdSalary = await storage.createSalary({
            employeeId: employeeId,
            month: salary.month,
            year: Number(salary.year),
            basicSalary: salary.basicSalary.toString(),
            bonus: salary.bonus?.toString() || "0",
            taxDeduction: salary.taxDeduction?.toString() || "0",
            loanDeduction: salary.loanDeduction?.toString() || "0",
            arrears: salary.arrears?.toString() || "0",
            travelAllowance: salary.travelAllowance?.toString() || "0",
            netSalary: salary.netSalary?.toString() || salary.basicSalary.toString(),
            status: salary.status || 'Pending',
            paymentDate: salary.paymentDate || null
          });

          results.push(createdSalary);
        } catch (error) {
          errors.push({
            salary,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return res.status(200).json({
        success: true,
        created: results.length,
        failed: errors.length,
        results,
        errors
      });
    } catch (error) {
      console.error('Error in bulk salary upload:', error);
      return res.status(500).json({
        error: 'Failed to process salary uploads',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get(`${apiBase}/salaries/employee/:employeeId`, async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const salaries = await storage.getSalariesByEmployee(employeeId);
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries for employee" });
    }
  });

  app.get(`${apiBase}/salaries/month/:month/:year`, async (req, res) => {
    try {
      const month = req.params.month;
      const year = parseInt(req.params.year);
      const salaries = await storage.getSalariesByMonth(month, year);
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salaries for the specified month/year" });
    }
  });

  app.get(`${apiBase}/salaries/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const salary = await storage.getSalary(id);
      
      if (!salary) {
        return res.status(404).json({ error: "Salary record not found" });
      }
      
      res.json(salary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary details" });
    }
  });

  app.post(`${apiBase}/salaries`, async (req, res) => {
    try {
      const validatedData = insertSalarySchema.parse(req.body);
      
      // Calculate net salary if not provided
      if (!validatedData.netSalary) {
        const netSalary = storage.calculateNetSalary(validatedData);
        validatedData.netSalary = netSalary;
      }
      
      const salary = await storage.createSalary(validatedData);
      res.status(201).json(salary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create salary record" });
    }
  });

  app.put(`${apiBase}/salaries/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSalarySchema.partial().parse(req.body);
      const updatedSalary = await storage.updateSalary(id, validatedData);
      
      if (!updatedSalary) {
        return res.status(404).json({ error: "Salary record not found" });
      }
      
      res.json(updatedSalary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update salary record" });
    }
  });

  app.delete(`${apiBase}/salaries/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSalary(id);
      
      if (!success) {
        return res.status(404).json({ error: "Salary record not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete salary record" });
    }
  });

  app.post(`${apiBase}/salaries/bulk-delete`, async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Invalid request. Expected a non-empty array of salary IDs." });
      }

      const success = await storage.deleteSalaries(ids);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete one or more salary records" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete salary records" });
    }
  });

  // Expenses routes
  app.get(`${apiBase}/expenses`, async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get(`${apiBase}/expenses/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.post(`${apiBase}/expenses`, async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  app.patch(`${apiBase}/expenses/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateExpense(id, validatedData);
      
      if (!updatedExpense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update expense" });
    }
  });

  app.delete(`${apiBase}/expenses/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ error: "Expense not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Company Settings routes
  app.get(`${apiBase}/company-settings`, async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      if (!settings) {
        return res.status(404).json({ error: "Company settings not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(`${apiBase}/company-settings`, async (req, res) => {
    try {
      const settings = await storage.createCompanySettings(req.body);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating company settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put(`${apiBase}/company-settings/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const settings = await storage.updateCompanySettings(id, req.body);
      if (!settings) {
        return res.status(404).json({ error: "Company settings not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete(`${apiBase}/company-settings/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCompanySettings(id);
      if (!success) {
        return res.status(404).json({ error: "Company settings not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
