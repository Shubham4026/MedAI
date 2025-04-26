import axios from 'axios';
import { storage } from '../storage';

interface FitnessData {
  steps: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  calories: number;
  activeMinutes: number;
}

export async function getFitnessData(userId: number): Promise<FitnessData> {
  try {
    const user = await storage.getUser(userId);
    if (!user?.googleAccessToken) {
      throw new Error('Google access token not found');
    }

    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    // Get steps data
    const stepsResponse = await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      headers: {
        Authorization: `Bearer ${user.googleAccessToken}`,
      },
      params: {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta',
        }],
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime(),
      },
    });

    // Get heart rate data
    const heartRateResponse = await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      headers: {
        Authorization: `Bearer ${user.googleAccessToken}`,
      },
      params: {
        aggregateBy: [{
          dataTypeName: 'com.google.heart_rate.bpm',
        }],
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime(),
      },
    });

    // Get calories data
    const caloriesResponse = await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      headers: {
        Authorization: `Bearer ${user.googleAccessToken}`,
      },
      params: {
        aggregateBy: [{
          dataTypeName: 'com.google.calories.expended',
        }],
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime(),
      },
    });

    // Process and return the data
    const steps = stepsResponse.data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
    const heartRatePoints = heartRateResponse.data.bucket[0]?.dataset[0]?.point || [];
    const calories = caloriesResponse.data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.fpVal || 0;

    // Calculate heart rate stats
    let minHR = Infinity;
    let maxHR = -Infinity;
    let totalHR = 0;
    let count = 0;

    heartRatePoints.forEach((point: any) => {
      const hr = point.value[0]?.fpVal;
      if (hr) {
        minHR = Math.min(minHR, hr);
        maxHR = Math.max(maxHR, hr);
        totalHR += hr;
        count++;
      }
    });

    return {
      steps,
      heartRate: {
        average: count > 0 ? Math.round(totalHR / count) : 0,
        min: minHR === Infinity ? 0 : Math.round(minHR),
        max: maxHR === -Infinity ? 0 : Math.round(maxHR),
      },
      calories: Math.round(calories),
      activeMinutes: Math.round(steps / 100), // Rough estimate based on steps
    };
  } catch (error) {
    console.error('Error fetching fitness data:', error);
    throw error;
  }
}
