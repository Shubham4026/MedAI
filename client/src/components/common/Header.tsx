import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Activity,
  Bell,
  Calendar,
  LogOut,
  Settings,
  Siren,
  TrendingUp,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const Header = () => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth?mode=login");
        // Optionally force a full page reload if state isn't clearing properly
        // window.location.href = "/auth?mode=login";
      },
      onError: (error) => {
        console.error("Logout failed:", error);
        // Handle logout error (e.g., show a notification)
      },
    });
  };


  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-7 w-7 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">MedAI</span>
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

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-6 w-6 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user ? `${user.firstName} ${user.lastName}` : "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
