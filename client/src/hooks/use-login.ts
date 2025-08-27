import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from "./use-auth";

// This is the new mock function that replaces the old API call.
const mockLoginUser = async (credentials: any) => {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (
    ['Sharan', 'Mahantesh', 'Sangamesh', 'SidduSir', 'Manjunath', 'Saakshi', 'Harsha', 'Rohit'].includes(credentials.username) &&
    credentials.password === 'Test@123'
  ) {
    // On success, return a mock user object.
    return {
      id: 'mock-user-1',
      username: 'Sharan',
      email: 'sharan@aryabhata.space',
      firstName: 'Sharan',
      lastName: 'Aspirant',
      profileImageUrl: 'https://i.pravatar.cc/150?u=sharan',
      streakDays: 12,
      totalStudyMinutes: 720,
      createdAt: new Date().toISOString(),
    };
  } else {
    // On failure, throw an error.
    throw new Error('Invalid username or password');
  }
};

export const useLoginMutation = () => {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: mockLoginUser, // Use the new mock function here
    onSuccess: (user) => {
      login(user);
      setLocation('/'); // Redirect to the homepage after login
    },
    onError: (error: Error) => {
      alert(error.message); // Show an alert on failed login
    },
  });
};