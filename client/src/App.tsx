import { Switch, Route } from "wouter";
import { useEffect, useState, Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
const NotFound = lazy(() => import("@/pages/not-found"));
const SymptomChecker = lazy(() => import("@/pages/symptom-checker"));
const VoiceAssistant = lazy(() => import("@/pages/voice-assistant"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const LandingPage = lazy(() => import("@/pages/landing"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Profile = lazy(() => import("@/pages/profile"));
const ProfileEdit = lazy(() => import("@/pages/profile-edit"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Contact = lazy(() => import("@/pages/contact"));
const FAQ = lazy(() => import("@/pages/faq"));
const NearbyHospitalsPage = lazy(() => import("@/pages/nearby-hospitals"));
const DietPlan = lazy(() => import("@/pages/DietPlan"));
const HealthMetrics = lazy(() => import("@/pages/health-metrics"));
const FindDrugs = lazy(() => import("@/pages/find-drugs"));
const ScanReport = lazy(() => import("@/pages/scanReport"));

import { HeartPulse } from "lucide-react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Route as WouterRoute, Redirect } from "wouter";
import { RedirectProvider, useRedirect } from "@/contexts/redirect-context";
import { WelcomePopup } from "@/components/welcome/WelcomePopup";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
}) => {
  const { user } = useAuth();
  const { setRedirectPath } = useRedirect();

  if (!user) {
    setRedirectPath(path);
    return <Redirect to="/auth?mode=login" />;
  }

  return <WouterRoute path={path} component={Component} />;
};

function Router() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
          <HeartPulse className="h-16 w-16 text-red-500 animate-heartbeat" />
          <span className="mt-4 text-red-500 font-semibold text-lg">
            Loading...
          </span>
          <style>{`
            @keyframes heartbeat {
              0%, 100% { transform: scale(1); filter: brightness(1); }
              10% { transform: scale(1.12); filter: brightness(1.2); }
              20% { transform: scale(0.95); filter: brightness(0.9); }
              30% { transform: scale(1.08); filter: brightness(1.15); }
              40% { transform: scale(1); filter: brightness(1); }
            }
            .animate-heartbeat {
              animation: heartbeat 1.1s infinite;
              transform-origin: center;
            }
          `}</style>
        </div>
      }
    >
      <Switch>
        <WouterRoute path="/" component={LandingPage} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/symptom-checker" component={SymptomChecker} />
        <ProtectedRoute path="/voice-assistant" component={VoiceAssistant} />
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/profile/edit" component={ProfileEdit} />
        <ProtectedRoute path="/scan-report" component={ScanReport} />
        <WouterRoute path="/pricing" component={Pricing} />
        <WouterRoute path="/contact" component={Contact} />
        <WouterRoute path="/faq" component={FAQ} />
        <WouterRoute path="/nearby-hospitals" component={NearbyHospitalsPage} />
        <WouterRoute path="/auth" component={AuthPage} />
        <WouterRoute path="/diet-plan" component={DietPlan} />
        <WouterRoute path="/health-metrics" component={HealthMetrics} />
        <WouterRoute path="/find-drugs" component={FindDrugs} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  // Add metadata to the document head
  useEffect(() => {
    document.title = "MediAI - AI-Powered Health Assistant";
  }, []);

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate minimal delay for loader (can be removed or adjusted)
    const timeout = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <HeartPulse className="h-16 w-16 text-red-500 animate-heartbeat" />
        <span className="mt-4 text-red-500 font-semibold text-lg">
          Loading...
        </span>
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            10% { transform: scale(1.12); filter: brightness(1.2); }
            20% { transform: scale(0.95); filter: brightness(0.9); }
            30% { transform: scale(1.08); filter: brightness(1.15); }
            40% { transform: scale(1); filter: brightness(1); }
          }
          .animate-heartbeat {
            animation: heartbeat 1.1s infinite;
            transform-origin: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Router />
      <Toaster />
      {user && <WelcomePopup />}
      <PWAInstallPrompt />
    </>
  );
}

function App() {
  // Add metadata to the document head
  useEffect(() => {
    document.title = "MediAI - AI-Powered Health Assistant";

    // Add favicon
    const link = document.createElement("link");
    link.rel = "icon";
    link.href =
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233B82F6"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RedirectProvider>
          <AppContent />
        </RedirectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
