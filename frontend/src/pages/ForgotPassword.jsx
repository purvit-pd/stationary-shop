import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('email');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setToken(res.data.resetToken);
      toast({ title: 'Token Generated', description: 'Enter your new password below', variant: 'success' });
      setStep('reset');
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast({ title: 'Success', description: 'Password reset successful! You can now login.', variant: 'success' });
      setStep('done');
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Reset failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>{step === 'email' ? 'Enter your email to get reset link' : step === 'reset' ? 'Enter your new password' : 'Done!'}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Token'}</Button>
            </form>
          )}
          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
            </form>
          )}
          {step === 'done' && (
            <div className="space-y-4">
              <p className="text-green-600 text-sm">Password reset successful! You can now login.</p>
              <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
            </div>
          )}
          <div className="text-center text-sm mt-4">
            <Link to="/login" className="text-primary hover:underline">Back to Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
