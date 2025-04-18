import { Button } from "@/components/ui/button";
import { Activity, Heart } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated heartbeat icon */}
        <div className="relative w-32 h-32 mx-auto">
          <Heart 
            className="w-32 h-32 text-teal-200 absolute inset-0 animate-pulse" 
            strokeWidth={1.5} 
          />
          <Activity 
            className="w-32 h-32 text-teal-600 absolute inset-0 animate-bounce" 
            strokeWidth={1.5} 
          />
        </div>

        {/* Error message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-teal-600 relative inline-block">
            <span className="relative z-10">404</span>
            <span className="absolute inset-0 animate-ping opacity-25 text-teal-600">404</span>
          </h1>
          <h2 className="text-2xl font-semibold">Page Flatlined</h2>
          <p className="text-muted-foreground">
            The page you're looking for seems to have lost its vital signs.
            Our AI medical team is working on resuscitation.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/">
            <Button className="space-x-2 bg-teal-600 hover:bg-teal-700">
              <Heart className="w-4 h-4" />
              <span>Return to Homepage</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="space-x-2">
              <Activity className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Medical disclaimer */}
        <p className="text-xs text-muted-foreground mt-8">
          Error Code: 404 - Page Not Found<br />
          If symptoms persist, please contact our support team.
        </p>
      </div>
    </div>
  );
}
