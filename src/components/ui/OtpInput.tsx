import React from 'react';

interface OtpInputProps {
  prefix: string;
  value: string[];
  onChange: (val: string[]) => void;
  disabled: boolean;
}

const OtpInput = ({ prefix, value, onChange, disabled }: OtpInputProps) => {
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
          key={i} 
          id={`${prefix}-otp-${i}`} 
          type="text" 
          maxLength={1} 
          value={v} 
          onChange={e => handleChange(e, i)} 
          onKeyDown={e => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default OtpInput;
