import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface HealthProfile {
  id: number;
  userId: number;

  gender?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];

  lastCheckup?: string;
}

export function useProfileCompletion() {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const getProfileCompletion = () => {
    if (!profile) return { percentage: 0, completed: 0, total: 4 };
    const requiredFields = [
      profile.gender,
      profile.height,
      profile.weight,
      profile.bloodType
    ];
    const completed = requiredFields.filter(field => field).length;
    const total = requiredFields.length;
    const percentage = Math.round((completed / total) * 100);
    return { percentage, completed, total };
  };

  return {
    profile,
    loading,
    completion: getProfileCompletion(),
    refresh: fetchProfile
  };
}
