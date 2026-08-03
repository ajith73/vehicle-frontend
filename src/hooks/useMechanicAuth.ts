import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import type { Mechanic } from '../types';
import { isStrongPassword, isValidEmail } from '../utils/validationUtils';

export const useMechanicAuth = (selectedMechanic: Mechanic | null) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otpState, setOtpState] = useState<'idle' | 'sent' | 'verified' | 'login'>('idle');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !isValidEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await apiClient<{exists: boolean}>('/public/check-email', {
        method: 'POST',
        data: { email, mechanicId: selectedMechanic?.id }
      });
      if (res.exists) {
        setOtpState('login');
        toast.success('Account found! Please enter your password to continue.');
      } else {
        setOtpState('sent');
        setOtp(['', '', '', '', '', '']);
        await apiClient('/public/send-otp', {
          method: 'POST',
          data: { email, mechanicId: selectedMechanic?.id }
        });
        setTimer(60); 
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
        toast.error('Password must be at least 6 characters and contain an uppercase letter, lowercase letter, number, and special character.');
        return;
      }
    }
    
    setIsContinuing(true);
    try {
      if (otpState === 'login') {
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
        await apiClient('/public/setup-account', {
          method: 'POST',
          data: { email, password }
        });
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
      
      if (otpState === 'login') {
        navigate(`/mechanic-dashboard/${selectedMechanic?.id}`, { 
          state: { 
            accountEmail: email, 
            accountPassword: password 
          } 
        });
      } else {
        navigate(`/verify-flow/${selectedMechanic?.id}`, { 
          state: { 
            accountEmail: email, 
            accountPassword: password,
            initialStep: 1
          } 
        });
      }
    } catch (err: any) {
      toast.error(err.message || (otpState === 'login' ? 'Invalid password.' : 'Failed to setup account.'));
    } finally {
      setIsContinuing(false);
    }
  };

  return {
    email,
    setEmail,
    otpState,
    setOtpState,
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
  };
};
