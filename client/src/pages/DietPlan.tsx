import React, { useState, useEffect } from "react";
import { DetailedNutritionPlan } from "../../../shared/schema"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, RefreshCw, UtensilsCrossed, Droplet, Target, Info } from 'lucide-react'; // Icons
import Header from '@/components/common/Header';

const STORAGE_KEY = 'detailedNutritionPlan';

const DietPlan: React.FC = () => {
  // Initialize state from local storage
  const [detailedPlan, setDetailedPlan] = useState<DetailedNutritionPlan | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPlan = localStorage.getItem(STORAGE_KEY);
        return savedPlan ? JSON.parse(savedPlan) : null;
      } catch (error) {
        console.error(`Error reading ${STORAGE_KEY} from local storage:`, error);
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to local storage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (detailedPlan) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(detailedPlan));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error(`Error saving ${STORAGE_KEY} to local storage:`, error);
      }
    }
  }, [detailedPlan]);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    setDetailedPlan(null); // Clear previous plan for regeneration

    try {
      const response = await fetch('/api/nutrition-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth headers if needed, e.g., Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const planData: DetailedNutritionPlan = await response.json();
      setDetailedPlan(planData);

    } catch (err: any) {
      console.error("Error generating detailed nutrition plan:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      // Add a small delay to prevent flash of loading state
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-teal-600" />
              AI Detailed Nutrition Plan
            </CardTitle>
            <CardDescription>
              Generate a personalized nutrition plan based on your health profile.
              Ensure your profile is complete for the best results.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end">
            {isLoading ? (
              <Button disabled size="lg">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </Button>
            ) : detailedPlan ? (
              <Button onClick={handleGeneratePlan} size="lg" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Plan
              </Button>
            ) : (
              <Button onClick={handleGeneratePlan} size="lg">
                Generate Plan
              </Button>
            )}
          </CardFooter>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {detailedPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Nutrition Plan</CardTitle>
              <CardDescription>{detailedPlan.overallGoal}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Targets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-1"><Target className="h-4 w-4" /> Calories</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-xl font-semibold">{detailedPlan.calorieTarget} kcal</p>
                  </CardContent>
                </Card>
                <Card className="p-4 bg-green-50">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-sm font-medium">Macronutrients</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 text-sm">
                    <p>Protein: {detailedPlan.macronutrientTargets.proteinGrams}g</p>
                    <p>Carbs: {detailedPlan.macronutrientTargets.carbohydrateGrams}g</p>
                    <p>Fat: {detailedPlan.macronutrientTargets.fatGrams}g</p>
                  </CardContent>
                </Card>
                <Card className="p-4 bg-teal-50">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-1"><Droplet className="h-4 w-4" /> Hydration</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-xl font-semibold">{detailedPlan.hydrationGoalLiters} Liters</p>
                  </CardContent>
                </Card>
              </div>

              {/* Meal Plan */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Meal Suggestions</h3>
                <div className="space-y-4">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(mealType => (
                    detailedPlan.mealPlan[mealType]?.suggestions?.length > 0 && (
                      <div key={mealType}>
                        <h4 className="font-medium capitalize mb-1">{mealType}</h4>
                        <ul className="list-disc list-inside pl-4 text-sm text-gray-700 space-y-1">
                          {detailedPlan.mealPlan[mealType].suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                        {detailedPlan.mealPlan[mealType].notes && (
                          <p className="text-xs italic text-gray-500 mt-1 pl-4">Note: {detailedPlan.mealPlan[mealType].notes}</p>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Micronutrients & Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailedPlan.keyMicronutrientsFocus?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">Key Micronutrients Focus</h4>
                    <ul className="list-disc list-inside pl-4 text-sm text-gray-700">
                      {detailedPlan.keyMicronutrientsFocus.map((micro, idx) => <li key={idx}>{micro}</li>)}
                    </ul>
                  </div>
                )}
                {detailedPlan.generalAdvice?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-1">General Advice</h4>
                    <ul className="list-disc list-inside pl-4 text-sm text-gray-700 space-y-1">
                      {detailedPlan.generalAdvice.map((advice, idx) => <li key={idx}>{advice}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="font-medium">Disclaimer</AlertTitle>
                <AlertDescription className="text-xs">
                  {detailedPlan.disclaimer}
                </AlertDescription>
              </Alert>

            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default DietPlan;
