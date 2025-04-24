import React from "react";

interface Hospital {
  name: string;
  address: string;
  timing?: string;
  specialties?: string[];
  lat: number;
  lng: number;
}

function checkOpenStatus(timing?: string): boolean {
  // Placeholder logic: always open if timing exists
  if (!timing) return true;
  // TODO: Parse timing and compare with current time
  return true;
}

const HospitalCard = ({ hospital }: { hospital: Hospital }) => {
  const isOpen = checkOpenStatus(hospital.timing);

  return (
    <div className="relative flex flex-col h-full rounded-2xl shadow-xl mb-6 overflow-hidden border border-gray-100 bg-white hover:shadow-2xl transition-shadow duration-200">
      {/* Gradient header with hospital icon */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-400 to-teal-300 px-6 py-4 flex items-center gap-3">
        <div className="bg-white rounded-full p-2 shadow flex items-center justify-center">
          <svg className="w-7 h-7 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 21V9h6v12"/><path d="M12 12v3"/><path d="M10.5 13.5h3"/></svg>
        </div>
        <span className="text-lg sm:text-xl font-bold text-white drop-shadow-lg flex-1 truncate">{hospital.name}</span>
      </div>
      <div className="flex-1 flex flex-col p-6 gap-2 bg-white">
        {hospital.specialties && hospital.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {hospital.specialties.map(s => (
              <span key={s} className="bg-teal-50 border border-teal-200 text-teal-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center text-gray-600 text-sm">
          <svg className="w-4 h-4 mr-1 text-teal-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
          <span className="truncate">{hospital.address}</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs">
          <svg className="w-4 h-4 mr-1 text-teal-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
          <span>{hospital.timing || "Timing N/A"}</span>
        </div>
        <div className="mt-1">
          {isOpen ? (
            <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-semibold border border-green-200 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Status: Open
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Status: Closed
            </span>
          )}
        </div>
        <button
          className="mt-4 w-full py-2 px-4 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold shadow hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition"
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`;
            window.open(url, '_blank');
          }}
        >
          Get Directions
        </button>
      </div>
    </div>
  );
};

export default HospitalCard;
