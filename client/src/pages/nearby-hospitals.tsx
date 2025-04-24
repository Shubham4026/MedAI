import NearbyHospitalsList from "@/components/nearby-hospitals/NearbyHospitalsList";
import { useEffect, useState } from "react";
import { getUserLocation } from "@/utils/geolocation";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, Calendar, Siren, Bell, User, Settings, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";

export default function NearbyHospitalsPage() {
  const [, setLocation] = useLocation();
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUserLocation()
      .then(loc => {
        setUserLocation(loc);
        setLoading(false);
      })
      .catch(err => {
        setError("Unable to get your location. Please enable location services.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="h-7 w-7 text-teal-600" />
              <span className="text-xl font-bold text-teal-600">MediAI</span>
            </Link>
            {/* Right side navigation */}
            <div className="flex items-center space-x-6">
              {/* Quick Access */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="flex items-center space-x-2" title="Book Appointment">
                  <Calendar className="h-6 w-6 text-gray-600" />
                  <span className="hidden sm:inline">Book Appointment</span>
                </Button>
                <Button variant="ghost" className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50" title="Emergency">
                  <Siren className="h-6 w-6" />
                  <span className="hidden sm:inline">Emergency</span>
                </Button>
              </div>
              {/* Notifications */}
              <Button variant="ghost" size="icon" title="Notifications">
                <Bell className="h-6 w-6 text-gray-600" />
              </Button>
              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Profile">
                    <User className="h-6 w-6 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
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
