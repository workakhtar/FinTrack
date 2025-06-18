import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return 'Rs. 0.00';
  
  // Extra debugging
  console.log("Formatting currency amount:", amount, "type:", typeof amount);
  
  // Handle edge case where amount is an empty string
  if (amount === '') return 'Rs. 0.00';
  
  // Convert to numeric, handling any edge cases
  let numericAmount = 0;
  try {
    numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    // Check for NaN result after conversion
    if (isNaN(numericAmount)) numericAmount = 0;
  } catch (e) {
    console.error("Error converting amount to number:", e);
    numericAmount = 0;
  }
  
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Active': 'green',
    'On Leave': 'yellow',
    'Inactive': 'gray',
    'In Progress': 'yellow',
    'Planning': 'blue',
    'Completed': 'blue',
    'Paid': 'green',
    'Pending': 'yellow',
    'Overdue': 'red',
    'Approved': 'green',
    'Rejected': 'red'
  };
  
  return statusMap[status] || 'gray';
}

export function calculateGrowthPercentage(current: number, previous: number): number {
  if (previous === 0) return 100;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[monthNumber - 1] || '';
}

export function getCurrentMonthAndYear(): { month: string, year: number } {
  const today = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    month: monthNames[today.getMonth()],
    year: today.getFullYear()
  };
}

export function getPreviousMonths(count: number): { month: string, year: number }[] {
  const result = [];
  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  for (let i = 0; i < count; i++) {
    result.push({
      month: monthNames[currentMonth],
      year: currentYear
    });
    
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
  }
  
  return result;
}

export function generateAvatarFromName(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
}
