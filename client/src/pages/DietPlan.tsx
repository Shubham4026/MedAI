import React from "react";

const DietPlan: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-teal-700">Diet Plan</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4 text-gray-700">Here you can display personalized diet plans, nutrition advice, or meal schedules for users.</p>
        {/* Add more diet plan content here */}
      </div>
    </div>
  );
};

export default DietPlan;
