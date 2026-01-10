import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { generateEditedImage } from './services/geminiService';
import { HAIRSTYLE_PRESETS } from './constants';
import { ImageFile, GenerationStatus } from './types';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!sourceImage) {
      setErrorMessage("Please upload a photo of yourself first.");
      return;
    }
    
    if (!customPrompt && !selectedPresetId && !styleImage) {
      setErrorMessage("Please select a style, upload a target look, or enter a prompt.");
      return;
    }

    setStatus('generating');
    setErrorMessage(null);
    setResultImage(null);

    try {
      // Construct prompt based on available inputs
      let finalPrompt = "";
      
      if (styleImage) {
        finalPrompt += "Transfer the hairstyle from the second image to the person in the first image. ";
      } else if (selectedPresetId) {
        const preset = HAIRSTYLE_PRESETS.find(p => p.id === selectedPresetId);
        if (preset) {
          finalPrompt += `Change the hairstyle of the person in the image to a ${preset.name} (${preset.description}). `;
        }
      } else {
        finalPrompt += "Edit the hairstyle in the image. ";
      }

      if (customPrompt) {
        finalPrompt += `Additional instructions: ${customPrompt}`;
      }
      
      finalPrompt += " Ensure the result is photorealistic and maintains the person's identity.";

      const generatedImageUrl = await generateEditedImage(
        sourceImage.base64,
        sourceImage.mimeType,
        finalPrompt,
        styleImage?.base64,
        styleImage?.mimeType
      );

      setResultImage(generatedImageUrl);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'hairstyle-magic-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 text-white selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
               <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">HairStyle Magic</h1>
               <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash Image</p>
            </div>
          </div>
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</a>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            
            <section className="space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl">
                 <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">1</span>
                    Upload Your Photo
                 </h2>
                 <ImageUploader 
                    label="Primary Photo" 
                    image={sourceImage} 
                    onImageChange={setSourceImage}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                 />
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl">
                 <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">2</span>
                    Choose Style Source
                 </h2>
                 
                 {/* Tabs or Toggle for Style Source */}
                 <div className="space-y-6">
                   <div>
                     <p className="text-sm text-slate-400 mb-3">Option A: Select a Preset</p>
                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {HAIRSTYLE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setSelectedPresetId(selectedPresetId === preset.id ? null : preset.id);
                              setStyleImage(null); // Clear style image if preset selected
                            }}
                            className={`relative group p-2 rounded-xl text-left transition-all border ${
                              selectedPresetId === preset.id 
                                ? 'bg-indigo-600 border-indigo-500 ring-2 ring-indigo-400/30' 
                                : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-700'
                            }`}
                          >
                             <div className={`w-full h-8 ${preset.previewColor} rounded-lg mb-2 opacity-80`}></div>
                             <span className="block text-xs font-medium truncate">{preset.name}</span>
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-800"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-slate-900 px-2 text-xs text-slate-500 uppercase">OR</span>
                      </div>
                   </div>

                   <div>
                      <p className="text-sm text-slate-400 mb-3">Option B: Upload Reference Photo</p>
                      <ImageUploader 
                        label="Target Hairstyle (Optional)" 
                        image={styleImage} 
                        onImageChange={(img) => {
                            setStyleImage(img);
                            if (img) setSelectedPresetId(null); // Clear preset if image uploaded
                        }}
                      />
                   </div>
                 </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 shadow-xl">
                 <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold">3</span>
                    Custom Instructions
                 </h2>
                 <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder='E.g., "Make the hair bright pink", "Add a floral headband", "Make it look windblown"'
                    className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-white min-h-[100px] resize-none"
                 />
              </div>

              <button
                onClick={handleGenerate}
                disabled={status === 'generating' || !sourceImage}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2
                  ${status === 'generating' 
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                    : !sourceImage 
                        ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-indigo-500/25 text-white'
                  }`}
              >
                {status === 'generating' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Designing Hairstyle...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Makeover
                    </>
                )}
              </button>

               {errorMessage && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {errorMessage}
                  </div>
               )}

            </section>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7 h-full flex flex-col">
             <div className="flex-1 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-2 relative min-h-[500px] flex flex-col">
                <div className="absolute top-4 left-4 z-10">
                    <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur text-xs font-medium text-slate-300 border border-white/10">
                        Preview
                    </div>
                </div>

                <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                    {resultImage ? (
                        <img 
                          src={resultImage} 
                          alt="Generated Hairstyle" 
                          className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-center p-8 max-w-md">
                            {status === 'generating' ? (
                                <div className="space-y-4">
                                   <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                                   <p className="text-slate-300 text-lg font-medium animate-pulse">Gemini is styling your hair...</p>
                                   <p className="text-slate-500 text-sm">This usually takes about 5-10 seconds.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 opacity-50">
                                    <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-400">Your masterpiece will appear here</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Toolbar */}
                <div className="mt-2 p-2 bg-slate-800/50 rounded-xl border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {status === 'success' && (
                             <span className="text-green-400 text-sm flex items-center gap-1 font-medium px-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Generated Successfully
                             </span>
                        )}
                    </div>
                    <div>
                        <button
                          onClick={handleDownload}
                          disabled={!resultImage}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                            ${resultImage 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/20' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                           </svg>
                           Download
                        </button>
                    </div>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
