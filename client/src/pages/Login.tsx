import { useForm } from 'react-hook-form';
import { useLoginMutation } from '@/hooks/use-login';

export function LoginPage() {
  const loginMutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = (values: any) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login</h1>
          </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium">Username</label>
            <input id="username" className="w-full p-2 mt-1 border rounded" {...register('username', { required: 'Username is required.' })} />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" className="w-full p-2 mt-1 border rounded" {...register('password', { required: 'Password is required.' })} />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" className="w-full p-2 bg-primary text-primary-foreground rounded" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}