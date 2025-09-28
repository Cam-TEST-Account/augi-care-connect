export interface PasswordValidation {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const validatePassword = (password: string): PasswordValidation => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (metRequirements >= 5 && password.length >= 12) {
    strength = 'strong';
  } else if (metRequirements >= 4 && password.length >= 8) {
    strength = 'medium';
  }

  const isValid = Object.values(requirements).every(Boolean);

  return {
    isValid,
    strength,
    requirements,
  };
};

export const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak':
      return 'text-destructive';
    case 'medium':
      return 'text-yellow-600';
    case 'strong':
      return 'text-green-600';
    default:
      return 'text-muted-foreground';
  }
};

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.length > 2 
    ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
    : '*'.repeat(localPart.length);
  return `${maskedLocal}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 10) {
    return `(${cleaned.substring(0, 3)}) ***-${cleaned.substring(6)}`;
  }
  return phone;
};