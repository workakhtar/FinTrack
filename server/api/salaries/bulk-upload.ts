import { Request, Response } from 'express';
import { storage } from '../../storage';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { salaries } = req.body;

    if (!Array.isArray(salaries)) {
      return res.status(400).json({ error: 'Invalid request body. Expected an array of salaries.' });
    }

    const results = [];
    const errors = [];

    for (const salary of salaries) {
      try {
        // Validate required fields
        if (!salary.employeeId || !salary.month || !salary.year || !salary.basicSalary) {
          errors.push({
            salary,
            error: 'Missing required fields'
          });
          continue;
        }

        // Create the salary record
        const createdSalary = await storage.createSalary({
          employeeId: Number(salary.employeeId),
          month: salary.month,
          year: Number(salary.year),
          basicSalary: salary.basicSalary.toString(),
          bonus: salary.bonus?.toString() || null,
          taxDeduction: salary.taxDeduction?.toString() || null,
          loanDeduction: salary.loanDeduction?.toString() || null,
          arrears: salary.arrears?.toString() || null,
          travelAllowance: salary.travelAllowance?.toString() || null,
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
} 