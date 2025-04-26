import { PersonalizedHealthPlan } from "../../../../shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Apple, Dumbbell, HeartPulse, Info, Lightbulb, ShieldCheck, ShieldAlert, Zap, CalendarCheck } from 'lucide-react'; // Updated icons

interface PersonalizedHealthPlanDisplayProps {
  plan: PersonalizedHealthPlan;
}

// Helper for items using 'recommendation' (Diet, Exercise)
const renderRecommendationItem = (item: { recommendation: string; frequency?: string; reasoning: string }, index: number) => (
  <AccordionItem value={`item-${index}`} key={index}>
    <AccordionTrigger className="font-medium text-base">{item.recommendation}</AccordionTrigger>
    <AccordionContent>
      {item.frequency && <p className="text-sm text-gray-600 mb-1"><strong>Frequency:</strong> {item.frequency}</p>}
      <p className="text-gray-700"><strong>Reasoning:</strong> {item.reasoning}</p>
    </AccordionContent>
  </AccordionItem>
);

// Helper for items using 'suggestion' (Preventive Care, Mental Wellness)
const renderSuggestionItem = (item: { suggestion: string; frequency?: string; reasoning: string }, index: number) => (
  <AccordionItem value={`suggestion-item-${index}`} key={index}>
    <AccordionTrigger className="font-medium text-base">{item.suggestion}</AccordionTrigger>
    <AccordionContent>
      {item.frequency && <p className="text-sm text-gray-600 mb-1"><strong>Frequency:</strong> {item.frequency}</p>}
      <p className="text-gray-700"><strong>Reasoning:</strong> {item.reasoning}</p>
    </AccordionContent>
  </AccordionItem>
);

export default function PersonalizedHealthPlanDisplay({ plan }: PersonalizedHealthPlanDisplayProps) {
  return (
    <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto p-1 pr-3"> 
      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-teal-700 flex items-center gap-2">
            <Zap className="h-5 w-5" /> Overall Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{plan.overallSummary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <HeartPulse className="h-5 w-5" /> Key Metrics to Focus On
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-gray-700">
            {plan.keyMetricsFocus.map((metric: string, index: number) => (
              <li key={index}>{metric}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risk Highlights */}
      {plan.riskHighlights && plan.riskHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-700 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Risk Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {plan.riskHighlights.map((item: { risk: string; explanation: string; severity: 'Low' | 'Moderate' | 'High' }, index: number) => (
                <AccordionItem value={`risk-${index}`} key={index}>
                  <AccordionTrigger className={`font-medium text-base ${item.severity === 'High' ? 'text-red-600' : item.severity === 'Moderate' ? 'text-yellow-600' : ''}`}>
                    {item.risk} ({item.severity})
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-700">{item.explanation}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Diet Recommendations */}
      {plan.dietRecommendations && plan.dietRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <Apple className="h-5 w-5" /> Diet Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {plan.dietRecommendations.map(renderRecommendationItem)}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Exercise Recommendations */}
      {plan.exerciseRecommendations && plan.exerciseRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-orange-700 flex items-center gap-2">
              <Dumbbell className="h-5 w-5" /> Exercise Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {plan.exerciseRecommendations.map(renderRecommendationItem)}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Preventive Care */}
      {plan.preventiveCare && plan.preventiveCare.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-cyan-700 flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" /> Preventive Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {plan.preventiveCare.map(renderSuggestionItem)}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Mental Wellness */}
      {plan.mentalWellness && plan.mentalWellness.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-purple-700 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" /> Mental Wellness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {plan.mentalWellness.map(renderSuggestionItem)}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-600 flex items-center gap-2">
            <Info className="h-5 w-5" /> Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{plan.disclaimer}</p>
        </CardContent>
      </Card>
    </div>
  );
}
