import NearbyHospitalsList from "@/components/nearby-hospitals/NearbyHospitalsList";
import { useEffect, useState } from "react";
import { getUserLocation } from "@/utils/geolocation";
import Header from "@/components/common/Header";

export default function NearbyHospitalsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserLocation()
      .then((loc: { lat: number; lng: number }) => {
        setUserLocation(loc);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error("Geolocation error:", err);
        setError("Unable to get your location. Please enable location services.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-teal-700">Nearby Hospitals</h1>
        <p className="mb-6 text-gray-600">Find hospitals close to your location.</p>
        {loading && (
          <div className="text-center text-gray-500 py-8">Detecting your location...</div>
        )}
        {!loading && error && (
          <div className="text-center text-red-500 py-8">{error}</div>
        )}

        <NearbyHospitalsList userLocation={userLocation} />
      </main>
    </div>
  );
}
