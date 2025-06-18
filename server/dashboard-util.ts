import { Billing, Employee, Expense, Partner, ProfitDistribution, Project } from "@shared/schema";

/**
 * Helper function to calculate total revenue from billing entries
 * with detailed logging for easier debugging
 */
export function calculateTotalRevenue(billings: Billing[]): number {
  let totalRevenue = 0;
  
  if (!billings || !Array.isArray(billings)) {
    console.error("Invalid billings data:", billings);
    return 0; // Return 0 if no billings are found
  }
  
  console.log(`Processing ${billings.length} billing entries for revenue calculation`);
  
  // Calculate the total revenue from all billing entries
  // Since the billings should already be filtered by month/year in the storage layer,
  // we just need to sum up the amounts from all provided billings
  
  // If we reach here, try the regular calculation
  try {
    // Sum up amounts from all billings
    billings.forEach((billing, index) => {
      if (billing && billing.amount) {
        // Convert amount to number if it's a string
        const amount = typeof billing.amount === 'string' 
          ? parseFloat(billing.amount)
          : (typeof billing.amount === 'number' ? billing.amount : 0);
        
        if (!isNaN(amount)) {
          totalRevenue += amount;
          console.log(`Added ${amount} from billing #${index+1}`);
        }
      }
    });
    
    console.log(`Calculated total revenue: ${totalRevenue}`);
    
    // Return the calculated total revenue
    return totalRevenue;
  } catch (error) {
    console.error("Error calculating revenue:", error);
    return 0; // Return 0 on error
  }
}

/**
 * Helper function to calculate total expenses with error handling
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
  let totalExpenses = 0;
  
  if (!expenses || !Array.isArray(expenses)) {
    console.error("Invalid expenses data:", expenses);
    return 0;
  }
  
  console.log(`Processing ${expenses.length} expense entries`);
  
  expenses.forEach((expense, index) => {
    try {
      const amountValue = typeof expense.amount === 'string' 
        ? parseFloat(expense.amount) 
        : typeof expense.amount === 'number'
          ? expense.amount 
          : 0;
      
      if (!isNaN(amountValue)) {
        totalExpenses += amountValue;
        console.log(`Added expense #${index+1} amount ${amountValue}, running total: ${totalExpenses}`);
      } else {
        console.warn(`Skipping expense with invalid amount "${expense.amount}"`);
      }
    } catch (error) {
      console.error(`Error processing expense #${index+1}:`, error);
    }
  });
  
  console.log(`⭐ FINAL CALCULATED EXPENSES: ${totalExpenses}`);
  return totalExpenses;
}

/**
 * Helper function to prepare dashboard data
 * Returns a comprehensive dashboard with metrics, charts and insights
 */
