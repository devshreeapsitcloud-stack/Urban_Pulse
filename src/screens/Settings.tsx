import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Car, 
  Moon, 
  Sun, 
  CreditCard, 
  Bell, 
  LogOut,
  ChevronRight,
  Shield,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Button, Card } from '../components/ui';

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  
  const [name, setName] = useState(profile?.name || '');
  const [vehicle, setVehicle] = useState(profile?.vehicle_number || '');
  const [theme, setTheme] = useState(profile?.theme || 'light');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      await authService.updateProfile(user.uid, {
        name,
        vehicle_number: vehicle,
        theme
      });
      await refreshProfile();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Update theme on body
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white p-4 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-xl mr-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-display font-bold">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 max-w-lg mx-auto w-full pb-24">
        {/* User Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Personal Info</h3>
          <Card className="bg-white border-none shadow-sm space-y-6 p-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium bg-gray-50/30"
                  placeholder="Your Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Vehicle Number</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                <input 
                  type="text" 
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium bg-gray-50/30 font-mono text-center tracking-widest uppercase"
                  placeholder="MH-01-AB-1234"
                />
              </div>
            </div>
            
            <Button 
              className="w-full py-4 rounded-xl flex items-center justify-center space-x-2"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="h-5 w-5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </Button>
            {message && <p className="text-center text-sm font-bold text-green-600">{message}</p>}
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Preferences</h3>
          <div className="space-y-3">
            <Card className="flex items-center justify-between p-4 bg-white border-none shadow-sm h-16">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <span className="font-bold">Dark Mode</span>
              </div>
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`relative w-14 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </Card>

            <Card className="flex items-center justify-between p-4 bg-white border-none shadow-sm h-16 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="font-bold">Payment Methods</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </Card>

            <Card className="flex items-center justify-between p-4 bg-white border-none shadow-sm h-16 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  <Bell className="h-5 w-5" />
                </div>
                <span className="font-bold">Notifications</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </Card>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Account</h3>
          <div className="space-y-3">
             <Card className="flex items-center justify-between p-4 bg-white border-none shadow-sm h-16 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="font-bold">Privacy & Security</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </Card>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors mt-4"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
        
        <div className="text-center text-gray-300 text-[10px] uppercase font-bold tracking-[0.2em] py-8">
          Urban Pulse v1.0.0
        </div>
      </div>
    </div>
  );
}
