import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Activity, ArrowLeft, User, Mail, Phone, Calendar, Weight, Ruler, Droplet, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface HealthProfile {
  id: number;
  userId: number;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContact?: string;
  lastCheckup?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLocation("/auth?mode=login");
      return;
    }

    fetchProfile();
  }, [user, setLocation]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/health-profile', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">
          <Activity className="h-8 w-8 text-teal-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-gray-100"
                onClick={() => setLocation('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-7 w-7 text-teal-600" />
                <span className="text-xl font-bold text-teal-600">Profile</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user ? `${user.firstName} ${user.lastName}` : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{profile?.dateOfBirth || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{profile?.gender || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Health Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Health Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Ruler className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">{profile?.height ? `${profile.height} cm` : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Weight className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{profile?.weight ? `${profile.weight} kg` : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Droplet className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="font-medium">{profile?.bloodType || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Checkup</p>
                  <p className="font-medium">{profile?.lastCheckup || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Medical History */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Medical History</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Allergies</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.allergies?.length ? (
                    profile.allergies.map((allergy, index) => (
                      <span key={index} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-600">No allergies recorded</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Medications</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.medications?.length ? (
                    profile.medications.map((medication, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {medication}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-600">No medications recorded</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Medical Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {profile?.conditions?.length ? (
                    profile.conditions.map((condition, index) => (
                      <span key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm">
                        {condition}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-600">No conditions recorded</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Emergency Contact</h2>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Emergency Contact Number</p>
                <p className="font-medium">{profile?.emergencyContact || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          {/* Edit Button */}
          <div className="flex justify-end">
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => setLocation('/profile/edit')}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
