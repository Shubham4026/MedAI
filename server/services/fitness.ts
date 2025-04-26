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

    // Check if token is expired
    if (user.googleTokenExpiry && new Date(user.googleTokenExpiry) < new Date()) {
      if (!user.googleRefreshToken) {
        throw new Error('Google refresh token not found');
      }
      // Token is expired, try to refresh it
      try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: user.googleRefreshToken,
          grant_type: 'refresh_token'
        });

        const { access_token, expires_in } = response.data;
        console.log(access_token,"Access Toekn");
        await storage.updateUser(userId, {
          googleAccessToken: access_token,
          googleTokenExpiry: new Date(Date.now() + expires_in * 1000)
        });

        user.googleAccessToken = access_token;
      } catch (error) {
        console.error('Error refreshing Google token:', error);
        throw new Error('Failed to refresh Google access token');
      }
    }

    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const makeRequest = async (dataType: string) => {
      try {
        console.log(`Making fitness request for ${dataType}`, {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(now).toISOString(),
        });

        const response = await axios({
          method: 'POST',
          url: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
          headers: {
            Authorization: `Bearer ${user.googleAccessToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            aggregateBy: [{
              dataTypeName: dataType,
            }],
            bucketByTime: { durationMillis: 24 * 60 * 60 * 1000 }, // 24 hours
            startTimeMillis: startTime.getTime(),
            endTimeMillis: now.getTime(),
          }
        });

        console.log(`Fitness response for ${dataType}:`, response.data);
        return response;
      } catch (error: any) {
        console.error(`Error fetching ${dataType}:`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    };

    // Get steps data
    const stepsResponse = await makeRequest('com.google.step_count.delta');

    // Get heart rate data
    const heartRateResponse = await makeRequest('com.google.heart_rate.bpm');

    // Get calories data
    const caloriesResponse = await makeRequest('com.google.calories.expended');

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
