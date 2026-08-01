import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Lock, Eye, EyeOff, X } from 'lucide-react';
import type { Mechanic } from '../../types';
import OtpInput from '../ui/OtpInput';
import { isStrongPassword, isValidEmail } from '../../utils/validationUtils';
import { useMechanicAuth } from '../../hooks/useMechanicAuth';

interface ClaimMechanicFlowProps {
  selectedMechanic: Mechanic | null;
  setSelectedMechanic: (mechanic: Mechanic | null) => void;
}

const ClaimMechanicFlow: React.FC<ClaimMechanicFlowProps> = ({
  selectedMechanic,
  setSelectedMechanic,
}) => {
  const {
    email,
    setEmail,
    otpState,
    otp,
    setOtp,
    timer,
    setTimer,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSendingOtp,
    isContinuing,
    handleSendOtp,
    handleVerifyOtp,
    handleContinue
  } = useMechanicAuth(selectedMechanic);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let interval: any;
    if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, setTimer]);

  useEffect(() => {
    if (selectedMechanic?.emails && selectedMechanic.emails.length > 0) {
      setEmail(selectedMechanic.emails[0]);
    }
  }, [selectedMechanic, setEmail]);

  if (!selectedMechanic) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Selected Mechanic Card */}
      <div className="p-4 rounded-xl border border-border bg-muted/50 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">Selected Business</p>
          <h3 className="font-bold text-lg">{selectedMechanic.businessName || selectedMechanic.name}</h3>
          <p className="text-sm text-muted-foreground">{selectedMechanic.address}</p>
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
              <span className={`text-sm font-bold ${timer > 0 ? 'text-blue-500' : 'text-green-600 dark:text-green-500'}`}>
                {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Resend available'}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <OtpInput prefix="claim" value={otp} onChange={setOtp} disabled={false} />
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button 
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || otpState !== 'sent'}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Confirm
                </button>
                {timer === 0 && (
                  <button 
                    onClick={handleSendOtp}
                    className="flex-1 px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
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
                <span className="flex items-center gap-1"><X size={12}/> Needs an uppercase, lowercase, number & special character (min 6 chars)</span>
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
    </div>
  );
};

export default ClaimMechanicFlow;
