import { Link, useLocation } from "wouter";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  FolderOpen,
  CreditCard,
  Gift,
  DollarSign,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useUI } from "@/App";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Bonuses", href: "/bonuses", icon: Gift },
  { name: "Salaries", href: "/salaries", icon: DollarSign },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  // { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useUI();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn("hidden lg:flex lg:flex-shrink-0 transition-all duration-300", isSidebarCollapsed ? "w-20" : "w-64")}>
      <div className="flex flex-col w-full">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-neutral-100">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/>
                <line x1="2" y1="20" x2="2" y2="20"/>
              </svg>
              <span className={cn("text-xl font-semibold text-primary ml-2 transition-opacity", isSidebarCollapsed && "opacity-0 hidden")}>FinTrack</span>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-neutral-500">
              {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                        isActive
                          ? "bg-primary text-white"
                          : "text-neutral-700 hover:bg-neutral-50",
                        isSidebarCollapsed && "justify-center"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0 h-5 w-5",
                          isActive ? "text-white" : "text-neutral-400",
                          !isSidebarCollapsed && "mr-3"
                        )}
                      />
                      <span className={cn(!isSidebarCollapsed ? "opacity-100" : "opacity-0 hidden")}>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile and Logout */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-neutral-100">
            <div className={cn("flex items-center", isSidebarCollapsed && "justify-center")}>
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User profile"
                />
              </div>
              <div className={cn("ml-3 flex-1", isSidebarCollapsed && "hidden")}>
                <p className="text-sm font-medium text-neutral-700">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-neutral-500">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={cn("p-1 text-neutral-400 hover:text-neutral-600", isSidebarCollapsed ? "ml-0" : "ml-2")}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}