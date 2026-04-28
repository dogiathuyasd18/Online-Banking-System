import { useCallback, useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Key, 
  CheckCircle2,
  Camera,
  LogOut
} from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { ApiError, apiRequest } from '../api';
import type { ProfileResponse } from '../types';

interface ProfilePageProps {
  token: string;
  email: string;
  onLogout: () => void;
}

export function ProfilePage({ token, email, onLogout }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiRequest<ProfileResponse>('/api/profile', {}, token);
      setProfileData(res.data);
      setFullName(res.data?.profile?.full_name || '');
      setPhone(res.data?.profile?.phone || '');
      setAddress(res.data?.profile?.address || '');
    } catch {
      console.error('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName, phone, address })
      }, token);
      setIsEditing(false);
      setMessage(res.message);
      void fetchProfile();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Failed to update profile:', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  if (isLoading) return <div className="p-8 text-center font-bold text-slate-500">Loading profile...</div>;

  const profile = {
    name: profileData?.profile?.full_name || 'User',
    email: email,
    phone: profileData?.profile?.phone || 'Not set',
    address: profileData?.profile?.address || 'Not set',
    status: 'Verified',
    memberSince: profileData?.profile?.created_at ? new Date(profileData.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'April 2024'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your personal information and security preferences.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Avatar and Quick Info */}
        <div className="space-y-6">
          <Card className="text-center py-8">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-50 overflow-hidden mx-auto">
                <User className="h-12 w-12 text-slate-400" />
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors">
                 <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-black text-slate-800">{profile.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="success" className="text-[10px] py-0.5 px-2">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {profile.status}
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-3 uppercase tracking-widest">Member since {profile.memberSince}</p>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <button 
              className="flex w-full items-center gap-3 px-6 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              onClick={() => setIsEditing(!isEditing)}
            >
              <User className="h-5 w-5 text-slate-400" />
              Edit Profile
            </button>
            <button className="flex w-full items-center gap-3 px-6 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Shield className="h-5 w-5 text-slate-400" />
              Privacy Policy
            </button>
            <button className="flex w-full items-center gap-3 px-6 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell className="h-5 w-5 text-slate-400" />
              Notifications
            </button>
            <div className="h-px bg-slate-100 mx-6" />
            <button 
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-6 py-4 text-sm font-bold text-danger hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </Card>
        </div>

        {/* Right Column: Detailed Forms */}
        <div className="md:col-span-2 space-y-6">
          <Card header={<CardTitle>Personal Information</CardTitle>}>
             <div className="grid gap-6 sm:grid-cols-2">
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                 <Input 
                   value={fullName} 
                   onChange={(e) => setFullName(e.target.value)}
                   disabled={!isEditing}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                 <Input 
                   value={email} 
                   disabled={true}
                   icon={<Mail className="h-4 w-4" />}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                 <Input 
                   value={phone} 
                   onChange={(e) => setPhone(e.target.value)}
                   disabled={!isEditing}
                   icon={<Phone className="h-4 w-4" />}
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Address</label>
                 <Input 
                   value={address} 
                   onChange={(e) => setAddress(e.target.value)}
                   disabled={!isEditing}
                   icon={<MapPin className="h-4 w-4" />}
                 />
               </div>
             </div>
             {isEditing && (
               <div className="flex justify-end mt-8 gap-3">
                 <Button variant="ghost" className="font-bold" onClick={() => setIsEditing(false)}>Cancel</Button>
                 <Button 
                   className="font-bold" 
                   onClick={handleSave}
                   disabled={isSaving}
                 >
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </Button>
               </div>
             )}
             {message && <p className="mt-4 text-right text-sm font-bold text-emerald-600">{message}</p>}
             {error && <p className="mt-4 text-right text-sm font-bold text-red-600">{error}</p>}
          </Card>

          <Card header={<CardTitle>Security Preferences</CardTitle>}>
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex gap-4">
                   <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                     <Key className="h-5 w-5 text-primary" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                     <p className="text-xs font-medium text-slate-500">Secure your account with an extra layer of security.</p>
                   </div>
                 </div>
                 <Button variant="outline" size="sm" className="font-bold">Enable</Button>
               </div>
               
               <div className="h-px bg-slate-100" />

               <div className="flex items-center justify-between">
                 <div className="flex gap-4">
                   <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                     <Shield className="h-5 w-5 text-orange-500" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">Change Password</p>
                     <p className="text-xs font-medium text-slate-500">Last changed 3 months ago.</p>
                   </div>
                 </div>
                 <Button variant="outline" size="sm" className="font-bold">Update</Button>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
