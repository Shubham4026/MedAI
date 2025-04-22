import React from 'react';
import { CheckCircle, Star, Briefcase, Rocket, Activity } from 'lucide-react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Pricing() {
  const [location, setLocation] = useLocation();
  return (
    <>
      {/* Landing page header copy for Pricing page */}
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
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
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
      <div className="min-h-screen w-full bg-gradient-to-br from-teal-100 via-blue-100 to-purple-100 py-10 px-4 flex flex-col items-center">

      <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 animate-fade-in">Choose Your Plan</h1>
      <p className="mb-10 text-lg text-gray-700">Flexible pricing for every stage of your health journey.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl h-full">

        {/* Basic Plan */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 border-gray-100 hover:shadow-2xl transition-shadow min-h-[520px] h-full flex-1">
          <div className="bg-teal-50 p-4 rounded-full mb-4"><Star className="h-8 w-8 text-teal-500" /></div>
          <h2 className="text-xl font-bold mb-2">Basic</h2>
          <span className="text-xs bg-gray-200 text-gray-700 rounded px-2 py-1 mb-2">Free Forever</span>
          <p className="text-3xl font-bold mb-4">Free</p>
          <ul className="mb-6 text-gray-600 space-y-2 flex-1">
            <li className="flex items-center gap-2"><CheckCircle className="text-teal-500 h-5 w-5" /> Symptom Checker</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-teal-500 h-5 w-5" /> Voice Chat</li>
            <li className="flex items-center gap-2 opacity-60"><Briefcase className="h-5 w-5" /> Priority Support</li>
          </ul>
          <div className="mt-auto w-full flex justify-center">
            <button className="bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-2 rounded font-semibold shadow hover:scale-105 transition-transform w-full">Get Started</button>
          </div>
        </div>
        {/* Pro Plan */}
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center border-4 border-primary-500 z-10 animate-glow min-h-[520px] h-full flex-1">
          <div className="absolute -top-4 right-4 bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">Most Popular</div>
          <div className="bg-gradient-to-tr from-yellow-100 to-pink-100 p-4 rounded-full mb-4"><Rocket className="h-8 w-8 text-yellow-500" /></div>
          <h2 className="text-xl font-bold mb-2 text-primary-700">Pro</h2>
          <span className="text-xs bg-primary-100 text-primary-700 rounded px-2 py-1 mb-2">Best Value</span>
          <p className="text-4xl font-extrabold mb-4 text-primary-700">$9<span className="text-base font-normal">/mo</span></p>
          <ul className="mb-6 text-gray-700 space-y-2 flex-1">
            <li className="flex items-center gap-2"><CheckCircle className="text-primary-500 h-5 w-5" /> All Basic Features</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-primary-500 h-5 w-5" /> Unlimited Chats</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-primary-500 h-5 w-5" /> Priority Support</li>
          </ul>
          <div className="mt-auto w-full flex justify-center">
            <button className="bg-gradient-to-r from-yellow-500 to-pink-500 text-white px-8 py-2 rounded font-bold shadow-lg hover:scale-110 transition-transform w-full">Upgrade</button>
          </div>
        </div>
        {/* Enterprise Plan */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 border-purple-300 hover:shadow-2xl transition-shadow min-h-[520px] h-full flex-1">
          <div className="bg-purple-50 p-4 rounded-full mb-4"><Briefcase className="h-8 w-8 text-purple-500" /></div>
          <h2 className="text-xl font-bold mb-2">Enterprise</h2>
          <span className="text-xs bg-purple-100 text-purple-700 rounded px-2 py-1 mb-2">Custom</span>
          <p className="text-3xl font-bold mb-4 text-purple-700">Contact Us</p>
          <ul className="mb-6 text-gray-700 space-y-2 flex-1">
            <li className="flex items-center gap-2"><CheckCircle className="text-purple-500 h-5 w-5" /> All Pro Features</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-purple-500 h-5 w-5" /> Custom Integrations</li>
            <li className="flex items-center gap-2"><CheckCircle className="text-purple-500 h-5 w-5" /> Dedicated Support</li>
          </ul>
          <div className="mt-auto w-full flex justify-center">
            <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-2 rounded font-semibold shadow hover:scale-105 transition-transform w-full">Contact Sales</button>
          </div>
        </div>
      </div>
      </div>
      <footer className="w-full border-t bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-6">
          <span className="text-gray-500 text-sm">© {new Date().getFullYear()} MediAI. All rights reserved.</span>
          <div className="flex gap-6 mt-2 md:mt-0">
            <Link href="/faq" className="text-sm font-medium text-primary-600 hover:underline">FAQ</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
