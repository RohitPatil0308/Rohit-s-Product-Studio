import React from 'react';
import { CustomizationOptions, ImageFile } from '../types';
import { LIGHTING_STYLES, CAMERA_PERSPECTIVES } from '../constants';
import ImageUploader from './ImageUploader';

interface CustomizationPanelProps {
  options: CustomizationOptions;
  setOptions: React.Dispatch<React.SetStateAction<CustomizationOptions>>;
  styleImage: ImageFile | null;
  onStyleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzingStyle: boolean;
}

const CustomSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <select value={value} onChange={onChange} className="w-full glass-input text-white rounded-md py-2 px-3 transition-all">
            {options.map(opt => <option key={opt.value} value={opt.value} className="bg-gray-800">{opt.label}</option>)}
        </select>
    </div>
);


const CustomizationPanel: React.FC<CustomizationPanelProps> = ({ options, setOptions, styleImage, onStyleImageUpload, isAnalyzingStyle }) => {
  const handleChange = <K extends keyof CustomizationOptions,>(key: K, value: CustomizationOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold text-white">Customize Your Image</h2>
      
      <CustomSelect 
        label="Lighting Style"
        value={options.lightingStyle}
        onChange={(e) => handleChange('lightingStyle', e.target.value as CustomizationOptions['lightingStyle'])}
        options={LIGHTING_STYLES}
      />

      <CustomSelect 
        label="Camera Perspective"
        value={options.cameraPerspective}
        onChange={(e) => handleChange('cameraPerspective', e.target.value as CustomizationOptions['cameraPerspective'])}
        options={CAMERA_PERSPECTIVES}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Style Reference (Optional)</label>
        <div className="relative">
            <ImageUploader 
                id="style-uploader"
                title="Upload Style Image"
                image={styleImage}
                onImageUpload={onStyleImageUpload}
            />
            {isAnalyzingStyle && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fuchsia-500"></div>
                <p className="text-sm text-white mt-2">Analyzing style...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;