-- Create test data seeding function for new organizations
CREATE OR REPLACE FUNCTION public.seed_test_patients(_organization_id uuid, _primary_provider_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  patient_emily uuid;
  patient_michael uuid;
  patient_sarah uuid;
  patient_david uuid;
  patient_lisa uuid;
BEGIN
  -- Insert test patients
  INSERT INTO public.patients (
    first_name, last_name, date_of_birth, gender, email, phone,
    address_line1, city, state, zip_code,
    emergency_contact_name, emergency_contact_phone,
    insurance_provider, insurance_policy_number,
    primary_provider_id, organization_id,
    risk_level, risk_score, status,
    mrn, external_patient_id
  ) VALUES
  ('Emily', 'Rodriguez', '1990-03-15', 'Female', 'emily.rodriguez@testpatient.com', '(555) 123-4567',
   '123 Main St', 'Boston', 'MA', '02101',
   'John Rodriguez', '(555) 234-5678',
   'Blue Cross Blue Shield', 'BC123456789',
   _primary_provider_id, _organization_id,
   'high', 85, 'active',
   'MRN-001234', 'EXT-001')
  RETURNING id INTO patient_emily;

  INSERT INTO public.patients (
    first_name, last_name, date_of_birth, gender, email, phone,
    address_line1, city, state, zip_code,
    emergency_contact_name, emergency_contact_phone,
    insurance_provider, insurance_policy_number,
    primary_provider_id, organization_id,
    risk_level, risk_score, status,
    mrn, external_patient_id
  ) VALUES
  ('Michael', 'Thompson', '1967-08-22', 'Male', 'michael.thompson@testpatient.com', '(555) 345-6789',
   '456 Oak Ave', 'Cambridge', 'MA', '02139',
   'Jane Thompson', '(555) 456-7890',
   'Aetna', 'AT987654321',
   _primary_provider_id, _organization_id,
   'medium', 65, 'active',
   'MRN-005678', 'EXT-002')
  RETURNING id INTO patient_michael;

  INSERT INTO public.patients (
    first_name, last_name, date_of_birth, gender, email, phone,
    address_line1, city, state, zip_code,
    emergency_contact_name, emergency_contact_phone,
    insurance_provider, insurance_policy_number,
    primary_provider_id, organization_id,
    risk_level, risk_score, status,
    mrn, external_patient_id
  ) VALUES
  ('Sarah', 'Williams', '1981-12-05', 'Female', 'sarah.williams@testpatient.com', '(555) 567-8901',
   '789 Pine St', 'Somerville', 'MA', '02143',
   'David Williams', '(555) 678-9012',
   'UnitedHealthcare', 'UH456789123',
   _primary_provider_id, _organization_id,
   'critical', 95, 'active',
   'MRN-009012', 'EXT-003')
  RETURNING id INTO patient_sarah;

  INSERT INTO public.patients (
    first_name, last_name, date_of_birth, gender, email, phone,
    address_line1, city, state, zip_code,
    emergency_contact_name, emergency_contact_phone,
    insurance_provider, insurance_policy_number,
    primary_provider_id, organization_id,
    risk_level, risk_score, status,
    mrn, external_patient_id
  ) VALUES
  ('David', 'Chen', '1975-06-18', 'Male', 'david.chen@testpatient.com', '(555) 789-0123',
   '321 Elm St', 'Arlington', 'MA', '02474',
   'Lisa Chen', '(555) 890-1234',
   'Cigna', 'CG789012345',
   _primary_provider_id, _organization_id,
   'low', 25, 'active',
   'MRN-003456', 'EXT-004')
  RETURNING id INTO patient_david;

  INSERT INTO public.patients (
    first_name, last_name, date_of_birth, gender, email, phone,
    address_line1, city, state, zip_code,
    emergency_contact_name, emergency_contact_phone,
    insurance_provider, insurance_policy_number,
    primary_provider_id, organization_id,
    risk_level, risk_score, status,
    mrn, external_patient_id
  ) VALUES
  ('Lisa', 'Park', '1993-11-30', 'Female', 'lisa.park@testpatient.com', '(555) 901-2345',
   '654 Maple Dr', 'Medford', 'MA', '02155',
   'Tom Park', '(555) 012-3456',
   'Harvard Pilgrim', 'HP234567890',
   _primary_provider_id, _organization_id,
   'medium', 55, 'active',
   'MRN-007890', 'EXT-005')
  RETURNING id INTO patient_lisa;

  -- Add some appointments
  INSERT INTO public.appointments (
    patient_id, provider_id, organization_id,
    scheduled_date, duration_minutes, appointment_type,
    status, chief_complaint, telehealth_enabled
  ) VALUES
  (patient_emily, _primary_provider_id, _organization_id,
   NOW() + INTERVAL '2 days', 30, 'Follow-up',
   'scheduled', 'Hypertension management', false),
  (patient_michael, _primary_provider_id, _organization_id,
   NOW() + INTERVAL '5 days', 45, 'Routine Check-up',
   'scheduled', 'Diabetes monitoring', true),
  (patient_sarah, _primary_provider_id, _organization_id,
   NOW() - INTERVAL '1 day', 60, 'Consultation',
   'completed', 'Cardiac evaluation', true);

  -- Add vital signs
  INSERT INTO public.vital_signs (
    patient_id, recorded_by_provider_id, organization_id,
    systolic_bp, diastolic_bp, heart_rate, temperature_c,
    weight_kg, height_cm, oxygen_saturation
  ) VALUES
  (patient_emily, _primary_provider_id, _organization_id,
   145, 95, 78, 36.8, 68.5, 165, 98),
  (patient_michael, _primary_provider_id, _organization_id,
   120, 80, 72, 36.6, 82.3, 175, 97),
  (patient_sarah, _primary_provider_id, _organization_id,
   160, 100, 88, 37.1, 75.2, 162, 96);

  -- Add some clinical notes
  INSERT INTO public.clinical_notes (
    patient_id, provider_id, organization_id,
    title, content, note_type, is_signed
  ) VALUES
  (patient_emily, _primary_provider_id, _organization_id,
   'Hypertension Follow-up', 
   'Patient reports good adherence to medication. BP improving. Continue current regimen.',
   'Progress Note', true),
  (patient_sarah, _primary_provider_id, _organization_id,
   'Cardiac Consultation',
   'Echo results show mild LV dysfunction. Recommend ACE inhibitor adjustment.',
   'Consultation', true);

  -- Update last visit dates
  UPDATE public.patients 
  SET last_visit_date = NOW() - INTERVAL '5 days',
      next_appointment_date = NOW() + INTERVAL '2 days'
  WHERE id = patient_emily;

  UPDATE public.patients 
  SET last_visit_date = NOW() - INTERVAL '10 days',
      next_appointment_date = NOW() + INTERVAL '5 days'
  WHERE id = patient_michael;

  UPDATE public.patients 
  SET last_visit_date = NOW() - INTERVAL '1 day'
  WHERE id = patient_sarah;

  UPDATE public.patients 
  SET last_visit_date = NOW() - INTERVAL '7 days'
  WHERE id = patient_david;

  UPDATE public.patients 
  SET last_visit_date = NOW() - INTERVAL '14 days'
  WHERE id = patient_lisa;

END;
$$;

-- Function to remove all test patients for an organization
CREATE OR REPLACE FUNCTION public.remove_test_patients(_organization_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all related data first (cascade should handle this, but being explicit)
  DELETE FROM public.clinical_notes 
  WHERE patient_id IN (
    SELECT id FROM public.patients 
    WHERE organization_id = _organization_id 
    AND (email LIKE '%testpatient.com' OR external_patient_id LIKE 'EXT-%')
  );
  
  DELETE FROM public.vital_signs 
  WHERE patient_id IN (
    SELECT id FROM public.patients 
    WHERE organization_id = _organization_id 
    AND (email LIKE '%testpatient.com' OR external_patient_id LIKE 'EXT-%')
  );
  
  DELETE FROM public.appointments 
  WHERE patient_id IN (
    SELECT id FROM public.patients 
    WHERE organization_id = _organization_id 
    AND (email LIKE '%testpatient.com' OR external_patient_id LIKE 'EXT-%')
  );
  
  -- Finally delete the test patients
  DELETE FROM public.patients 
  WHERE organization_id = _organization_id 
  AND (email LIKE '%testpatient.com' OR external_patient_id LIKE 'EXT-%');
END;
$$;