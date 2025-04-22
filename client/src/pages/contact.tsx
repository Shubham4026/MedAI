import React from 'react';
import { Mail, Phone, MapPin, Activity } from 'lucide-react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Contact() {
  const [location, setLocation] = useLocation();
  return (
    <>
      <header className="border-b">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 md:px-6 w-full">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold">MediAI</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="/pricing" className={`text-sm font-medium hover:underline underline-offset-4 ${location === '/pricing' ? 'font-bold text-primary-600 underline' : ''}`}>
              Pricing
            </Link>
            <Link href="/contact" className={`text-sm font-medium hover:underline underline-offset-4 ${location === '/contact' ? 'font-bold text-primary-600 underline' : ''}`}>
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
            <Button 
              onClick={() => setLocation("/auth?mode=signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600">Contact Us</h1>
        <p className="mb-8 text-gray-700 text-center">We'd love to hear from you! Reach out using the form below or contact us directly.</p>
        <form className="w-full space-y-4">
          <input type="text" placeholder="Your Name" className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" />
          <input type="email" placeholder="Your Email" className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" />
          <textarea placeholder="Your Message" rows={4} className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" />
          <button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded font-semibold shadow hover:scale-105 transition-transform">Send Message</button>
        </form>
        <div className="mt-8 w-full flex flex-col items-center gap-4 text-gray-600">
          <div className="flex items-center gap-2"><Mail className="h-5 w-5" /> support@mediai.com</div>
          <div className="flex items-center gap-2"><Phone className="h-5 w-5" /> +1 (800) 123-4567</div>
          <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /> 123 Health St, Wellness City</div>
        </div>
      </div>
      </div>
    </>
  );
}
