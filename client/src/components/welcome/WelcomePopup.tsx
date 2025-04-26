import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Show popup when component mounts
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setIsOpen(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  const handleGoToSymptomChecker = () => {
    setIsOpen(false);
    setLocation('/symptom-checker');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to MedAI!</DialogTitle>
          <DialogDescription>
            Get started with our Symptom Checker - your first step towards understanding your health concerns.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-600">
            Our AI-powered Symptom Checker helps you:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Analyze your symptoms quickly</li>
            <li>Get personalized health insights</li>
            <li>Receive guidance on next steps</li>
          </ul>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleGoToSymptomChecker}>
            Try Symptom Checker
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
