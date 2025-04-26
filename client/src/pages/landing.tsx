import { useEffect } from "react";
import { Link } from "wouter";
import Features from "@/components/features";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Testimonial from "@/components/testimonial";
import { Activity, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [setLocation, user]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6 w-full">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold">MediAI</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Contact
            </Link>
          </nav>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/auth?mode=login")}
            >
              Log In
            </Button>

            <button
              onClick={() => setLocation("/auth?mode=signup")}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-11 rounded-md px-8 bg-teal-600 hover:bg-teal-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-teal-50">
          <div className="px-4 md:px-6 max-w-7xl mx-auto w-full">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your AI Health Assistant
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    MediAI uses advanced artificial intelligence to monitor your
                    health, provide personalized insights, and help you achieve
                    your wellness goals.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={() => setLocation("/auth?mode=signup")}
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="/#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-[550px] h-[550px] rounded-lg overflow-hidden shadow-xl">
                  <img
                    src="/assets/Medi_ai_assistant.png"
                    alt="MediAI Health Assistant"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback in case the image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src =
                        "https://d2jx2rerrg6sh3.cloudfront.net/images/Article_Images/ImageForArticle_24532_17066301121638048.jpg";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Features />
        <Testimonial />

        {/* Nearby Hospitals Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="px-4 md:px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Nearby Hospitals
              </h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl mb-4">
                Find hospitals close to your location for quick access to
                healthcare.
              </p>
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => setLocation("/nearby-hospitals")}
              >
                View Nearby Hospitals
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-600 text-white">
          <div className="px-4 md:px-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to transform your health?
                </h2>
                <p className="max-w-[700px] text-teal-50 md:text-xl">
                  Join thousands of users who have already improved their health
                  with MediAI.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="bg-white text-teal-600 hover:bg-teal-50"
                  >
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-6">
          <span className="text-gray-500 text-sm">
            © {new Date().getFullYear()} MediAI. All rights reserved.
          </span>
          <div className="flex gap-6 mt-2 md:mt-0">
            <Link
              href="/faq"
              className="text-sm font-medium text-primary-600 hover:underline"
            >
              FAQ
            </Link>
          </div>
        </div>
      </footer>
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 py-8 md:py-12 px-4 md:px-6 w-full">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:gap-12">
            <div className="flex flex-col gap-3">
              <Link href="/" className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-teal-600" />
                <span className="text-xl font-bold">MediAI</span>
              </Link>
              <p className="text-sm text-gray-500 max-w-[400px]">
                MediAI is an AI-powered virtual health assistant that helps you
                monitor your health, provides personalized insights, and helps
                you achieve your wellness goals.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
              <div className="flex flex-col gap-3">
                <div className="font-medium">Product</div>
                <nav className="flex flex-col gap-2">
                  <Link href="/#features" className="text-sm hover:underline">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-sm hover:underline">
                    Pricing
                  </Link>
                  <Link href="/faq" className="text-sm hover:underline">
                    FAQ
                  </Link>
                </nav>
              </div>
              <div className="flex flex-col gap-3">
                <div className="font-medium">Company</div>
                <nav className="flex flex-col gap-2">
                  <Link href="/about" className="text-sm hover:underline">
                    About
                  </Link>
                  <Link href="/blog" className="text-sm hover:underline">
                    Blog
                  </Link>
                  <Link href="/careers" className="text-sm hover:underline">
                    Careers
                  </Link>
                </nav>
              </div>
              <div className="flex flex-col gap-3">
                <div className="font-medium">Legal</div>
                <nav className="flex flex-col gap-2">
                  <Link href="/privacy" className="text-sm hover:underline">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-sm hover:underline">
                    Terms of Service
                  </Link>
                  <Link href="/cookies" className="text-sm hover:underline">
                    Cookie Policy
                  </Link>
                </nav>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} MediAI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-teal-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
