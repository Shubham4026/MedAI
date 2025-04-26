import React from "react";

export type HospitalSpecialty = 'pediatric' | 'ortho' | 'heart' | 'general';

const specialties: HospitalSpecialty[] = ['general', 'pediatric', 'ortho', 'heart'];

interface FilterBarProps {
  filters: { specialty: HospitalSpecialty, radius: number };
  onChange: (filters: Partial<{ specialty: HospitalSpecialty, radius: number }>) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange }) => (
  <div className="flex gap-4 p-4 bg-gray-50 rounded-md mb-4 items-end">
    <div>
      <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
        Specialty
      </label>
      <select
        id="specialty"
        value={filters.specialty}
        onChange={e => onChange({ specialty: e.target.value as HospitalSpecialty })}
        className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
      >
        {specialties.map(s => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
    </div>
  </div>
);

export default FilterBar;
