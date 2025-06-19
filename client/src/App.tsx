import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Projects from "@/pages/projects";
import Billing from "@/pages/billing";
import Bonuses from "@/pages/bonuses";
import Salaries from "@/pages/salaries";
import Expenses from "@/pages/expenses";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import MobileSidebar from "@/components/layout/mobile-sidebar";
import { useState, createContext, useContext, useEffect } from "react";

// Auth Context
const AuthContext = createContext<{
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  user: null,
  isLoading: false,
  login: async () => {},
  logout: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const checkAuthState = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          
          // If we have user data and a token, set the user without validating
          // This prevents logout on refresh
          if (userData.token) {
            setUser(userData);
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('user');
      }
      
      setIsLoading(false);
    };
    
    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Always use full URL for login to avoid CORS issues
      const response = await fetch('https://inovaqofinance-be-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        // Add mode to handle CORS
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      console.log('Login response:', data); // Debug log
      
      // Handle different possible API response structures
      const userData = {
        id: data.user?.id || data.id || Date.now(),
        email: data.user?.email || data.email || email,
        name: data.user?.name || data.name || data.user?.firstName + ' ' + data.user?.lastName || "User",
        role: data.user?.role || data.role || "user",
        token: data.token || data.access_token || data.accessToken,
        firstName: data.user?.firstName || data.firstName,
        lastName: data.user?.lastName || data.lastName,
        ...data.user
      };

      // Validate that we got a token
      if (!userData.token) {
        throw new Error('No authentication token received');
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User stored:', userData); // Debug log
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages for CORS
      if (error instanceof Error && (error.message.includes('CORS') || error.name === 'TypeError')) {
        throw new Error('Network error. Please check your internet connection or try again later.');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.token) {
        await fetch('https://inovaqofinance-be-production.up.railway.app/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Ignore logout API errors, still clear local state
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth() as { user: any, isLoading: boolean };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Component />;
}

// Protected Layout Component
function ProtectedLayout({ children, isMobileSidebarOpen, setIsMobileSidebarOpen }: { children: React.ReactNode, isMobileSidebarOpen: boolean, setIsMobileSidebarOpen: (isOpen: boolean) => void }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-100 bg-white">
            <div className="flex items-center">
              <button 
                type="button" 
                className="text-neutral-500 focus:outline-none"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <div className="ml-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/>
                  <line x1="2" y1="20" x2="2" y2="20"/>
                </svg>
                <span className="text-lg font-semibold text-primary ml-2">FinTrack</span>
              </div>
            </div>
            <div>
              <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function Router() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is not logged in, show login page
  if (!user) {
    return <Login />;
  }

  // If user is logged in, show protected routes with layout
  return (
    <ProtectedLayout isMobileSidebarOpen={isMobileSidebarOpen} setIsMobileSidebarOpen={setIsMobileSidebarOpen}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/employees" component={Employees} />
        <Route path="/projects" component={Projects} />
        <Route path="/billing" component={Billing} />
        <Route path="/bonuses" component={Bonuses} />
        <Route path="/salaries" component={Salaries} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </ProtectedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;