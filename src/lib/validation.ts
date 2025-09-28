import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
});

// Patient data schemas
export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (555) 123-4567').optional().or(z.literal('')),
  addressLine1: z.string().max(100, 'Address must be less than 100 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  state: z.string().max(2, 'State must be 2 characters').optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789').optional().or(z.literal('')),
  emergencyContactName: z.string().max(100, 'Emergency contact name must be less than 100 characters').optional(),
  emergencyContactPhone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone must be in format (555) 123-4567').optional().or(z.literal('')),
  insuranceProvider: z.string().max(100, 'Insurance provider must be less than 100 characters').optional(),
  insurancePolicyNumber: z.string().max(50, 'Policy number must be less than 50 characters').optional(),
});

// Message schemas
export const messageSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  messageBody: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
  patientId: z.string().uuid('Invalid patient ID'),
  recipientProviderId: z.string().uuid('Invalid recipient provider ID').optional(),
  isUrgent: z.boolean().optional(),
  messageType: z.enum(['clinical', 'administrative', 'billing'], { required_error: 'Message type is required' }),
});

// Appointment schemas
export const appointmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  scheduledDate: z.string().min(1, 'Appointment date is required'),
  durationMinutes: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  appointmentType: z.string().min(1, 'Appointment type is required').max(50, 'Appointment type must be less than 50 characters'),
  chiefComplaint: z.string().max(500, 'Chief complaint must be less than 500 characters').optional(),
  telehealthEnabled: z.boolean().optional(),
});

// Vital signs schemas
export const vitalSignsSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  systolicBp: z.number().min(50, 'Systolic BP must be at least 50').max(300, 'Systolic BP cannot exceed 300').optional(),
  diastolicBp: z.number().min(30, 'Diastolic BP must be at least 30').max(200, 'Diastolic BP cannot exceed 200').optional(),
  heartRate: z.number().min(30, 'Heart rate must be at least 30').max(300, 'Heart rate cannot exceed 300').optional(),
  temperatureC: z.number().min(30, 'Temperature must be at least 30°C').max(45, 'Temperature cannot exceed 45°C').optional(),
  weightKg: z.number().min(1, 'Weight must be at least 1kg').max(500, 'Weight cannot exceed 500kg').optional(),
  heightCm: z.number().min(50, 'Height must be at least 50cm').max(250, 'Height cannot exceed 250cm').optional(),
  oxygenSaturation: z.number().min(50, 'Oxygen saturation must be at least 50%').max(100, 'Oxygen saturation cannot exceed 100%').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

// Clinical notes schemas
export const clinicalNoteSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be less than 10000 characters'),
  noteType: z.string().min(1, 'Note type is required').max(50, 'Note type must be less than 50 characters'),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
});

// Site password schema
export const sitePasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type PatientFormData = z.infer<typeof patientSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;
export type ClinicalNoteFormData = z.infer<typeof clinicalNoteSchema>;
export type SitePasswordFormData = z.infer<typeof sitePasswordSchema>;