import React from 'react';
import { PackageCreator } from '../components/package-creator/PackageCreator';

export const PackageCreatorPage: React.FC = () => {
  return (
    <div className="site-theme min-h-screen bg-gradient-to-br from-orange-50 via-[#fff8f1] to-amber-50">
      <PackageCreator brandTheme />
    </div>
  );
};

export default PackageCreatorPage;
