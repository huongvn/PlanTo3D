import React from 'react';

interface ComparisonViewProps {
  originalImage: string;
  generatedImage: string | null;
  isLoading: boolean;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ originalImage, generatedImage, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
      {/* Original Image */}
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Original 2D Plan</h3>
        <div className="relative group rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 aspect-[4/3]">
          <img 
            src={originalImage} 
            alt="Original Floor Plan" 
            className="w-full h-full object-contain p-2"
          />
        </div>
      </div>

      {/* Generated Image */}
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-3">3D Visualization</h3>
        <div className="relative rounded-xl overflow-hidden bg-white shadow-md border border-indigo-100 aspect-[4/3] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center p-8 text-center animate-pulse">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">Generating 3D Model...</p>
              <p className="text-slate-400 text-sm mt-2">Analyzing zones and applying textures</p>
            </div>
          ) : generatedImage ? (
            <img 
              src={generatedImage} 
              alt="Generated 3D Plan" 
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <div className="text-slate-400 text-sm italic">
              Waiting for generation...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
