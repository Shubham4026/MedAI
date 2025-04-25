import React from 'react';
import { Link } from "wouter";
import { Button } from '@/components/ui/button';

export default function VoiceAssistant() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-teal-600">Voice Assistant</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/symptom-checker">
                <Button variant="default" className="bg-teal-600 hover:bg-teal-700">
                  Go to Symptom Checker
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Voice Assistant Coming Soon!</h2>
          <p className="text-gray-600">This page will allow users to interact with the system using their voice.</p>
        </div>
      </main>
    </div>
  );
}
