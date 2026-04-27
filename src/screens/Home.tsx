import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon, 
  Filter, 
  Navigation as NavIcon, 
  Clock, 
  Star, 
  MapPin, 
  LayoutDashboard, 
  Settings as SettingsIcon,
  ChevronUp,
  Sparkles,
  Activity,
  Shield,
  Zap,
  Coffee,
  Mic,
  User
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { ParkingSpot } from '../types';
import { useAuth } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import { Button, Card, Badge } from '../components/ui';
import { cn } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showBestSpots, setShowBestSpots] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    free: false,
    covered: false,
    ev: false,
    open: false
  });

  useEffect(() => {
    return parkingService.subscribeToSpots((updatedSpots) => {
      setSpots(updatedSpots);
    });
  }, []);

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredSpots = spots.filter(spot => {
    if (filters.free && !spot.is_free) return false;
    if (filters.covered && !spot.is_covered) return false;
    if (filters.ev && !spot.has_ev) return false;
    if (filters.open && !spot.is_open) return false;
    return true;
  });

  const [userLocation, setUserLocation] = useState({ lat: 19.0600, lng: 72.8600 });

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Calculate scores for best spots
  const scoredSpots = [...filteredSpots].map(spot => {
    // Distance (Mock calculated score)
    const dist = Math.sqrt(
      Math.pow(spot.location.lat - userLocation.lat, 2) + 
      Math.pow(spot.location.lng - userLocation.lng, 2)
    );
    
    // Normalized scores (0-1, where 1 is best)
    const currentPrice = parkingService.calculateCurrentPrice(spot);
    const vacancyScore = spot.available_spots / spot.total_spots;
    const priceScore = 1 - (Math.min(currentPrice, 100) / 100);
    const proximityScore = 1 - Math.min(dist * 100, 1); // Closer is higher

    // Weighted average: Vacancy(40%), Price(30%), Proximity(30%)
    const finalScore = (vacancyScore * 0.4) + (priceScore * 0.3) + (proximityScore * 0.3);
    
    // Determine the "Tag" for the recommendation
    let tag = "Best Value";
    if (parkingService.isHappyHour(spot)) tag = "Happy Hour 🎁";
    else if (proximityScore > 0.9) tag = "Closest";
    else if (vacancyScore > 0.8) tag = "Most Vacant";
    else if (priceScore > 0.8) tag = "Cheapest";

    return { ...spot, finalScore, recommendationTag: tag, currentPrice };
  }).sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);

  return (
    <div className="relative h-screen w-full bg-slate-100 overflow-hidden font-sans">
      {/* Brand Header (Top Left - Floating) */}
      <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-start">
        <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform border border-slate-100" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-500/20">UP</div>
          <div className="pr-2 hidden md:block">
            <div className="text-slate-900 font-black text-xs leading-none tracking-tighter">URBAN PULSE</div>
          </div>
        </div>

        {/* User Greeting Bar */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="bg-white/90 backdrop-blur-xl px-5 py-3 rounded-[2rem] shadow-xl border border-white flex items-center gap-4 cursor-pointer hover:border-blue-200 transition-all group scale-90 sm:scale-100 origin-right"
        >
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome Back</div>
            <div className="text-sm font-black text-slate-800 tracking-tight capitalize">Hi! {user?.email?.split('@')[0] || 'Explorer'}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-900 overflow-hidden border-2 border-white shadow-lg group-hover:scale-110 transition-transform">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapComponent 
          spots={filteredSpots} 
          selectedSpot={selectedSpot} 
          onSelectSpot={setSelectedSpot} 
          userLocation={userLocation}
        />
      </div>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-[101] p-8 pb-12 shadow-2xl max-w-lg mx-auto"
            >
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">Filter Options</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Refine your Search</p>
                </div>
                <button 
                  onClick={() => setFilters({ free: false, covered: false, ev: false, open: false })}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Reset all
                </button>
              </div>

              <div className="space-y-6 mb-12">
                {[
                  { id: 'free', label: 'Free Parking', icon: '🎁', desc: 'No cost for parking' },
                  { id: 'covered', label: 'Covered Parking', icon: '🏠', desc: 'Protection from weather' },
                  { id: 'ev', label: 'EV Charging', icon: '⚡', desc: 'Electric vehicle priority' },
                  { id: 'open', label: 'Open Now', icon: '🕒', desc: 'Currently accessible' },
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => toggleFilter(opt.id as any)}
                    className={cn(
                      "w-full flex items-center justify-between p-6 rounded-[2.25rem] border-2 transition-all group relative overflow-hidden",
                      filters[opt.id as keyof typeof filters] 
                        ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/5 scale-[1.02]" 
                        : "border-slate-50 bg-white hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all",
                        filters[opt.id as keyof typeof filters] ? "bg-white shadow-sm" : "bg-slate-50"
                      )}>
                        {opt.icon}
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-slate-800 text-lg leading-none mb-1 tracking-tight">{opt.label}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{opt.desc}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                      filters[opt.id as keyof typeof filters]
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/40"
                        : "border-slate-100 group-hover:border-slate-200"
                    )}>
                      {filters[opt.id as keyof typeof filters] && <span className="text-xs font-black">✓</span>}
                    </div>
                  </button>
                ))}
              </div>

              <Button 
                className="w-full py-6 text-sm font-black rounded-3xl uppercase tracking-widest shadow-xl shadow-blue-100"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Bottom Parking Details Card */}
      <AnimatePresence>
        {selectedSpot && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                setSelectedSpot(null);
              }
            }}
            className="absolute bottom-0 left-0 w-full p-6 z-50 pointer-events-none"
          >
            <div className="bg-white rounded-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 flex max-w-4xl mx-auto pointer-events-auto cursor-grab active:cursor-grabbing flex-col">
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto my-3 shrink-0"></div>
              
              <div className="flex flex-1">
                {/* Left: Image Preview */}
              <div className="w-1/3 min-w-[140px] bg-slate-300 relative hidden sm:block">
                <img src={selectedSpot.images[0]} alt={selectedSpot.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 flex flex-col gap-2">
                  <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded inline-block">8 MIN AWAY</div>
                  {selectedSpot.green_score && (
                    <div className="bg-green-600 text-white text-[10px] font-black px-2 py-1 rounded flex items-center gap-1">
                      <span>☘️</span> {selectedSpot.green_score}% GREEN PULSE
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right: Info */}
              <div className="flex-1 p-6 relative">
                <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Updated 10s ago</span>
                </div>
                
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{selectedSpot.type} • LEVEL 2</div>
                    {selectedSpot.has_ev && <div className="text-amber-500 text-[10px] font-black uppercase tracking-widest border-l border-slate-200 pl-2 flex items-center gap-0.5">⚡ EV ACTIVE</div>}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-1 leading-none">{selectedSpot.name}</h2>
                  <p className="text-sm text-slate-500 mb-4 px-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Ashok Nagar, MG Road • {selectedSpot.is_open ? 'Open Now' : 'Currently Closed'}
                  </p>

                  {selectedSpot.has_ev && selectedSpot.ev_details && (
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⚡</span>
                        <div>
                          <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">EV Charging Details</div>
                          <div className="text-xs font-black text-amber-900">{selectedSpot.ev_details.speed} Charger • {selectedSpot.ev_details.tariff}</div>
                        </div>
                      </div>
                      <div className="text-[10px] font-black text-amber-500 bg-white px-2 py-1 rounded-lg">FCDP READY</div>
                    </div>
                  )}
                  
                  {/* Neighbourhood Pulse Insight */}
                  {selectedSpot.neighbourhood_discovery && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">
                          <Activity className="h-3 w-3" /> Area Busy Level
                        </div>
                        <div className={cn(
                          "text-sm font-black",
                          selectedSpot.neighbourhood_discovery.busy_level === 'Low' ? "text-green-600" :
                          selectedSpot.neighbourhood_discovery.busy_level === 'Moderate' ? "text-amber-600" : "text-red-600"
                        )}>
                          {selectedSpot.neighbourhood_discovery.busy_level.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">
                          <Coffee className="h-3 w-3" /> Nearby Points
                        </div>
                        <div className="text-sm font-black text-slate-800 line-clamp-1">
                          {selectedSpot.neighbourhood_discovery.points_of_interest[0]}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">₹{parkingService.calculateCurrentPrice(selectedSpot)}</span>
                        {parkingService.isHappyHour(selectedSpot) && (
                          <span className="text-sm font-bold text-slate-400 line-through">₹{selectedSpot.price_per_hour}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Rate</span>
                        {parkingService.isHappyHour(selectedSpot) && (
                          <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 text-[8px] font-black py-0 px-1.5 rounded-sm">HAPPY HOUR</Badge>
                        )}
                      </div>
                    </div>
                    <div className="w-px h-10 bg-slate-200"></div>
                    <div className="flex flex-col">
                      <span className={cn("text-3xl font-black tracking-tight", selectedSpot.available_spots > 5 ? "text-green-500" : "text-red-500")}>{selectedSpot.available_spots}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Available</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 py-7 rounded-[2rem] shadow-[0_20px_50px_rgba(37,99,235,0.3)] bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-lg"
                      onClick={() => navigate(`/booking/${selectedSpot.id}`)}
                    >
                      RESERVE
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-10 py-7 rounded-[2rem] bg-slate-50 border-slate-100 font-black uppercase tracking-widest text-sm"
                      onClick={() => navigate(`/navigation/${selectedSpot.id}`)}
                    >
                      <NavIcon className="h-5 w-5 mr-2" />
                      GO
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Driver-Focused Bottom UI */}
      {!selectedSpot && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.1}
          className="absolute bottom-0 left-0 w-full z-40 bg-white/60 backdrop-blur-xl pt-4 pb-8 px-6 border-t border-slate-100 cursor-grab active:cursor-grabbing"
        >
          {/* Drag Handle */}
          <div className="w-12 h-1 bg-slate-200/50 rounded-full mx-auto mb-6 shrink-0"></div>
          
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* 1. Best Spots Strip (Horizontal Scroll) */}
            <AnimatePresence>
              {showBestSpots && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2"
                >
                  <div className="bg-slate-100 border-2 border-slate-200 px-6 py-5 rounded-[2rem] flex flex-col gap-1 min-w-[180px] shadow-sm">
                    <div className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="tracking-widest text-slate-500">Smart Priority</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 leading-tight mt-1 uppercase italic">Top Matches</div>
                  </div>
                  
                  {scoredSpots.map(spot => (
                    <div 
                      key={spot.id}
                      onClick={() => setSelectedSpot(spot)}
                      className={cn(
                        "bg-white border-2 px-6 py-5 rounded-[2rem] flex flex-col gap-2 min-w-[240px] cursor-pointer transition-all shadow-md hover:shadow-xl hover:-translate-y-1",
                        selectedSpot?.id === spot.id ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-50"
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[9px] uppercase font-black text-blue-600 tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                          {spot.recommendationTag}
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">₹{spot.currentPrice}/hr</div>
                          {parkingService.isHappyHour(spot) && (
                            <div className="text-[8px] font-bold text-slate-400 line-through">₹{spot.price_per_hour}/hr</div>
                          )}
                        </div>
                      </div>
                      <div className="text-base font-black text-slate-800 truncate leading-tight tracking-tight">{spot.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tight">{spot.available_spots} FREE</span>
                        <span className={cn("w-2.5 h-2.5 rounded-full shadow-lg", spot.available_spots > 0 ? "bg-green-500 shadow-green-500/30" : "bg-red-500 shadow-red-500/30")}></span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. Quick Discovery (Horizontal Scroll) */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm whitespace-nowrap group hover:bg-slate-50 transition-all cursor-pointer">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Quiet Area</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm whitespace-nowrap group hover:bg-slate-50 transition-all cursor-pointer">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Safe Zone</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm whitespace-nowrap group hover:bg-slate-50 transition-all cursor-pointer">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">EV Density</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm whitespace-nowrap group hover:bg-slate-50 transition-all cursor-pointer">
                <Coffee className="h-4 w-4 text-orange-600" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Nearby Cafe</span>
              </div>
            </div>

            {/* 3. Driver Search Bar (Fixed at bottom) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 flex-1 group focus-within:border-blue-500 transition-all overflow-hidden">
                <div className="p-4 bg-slate-900 rounded-3xl text-white">
                  <SearchIcon className="h-6 w-6" />
                </div>
                <input 
                  type="text" 
                  placeholder="Find a parking spot..." 
                  className="bg-transparent outline-none w-full text-xl font-black text-slate-800 placeholder:text-slate-300"
                  onFocus={() => navigate('/search')}
                />
                <button 
                  className="p-4 hover:bg-slate-50 rounded-2xl text-slate-400 mr-2 transition-colors"
                  onClick={() => setIsFilterOpen(true)}
                >
                  <Filter className="h-6 w-6" />
                </button>
              </div>
              
              {/* Account Shortcut */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-5 bg-white rounded-[2rem] shadow-2xl border-2 border-slate-100 text-slate-900 hover:text-blue-600 transition-all active:scale-90"
              >
                <User className="h-7 w-7" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
