import React from "react";
import { Activity } from 'lucide-react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const faqs = [
  {
    question: "What is MediAI?",
    answer: "MediAI is an AI-powered health assistant that helps you monitor your health, get personalized insights, and achieve wellness goals."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption and never share your data without your consent."
  },
  {
    question: "How do I upgrade my plan?",
    answer: "You can upgrade your plan anytime from the Pricing page or your account settings."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time with no hidden fees."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach out via the Contact page or email us at support@mediai.com."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = React.useState(0);
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
            <Link href="/faq" className={`text-sm font-medium hover:underline underline-offset-4 ${location === '/faq' ? 'font-bold text-primary-600 underline' : ''}`}>
              FAQ
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
          <h1 className="text-3xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600">Frequently Asked Questions</h1>
        <div className="w-full divide-y">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className={
                  `w-full flex justify-between items-center py-4 font-semibold text-lg focus:outline-none transition-colors ` +
                  (openIndex === i ? 'text-primary-600' : 'text-gray-900 hover:text-primary-600')
                }
                aria-expanded={openIndex === i}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              >
                <span>{faq.question}</span>
                <svg className={`h-5 w-5 ml-2 transform transition-transform ${openIndex === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div
                id={`faq-panel-${i}`}
                className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                style={{}}
                aria-hidden={openIndex !== i}
              >
                <div className="text-gray-700 pb-4 pl-1 pr-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
