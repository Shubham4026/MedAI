import React, { useState } from "react";

// Interface for the basic hospital data passed as prop
interface Hospital {
  id: string; // Google Place ID
  businessStatus?: string; // Added from Nearby Search API
  icon?: string; // Icon URL from Nearby Search
  iconBackgroundColor?: string; // Icon background color hex
  rating?: number; // Rating from Nearby Search
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Interface for the details fetched on demand
interface HospitalDetails {
  timing?: string;
  formatted_phone_number?: string;
  rating?: number;
  icon?: string; // URL for the icon
  // Add other details fields if needed
}

function checkOpenStatus(timing?: string): boolean {
  // Placeholder logic: always open if timing exists
  if (!timing) return true;
  // TODO: Parse timing and compare with current time
  return true;
}

interface HospitalCardProps {
  hospital: Hospital;
}

const HospitalCard: React.FC<HospitalCardProps> = ({ hospital }) => {
  const [details, setDetails] = useState<HospitalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCardClick = async () => {
    // Don't refetch if already loaded or loading
    if (details || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/place-details/${hospital.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const fetchedDetails: HospitalDetails = await response.json();
      setDetails(fetchedDetails);
    } catch (err: any) {
      console.error("Error fetching hospital details:", err);
      setError(err.message || "Failed to load details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine open status from fetched details, default to false if no details
  const isOpen = details ? checkOpenStatus(details.timing) : false;

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden mb-4 cursor-pointer transition-shadow hover:shadow-md h-full flex flex-col"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${hospital.name}`}
      onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleCardClick() : null}
    >
      <div className="p-4 flex-grow">
        <div className="flex items-center mb-2">
          {/* Display icon from initial Nearby Search data */}
          {hospital.icon && (
            <img src={hospital.icon} alt={`${hospital.name} icon`} className="w-6 h-6 mr-2" />
          )}
          <h3 className="text-lg font-semibold text-gray-800 flex-1 truncate">{hospital.name}</h3>
          {/* Display Business Status */}
          {hospital.businessStatus && (
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold border ${hospital.businessStatus === 'OPERATIONAL' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {hospital.businessStatus.replace('_', ' ')}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-gray-600 text-sm truncate flex-grow mr-2" title={hospital.address}>{hospital.address}</p>
          {/* Display Rating */}
          {hospital.rating && (
            <div className="flex items-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              <span className="text-gray-600 text-sm font-medium">{hospital.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Details Section (Loading/Error/Content) */}
        <div className="mt-2 pt-2 border-t border-gray-100 min-h-[60px"> {/* Added min-height */}
          {isLoading && <p className="text-xs text-gray-400">Loading details...</p>}
          {error && <p className="text-xs text-red-500">Error: {error}</p>}
          {details && (
            <>
              {/* Rating */}
              {details.rating && (
                <div className="flex items-center text-gray-500 text-xs mb-1">
                  <svg className="w-4 h-4 mr-1 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                  <span>{details.rating.toFixed(1)} / 5.0</span>
                </div>
              )}
              {/* Timing Display */}
              <div className="flex items-center text-gray-500 text-xs mb-1">
                <svg className="w-4 h-4 mr-1 text-teal-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                <span>{details.timing || "Timing N/A"}</span>
              </div>
              {/* Phone Number Display */}
              {details.formatted_phone_number && (
                <div className="flex items-center text-gray-500 text-xs mb-1">
                  <svg className="w-4 h-4 mr-1 text-teal-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <span>{details.formatted_phone_number}</span>
                </div>
              )}
              {/* Open/Closed Status based on fetched details */}
              <div className="mt-1">
                {isOpen ? (
                  <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-semibold border border-green-200 flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Open Now
                  </span>
                ) : details.timing !== 'N/A' ? ( // Only show Closed if timing info exists
                  <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                    Closed
                  </span>
                ) : null}
              </div>
            </>
          )}
          {/* Prompt to click if no details yet and not loading/error */}
          {!details && !isLoading && !error && (
            <p className="text-xs text-gray-400 italic">Click to load details</p>
          )}
        </div>
      </div>
      {/* Action Buttons - Fixed at bottom */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex justify-end space-x-2">
        {/* Call Button (conditional) */}
        {details?.formatted_phone_number && (
          <a
            href={`tel:${details.formatted_phone_number}`}
            onClick={(e) => e.stopPropagation()} // Prevent card click
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition"
          >
            <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
            Call
          </a>
        )}

        {/* Directions Button */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()} // Prevent card click
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition"
        >
            <svg className="-ml-0.5 mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
          Directions
        </a>
      </div>
    </div>
  );
};

export default HospitalCard;
