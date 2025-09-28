import { z } from 'zod';

// Patient form validation schema
export const patientSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().trim().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters').optional().or(z.literal('')),
  phone: z.string().trim().max(20, 'Phone number must be less than 20 characters').optional().or(z.literal('')),
  address_line1: z.string().trim().max(100, 'Address must be less than 100 characters').optional().or(z.literal('')),
  address_line2: z.string().trim().max(100, 'Address must be less than 100 characters').optional().or(z.literal('')),
  city: z.string().trim().max(50, 'City must be less than 50 characters').optional().or(z.literal('')),
  state: z.string().trim().max(2, 'State must be 2 characters').optional().or(z.literal('')),
  zip_code: z.string().trim().max(10, 'ZIP code must be less than 10 characters').optional().or(z.literal('')),
  emergency_contact_name: z.string().trim().max(100, 'Emergency contact name must be less than 100 characters').optional().or(z.literal('')),
  emergency_contact_phone: z.string().trim().max(20, 'Emergency contact phone must be less than 20 characters').optional().or(z.literal('')),
  insurance_provider: z.string().trim().max(100, 'Insurance provider must be less than 100 characters').optional().or(z.literal('')),
  insurance_policy_number: z.string().trim().max(50, 'Insurance policy number must be less than 50 characters').optional().or(z.literal('')),
  mrn: z.string().trim().max(50, 'MRN must be less than 50 characters').optional().or(z.literal('')),
});

// Appointment form validation schema
export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  duration_minutes: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  appointment_type: z.string().trim().min(1, 'Appointment type is required').max(100, 'Appointment type must be less than 100 characters'),
  chief_complaint: z.string().trim().max(500, 'Chief complaint must be less than 500 characters').optional().or(z.literal('')),
  notes: z.string().trim().max(1000, 'Notes must be less than 1000 characters').optional().or(z.literal('')),
  telehealth_enabled: z.boolean().optional(),
});

// Clinical note validation schema
export const clinicalNoteSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().trim().min(1, 'Content is required').max(10000, 'Content must be less than 10,000 characters'),
  note_type: z.string().trim().min(1, 'Note type is required').max(50, 'Note type must be less than 50 characters'),
  appointment_id: z.string().uuid('Invalid appointment ID').optional(),
});

// Provider profile validation schema
export const providerProfileSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  last_name: z.string().trim().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().max(20, 'Phone number must be less than 20 characters').optional().or(z.literal('')),
  professional_email: z.string().trim().email('Invalid professional email').max(255, 'Professional email must be less than 255 characters').optional().or(z.literal('')),
  professional_phone: z.string().trim().max(20, 'Professional phone must be less than 20 characters').optional().or(z.literal('')),
  npi_number: z.string().trim().length(10, 'NPI number must be exactly 10 digits').regex(/^\d{10}$/, 'NPI number must contain only digits').optional().or(z.literal('')),
  license_number: z.string().trim().max(50, 'License number must be less than 50 characters').optional().or(z.literal('')),
  license_state: z.string().trim().max(2, 'License state must be 2 characters').optional().or(z.literal('')),
  specialty: z.string().trim().max(100, 'Specialty must be less than 100 characters').optional().or(z.literal('')),
  department: z.string().trim().max(100, 'Department must be less than 100 characters').optional().or(z.literal('')),
  organization_name: z.string().trim().max(200, 'Organization name must be less than 200 characters').optional().or(z.literal('')),
});

// Message validation schema
export const messageSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  recipient_provider_id: z.string().uuid('Invalid recipient provider ID').optional(),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message_body: z.string().trim().min(1, 'Message body is required').max(5000, 'Message body must be less than 5,000 characters'),
  is_urgent: z.boolean().optional(),
  message_type: z.enum(['clinical', 'administrative', 'billing']).optional(),
});

