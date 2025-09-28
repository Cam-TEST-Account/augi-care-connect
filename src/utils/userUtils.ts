import { User } from '@supabase/supabase-js';

interface UserDisplayInfo {
  fullName: string;
  displayName: string;
  initials: string;
  title: string;
  specialty: string;
}

export const getUserDisplayInfo = (user: User | null): UserDisplayInfo => {
  if (!user) {
    return {
      fullName: 'Provider',
      displayName: 'Provider',
      initials: 'DR',
      title: 'Dr.',
      specialty: 'Healthcare Provider',
    };
  }

  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';
  const specialty = user.user_metadata?.specialty || 'Healthcare Provider';
  const title = user.user_metadata?.title || 'Dr.';

  // If we have both first and last name
  if (firstName && lastName) {
    return {
      fullName: `${firstName} ${lastName}`,
      displayName: `${title} ${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      title,
      specialty,
    };
  }

  // If we only have first name
  if (firstName) {
    return {
      fullName: firstName,
      displayName: `${title} ${firstName}`,
      initials: firstName[0].toUpperCase(),
      title,
      specialty,
    };
  }

  // Fallback to email
  const email = user.email || '';
  const emailInitial = email[0]?.toUpperCase() || 'DR';
  
  return {
    fullName: email || 'Provider',
    displayName: email || 'Provider',
    initials: emailInitial,
    title: 'Dr.',
    specialty,
  };
};

export const getGreetingMessage = (user: User | null): string => {
  const userInfo = getUserDisplayInfo(user);
  
  const currentHour = new Date().getHours();
  let greeting = 'Welcome back';
  
  if (currentHour < 12) {
    greeting = 'Good morning';
  } else if (currentHour < 17) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }
  
  return `${greeting}, ${userInfo.displayName}. Here's your patient overview.`;
};