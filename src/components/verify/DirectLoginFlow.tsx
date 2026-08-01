import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient } from '../../api/apiClient';
import { isValidEmail } from '../../utils/validationUtils';

interface DirectLoginFlowProps {
  onClose: () => void;
}

const DirectLoginFlow: React.FC<DirectLoginFlowProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!isValidEmail(loginEmail) || !loginPassword) {
      toast.error('Please fill in all fields correctly');
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const response = await apiClient<any>('/auth/login', {
        method: 'POST',
        data: { email: loginEmail, password: loginPassword }
      });
      
      localStorage.setItem('token', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      localStorage.setItem('role', response.role);
      localStorage.setItem('adminEmail', response.email || loginEmail);
      localStorage.setItem('adminName', response.email || loginEmail);
      
      toast.success('Logged in successfully');
      
      if (response.role === 'Mechanic') {
        if (response.mechanicId) {
          navigate(`/mechanic-dashboard/${response.mechanicId}`, { 
            state: { accountEmail: loginEmail, accountPassword: loginPassword } 
          });
        } else {
          toast.success('Logged in! Please submit your business details.');
          navigate('/submit');
        }
      } else if (response.role === 'Super Admin') {
        window.location.href = '/admin/dashboard';
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">Login to your account</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              <Mail size={16}/> Email Address
            </label>
            <input 
              type="email" 
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full p-3 rounded-xl border bg-background outline-none transition-all ${
                loginEmail && !isValidEmail(loginEmail) ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-border focus:border-primary focus:ring-primary'
              }`} 
            />
            {loginEmail && !isValidEmail(loginEmail) && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              <Lock size={16}/> Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 pr-10 rounded-xl border border-border bg-background outline-none transition-all focus:border-primary focus:ring-primary"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            disabled={!loginEmail || !isValidEmail(loginEmail) || !loginPassword || isLoggingIn}
            className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectLoginFlow;
