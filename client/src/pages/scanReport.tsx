import React from 'react';
import Header from '@/components/common/Header'; 

const ScanReport: React.FC = () => {
  return (
    <>
      <Header /> 
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Scan Report</h1>
        {/* Add content for the scan report page here */}
        <p>This page will display the scanned report details.</p>
      </div>
    </>
  );
};

export default ScanReport;
