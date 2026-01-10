'use client';

import { ArrowLeft } from 'lucide-react';

const GoBackButton = () => {
  return (
    <button
      onClick={() => window.history.back()}
      className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden="true" />
      Go Back
    </button>
  );
};

export default GoBackButton;
