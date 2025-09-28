-- Create RLS policies for provider_profiles table
CREATE POLICY "Providers can view their own profile" ON public.provider_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Providers can update their own profile" ON public.provider_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert their own profile" ON public.provider_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for patients table (providers can access their assigned patients)
CREATE POLICY "Providers can view their patients" ON public.patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() 
            AND (pp.id = primary_provider_id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = patients.id AND a.provider_id = pp.id
            ))
        )
    );

CREATE POLICY "Providers can insert patients" ON public.patients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can update their patients" ON public.patients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() 
            AND (pp.id = primary_provider_id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = patients.id AND a.provider_id = pp.id
            ))
        )
    );

-- Create RLS policies for ehr_connections table
CREATE POLICY "Providers can view EHR connections for their patients" ON public.ehr_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            JOIN public.provider_profiles pp ON pp.user_id = auth.uid()
            WHERE p.id = patient_id 
            AND (p.primary_provider_id = pp.id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = p.id AND a.provider_id = pp.id
            ))
        )
    );

CREATE POLICY "Providers can manage EHR connections" ON public.ehr_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            JOIN public.provider_profiles pp ON pp.user_id = auth.uid()
            WHERE p.id = patient_id 
            AND (p.primary_provider_id = pp.id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = p.id AND a.provider_id = pp.id
            ))
        )
    );

-- Create RLS policies for appointments table
CREATE POLICY "Providers can view their appointments" ON public.appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = provider_id
        )
    );

CREATE POLICY "Providers can manage their appointments" ON public.appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = provider_id
        )
    );

-- Create RLS policies for prescriptions table
CREATE POLICY "Providers can view their prescriptions" ON public.prescriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = provider_id
        )
    );

CREATE POLICY "Providers can manage their prescriptions" ON public.prescriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = provider_id
        )
    );

-- Create RLS policies for clinical_notes table
CREATE POLICY "Providers can view clinical notes for their patients" ON public.clinical_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() 
            AND (pp.id = provider_id OR EXISTS (
                SELECT 1 FROM public.patients p 
                WHERE p.id = patient_id AND p.primary_provider_id = pp.id
            ))
        )
    );

CREATE POLICY "Providers can create clinical notes" ON public.clinical_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = provider_id
        )
    );

CREATE POLICY "Providers can update their own clinical notes" ON public.clinical_notes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = provider_id
        )
    );

-- Create RLS policies for secure_messages table
CREATE POLICY "Providers can view messages they sent or received" ON public.secure_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() 
            AND (pp.id = sender_provider_id OR pp.id = recipient_provider_id)
        )
    );

CREATE POLICY "Providers can send messages" ON public.secure_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = sender_provider_id
        )
    );

CREATE POLICY "Providers can update messages they received" ON public.secure_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.id = recipient_provider_id
        )
    );

-- Create RLS policies for vital_signs table
CREATE POLICY "Providers can view vital signs for their patients" ON public.vital_signs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            JOIN public.provider_profiles pp ON pp.user_id = auth.uid()
            WHERE p.id = patient_id 
            AND (p.primary_provider_id = pp.id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = p.id AND a.provider_id = pp.id
            ))
        )
    );

CREATE POLICY "Providers can manage vital signs" ON public.vital_signs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            JOIN public.provider_profiles pp ON pp.user_id = auth.uid()
            WHERE p.id = patient_id 
            AND (p.primary_provider_id = pp.id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = p.id AND a.provider_id = pp.id
            ))
        )
    );

-- Create RLS policies for lab_results table
CREATE POLICY "Providers can view lab results for their patients" ON public.lab_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            JOIN public.provider_profiles pp ON pp.user_id = auth.uid()
            WHERE p.id = patient_id 
            AND (p.primary_provider_id = pp.id OR pp.id = ordered_by_provider_id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = p.id AND a.provider_id = pp.id
            ))
        )
    );

CREATE POLICY "Providers can manage lab results" ON public.lab_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            JOIN public.provider_profiles pp ON pp.user_id = auth.uid()
            WHERE p.id = patient_id 
            AND (p.primary_provider_id = pp.id OR pp.id = ordered_by_provider_id OR EXISTS (
                SELECT 1 FROM public.appointments a 
                WHERE a.patient_id = p.id AND a.provider_id = pp.id
            ))
        )
    );

-- Create RLS policies for audit_logs table (only admin access for compliance)
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.provider_profiles pp 
            WHERE pp.user_id = auth.uid() AND pp.role = 'admin'
        )
    );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_provider_profiles_updated_at
    BEFORE UPDATE ON public.provider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinical_notes_updated_at
    BEFORE UPDATE ON public.clinical_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.provider_profiles (
        user_id, 
        email, 
        first_name, 
        last_name
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();