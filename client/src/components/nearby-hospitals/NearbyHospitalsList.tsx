import React, { useEffect, useState } from "react";
import HospitalCard from "./HospitalCard";
import FilterBar from "./FilterBar";
import { fetchHospitals, fetchHospitalsFromGoogle } from "@/services/hospitalService";

interface Hospital {
  id: string; // Now represents Google Place ID
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface NearbyHospitalsListProps {
  userLocation: { lat: number; lng: number } | null;
}

const DEFAULT_RADIUS = 10; // km

const NearbyHospitalsList: React.FC<NearbyHospitalsListProps> = ({ userLocation }) => {
  const [filters, setFilters] = useState({ specialty: "All", radius: DEFAULT_RADIUS });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  // Handler to merge filter updates from FilterBar
  const handleFilterChange = (newFilters: Partial<{ specialty: string; radius: number }>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  useEffect(() => {
    if (!userLocation) return;
    setLoading(true);
    setHospitals([]); // Clear previous results immediately
    setError(null);
    setFallback(false);
    fetchHospitalsFromGoogle(userLocation.lat, userLocation.lng, filters)
      .then(results => {
        if (results && results.length > 0) {
          setHospitals(results);
        } else {
          setFallback(true);
          fetchHospitals(userLocation.lat, userLocation.lng, filters)
            .then(setHospitals)
            .catch(() => setError("Failed to fetch hospitals."));
        }
      })
      .catch(() => {
        setFallback(true);
        fetchHospitals(userLocation.lat, userLocation.lng, filters)
          .then(setHospitals)
          .catch(() => setError("Failed to fetch hospitals."));
      })
      .finally(() => setLoading(false));
  }, [userLocation, filters]);

  return (
    <div>
      <FilterBar filters={filters} onChange={handleFilterChange} />
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-12 h-12 text-teal-500 animate-pulse mb-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <rect x="4" y="7" width="16" height="13" rx="2"/>
            <path d="M9 21V9h6v12"/>
            <path d="M12 12v3"/>
            <path d="M10.5 13.5h3"/>
          </svg>
          <div className="text-gray-500 text-lg font-medium">Loading hospitals...</div>
        </div>
      )}
      {error && <div className="text-center text-red-500 py-8">{error}</div>}
      {fallback && !loading && !error && (
        <div className="text-center text-yellow-600 py-2 text-sm font-medium">Google Places unavailable, showing saved hospital data.</div>
      )}
      {!loading && !error && hospitals.length === 0 && (
        <div className="text-center text-gray-400 py-8">No hospitals found for your filters.</div>
      )}
      <div className="flex flex-wrap gap-6 justify-start">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="flex-[1_1_320px] max-w-xs min-w-[260px]">
            <HospitalCard hospital={hospital} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearbyHospitalsList;
