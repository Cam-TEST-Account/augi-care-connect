import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import augiLogo from '@/assets/augi-logo.png';

const PASSWORD_KEY = 'augi_site_access';

interface SecurePasswordProtectionProps {
  children: React.ReactNode;
}

export const SecurePasswordProtection: React.FC<SecurePasswordProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user has already entered the correct password
    const savedAuth = localStorage.getItem(PASSWORD_KEY);
    if (savedAuth === 'granted') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const verifyPassword = async (inputPassword: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-site-password', {
        body: { password: inputPassword }
      });

      if (error) {
        console.error('Password verification error:', error);
        return false;
      }

      return data?.valid === true;
    } catch (err) {
      console.error('Password verification failed:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const isValid = await verifyPassword(password);
      
      if (isValid) {
        localStorage.setItem(PASSWORD_KEY, 'granted');
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin">
          <Shield className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={augiLogo} alt="Augi Logo" className="w-12 h-12 mr-3" />
              <div>
                <CardTitle className="text-2xl">AugiCare</CardTitle>
                <CardDescription className="flex items-center justify-center mt-1">
                  <Lock className="w-4 h-4 mr-1" />
                  Protected Access
                </CardDescription>
              </div>
            </div>
            <CardDescription>
              Please enter the site password to access the AugiCare platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-password">Site Password</Label>
                <Input
                  id="site-password"
                  type="password"
                  placeholder="Enter site password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
              
              {error && (
                <Alert className="border-destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Shield className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Verifying...' : 'Access Platform'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center">
                <Shield className="w-4 h-4 mr-1" />
                HIPAA-compliant secure access
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};