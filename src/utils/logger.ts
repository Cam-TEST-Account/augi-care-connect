// Production-safe logging utility
const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error, ...args);
    } else {
      // In production, only log critical errors without sensitive data
      console.error(`[ERROR] ${message}`);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};

// Security-focused logging - never logs sensitive data
export const securityLogger = {
  authAttempt: (email: string) => {
    if (isDevelopment) {
      console.log(`[SECURITY] Authentication attempt for: ${email}`);
    }
  },
  
  authSuccess: () => {
    if (isDevelopment) {
      console.log('[SECURITY] Authentication successful');
    }
  },
  
  authFailure: (reason?: string) => {
    if (isDevelopment) {
      console.warn(`[SECURITY] Authentication failed: ${reason || 'Unknown reason'}`);
    }
  },
  
  accessDenied: (resource: string) => {
    console.warn(`[SECURITY] Access denied to resource: ${resource}`);
  },
  
  dataAccess: (table: string, operation: string) => {
    if (isDevelopment) {
      console.log(`[SECURITY] Data access: ${operation} on ${table}`);
    }
  }
};