import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  Award, 
  MapPin, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { Booking, ParkingSpot } from '../types';
import { Card, Badge, Button } from '../components/ui';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [spots, setSpots] = useState<Record<string, ParkingSpot>>({});
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const [userBookings, allSpots] = await Promise.all([
          parkingService.getUserBookings(user.uid),
          parkingService.getAllSpots()
        ]);
        
        const spotsMap: Record<string, ParkingSpot> = {};
        allSpots.forEach(s => spotsMap[s.id] = s);
        
        setBookings(userBookings.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
        setSpots(spotsMap);
        setLoading(false);
      };
      fetchData();
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const currentBooking = bookings.find(b => b.status === 'active');
  const pastBookings = bookings.filter(b => b.status !== 'active');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-50 rounded-xl mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-display font-bold">Dashboard</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 bg-gray-100 rounded-full border-2 border-white shadow-sm overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-lg mx-auto w-full pb-24">


        {/* Current Active Booking */}
        {currentBooking && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Active Now</h3>
            <div className="bg-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
              <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <LayoutDashboard className="h-48 w-48" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-black">{spots[currentBooking.parking_id]?.name || 'Parking Spot'}</h4>
                    <p className="opacity-50 text-xs font-bold uppercase tracking-widest mt-1">Reservation Active</p>
                  </div>
                  <Badge variant="available" className="bg-white/10 text-white border border-white/20 backdrop-blur-sm">45M LEFT</Badge>
                </div>
                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                  <div className="flex items-center space-x-6">
                    <div>
                      <div className="text-[10px] uppercase font-black opacity-40 tracking-wider">Status</div>
                      <div className="font-black text-blue-500 uppercase text-xs mt-1 tracking-widest">{currentBooking.status}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-black opacity-40 tracking-wider">Total</div>
                      <div className="font-black text-xl">₹{currentBooking.total_price}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline"
                      className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 rounded-xl px-4 py-2 text-xs"
                      onClick={async () => {
                        await parkingService.updateBookingStatus(currentBooking.id, 'completed');
                        await parkingService.updateAvailability(currentBooking.parking_id, spots[currentBooking.parking_id].available_spots + 1);
                        window.location.reload();
                      }}
                    >
                      VACATE
                    </Button>
                    <Button 
                      className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-6 py-2 text-xs"
                      onClick={() => navigate(`/navigation/${currentBooking.parking_id}`)}
                    >
                      NAVIGATE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
              <History className="h-4 w-4 mr-2" />
              Recent History
            </h3>
            <button className="text-xs font-bold text-blue-600 uppercase tracking-wider">See All</button>
          </div>
          
          <div className="space-y-3">
            {pastBookings.length > 0 ? pastBookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl group hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm leading-tight">{spots[booking.parking_id]?.name || 'Parking Spot'}</h4>
                    <div className="flex items-center text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{format(new Date(booking.start_time), 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <div>
                    <div className="font-black text-slate-900">₹{booking.total_price}</div>
                    <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Completed</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-400">
                <p>No recent parking history</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-none shadow-sm p-4 space-y-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Savings</div>
              <div className="text-xl font-bold">₹120</div>
            </div>
          </Card>
          <Card className="bg-white border-none shadow-sm p-4 space-y-2">
            <Award className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Bookings</div>
              <div className="text-xl font-bold">{bookings.length}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
