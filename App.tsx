import React, { useState, useEffect, useCallback } from 'react';
import { CustomizationOptions, ImageFile, LightingStyle, CameraPerspective } from './types';
import { generateImage, analyzeStyleImage } from './services/geminiService';
import CustomizationPanel from './components/CustomizationPanel';
import ImageWorkspace from './components/ImageWorkspace';
import PromptEditor from './components/PromptEditor';
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES } from './constants';

const LIGHTING_DESCRIPTIONS: Record<LightingStyle, string> = {
  'Natural Light': "Bathed in soft, diffused natural light, creating a clean, airy, and authentic feel. Emphasize realistic highlights and gentle shadows.",
  'Studio Light': "Lit with a professional multi-point studio setup. Use a key light, fill light, and rim light to sculpt the product's form, create depth, and produce crisp, clean highlights. The background should be seamless and evenly lit.",
  'Golden Hour': "Illuminated by the warm, soft, and directional light of the golden hour (just after sunrise or before sunset). The scene should have long, soft shadows and a warm, inviting color palette.",
  'Blue Hour': "Captured during the blue hour (the period of twilight in the morning or evening). The light should be cool, soft, and diffused, creating a serene and moody atmosphere with a predominantly blue color cast.",
  'Cinematic': "Use dramatic, moody lighting with high contrast, similar to a film still. Emphasize texture and shape with creative use of light and shadow. Consider using color gels for a stylized effect.",
  'Dramatic': "Characterized by high contrast and strong, hard light (chiaroscuro). Use deep shadows to create a sense of mystery, power, and intensity, focusing attention on specific parts of the product.",
};

const CAMERA_PERSPECTIVE_DESCRIPTIONS: Record<CameraPerspective, string> = {
  'Front View': "A direct, head-on shot from the front, perfectly centered. This perspective should clearly display the product's primary face and branding in a straightforward manner.",
  'Top View': "A bird's-eye view, shot directly from above (a flat lay or knolling perspective). This is ideal for showcasing the product's shape, layout, or components on a flat surface.",
  'Side View': "A profile shot taken directly from the side. This perspective is used to highlight the product's silhouette, thickness, and details not visible from the front.",
  '45° Angle': "An isometric or three-quarter view, shot from a 45-degree angle from the front and side. This popular perspective provides a sense of depth and dimension, showing multiple sides of the product at once.",
  'Close-up': "A tight shot focusing on a specific, interesting detail of the product. This should highlight its material, texture, craftsmanship, or a key feature with a shallow depth of field.",
  'Macro Shot': "An extreme close-up view that reveals intricate details not visible to the naked eye. This perspective should magnify textures, patterns, and minuscule components, emphasizing the product's quality and precision.",
};


function App() {
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageFile | null>(null);
  
  const [styleDescription, setStyleDescription] = useState<string | null>(null);
  const [isAnalyzingStyle, setIsAnalyzingStyle] = useState<boolean>(false);

  const [options, setOptions] = useState<CustomizationOptions>({
    lightingStyle: LIGHTING_STYLES[0].value,
    cameraPerspective: CAMERA_PERSPECTIVES[0].value,
  });

  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (styleImage) {
      const getStyleDescription = async () => {
        setIsAnalyzingStyle(true);
        setError(null);
        try {
          const description = await analyzeStyleImage(styleImage);
          setStyleDescription(description);
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "Could not analyze the style image.");
          setStyleDescription(null);
        } finally {
          setIsAnalyzingStyle(false);
        }
      };
      getStyleDescription();
    } else {
      setStyleDescription(null);
    }
  }, [styleImage]);


  useEffect(() => {
    const generateNewPrompt = () => {
      if (!productImage) {
        setPrompt('');
        return;
      }

      const lightingDesc = LIGHTING_DESCRIPTIONS[options.lightingStyle];
      const perspectiveDesc = CAMERA_PERSPECTIVE_DESCRIPTIONS[options.cameraPerspective];

      let newPrompt = `Generate a high-resolution, professional product photograph of the subject in the provided image.

Key requirements:
- **Lighting**: ${lightingDesc}
- **Camera Perspective**: ${perspectiveDesc}
- **Background**: The background should be clean, non-distracting, and complementary to the product. A subtle, high-end studio setting is preferred, unless the lighting or style suggests otherwise.
- **Overall Mood**: The image should feel premium, clean, and aspirational. Focus on photorealism and fine detail.`;

      if (styleImage) {
        if (isAnalyzingStyle) {
            newPrompt += `\n\n- **Style Reference**: A style reference image is being analyzed. Please wait for the analysis to complete for specific style instructions.`;
        } else if (styleDescription) {
            newPrompt += `\n\n- **Style Reference**: Strictly adhere to the aesthetic of the provided style reference image, which is described as: "${styleDescription}". The goal is to make the product look as if it belongs in the same visual world, matching the mood, color palette, and textures.`;
        } else {
             newPrompt += `\n\n- **Style Reference**: Strictly adhere to the aesthetic, color palette, texture, and overall mood of the provided style reference image. The goal is to make the product look as if it belongs in the same visual world as the style reference.`;
        }
      }

      setPrompt(newPrompt);
    };
    generateNewPrompt();
  }, [options, productImage, styleImage, styleDescription, isAnalyzingStyle]);
  
  const handleGenerate = useCallback(async () => {
    if (!productImage || !prompt) {
      setError('Please upload a product image and ensure the prompt is not empty.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImage(productImage, prompt, styleImage);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [productImage, prompt, styleImage]);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<ImageFile | null>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setter({
          base64: base64String.split(',')[1],
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 pb-2">
          Rohit's Product Studio
        </h1>
        <p className="text-gray-400 mt-2">Transform your product photos with the power of Gemini.</p>
      </header>
      
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <ImageWorkspace 
                productImage={productImage} 
                onProductImageUpload={handleFileChange(setProductImage)}
                generatedImage={generatedImage}
                isLoading={isLoading}
            />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-8">
            <CustomizationPanel 
                options={options}
                setOptions={setOptions}
                styleImage={styleImage}
                onStyleImageUpload={handleFileChange(setStyleImage)}
                isAnalyzingStyle={isAnalyzingStyle}
            />
            <PromptEditor 
                prompt={prompt}
                setPrompt={setPrompt}
            />
            {error && <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">{error}</div>}
             <button 
                onClick={handleGenerate}
                disabled={isLoading || !productImage || isAnalyzingStyle}
                className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-600 hover:from-cyan-600 hover:to-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl hover:shadow-fuchsia-500/20 disabled:shadow-none transform hover:-translate-y-1 disabled:transform-none"
            >
                {isAnalyzingStyle ? 'Analyzing Style...' : isLoading ? 'Generating...' : 'Generate Image'}
            </button>
        </div>
      </main>
    </div>
  );
}

export default App;
