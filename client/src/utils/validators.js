export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Minimum 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRequired = (value, fieldName) => {
  if (!value || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateFileType = (file, allowedTypes) => {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
  }
  return null;
};

export const validateFileSize = (file, maxSizeInMB) => {
  const maxSize = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `File too large. Maximum size is ${maxSizeInMB}MB`;
  }
  return null;
};