export function prepareDashboardData(
  employees: Employee[], 
  projects: Project[], 
  billings: Billing[],
  expenses: Expense[],
  partners: Partner[],
  profitDistributions: ProfitDistribution[],
  bonuses: any[]
) {
  console.log("Preparing dashboard data with inputs:", {
    employeesCount: employees?.length || 0,
    projectsCount: projects?.length || 0,
    billingsCount: billings?.length || 0,
    expensesCount: expenses?.length || 0,
    bonusesCount: bonuses?.length || 0
  });
  
  // Calculate key metrics with proper error handling
  const totalRevenue = calculateTotalRevenue(billings);
  const totalExpenses = calculateTotalExpenses(expenses);
  const profit = totalRevenue - totalExpenses;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue * 100).toFixed(2) : "0.00";
  
  // Active projects and total employees count
  const activeProjects = Array.isArray(projects) 
    ? projects.filter(p => p.status === "Active" || p.status === "In Progress")
    : [];
  const totalEmployees = Array.isArray(employees) ? employees.length : 0;
  
  // Group expenses by category
  const expensesByCategory = new Map<string, number>();
  if (Array.isArray(expenses)) {
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      const amount = typeof expense.amount === 'string' 
        ? parseFloat(expense.amount) 
        : typeof expense.amount === 'number' 
          ? expense.amount 
          : 0;
      
      if (isNaN(amount)) return;
      
      if (expensesByCategory.has(category)) {
        expensesByCategory.set(category, (expensesByCategory.get(category) || 0) + amount);
      } else {
        expensesByCategory.set(category, amount);
      }
    });
  }
  
  const expenseBreakdown = Array.from(expensesByCategory.entries()).map(([name, value]) => ({ name, value }));
  
  // Recent projects and employees for dashboard widgets
  const recentProjects = Array.isArray(projects) 
    ? projects.filter(p => p.status === "Active").slice(0, 3)
    : [];
  const recentEmployees = Array.isArray(employees) ? employees.slice(0, 3) : [];
  
  // Get current month/year for contextual data
  const currentDate = new Date();
  const currentMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                         'August', 'September', 'October', 'November', 'December'][currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  // Generate revenue chart data by month
  const monthYearSet = new Set<string>();
  if (Array.isArray(billings)) {
    billings.forEach(b => {
      if (b.month && b.year) {
        monthYearSet.add(`${b.month} ${b.year}`);
      }
    });
  }
  
  const revenueChartData = Array.from(monthYearSet).map(monthYear => {
    const [month, yearStr] = monthYear.split(' ');
    const year = parseInt(yearStr);
    
    // Get billings for this month/year
    const monthBillings = Array.isArray(billings)
      ? billings.filter(b => b.month === month && b.year === year)
      : [];
      
    // Get expenses for this month/year
    const monthExpenses = Array.isArray(expenses)
      ? expenses.filter(e => e.month === month && e.year === year)
      : [];
    
    // Calculate total revenue
    const totalRevenue = monthBillings.reduce((sum, billing) => {
      const amount = typeof billing.amount === 'string' 
        ? parseFloat(billing.amount) 
        : typeof billing.amount === 'number'
          ? billing.amount 
          : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Calculate total expenses
    const totalExpenses = monthExpenses.reduce((sum, expense) => {
      const amount = typeof expense.amount === 'string' 
        ? parseFloat(expense.amount) 
        : typeof expense.amount === 'number'
          ? expense.amount 
          : 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Calculate profit
    const profit = totalRevenue - totalExpenses;
    
    return {
      month: month,
      year: year,
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: profit
    };
  });
  // console.log(revenueChartData,"revenue chart data");
  
  // Partner profit distributions
  const partnerDistributions = Array.isArray(partners) 
    ? partners.map(partner => {
        const distribution = Array.isArray(profitDistributions)
          ? profitDistributions.find(pd => 
              pd.partnerId === partner.id && 
              pd.month === currentMonth && 
              pd.year === currentYear)
          : null;

        // Calculate amount based on partner's share of total profit
        const sharePercentage = typeof partner.share === 'string'
          ? parseFloat(partner.share)
          : typeof partner.share === 'number'
            ? partner.share
            : 0;

        const amount = (profit * (sharePercentage / 100)).toFixed(2);
        
        return {
          id: partner.id,
          name: partner.name,
          share: partner.share,
          amount: parseFloat(amount)
        };
      })
    : [];
  
  // Calculate project bonuses using actual bonus data
  const projectBonuses = Array.isArray(projects)
    ? projects.filter(p => p.status === 'Active').slice(0, 3).map(project => {
        const manager = Array.isArray(employees)
          ? employees.find(e => e.id === project.managerId)
          : null;
        
        // Get all bonuses for this project
        const projectBonusData = Array.isArray(bonuses)
          ? bonuses.filter(b => b.projectId === project.id)
          : [];
        
        // Calculate total bonus amount for this project
        const totalBonus = projectBonusData.reduce((sum, bonus) => {
          const amount = typeof bonus.amount === 'string'
            ? parseFloat(bonus.amount)
            : typeof bonus.amount === 'number'
              ? bonus.amount
              : 0;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        // Calculate ROI based on project value and total bonus
        const projectValue = typeof project.value === 'string'
          ? parseFloat(project.value)
          : typeof project.value === 'number'
            ? project.value
            : 0;
        
        const roi = projectValue > 0
          ? Math.round((totalBonus / projectValue) * 100)
          : 0;
        
        return {
          id: project.id,
          name: project.name,
          roi: roi,
          manager: manager ? `${manager.firstName} ${manager.lastName}` : 'Unassigned',
          bonus: totalBonus
        };
      })
    : [];
  
  // Calculate total bonus pool from all bonuses
  const totalBonusPool = Array.isArray(bonuses)
    ? bonuses.reduce((sum, bonus) => {
        const amount = typeof bonus.amount === 'string'
          ? parseFloat(bonus.amount)
          : typeof bonus.amount === 'number'
            ? bonus.amount
            : 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0)
    : 0;
  
  // Log final calculated metrics for debugging
  console.log('⭐ DASHBOARD METRICS:', {
    totalRevenue,
    totalExpenses,
    profit,
    expenseRatio,
    employeeCount: totalEmployees,
    projectCount: Array.isArray(projects) ? projects.length : 0,
    activeProjectCount: activeProjects.length,
    totalBonusPool
  });
  
  // Return the complete dashboard data
  return {
    metrics: {
      totalRevenue,
      totalExpenses,
      profit,
      expenseRatio,
      employeeCount: totalEmployees,
      projectCount: Array.isArray(projects) ? projects.length : 0,
      activeProjectCount: activeProjects.length
    },
    recentProjects,
    revenueChartData,
    expenseBreakdown,
    partnerDistributions,
    projectBonuses,
    recentEmployees,
    totalBonusPool
  };
}

interface RevenueData {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}