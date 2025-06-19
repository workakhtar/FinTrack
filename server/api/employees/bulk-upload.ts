import { Request, Response } from 'express';
import { storage } from '../../storage';
import { insertEmployeeSchema } from '../../schemas/employee';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
} 