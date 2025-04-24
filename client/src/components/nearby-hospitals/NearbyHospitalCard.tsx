interface Hospital {
  id: number;
  name: string;
  address: string;
  distance: string;
  phone: string;
}

export default function NearbyHospitalCard({ hospital }: { hospital: Hospital }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-teal-700">{hospital.name}</h2>
        <p className="text-gray-600">{hospital.address}</p>
        <p className="text-gray-500 text-sm">Distance: {hospital.distance}</p>
      </div>
      <div className="mt-2 md:mt-0">
        <a href={`tel:${hospital.phone}`} className="text-teal-600 underline">
          Call: {hospital.phone}
        </a>
      </div>
    </div>
  );
}
