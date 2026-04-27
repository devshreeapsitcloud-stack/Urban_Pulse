import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Navigation as NavIcon, 
  Clock, 
  MapPin, 
  Mic, 
  CircleStop,
  MoreVertical
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { ParkingSpot } from '../types';
import { Button, Card, Badge } from '../components/ui';
import MapComponent from '../components/MapComponent';

export default function Navigation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [eta, setEta] = useState(12);
  const [distance, setDistance] = useState(2.4);
  const [userLoc, setUserLoc] = useState({ lat: 19.0760, lng: 72.8777 });

  useEffect(() => {
    parkingService.getAllSpots().then(spots => {
      const found = spots.find(s => s.id === id);
      if (found) setSpot(found);
    });

    const timer = setInterval(() => {
      setEta(prev => Math.max(1, prev - 1));
      setDistance(prev => Math.max(0.1, prev - 0.1));
    }, 10000);

    return () => clearInterval(timer);
  }, [id]);

  if (!spot) return <div className="p-8 text-center">Loading navigation...</div>;

  return (
    <div className="h-screen bg-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top HUD */}
      <div className="p-8 bg-slate-900 border-b border-white/5 z-20 shadow-2xl">
        <div className="flex items-start justify-between max-w-4xl mx-auto">
          <div className="flex items-start space-x-6">
            <div className="bg-blue-600 p-4 rounded-[1.5rem] shadow-[0_0_40px_rgba(37,99,235,0.3)] border border-blue-400/50">
              <NavIcon className="h-10 w-10 text-white rotate-45" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white leading-none tracking-tight">Turn Right</h2>
              <div className="flex items-center mt-3">
                <div className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] bg-blue-400/10 px-2 py-1 rounded-md">Marine Drive</div>
                <div className="w-1 h-1 rounded-full bg-slate-700 mx-3"></div>
                <div className="text-slate-400 font-black text-sm">400m</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Area (Navigation View) */}
      <div className="flex-1 relative bg-slate-800 overflow-hidden">
        <MapComponent 
          spots={spot ? [spot] : []}
          selectedSpot={spot}
          onSelectSpot={() => {}}
          userLocation={userLoc}
        />

        {/* Navigation Info Overlay */}
        <div className="absolute top-4 left-4 right-4 flex space-x-3 z-[400]">
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-2">
            <Badge className="bg-orange-500 text-white border-none">Fastest</Badge>
            <span className="text-white text-xs font-bold">Via Highway</span>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute right-4 bottom-10 flex flex-col space-y-4 z-[400]">
          <button className="h-14 w-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-800">
            <Mic className="h-6 w-6" />
          </button>
          <button 
            className="h-14 w-14 bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl flex items-center justify-center text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-8 bg-white border-t border-slate-100 z-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-12">
              <div>
                <div className="text-5xl font-black text-slate-900 tracking-tight">{eta} <span className="text-sm text-slate-400 font-black uppercase tracking-widest ml-1">min</span></div>
                <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 italic">
                  Optimal Route Active
                </div>
              </div>
              <div className="h-12 w-px bg-slate-100"></div>
              <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{distance.toFixed(1)} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">km</span></div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Remaining</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                <MapPin className="h-7 w-7" />
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Destination Arrival</div>
                <div className="font-black text-slate-800 text-lg tracking-tight leading-none">{spot.name}</div>
              </div>
            </div>
            <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-tighter">PREPAID</div>
          </div>

          <Button 
            onClick={() => navigate('/')}
            className="w-full py-8 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.3em] shadow-2xl shadow-red-500/20 transition-all active:scale-95"
          >
            End Trip
          </Button>
        </div>
      </div>
    </div>
  );
}
