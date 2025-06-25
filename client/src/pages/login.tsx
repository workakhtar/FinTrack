import { useState } from "react";
import { useAuth } from "@/App";    
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye, EyeOff, Mail, Lock, Shield, Users, ChevronRight,
  Building2, DollarSign, BarChart3, PieChart, TrendingUp, FileText, CreditCard,
  Briefcase
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, label: "Revenue Analytics", color: "text-blue-600" },
    { icon: PieChart, label: "Expense Tracking", color: "text-cyan-600" },
    { icon: TrendingUp, label: "Growth Insights", color: "text-indigo-600" },
    { icon: FileText, label: "Reports", color: "text-sky-600" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-blue-500/30 to-indigo-600/20 animate-pulse"></div>
      
      {/* Flowing Blue Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-400/25 to-blue-600/25 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-gradient-to-tr from-sky-400/30 to-blue-500/30 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-300/10 via-cyan-400/15 to-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s', animationDuration: '8s'}}></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-blue-300/40 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-cyan-400/30 transform rotate-45 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 left-16 w-5 h-5 bg-indigo-300/35 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
        <div className="absolute bottom-40 right-20 w-3 h-3 bg-sky-400/40 transform rotate-45 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '2.5s'}}></div>
      </div>

      {/* Floating Financial Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {[DollarSign, TrendingUp, BarChart3, PieChart, CreditCard].map((Icon, i) => (
          <Icon
            key={i}
            className="absolute w-8 h-8 text-blue-200/20 animate-pulse"
            style={{
              left: `${10 + i * 18}%`,
              top: `${15 + i * 15}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 p-3 rounded-xl shadow-2xl border border-blue-300/30">
                  <span className="text-white font-bold text-2xl drop-shadow-lg">IQ</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Inovaqo Finance</h1>
                <p className="text-blue-100 text-sm mt-1">Professional Financial Management</p>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-6 mb-8">
              <h2 className="text-xl font-semibold text-white drop-shadow-md">
                Manage Financial Operations
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-blue-300/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <feature.icon className={`h-5 w-5 text-white drop-shadow-sm`} />
                    <span className="text-sm font-medium text-blue-50">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Visual Elements */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-lg border border-blue-300/30">
              <p className="text-blue-100 text-sm leading-relaxed">
                "Transform your financial operations with our comprehensive analytics platform. 
                Real-time insights, secure data management, and intuitive reporting tools."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center lg:hidden">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 p-3 rounded-xl shadow-2xl border border-blue-300/30">
                    <span className="text-white font-bold text-2xl drop-shadow-lg">IQ</span>
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Inovaqo Finance</h2>
              <p className="text-blue-100 text-sm">Professional Financial Management</p>
            </div>

            <Card className="shadow-2xl border border-blue-200/30 bg-white/95 backdrop-blur-lg relative overflow-hidden">
              {/* Card Background Enhancement */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30"></div>
              
              <CardHeader className="text-center pb-4 relative z-10">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center space-x-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <span>Welcome Back</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 border border-red-300 bg-red-50/90 backdrop-blur-sm">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Email address</span>
                    </Label>
                    <div className="relative group">
                      <Mail
                        className={`absolute left-3 top-3 h-5 w-5 transition-all duration-200 ${
                          focusedField === 'email' ? 'text-blue-600 scale-110' : 'text-gray-400'
                        }`}
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className={`pl-11 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          focusedField === 'email'
                            ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg bg-blue-50/50'
                            : 'hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span>Password</span>
                    </Label>
                    <div className="relative group">
                      <Shield
                        className={`absolute left-3 top-3 h-5 w-5 transition-all duration-200 ${
                          focusedField === 'password' ? 'text-blue-600 scale-110' : 'text-gray-400'
                        }`}
                      />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        className={`pl-11 pr-11 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          focusedField === 'password'
                            ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg bg-blue-50/50'
                            : 'hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-blue-600 transition"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Team Access</span>
                    </div>
                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition">
                      Forgot your password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-800 text-white font-semibold py-3 shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Sign in</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-blue-100 flex items-center justify-center space-x-2 drop-shadow-sm">
              <Shield className="h-4 w-4 text-cyan-300" />
              <span>Secure Access • Encrypted Data • SSL Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}