import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Activity,
  Ambulance,
  Apple,
  Bell,
  Brain,
  Building2,
  Calendar,
  Heart,
  LogOut,
  MessageSquare,
  Phone,
  Settings,
  Siren,
  TrendingUp,
  User
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useProfileCompletion } from "@/hooks/use-profile-completion";

function ProfileCompletionBanner() {
  const { completion, loading } = useProfileCompletion();
  const [, setLocation] = useLocation();

  if (loading || completion.percentage === 100) return null;

  return (
    <div className="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-teal-600" />
            <p className="text-teal-800">
              Complete your health profile ({completion.completed} of {completion.total} fields) to get personalized recommendations
            </p>
          </div>
          <Button
            onClick={() => setLocation('/profile')}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            size="sm"
          >
            Complete Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth?mode=login");
    }
  }, [user, setLocation]);
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

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner />

      {/* Emergency Floating Action Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 rounded-full bg-red-600 hover:bg-red-700 shadow-lg p-6 group"
            size="icon"
          >
            <div className="relative">
              <Ambulance className="h-6 w-6" />
              <span className="absolute -inset-2 rounded-full border-4 border-red-600 animate-ping opacity-75" />
            </div>
            <span className="sr-only">Call Ambulance</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-4">
              <p>Are you sure you want to call an ambulance?</p>
              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => window.location.href = 'tel:102'}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call 102
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.location.href = 'tel:108'}
                >
                  <Ambulance className="h-4 w-4 mr-2" />
                  Call 108
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Primary Actions */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/symptom-checker">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Symptom Checker</h3>
                      <p className="text-sm text-muted-foreground">Check your symptoms with AI</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Mental Wellness</h3>
                    <p className="text-sm text-muted-foreground">Track your mood and mental health</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Health Metrics</h3>
                    <p className="text-sm text-muted-foreground">Track your health data</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Secondary Actions */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Additional Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Apple className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Diet Plan</h3>
                    <p className="text-sm text-muted-foreground">Personalized nutrition guide</p>
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation('/nearby-hospitals')}
                role="button"
                tabIndex={0}
                onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setLocation('/nearby-hospitals'); }}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-700">Nearby Hospitals</h3>
                    <p className="text-sm text-muted-foreground">Find healthcare facilities</p>
                  </div>
                </div>
              </Card>


            </div>
          </div>

          {/* Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Activity className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last symptom check</p>
                    <p className="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Health score</p>
                    <p className="text-sm text-gray-500">85/100</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Schedule your annual health checkup</p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">2</span>
                  </div>
                  <p className="text-sm text-gray-600">Update your medication list</p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">3</span>
                  </div>
                  <p className="text-sm text-gray-600">Complete your daily wellness check</p>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Insurance Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Insurance</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://www.policybazaar.com/health-insurance/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    Health Insurance Plans
                  </a>
                </li>
                <li>
                  <a href="https://www.policybazaar.com/life-insurance/term-insurance/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    Term Life Insurance
                  </a>
                </li>
                <li>
                  <a href="https://www.policybazaar.com/health-insurance/health-insurance-claim/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    Health Insurance Claims
                  </a>
                </li>
                <li>
                  <a href="https://www.policybazaar.com/health-insurance/health-insurance-premium-calculator/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    Premium Calculator
                  </a>
                </li>
              </ul>
            </div>

            {/* Government Schemes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Government Schemes</h3>
              <ul className="space-y-3">
                <li>
                  <a href="https://pmjay.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    Ayushman Bharat PM-JAY
                  </a>
                </li>
                <li>
                  <a href="https://setu.pmjay.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    PM-JAY Beneficiary Portal
                  </a>
                </li>
                <li>
                  <a href="https://cghs.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    CGHS Portal
                  </a>
                </li>
                <li>
                  <a href="https://nha.gov.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600">
                    National Health Authority
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-teal-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-teal-600">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="text-sm text-gray-600 hover:text-teal-600">
                    Medical Disclaimer
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-gray-600 hover:text-teal-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-600 hover:text-teal-600">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-gray-600 hover:text-teal-600">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} MediAI. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Link href="#" className="text-gray-400 hover:text-teal-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-teal-600">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
