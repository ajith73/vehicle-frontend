import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShieldCheck, Mail, CheckCircle, Lock, Eye, EyeOff, X } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import type { Mechanic } from '../types';
import toast from 'react-hot-toast';

const OtpInput = ({ prefix, value, onChange, disabled }: { prefix: string, value: string[], onChange: (val: string[]) => void, disabled: boolean }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const v = e.target.value;
    if (/[^0-9]/.test(v)) return;
    const newOtp = [...value];
    newOtp[index] = v.substring(v.length - 1);
    onChange(newOtp);
    if (v && index < 5) {
      document.getElementById(`${prefix}-otp-${index + 1}`)?.focus();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      document.getElementById(`${prefix}-otp-${index - 1}`)?.focus();
    }
  };
  return (
    <div className="flex gap-2">
      {value.map((v, i) => (
        <input 
          key={i} id={`${prefix}-otp-${i}`} type="text" maxLength={1} value={v} 
          onChange={e => handleChange(e, i)} onKeyDown={e => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  )
}

const isStrongPassword = (pass: string) => {
  if (pass.length < 6) return false;
  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
  return hasLetter && hasNumber && hasSpecial;
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function VerifyStartPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Mechanic[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Claim Flow States
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [email, setEmail] = useState('');
  const [otpState, setOtpState] = useState<'idle' | 'sent' | 'verified' | 'login'>('idle');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  // Direct Login States
  const [showDirectLogin, setShowDirectLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const params = new URLSearchParams({ search: query.trim() });
        const results = await apiClient<Mechanic[]>(`/public/mechanics?${params.toString()}`);
        setSuggestions(results.slice(0, 6));
      } catch (loadError) {
        console.error('Failed to load mechanic suggestions', loadError);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSelectMechanic = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setQuery('');
    setSuggestions([]);
    
    // Auto-fill email if available
    if (mechanic.emails && mechanic.emails.length > 0) {
      setEmail(mechanic.emails[0]);
    } else {
      setEmail('');
    }
  };

  const handleSendOtp = async () => {
    if (!email || !isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await apiClient<{exists: boolean}>('/public/check-email', {
        method: 'POST',
        data: { email }
      });
      if (res.exists) {
        setOtpState('login');
        toast.success('Account found! Please enter your password to continue.');
      } else {
        setOtpState('sent');
        setOtp(['', '', '', '', '', '']);
        await apiClient('/public/send-otp', {
          method: 'POST',
          data: { email }
        });
        setTimer(300); // 5 minutes
        toast.success(`OTP sent to ${email}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to check email or send OTP.');
      setOtpState('idle');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit OTP.');
      return;
    }
    try {
      await apiClient('/public/verify-otp', {
        method: 'POST',
        data: { email, code }
      });
      setOtpState('verified');
      toast.success('Email verified successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired OTP. Please try again.');
    }
  };

  const handleContinue = async () => {
    if (otpState === 'verified') {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match.');
        return;
      }
      if (!isStrongPassword(password)) {
        toast.error('Password must be at least 6 characters and contain a letter, number, and special character.');
        return;
      }
    }
    
    setIsContinuing(true);
    try {
      if (otpState === 'login') {
        // Authenticate existing user
        const res = await apiClient<any>('/auth/login', {
          method: 'POST',
          data: { email, password }
        });
        localStorage.setItem('token', res.token);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('role', res.role);
        localStorage.setItem('adminEmail', res.email || email);
        localStorage.setItem('adminName', res.email || email);
      } else {
        // Setup new account
        await apiClient('/public/setup-account', {
          method: 'POST',
          data: { email, password }
        });
        // Log in immediately
        const res = await apiClient<any>('/auth/login', {
          method: 'POST',
          data: { email, password }
        });
        localStorage.setItem('token', res.token);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('role', res.role);
        localStorage.setItem('adminEmail', res.email || email);
        localStorage.setItem('adminName', res.email || email);
      }
      
      // Proceed to Mechanic Dashboard
      navigate(`/mechanic-dashboard/${selectedMechanic?.id}`, { 
        state: { 
          accountEmail: email, 
          accountPassword: password 
        } 
      });
    } catch (err: any) {
      toast.error(err.message || (otpState === 'login' ? 'Invalid password.' : 'Failed to setup account.'));
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
        
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm mb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3">Verify Your Business</h1>
            {!selectedMechanic ? (
              <p className="text-muted-foreground max-w-lg mx-auto">
                Get the Verified Shield to build trust with customers. Search for your existing business below to start the verification process.
              </p>
            ) : (
              <p className="text-muted-foreground max-w-lg mx-auto">
                Claim your business profile by verifying your email and setting up a secure password.
              </p>
            )}
          </div>

          {!selectedMechanic && !showDirectLogin ? (
            <div className="relative max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by business name or phone number..." 
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background shadow-inner focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-base sm:text-lg"
                  />
                </div>
                <div className="text-muted-foreground font-medium text-sm">or</div>
                <button 
                  onClick={() => setShowDirectLogin(true)}
                  className="w-full sm:w-auto px-6 py-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors whitespace-nowrap"
                >
                  Login
                </button>
              </div>

              {query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
                  {loadingSuggestions ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">Searching records...</div>
                  ) : suggestions.length > 0 ? (
                    <ul className="max-h-[300px] overflow-y-auto">
                      {suggestions.map((mechanic) => (
                        <li key={mechanic.id} className="border-b border-border last:border-0">
                          <button 
                            onClick={() => handleSelectMechanic(mechanic)}
                            className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex flex-col gap-1"
                          >
                            <span className="font-bold text-foreground">{mechanic.businessName || mechanic.name}</span>
                            <span className="text-xs text-muted-foreground">{mechanic.address}, {mechanic.city}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground text-sm mb-4">No matching records found.</p>
                      <button 
                        onClick={() => navigate('/submit')}
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Create New Record
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : showDirectLogin ? (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black">Login to your account</h2>
                  <button 
                    onClick={() => setShowDirectLogin(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Mail size={16}/> Email Address</label>
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
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Lock size={16}/> Password</label>
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
                    onClick={async () => {
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
                        
                        // If logging in from the verification screen, prioritize sending mechanics to the verify flow
                        if (response.role === 'Mechanic') {
                          if (response.mechanicId) {
                            navigate(`/mechanic-dashboard/${response.mechanicId}`, { 
                              state: { accountEmail: loginEmail, accountPassword: loginPassword } 
                            });
                          } else {
                            setShowDirectLogin(false);
                            toast.success('Logged in! Please search for your business to continue.');
                          }
                        } else if (response.role === 'Super Admin') {
                          window.location.href = '/admin/dashboard';
                        }
                      } catch (err: any) {
                        toast.error(err.message || 'Invalid credentials');
                      } finally {
                        setIsLoggingIn(false);
                      }
                    }}
                    disabled={!loginEmail || !isValidEmail(loginEmail) || !loginPassword || isLoggingIn}
                    className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {/* Selected Mechanic Card */}
              <div className="p-4 rounded-xl border border-border bg-muted/50 flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Selected Business</p>
                  <h3 className="font-bold text-lg">{selectedMechanic?.businessName || selectedMechanic?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedMechanic?.address}</p>
                </div>
                <button 
                  onClick={() => setSelectedMechanic(null)}
                  className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Email Verification */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Mail size={16}/> Email Address</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={otpState !== 'idle'}
                      placeholder="Enter your email to verify..."
                      className={`flex-1 p-3 rounded-xl border bg-background outline-none transition-all disabled:bg-muted disabled:text-muted-foreground ${
                        email && !isValidEmail(email) ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/50' : 'border-border focus:border-primary'
                      }`} 
                    />
                    {otpState === 'idle' && (
                      <button 
                        onClick={handleSendOtp}
                        disabled={!email || !isValidEmail(email) || isSendingOtp}
                        className="px-6 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap min-w-[100px] flex items-center justify-center"
                      >
                        {isSendingOtp ? 'Checking...' : 'Verify'}
                      </button>
                    )}
                    {(otpState === 'verified' || otpState === 'login') && (
                      <div className="px-6 flex items-center justify-center bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold rounded-xl whitespace-nowrap">
                        <CheckCircle size={20} className="mr-2" /> Verified
                      </div>
                    )}
                  </div>
                  {email && !isValidEmail(email) && (
                    <p className="text-red-500 text-sm">Please enter a valid email address.</p>
                  )}
                </div>
                
                {otpState === 'sent' && (
                  <div className="mt-4 p-5 border border-border rounded-xl bg-card shadow-sm animate-in fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium">Enter 6-digit OTP sent to {email}</label>
                      <span className={`text-sm font-bold ${timer > 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Expired'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <OtpInput prefix="claim" value={otp} onChange={setOtp} disabled={timer === 0} />
                      {timer === 0 ? (
                        <button 
                          onClick={handleSendOtp}
                          className="px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors whitespace-nowrap"
                        >
                          Resend OTP
                        </button>
                      ) : (
                        <button 
                          onClick={handleVerifyOtp}
                          className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors whitespace-nowrap"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Password Section */}
              {(otpState === 'verified' || otpState === 'login') && (
                <div className="space-y-4 pt-4 border-t border-border animate-in fade-in">
                  <div>
                    <h3 className="font-bold flex items-center gap-2 mb-4">
                      <Lock size={18} /> {otpState === 'login' ? 'Login to Continue' : 'Set Account Password'}
                    </h3>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={otpState === 'login' ? "Enter your password" : "Enter your password"}
                        className={`w-full p-3 pr-10 rounded-xl border bg-background outline-none focus:ring-1 transition-all ${(otpState !== 'login' && password.length > 0 && !isStrongPassword(password)) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : (otpState !== 'login' && isStrongPassword(password)) ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 'border-border focus:border-primary focus:ring-primary'}`} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                    {otpState !== 'login' && password.length > 0 && !isStrongPassword(password) && (
                      <p className="text-red-500 text-xs mt-1 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><X size={12}/> Needs a letter, number & special character (min 6 chars)</span>
                      </p>
                    )}
                    {otpState !== 'login' && isStrongPassword(password) && (
                      <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle size={12}/> Strong password</p>
                    )}
                  </div>
                  {otpState !== 'login' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm Password</label>
                      <div className="relative">
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className={`w-full p-3 pr-10 rounded-xl border bg-background outline-none focus:ring-1 transition-all ${confirmPassword.length > 0 && confirmPassword !== password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : confirmPassword.length > 0 && confirmPassword === password ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : 'border-border focus:border-primary focus:ring-primary'}`} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && confirmPassword !== password && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><X size={12}/> Passwords do not match</p>
                      )}
                      {confirmPassword.length > 0 && confirmPassword === password && (
                        <p className="text-green-600 dark:text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircle size={12}/> Passwords match</p>
                      )}
                    </div>
                  )}
                  
                  <button 
                    onClick={handleContinue}
                    disabled={otpState === 'login' ? !password || isContinuing : (!password || !confirmPassword || password !== confirmPassword || !isStrongPassword(password) || isContinuing)}
                    className="w-full py-4 mt-4 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isContinuing ? 'Loading...' : 'Continue to Verification Form'}
                  </button>
                </div>
              )}
              
              {/* Google Login Option */}
              {/* <div className="mt-8 animate-in fade-in">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => toast.success('Google login will be integrated soon!')}
                  className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 border border-border bg-background rounded-xl hover:bg-secondary/50 transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Sign in with Google
                </button>
              </div> */}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
