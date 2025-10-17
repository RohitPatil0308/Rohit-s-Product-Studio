
export type LightingStyle = 'Natural Light' | 'Studio Light' | 'Golden Hour' | 'Blue Hour' | 'Cinematic' | 'Dramatic';
export type CameraPerspective = 'Front View' | 'Top View' | 'Side View' | '45° Angle' | 'Close-up' | 'Macro Shot';

export interface CustomizationOptions {
  lightingStyle: LightingStyle;
  cameraPerspective: CameraPerspective;
}

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}