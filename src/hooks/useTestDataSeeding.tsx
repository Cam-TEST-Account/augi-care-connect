import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useTestDataSeeding = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkAndSeedTestData = async () => {
      if (!user) return;

      try {
        // Get user's provider profile and organization
        const { data: profile } = await supabase
          .from('provider_profiles')
          .select('organization_id, id, onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (!profile?.organization_id) return;

        // Check if this user has any patients already
        const { data: existingPatients, count } = await supabase
          .from('patients')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', profile.organization_id);

        // If no patients exist and onboarding is not completed, seed test data
        if (count === 0 && !profile.onboarding_completed) {
          console.log('Seeding test patients for new user...');

          // Seed test patients
          const { error: seedError } = await supabase.rpc('seed_test_patients', {
            _organization_id: profile.organization_id,
            _primary_provider_id: profile.id
          });

          if (seedError) {
            console.error('Error seeding test patients:', seedError);
            return;
          }

          // Mark onboarding as completed
          const { error: updateError } = await supabase
            .from('provider_profiles')
            .update({ onboarding_completed: true })
            .eq('id', profile.id);

          if (updateError) {
            console.error('Error updating onboarding status:', updateError);
            return;
          }

          toast({
            title: "Welcome to AugiCare! 🎉",
            description: "Sample test data has been added to help you explore. Real patient data will appear here once you start using the system.",
          });
        }

      } catch (error) {
        console.error('Error in test data seeding:', error);
      }
    };

    // Delay the check to ensure user data is fully loaded
    const timeoutId = setTimeout(checkAndSeedTestData, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [user, toast]);
};

export default useTestDataSeeding;