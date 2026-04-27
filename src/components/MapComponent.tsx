import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, CircleParking, CircleOff } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { ParkingSpot } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MapComponentProps {
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  userLocation?: { lat: number, lng: number };
}

// Fix Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map centering and programmatic selection
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ spots, selectedSpot, onSelectSpot, userLocation }: MapComponentProps) {
  const centerLat = userLocation?.lat || 19.0760;
  const centerLng = userLocation?.lng || 72.8777;

  // Custom DivIcon for parking spots
  const createParkingIcon = (spot: ParkingSpot) => {
    const isSelected = selectedSpot?.id === spot.id;
    const reflectsOccupancy = spot.available_spots === 0;
    const status = reflectsOccupancy ? 'occupied' : (spot.available_spots < spot.total_spots * 0.2 ? 'limited' : 'available');
    
    const colors = {
      available: '#22c55e',
      occupied: '#ef4444',
      limited: '#f59e0b'
    };

    const iconHtml = renderToString(
      <div className="relative flex flex-col items-center">
        {!reflectsOccupancy && (
          <div className="absolute -top-2 -right-2 bg-white text-slate-900 border border-slate-200 text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md z-10">
            {spot.available_spots}
          </div>
        )}
        <div 
          className={cn(
            "rounded-full p-1.5 border-2 border-white shadow-lg transition-all duration-300 flex items-center justify-center",
            isSelected ? "ring-4 ring-blue-500/30 scale-125 shadow-blue-200" : "scale-100"
          )}
          style={{ backgroundColor: colors[status] }}
        >
          {reflectsOccupancy ? (
            <CircleOff style={{ width: '16px', height: '16px', color: 'white' }} />
          ) : (
            <CircleParking style={{ width: '20px', height: '20px', color: 'white' }} />
          )}
        </div>
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: 'custom-parking-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // User Location icon
  const userIcon = L.divIcon({
    html: renderToString(
      <div className="relative">
        <div className="h-5 w-5 bg-blue-600 rounded-full border-4 border-white shadow-xl"></div>
        <div className="absolute -inset-2 bg-blue-600/20 rounded-full animate-ping"></div>
      </div>
    ),
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return (
    <div className="w-full h-full bg-[#f8fafc] relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          center={selectedSpot ? [selectedSpot.location.lat, selectedSpot.location.lng] : [centerLat, centerLng]} 
          zoom={selectedSpot ? 16 : 14} 
        />

        {/* User Location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
        )}

        {/* Parking Spots */}
        {spots.map((spot) => (
          <Marker 
            key={spot.id} 
            position={[spot.location.lat, spot.location.lng]} 
            icon={createParkingIcon(spot)}
            eventHandlers={{
              click: () => onSelectSpot(spot),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <div className="font-black text-slate-900">{spot.name}</div>
                <div className="text-[10px] uppercase font-black text-slate-400 mt-1">₹{spot.price_per_hour}/hr • {spot.available_spots} slots</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Zoom Controls overlay */}
      <div className="absolute bottom-6 right-6 flex flex-col space-y-2 z-[400]">
        <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 font-black text-lg">+</button>
        <button className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 font-black text-lg">-</button>
      </div>
    </div>
  );
}
