import { Activity, Brain, Shield, CheckCircle } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="px-4 md:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-teal-100 px-4 py-1 text-base font-semibold text-teal-700 shadow-sm tracking-wide uppercase mb-2 animate-fade-in">
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg mb-2">
              Everything you need for better health
            </h2>
            <p className="max-w-[700px] text-gray-500 md:text-xl mx-auto font-medium">
              Discover how MediAI empowers you to take control of your health journey with powerful, easy-to-use features.
            </p>
          </div>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <div className="flex flex-col items-center space-y-3 rounded-xl border border-teal-200 p-8 shadow-lg bg-white hover:scale-105 transition-transform duration-200">
            <Activity className="h-14 w-14 text-teal-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">Activity Tracking</h3>
            <p className="text-center text-gray-600 text-lg">
              Track your daily steps, workouts, and overall physical activity.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-xl border border-teal-200 p-8 shadow-lg bg-white hover:scale-105 transition-transform duration-200">
            <Brain className="h-14 w-14 text-teal-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">Mental Wellness</h3>
            <p className="text-center text-gray-600 text-lg">
              Assess your stress levels, sleep quality, and mental health status.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-xl border border-teal-200 p-8 shadow-lg bg-white hover:scale-105 transition-transform duration-200">
            <Shield className="h-14 w-14 text-teal-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">Preventive Care</h3>
            <p className="text-center text-gray-600 text-lg">
              Get personalized recommendations for preventive health measures.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-xl border border-teal-200 p-8 shadow-lg bg-white hover:scale-105 transition-transform duration-200">
            <CheckCircle className="h-14 w-14 text-teal-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">Health Goals</h3>
            <p className="text-center text-gray-600 text-lg">
              Set and track your health and fitness goals with AI assistance.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-3 rounded-xl border border-teal-200 p-8 shadow-lg bg-white hover:scale-105 transition-transform duration-200">
            <Activity className="h-14 w-14 text-teal-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">AI Insights</h3>
            <p className="text-center text-gray-600 text-lg">
              Receive AI-powered insights and recommendations based on your health data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
