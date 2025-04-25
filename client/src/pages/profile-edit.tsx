import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Ruler, Weight, Droplet, Phone, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface HealthProfile {
  id: number;
  userId: number;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  familyHistory?: string[];
  lifestyleHabits?: Record<string, any>;
  dietType?: string;
  dailyCaloricIntake?: number;
  waterIntakeLiters?: number;
  activityLevel?: string;
  exerciseFrequency?: string;
  stepCountAvgDaily?: number;
  stressLevel?: number;
  sleepQuality?: string;
  hoursOfSleep?: number;
  mentalHealthIssues?: string[];
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  bodyTemperature?: number;
  bloodSugarLevel?: number;
  cholesterolLevel?: number;
  nutritionalDeficiencies?: string[];
  recentLabResults?: Record<string, any>;
  vaccinationHistory?: string[];
  screeningsDone?: string[];
  occupationType?: string;
  exposureToPollution?: string;
  socialConnections?: string;
  bmi?: number;
  bmiCategory?: string;
  healthScore?: number;
  riskFlags?: string[];
  lastUpdated?: string;
  // legacy fields
  conditions?: string[];
  emergencyContact?: string;
  lastCheckup?: string;
}

export default function ProfileEdit() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [profile, setProfile] = useState<HealthProfile>({
    id: 0,
    userId: user?.id || 0,
    dateOfBirth: '',
    gender: '',
    height: undefined,
    weight: undefined,
    bloodType: '',
    allergies: [],
    chronicConditions: [],
    medications: [],
    familyHistory: [],
    lifestyleHabits: {},
    dietType: '',
    dailyCaloricIntake: undefined,
    waterIntakeLiters: undefined,
    activityLevel: '',
    exerciseFrequency: '',
    stepCountAvgDaily: undefined,
    stressLevel: undefined,
    sleepQuality: '',
    hoursOfSleep: undefined,
    mentalHealthIssues: [],
    bloodPressure: '',
    heartRate: undefined,
    respiratoryRate: undefined,
    bodyTemperature: undefined,
    bloodSugarLevel: undefined,
    cholesterolLevel: undefined,
    nutritionalDeficiencies: [],
    recentLabResults: {},
    vaccinationHistory: [],
    screeningsDone: [],
    occupationType: '',
    exposureToPollution: '',
    socialConnections: '',
    bmi: undefined,
    bmiCategory: '',
    healthScore: undefined,
    riskFlags: [],
    lastUpdated: '',
    conditions: [],
    emergencyContact: '',
    lastCheckup: ''
  });

  // New item states
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');

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

      if (response.ok) {
        const data = await response.json();
        setProfile(data || {
          id: 0,
          userId: user?.id || 0,
          dateOfBirth: '',
          gender: '',
          height: undefined,
          weight: undefined,
          bloodType: '',
          allergies: [],
          chronicConditions: [],
          medications: [],
          familyHistory: [],
          lifestyleHabits: {},
          dietType: '',
          dailyCaloricIntake: undefined,
          waterIntakeLiters: undefined,
          activityLevel: '',
          exerciseFrequency: '',
          stepCountAvgDaily: undefined,
          stressLevel: undefined,
          sleepQuality: '',
          hoursOfSleep: undefined,
          mentalHealthIssues: [],
          bloodPressure: '',
          heartRate: undefined,
          respiratoryRate: undefined,
          bodyTemperature: undefined,
          bloodSugarLevel: undefined,
          cholesterolLevel: undefined,
          nutritionalDeficiencies: [],
          recentLabResults: {},
          vaccinationHistory: [],
          screeningsDone: [],
          occupationType: '',
          exposureToPollution: '',
          socialConnections: '',
          bmi: undefined,
          bmiCategory: '',
          healthScore: undefined,
          riskFlags: [],
          lastUpdated: '',
          conditions: [],
          emergencyContact: '',
          lastCheckup: ''
        });
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/health-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setLocation('/profile');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Array field handlers
  const addItem = (field: 'allergies' | 'medications' | 'conditions', value: string) => {
    if (!value.trim()) return;
    setProfile(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
  };

  const removeItem = (field: 'allergies' | 'medications' | 'conditions', index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-teal-600">
          <Calendar className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-gray-100"
                onClick={() => setLocation('/profile')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-xl font-bold text-teal-600">Edit Profile</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profile.gender || ''}
                  onValueChange={value => setProfile(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Health Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Health Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height || ''}
                  onChange={e => setProfile(prev => ({ ...prev, height: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight || ''}
                  onChange={e => setProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={profile.bloodType || ''}
                  onValueChange={value => setProfile(prev => ({ ...prev, bloodType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastCheckup">Last Checkup</Label>
                <Input
                  id="lastCheckup"
                  type="date"
                  value={profile.lastCheckup || ''}
                  onChange={e => setProfile(prev => ({ ...prev, lastCheckup: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          {/* Medical History */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Medical History</h2>
            <div className="space-y-6">
              {/* Allergies */}
              <div className="space-y-2">
                <Label>Allergies</Label>
                <div className="flex gap-2">
                  <Input
                    value={newAllergy}
                    onChange={e => setNewAllergy(e.target.value)}
                    placeholder="Add allergy"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      addItem('allergies', newAllergy);
                      setNewAllergy('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.allergies?.map((allergy, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {allergy}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => removeItem('allergies', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-2">
                <Label>Current Medications</Label>
                <div className="flex gap-2">
                  <Input
                    value={newMedication}
                    onChange={e => setNewMedication(e.target.value)}
                    placeholder="Add medication"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      addItem('medications', newMedication);
                      setNewMedication('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.medications?.map((medication, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {medication}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => removeItem('medications', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value)}
                    placeholder="Add condition"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      addItem('conditions', newCondition);
                      setNewCondition('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.conditions?.map((condition, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {condition}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-transparent"
                        onClick={() => removeItem('conditions', index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* --- NEW FIELDS FROM SCHEMA --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Lifestyle & Diet */}
                <div>
                  <Label>Diet Type</Label>
                  <Input value={profile.dietType || ''} onChange={e => setProfile(p => ({...p, dietType: e.target.value}))} placeholder="e.g. Vegetarian, Vegan, etc." />
                  <Label className="mt-2">Daily Caloric Intake</Label>
                  <Input type="number" value={profile.dailyCaloricIntake || ''} onChange={e => setProfile(p => ({...p, dailyCaloricIntake: Number(e.target.value)}))} placeholder="Calories" />
                  <Label className="mt-2">Water Intake (liters)</Label>
                  <Input type="number" value={profile.waterIntakeLiters || ''} onChange={e => setProfile(p => ({...p, waterIntakeLiters: Number(e.target.value)}))} placeholder="Liters" />
                  <Label className="mt-2">Activity Level</Label>
                  <Input value={profile.activityLevel || ''} onChange={e => setProfile(p => ({...p, activityLevel: e.target.value}))} placeholder="e.g. Sedentary, Active" />
                  <Label className="mt-2">Exercise Frequency</Label>
                  <Input value={profile.exerciseFrequency || ''} onChange={e => setProfile(p => ({...p, exerciseFrequency: e.target.value}))} placeholder="e.g. 3x/week" />
                  <Label className="mt-2">Step Count (Avg Daily)</Label>
                  <Input type="number" value={profile.stepCountAvgDaily || ''} onChange={e => setProfile(p => ({...p, stepCountAvgDaily: Number(e.target.value)}))} placeholder="Steps" />
                </div>
                {/* Vitals & Biometrics */}
                <div>
                  <Label>Blood Pressure</Label>
                  <Input value={profile.bloodPressure || ''} onChange={e => setProfile(p => ({...p, bloodPressure: e.target.value}))} placeholder="e.g. 120/80" />
                  <Label className="mt-2">Heart Rate</Label>
                  <Input type="number" value={profile.heartRate || ''} onChange={e => setProfile(p => ({...p, heartRate: Number(e.target.value)}))} placeholder="bpm" />
                  <Label className="mt-2">Respiratory Rate</Label>
                  <Input type="number" value={profile.respiratoryRate || ''} onChange={e => setProfile(p => ({...p, respiratoryRate: Number(e.target.value)}))} placeholder="breaths/min" />
                  <Label className="mt-2">Body Temperature (°C)</Label>
                  <Input type="number" value={profile.bodyTemperature || ''} onChange={e => setProfile(p => ({...p, bodyTemperature: Number(e.target.value)}))} placeholder="°C" />
                  <Label className="mt-2">Blood Sugar Level</Label>
                  <Input type="number" value={profile.bloodSugarLevel || ''} onChange={e => setProfile(p => ({...p, bloodSugarLevel: Number(e.target.value)}))} placeholder="mg/dL" />
                  <Label className="mt-2">Cholesterol Level</Label>
                  <Input type="number" value={profile.cholesterolLevel || ''} onChange={e => setProfile(p => ({...p, cholesterolLevel: Number(e.target.value)}))} placeholder="mg/dL" />
                </div>
              </div>

              {/* Mental Health & Sleep */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <Label>Stress Level (1-10)</Label>
                  <Input type="number" value={profile.stressLevel || ''} min={1} max={10} onChange={e => setProfile(p => ({...p, stressLevel: Number(e.target.value)}))} placeholder="1-10" />
                  <Label className="mt-2">Sleep Quality</Label>
                  <Input value={profile.sleepQuality || ''} onChange={e => setProfile(p => ({...p, sleepQuality: e.target.value}))} placeholder="e.g. Good, Poor" />
                  <Label className="mt-2">Hours of Sleep</Label>
                  <Input type="number" value={profile.hoursOfSleep || ''} onChange={e => setProfile(p => ({...p, hoursOfSleep: Number(e.target.value)}))} placeholder="Hours" />
                </div>
                <div>
                  <Label>Mental Health Issues (comma separated)</Label>
                  <Input value={(profile.mentalHealthIssues || []).join(', ')} onChange={e => setProfile(p => ({...p, mentalHealthIssues: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="e.g. Anxiety, Depression" />
                </div>
              </div>

              {/* Environmental & Social */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <Label>Occupation Type</Label>
                  <Input value={profile.occupationType || ''} onChange={e => setProfile(p => ({...p, occupationType: e.target.value}))} placeholder="e.g. Office, Field" />
                  <Label className="mt-2">Exposure to Pollution</Label>
                  <Input value={profile.exposureToPollution || ''} onChange={e => setProfile(p => ({...p, exposureToPollution: e.target.value}))} placeholder="e.g. High, Low" />
                  <Label className="mt-2">Social Connections</Label>
                  <Input value={profile.socialConnections || ''} onChange={e => setProfile(p => ({...p, socialConnections: e.target.value}))} placeholder="e.g. Strong, Weak" />
                </div>
                <div>
                  <Label>Vaccination History (comma separated)</Label>
                  <Input value={(profile.vaccinationHistory || []).join(', ')} onChange={e => setProfile(p => ({...p, vaccinationHistory: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="e.g. COVID-19, Tetanus" />
                  <Label className="mt-2">Screenings Done (comma separated)</Label>
                  <Input value={(profile.screeningsDone || []).join(', ')} onChange={e => setProfile(p => ({...p, screeningsDone: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="e.g. Mammogram, Colonoscopy" />
                </div>
              </div>

              {/* Derived/Calculated Fields (read-only or optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <Label>BMI</Label>
                  <Input type="number" value={profile.bmi || ''} onChange={e => setProfile(p => ({...p, bmi: Number(e.target.value)}))} placeholder="Auto or manual" />
                  <Label className="mt-2">BMI Category</Label>
                  <Input value={profile.bmiCategory || ''} onChange={e => setProfile(p => ({...p, bmiCategory: e.target.value}))} placeholder="e.g. Normal, Overweight" />
                  <Label className="mt-2">Health Score</Label>
                  <Input type="number" value={profile.healthScore || ''} onChange={e => setProfile(p => ({...p, healthScore: Number(e.target.value)}))} placeholder="Auto or manual" />
                  <Label className="mt-2">Risk Flags (comma separated)</Label>
                  <Input value={(profile.riskFlags || []).join(', ')} onChange={e => setProfile(p => ({...p, riskFlags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="e.g. High BP, Diabetes" />
                </div>
                <div>
                  <Label>Nutritional Deficiencies (comma separated)</Label>
                  <Input value={(profile.nutritionalDeficiencies || []).join(', ')} onChange={e => setProfile(p => ({...p, nutritionalDeficiencies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="e.g. Vitamin D, Iron" />
                  <Label className="mt-2">Recent Lab Results (JSON)</Label>
                  <Textarea value={JSON.stringify(profile.recentLabResults || {}, null, 2)} onChange={e => {
                    try {
                      setProfile(p => ({...p, recentLabResults: JSON.parse(e.target.value)}));
                    } catch {}
                  }} placeholder='{"glucose": 95, "cholesterol": 180}' />
                </div>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
