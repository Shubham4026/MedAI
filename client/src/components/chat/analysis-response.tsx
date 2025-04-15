import React from 'react';
import { cn } from "@/lib/utils";
import { Analysis, UrgencyLevel } from "@/lib/types";
import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bolt } from "lucide-react";

interface AnalysisResponseProps {
  message: string;
  analysis: Analysis;
  className?: string;
  followUpQuestion?: string;
}

const urgencyColors: Record<UrgencyLevel, string> = {
  mild: "text-emerald-600 bg-emerald-100",
  moderate: "text-amber-600 bg-amber-100",
  severe: "text-red-600 bg-red-100"
};

const urgencyProgressColors: Record<UrgencyLevel, string> = {
  mild: "bg-emerald-500",
  moderate: "bg-amber-500",
  severe: "bg-red-500"
};

const urgencyProgressWidths: Record<UrgencyLevel, string> = {
  mild: "w-1/4",
  moderate: "w-1/2",
  severe: "w-3/4"
};

export function AnalysisResponse({ message, analysis, className, followUpQuestion }: AnalysisResponseProps) {
  return (
    <div className={cn("flex items-start", className)}>
      <div className="flex-shrink-0">
        <div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center">
          <Bolt className="h-5 w-5 text-primary-600" />
        </div>
      </div>
      <div className="ml-3 max-w-lg w-full">
        <div className="bg-gray-100 rounded-lg px-4 py-3 mb-3">
          <p className="text-gray-800">
            {message}
          </p>
        </div>

        {/* Results Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Urgency Assessment */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-700">Urgency Assessment</h3>
              <span className={cn(
                "ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                urgencyColors[analysis.urgencyLevel]
              )}>
                {analysis.urgencyLevel.charAt(0).toUpperCase() + analysis.urgencyLevel.slice(1)}
              </span>
            </div>
            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full", 
                  urgencyProgressColors[analysis.urgencyLevel],
                  urgencyProgressWidths[analysis.urgencyLevel]
                )} 
              ></div>
            </div>
          </div>

          {/* Potential Conditions */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Potential Conditions</h3>
            <div className="space-y-2">
              {analysis.conditions.map((condition, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800">{condition.name}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {condition.likelihood} Likelihood
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="px-4 py-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Care Suggestions</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  {suggestion.isWarning ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  ) : (
                    <Check className="h-5 w-5 text-emerald-500 mr-2" />
                  )}
                  <span>{suggestion.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* For severe cases, add action buttons */}
          {analysis.urgencyLevel === "moderate" || analysis.urgencyLevel === "severe" ? (
            <div className="px-4 py-3 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Would you like to:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="default" className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Find nearby doctors
                </Button>
                <Button variant="outline" className="flex items-center bg-primary-50">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule telemedicine
                </Button>
              </div>
            </div>
          ) : null}

          {/* Additional Information */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic">
              This information is based on the symptoms you've provided and is not a definitive diagnosis. Your personal medical history may affect these recommendations.
            </p>
          </div>
        </div>

        {/* Follow up question */}
        {followUpQuestion && (
          <div className="bg-gray-100 rounded-lg px-4 py-3 mt-3">
            <p className="text-gray-800">
              {followUpQuestion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
