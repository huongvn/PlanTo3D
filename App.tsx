import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonView } from './components/ComparisonView';
import { AppState, ProcessingOptions } from './types';
import { fileToGenerativePart, generate3DView } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Options state
  const [options, setOptions] = useState<ProcessingOptions>({
    style: 'isometric',
    colorScheme: 'pastel'
  });

  const handleImageSelected = (file: File) => {
    setRawFile(file);
    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setGeneratedImage(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!rawFile || !originalImage) return;

    setAppState(AppState.GENERATING);
    setError(null);

    try {
      const base64Data = await fileToGenerativePart(rawFile);
      const mimeType = rawFile.type;

      const resultImage = await generate3DView(base64Data, mimeType, options);
      
      setGeneratedImage(resultImage);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate 3D view. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setRawFile(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              PlanTo3D
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-3">
            Transform 2D Floor Plans to 3D
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your CAD drawing or floor plan image to generate a colorful, easy-to-read isometric 3D visualization instantly.
          </p>
        </div>

        {/* Upload Section */}
        {!originalImage && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <ImageUploader onImageSelected={handleImageSelected} />
            <div className="mt-6">
              <p className="text-xs text-center text-slate-400">
                Supported formats: PNG, JPG, WEBP.
              </p>
            </div>
          </div>
        )}

        {/* Main Interface when image is loaded */}
        {originalImage && (
          <div className="space-y-8 animate-fade-in">
            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">View Style</label>
                    <select 
                      value={options.style}
                      onChange={(e) => setOptions({...options, style: e.target.value as any})}
                      disabled={appState === AppState.GENERATING}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-40 p-2.5"
                    >
                      <option value="isometric">Isometric 3D</option>
                      <option value="top-down">Top-Down 3D</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Color Scheme</label>
                    <select 
                      value={options.colorScheme}
                      onChange={(e) => setOptions({...options, colorScheme: e.target.value as any})}
                      disabled={appState === AppState.GENERATING}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-40 p-2.5"
                    >
                      <option value="pastel">Pastel (Soft)</option>
                      <option value="vibrant">Vibrant (Distinct)</option>
                      <option value="blueprint">Blueprint</option>
                    </select>
                  </div>
               </div>

               <div className="flex gap-3 w-full md:w-auto">
                  <button 
                    onClick={reset}
                    disabled={appState === AppState.GENERATING}
                    className="flex-1 md:flex-none px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-sm transition-colors"
                  >
                    New Upload
                  </button>
                  <button 
                    onClick={handleGenerate}
                    disabled={appState === AppState.GENERATING || appState === AppState.COMPLETE && generatedImage !== null}
                    className={`flex-1 md:flex-none px-6 py-2.5 text-white rounded-lg font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                      appState === AppState.GENERATING 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : appState === AppState.COMPLETE 
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {appState === AppState.GENERATING ? (
                      <>Processing...</>
                    ) : appState === AppState.COMPLETE ? (
                      <>Regenerate</>
                    ) : (
                      <>Generate 3D View</>
                    )}
                  </button>
               </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <ComparisonView 
              originalImage={originalImage} 
              generatedImage={generatedImage} 
              isLoading={appState === AppState.GENERATING} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
