// ==========================================
// SECURITY & PROTECTION MODULE
// ==========================================

// Generate CSRF Token
function generateCSRFToken() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Initialize CSRF Token
function initializeCSRFToken() {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
  }
  document.querySelector('meta[name="csrf-token"]').setAttribute('content', token);
  return token;
}

// Get CSRF Token
function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

// ==========================================
// INPUT VALIDATION & SANITIZATION
// ==========================================

const ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]{10,}$/,
  name: /^[a-zA-Z\u0600-\u06FF\s'-]{2,50}$/,
  url: /^(https?:\/\/)?([\da-z\-\.]+)\.([a-z\.]{2,6})([\/\w \-]*)*\/?$/
};

class InputValidator {
  static validateEmail(email) {
    return ValidationRules.email.test(email);
  }

  static validatePhone(phone) {
    return ValidationRules.phone.test(phone);
  }

  static validateName(name) {
    return name.length >= 2 && name.length <= 50 && !/[\d<>{}"`]/g.test(name);
  }

  static validateMessage(message) {
    return message.length >= 10 && message.length <= 5000 && !/[<>{}"`]/g.test(message);
  }

  static sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }
}

// ==========================================
// RATE LIMITING
// ==========================================

class RateLimiter {
  constructor(maxAttempts = 5, timeWindowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.timeWindowMs = timeWindowMs;
    this.attempts = {};
  }

  isAllowed(key) {
    const now = Date.now();
    
    if (!this.attempts[key]) {
      this.attempts[key] = [];
    }

    // Remove old attempts outside the time window
    this.attempts[key] = this.attempts[key].filter(time => now - time < this.timeWindowMs);

    // Check if limit exceeded
    if (this.attempts[key].length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    this.attempts[key].push(now);
    return true;
  }

  getRemainingTime(key) {
    if (!this.attempts[key] || this.attempts[key].length === 0) {
      return 0;
    }
    const oldestAttempt = this.attempts[key][0];
    const remainingTime = this.timeWindowMs - (Date.now() - oldestAttempt);
    return Math.max(0, remainingTime);
  }
}

// Initialize rate limiter for form submissions
const contactFormLimiter = new RateLimiter(3, 60000); // 3 attempts per minute
const quotationFormLimiter = new RateLimiter(5, 300000); // 5 attempts per 5 minutes

// ==========================================
// SECURE STORAGE
// ==========================================

class SecureStorage {
  static set(key, value) {
    try {
      const encryptedValue = btoa(JSON.stringify(value)); // Simple encoding (use proper encryption in production)
      localStorage.setItem(`secure_${key}`, encryptedValue);
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  }

  static get(key) {
    try {
      const encryptedValue = localStorage.getItem(`secure_${key}`);
      if (!encryptedValue) return null;
      return JSON.parse(atob(encryptedValue));
    } catch (e) {
      console.error('Retrieval error:', e);
      return null;
    }
  }

  static remove(key) {
    localStorage.removeItem(`secure_${key}`);
  }

  static clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

class NotificationSystem {
  static show(message, type = 'info', duration = 4000) {
    const toast = document.getElementById('notificationToast');
    if (!toast) return;

    toast.className = `notification-toast notification-${type}`;
    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  }

  static success(message, duration = 4000) {
    this.show(message, 'success', duration);
  }

  static error(message, duration = 5000) {
    this.show(message, 'error', duration);
  }

  static warning(message, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  static info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }
}

// ==========================================
// SECURE API CALLS
// ==========================================

class SecureAPI {
  static async post(endpoint, data) {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  static async get(endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }
}

// ==========================================
// XSS PROTECTION
// ==========================================

class XSSProtection {
  static escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  static removeScripts(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    return temp.innerHTML;
  }
}

// ==========================================
// SESSION MANAGEMENT
// ==========================================

class SessionManager {
  static startSession() {
    const sessionId = generateCSRFToken();
    sessionStorage.setItem('session_id', sessionId);
    sessionStorage.setItem('session_start', Date.now());
  }

  static getSessionDuration() {
    const startTime = sessionStorage.getItem('session_start');
    if (!startTime) return 0;
    return Date.now() - parseInt(startTime);
  }

  static isSessionValid(maxDuration = 3600000) { // 1 hour default
    return this.getSessionDuration() < maxDuration;
  }

  static endSession() {
    sessionStorage.removeItem('session_id');
    sessionStorage.removeItem('session_start');
    SecureStorage.clear();
  }
}

// ==========================================
// ERROR LOGGING
// ==========================================

class ErrorLogger {
  static log(error, context = '') {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Store locally (in production, send to server)
    const logs = SecureStorage.get('error_logs') || [];
    logs.push(errorData);
    
    // Keep only last 50 errors
    if (logs.length > 50) {
      logs.shift();
    }
    
    SecureStorage.set('error_logs', logs);

    console.error('Error logged:', errorData);
  }

  static clearLogs() {
    SecureStorage.remove('error_logs');
  }

  static getLogs() {
    return SecureStorage.get('error_logs') || [];
  }
}

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

window.addEventListener('error', (event) => {
  ErrorLogger.log(event.error, 'Global error handler');
});

window.addEventListener('unhandledrejection', (event) => {
  ErrorLogger.log(new Error(event.reason), 'Unhandled promise rejection');
});

// ==========================================
// INITIALIZE SECURITY
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initializeCSRFToken();
  SessionManager.startSession();

  // Clear old session data if necessary
  const sessionDuration = SessionManager.getSessionDuration();
  if (sessionDuration > 14400000) { // 4 hours
    SessionManager.endSession();
    SessionManager.startSession();
  }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  // Optional: Log user activity
});