// Prescription validation schema
export const prescriptionSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  medication_name: z.string().trim().min(1, 'Medication name is required').max(200, 'Medication name must be less than 200 characters'),
  dosage: z.string().trim().min(1, 'Dosage is required').max(100, 'Dosage must be less than 100 characters'),
  frequency: z.string().trim().min(1, 'Frequency is required').max(100, 'Frequency must be less than 100 characters'),
  instructions: z.string().trim().max(1000, 'Instructions must be less than 1,000 characters').optional().or(z.literal('')),
  quantity: z.number().min(1, 'Quantity must be at least 1').max(9999, 'Quantity cannot exceed 9999').optional(),
  refills: z.number().min(0, 'Refills cannot be negative').max(99, 'Refills cannot exceed 99').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  ndc_code: z.string().trim().max(20, 'NDC code must be less than 20 characters').optional().or(z.literal('')),
  pharmacy_name: z.string().trim().max(200, 'Pharmacy name must be less than 200 characters').optional().or(z.literal('')),
  pharmacy_phone: z.string().trim().max(20, 'Pharmacy phone must be less than 20 characters').optional().or(z.literal('')),
});

// Vital signs validation schema
export const vitalSignsSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  systolic_bp: z.number().min(50, 'Systolic BP must be at least 50').max(300, 'Systolic BP cannot exceed 300').optional(),
  diastolic_bp: z.number().min(30, 'Diastolic BP must be at least 30').max(200, 'Diastolic BP cannot exceed 200').optional(),
  heart_rate: z.number().min(30, 'Heart rate must be at least 30').max(250, 'Heart rate cannot exceed 250').optional(),
  temperature_c: z.number().min(30, 'Temperature must be at least 30°C').max(45, 'Temperature cannot exceed 45°C').optional(),
  weight_kg: z.number().min(0.5, 'Weight must be at least 0.5 kg').max(500, 'Weight cannot exceed 500 kg').optional(),
  height_cm: z.number().min(30, 'Height must be at least 30 cm').max(300, 'Height cannot exceed 300 cm').optional(),
  oxygen_saturation: z.number().min(50, 'Oxygen saturation must be at least 50%').max(100, 'Oxygen saturation cannot exceed 100%').optional(),
  respiratory_rate: z.number().min(5, 'Respiratory rate must be at least 5').max(60, 'Respiratory rate cannot exceed 60').optional(),
  blood_glucose: z.number().min(20, 'Blood glucose must be at least 20').max(600, 'Blood glucose cannot exceed 600').optional(),
  notes: z.string().trim().max(500, 'Notes must be less than 500 characters').optional().or(z.literal('')),
});

// Organization validation schema
export const organizationSchema = z.object({
  name: z.string().trim().min(1, 'Organization name is required').max(200, 'Organization name must be less than 200 characters'),
  account_type: z.enum(['small_practice', 'enterprise_practice', 'hospital']),
  billing_email: z.string().trim().email('Invalid billing email').max(255, 'Billing email must be less than 255 characters').optional().or(z.literal('')),
  phone: z.string().trim().max(20, 'Phone number must be less than 20 characters').optional().or(z.literal('')),
  address_line1: z.string().trim().max(100, 'Address must be less than 100 characters').optional().or(z.literal('')),
  address_line2: z.string().trim().max(100, 'Address must be less than 100 characters').optional().or(z.literal('')),
  city: z.string().trim().max(50, 'City must be less than 50 characters').optional().or(z.literal('')),
  state: z.string().trim().max(2, 'State must be 2 characters').optional().or(z.literal('')),
  zip_code: z.string().trim().max(10, 'ZIP code must be less than 10 characters').optional().or(z.literal('')),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type ClinicalNoteFormData = z.infer<typeof clinicalNoteSchema>;
export type ProviderProfileFormData = z.infer<typeof providerProfileSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
export type VitalSignsFormData = z.infer<typeof vitalSignsSchema>;
export type OrganizationFormData = z.infer<typeof organizationSchema>;