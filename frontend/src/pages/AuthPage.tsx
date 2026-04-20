import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Mail, Lock, User } from 'lucide-react';
import { apiRequest, ApiError } from '../api';
import type { JwtResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

interface AuthPageProps {
  setToken: (token: string) => void;
  setEmail: (email: string) => void;
}

export function AuthPage({ setToken, setEmail }: AuthPageProps) {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await apiRequest<JwtResponse>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      setToken(res.data.token);
      setEmail(res.data.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await apiRequest('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });
      setIsLoginMode(true);
      // Optional: show success toast
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Panel: Branding (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary to-indigo-700 p-12 text-white lg:flex">
        <div className="z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight">ModernBank</span>
        </div>

        <div className="z-10">
          <h2 className="text-5xl font-black leading-tight tracking-tight">
            Secure, fast, and <br />
            reliable banking.
          </h2>
          <p className="mt-6 max-w-md text-lg font-medium opacity-80 decoration-blue-200">
            Join over 2 million customers worldwide who trust ModernBank for their daily financial needs.
          </p>
        </div>

        <div className="z-10 flex items-center gap-6">
          <div className="flex -space-x-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-slate-200 ring-2 ring-indigo-500" />
             ))}
          </div>
          <p className="text-sm font-bold opacity-80 italic">Over 10k users joined this week</p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Right Panel: Auth Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12 lg:bg-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {isLoginMode ? 'Welcome back' : 'Get started'}
            </h1>
            <p className="mt-2 text-slate-500 font-medium">
              {isLoginMode 
                ? 'Don\'t have an account? ' 
                : 'Already have an account? '}
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="font-bold text-primary hover:underline"
              >
                {isLoginMode ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>

          <Card className="border-none bg-transparent p-0 shadow-none lg:bg-white lg:p-8 lg:shadow-xl lg:shadow-slate-200/50 lg:rounded-2xl lg:border lg:border-slate-100">
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-danger border border-red-100 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                {error}
              </div>
            )}

            {isLoginMode ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
                <div className="space-y-1">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="h-4 w-4" />}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">
                      Forgot password?
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Sign in
                </Button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="mx-4 flex-shrink text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">OR</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>
                
                <Button variant="outline" className="w-full" type="button">
                   Continue with SSO
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="John"
                    icon={<User className="h-4 w-4" />}
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    icon={<User className="h-4 w-4" />}
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="h-4 w-4" />}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full" variant="primary" isLoading={isLoading}>
                  Create My Account
                </Button>
              </form>
            )}
          </Card>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            &copy; 2024 ModernBank Inc. <br className="lg:hidden" /> All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
