import { z } from 'zod';

export const insertEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  status: z.string().default('Active'),
  projectId: z.number().nullable().optional(),
  salary: z.string().min(1, 'Salary is required'),
  role: z.string().optional(),
  avatar: z.string().optional(),
}); 