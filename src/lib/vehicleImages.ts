// Legacy angle codes for reference (no longer enforced)
export type AngleCode =
  | 'FDS'|'FPS'|'SDS'|'SPS'|'SRDS'|'SRPS'|'RDS'|'R'|'F'
  | 'INT'|'INTB'|'ENG'|'TRK'|'ODOM'|'VIN';

export const ANGLE_ORDER: AngleCode[] = [
  'FDS','FPS','SDS','SPS','SRDS','SRPS','RDS','R','F',
  'INT','INTB','ENG','TRK','ODOM','VIN'
];

export const MODEL_MAP: Record<string, { make?: string; model?: string }> = {
  TB: { make: 'Chevrolet', model: 'Trailblazer' },
  CV: { make: 'Honda', model: 'Civic' },
  CM: { make: 'Toyota', model: 'Camry' },
  NA: { make: 'Nissan', model: 'Altima' },
  RX: { make: 'Jeep', model: 'Renegade' },
  F150: { make: 'Ford', model: 'F-150' },
  EQ: { make: 'Chevrolet', model: 'Equinox' },
  EL: { make: 'Hyundai', model: 'Elantra' },
  // extend as needed
};

export function parseFilename(name: string) {
  // 2021TB_FDS.jpg or any filename format
  const base = name.split('/').pop()!;
  const [stem] = base.split('.');
  const parts = stem.split('_');
  
  if (parts.length >= 2) {
    // Traditional format: 2021TB_FDS.jpg
    const [ymc, angle] = parts;
    const year = Number(ymc.slice(0,4));
    const modelCode = ymc.slice(4);
    return { year, modelCode, angle: angle }; // Return as string, not enum
  } else {
    // Simple format: just use the filename as angle
    const year = new Date().getFullYear(); // Default to current year
    const modelCode = 'CUSTOM';
    return { year, modelCode, angle: stem }; // Use filename as angle
  }
}

export function validateFilename(filename: string): { valid: boolean; error?: string } {
  // Now accepts any filename format - no validation needed
  // Just check that it's a reasonable filename
  const base = filename.split('/').pop()!;
  
  if (!base || base.length === 0) {
    return { valid: false, error: 'Filename cannot be empty' };
  }
  
  if (base.length > 255) {
    return { valid: false, error: 'Filename too long' };
  }
  
  // Allow any filename format
  return { valid: true };
}
