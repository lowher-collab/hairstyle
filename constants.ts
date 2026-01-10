import { PresetStyle } from './types';

export const HAIRSTYLE_PRESETS: PresetStyle[] = [
  { id: 'punk', name: 'Punk Mohawk', description: 'Edgy green mohawk with shaved sides', previewColor: 'bg-green-500' },
  { id: 'retro', name: 'Retro 80s', description: 'Big voluminous curly hair, 80s style', previewColor: 'bg-pink-500' },
  { id: 'bob', name: 'Sleek Bob', description: 'Sharp, modern chin-length bob cut', previewColor: 'bg-blue-500' },
  { id: 'wavy', name: 'Long Wavy', description: 'Luxurious long wavy flowing hair', previewColor: 'bg-amber-400' },
  { id: 'afro', name: 'Classic Afro', description: 'Large, rounded natural afro hairstyle', previewColor: 'bg-purple-600' },
  { id: 'bald', name: 'Bald/Shaved', description: 'Completely shaved head look', previewColor: 'bg-slate-400' },
  { id: 'fantasy', name: 'Elf Fantasy', description: 'Long silver elven hair with braids', previewColor: 'bg-indigo-300' },
  { id: 'neon', name: 'Cyber Neon', description: 'Glowing neon short spiky cyberpunk hair', previewColor: 'bg-cyan-400' },
];

export const GEMINI_MODEL = 'gemini-2.5-flash-image';
