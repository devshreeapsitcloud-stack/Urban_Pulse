import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search as SearchIcon, 
  MapPin, 
  Clock, 
  Star, 
  SlidersHorizontal,
  Navigation2,
  ChevronRight
} from 'lucide-react';
import { parkingService } from '../services/parkingService';
import { ParkingSpot } from '../types';
import { Card, Badge, Button } from '../components/ui';

export default function Search() {
  const navigate = useNavigate();
  const [queryText, setQueryText] = useState('');
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'cheapest' | 'nearest' | 'best'>('all');

  useEffect(() => {
    parkingService.getAllSpots().then(allSpots => {
      setSpots(allSpots);
      setFilteredSpots(allSpots);
    });
  }, []);

  useEffect(() => {
    let result = spots.filter(s => 
      s.name.toLowerCase().includes(queryText.toLowerCase()) || 
      s.type.toLowerCase().includes(queryText.toLowerCase())
    );

    if (activeFilter === 'cheapest') {
      result = [...result].sort((a, b) => a.price_per_hour - b.price_per_hour);
    } else if (activeFilter === 'best') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    setFilteredSpots(result);
  }, [queryText, spots, activeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Search */}
      <div className="bg-white p-4 pt-6 space-y-4 border-b border-gray-100 shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-50 rounded-xl">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              autoFocus
              type="text" 
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Where do you want to park?"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeFilter === 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-100'}`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveFilter('cheapest')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeFilter === 'cheapest' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-100'}`}
          >
            Cheapest
          </button>
          <button 
            onClick={() => setActiveFilter('best')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${activeFilter === 'best' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-100'}`}
          >
            Best Rated
          </button>
          <button className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-gray-500 border border-gray-100">
            <SlidersHorizontal className="h-3 w-3 inline mr-1" />
            Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
        {filteredSpots.length > 0 ? filteredSpots.map(spot => (
          <div 
            key={spot.id} 
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex"
            onClick={() => navigate(`/booking/${spot.id}`)}
          >
            <div className="w-28 h-28 relative flex-shrink-0">
              <img src={spot.images[0]} className="w-full h-full object-cover" alt="" />
              <div className="absolute top-2 left-2">
                <Badge variant={spot.available_spots === 0 ? 'occupied' : 'available'}>
                  {spot.available_spots} FREE
                </Badge>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-black text-slate-800 leading-tight line-clamp-1 text-sm">{spot.name}</h4>
                <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{spot.type} • 0.5km</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-blue-600 font-black text-lg">₹{spot.price_per_hour}<span className="text-[10px] font-normal text-slate-400">/hr</span></div>
                <div className="bg-slate-50 p-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-20">
            <SearchIcon className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No results found for "{queryText}"</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-white border-t border-gray-100">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Recent Searches</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-gray-600">
            <Clock className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium">Downtown Plaza</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <Clock className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-medium">Metro Mall Parking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
