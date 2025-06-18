-- Add foreign key constraints
ALTER TABLE employees 
  ADD CONSTRAINT employees_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE projects 
  ADD CONSTRAINT projects_manager_id_fkey 
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE billings 
  ADD CONSTRAINT billings_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE bonuses 
  ADD CONSTRAINT bonuses_project_id_fkey 
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE bonuses 
  ADD CONSTRAINT bonuses_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

ALTER TABLE profit_distributions 
  ADD CONSTRAINT profit_distributions_partner_id_fkey 
  FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;

ALTER TABLE salaries 
  ADD CONSTRAINT salaries_employee_id_fkey 
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;