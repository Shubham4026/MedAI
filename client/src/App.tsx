import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import SymptomChecker from "@/pages/symptom-checker";
import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Route as WouterRoute, Redirect } from "wouter";
import { RedirectProvider, useRedirect } from "@/contexts/redirect-context";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, path }) => {
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
    <Switch>
      <WouterRoute path="/" component={LandingPage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/symptom-checker" component={SymptomChecker} />
      <WouterRoute path="/auth" component={AuthPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Add metadata to the document head
  useEffect(() => {
    document.title = "MediAI - AI-Powered Health Assistant";
  }, []);

  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

function App() {
  // Add metadata to the document head
  useEffect(() => {
    document.title = "MediAI - AI-Powered Health Assistant";
    
    // Add favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233B82F6"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
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
