import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ParkingSpot } from '../types';

const mockSpots: ParkingSpot[] = [
  {
    id: 'spot-1',
    name: 'BKC Financial Center Lot',
    location: { lat: 19.0600, lng: 72.8600 },
    total_spots: 50,
    available_spots: 12,
    price_per_hour: 80,
    type: 'Garage',
    amenities: ['CCTV', 'Security', 'EV Charging'],
    rating: 4.5,
    images: ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800'],
    last_updated: new Date().toISOString(),
    is_free: false,
    is_covered: true,
    has_ev: true,
    is_open: true,
    ev_details: { speed: "50kW", tariff: "₹12/unit" },
    green_score: 85,
    neighbourhood_discovery: {
      busy_level: 'Heavy',
      safety_score: 95,
      points_of_interest: ['NSE', 'US Consulate', 'Reliance Jio World']
    }
  },
  {
    id: 'spot-2',
    name: 'Colaba Causeway Parking',
    location: { lat: 18.9218, lng: 72.8335 },
    total_spots: 20,
    available_spots: 2,
    price_per_hour: 40,
    type: 'Street',
    amenities: ['Lighting'],
    rating: 3.8,
    images: ['https://images.unsplash.com/photo-1590674867570-817e5764d33b?auto=format&fit=crop&q=80&w=800'],
    last_updated: new Date().toISOString(),
    is_free: true,
    is_covered: false,
    has_ev: false,
    is_open: true,
    green_score: 95,
    neighbourhood_discovery: {
      busy_level: 'Heavy',
      safety_score: 88,
      points_of_interest: ['Gateway of India', 'Leopold Cafe', 'Taj Hotel']
    }
  },
  {
    id: 'spot-3',
    name: 'Lower Parel Commercial Hub',
    location: { lat: 18.9950, lng: 72.8270 },
    total_spots: 15,
    available_spots: 0,
    price_per_hour: 100,
    type: 'Private',
    amenities: ['Security', 'Covered'],
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=800'],
    last_updated: new Date().toISOString(),
    is_free: false,
    is_covered: true,
    has_ev: false,
    is_open: false,
    green_score: 70
  },
  {
    id: 'spot-4',
    name: 'Andheri West Metro Lot',
    location: { lat: 19.1200, lng: 72.8400 },
    total_spots: 100,
    available_spots: 65,
    price_per_hour: 30,
    type: 'Garage',
    amenities: ['CCTV', 'Elevator', 'Security'],
    rating: 4.2,
    images: ['https://images.unsplash.com/photo-1545179605-1296651e9d43?auto=format&fit=crop&q=80&w=800'],
    last_updated: new Date().toISOString(),
    is_free: false,
    is_covered: true,
    has_ev: true,
    is_open: true,
    ev_details: { speed: "22kW", tariff: "₹15/unit" },
    green_score: 60
  }
];

export async function initializeMockData() {
  const querySnapshot = await getDocs(collection(db, 'parking_spots'));
  if (querySnapshot.empty) {
    for (const spot of mockSpots) {
      await setDoc(doc(db, 'parking_spots', spot.id), spot);
    }
    console.log("Mock data initialized");
  }
}
