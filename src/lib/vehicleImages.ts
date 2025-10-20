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
  // 2021TB_FDS.jpg
  const base = name.split('/').pop()!;
  const [stem] = base.split('.');
  const [ymc, angle] = stem.split('_');
  const year = Number(ymc.slice(0,4));
  const modelCode = ymc.slice(4);
  const angleCode = angle as AngleCode;

  return { year, modelCode, angle: angleCode };
}

export function validateFilename(filename: string): { valid: boolean; error?: string } {
  const base = filename.split('/').pop()!;
  const [stem] = base.split('.');
  const parts = stem.split('_');
  
  if (parts.length !== 2) {
    return { valid: false, error: 'Filename must be in format: YYYYMODEL_ANGLE.jpg' };
  }
  
  const [ymc, angle] = parts;
  
  if (ymc.length < 5) {
    return { valid: false, error: 'Year and model code must be at least 5 characters' };
  }
  
  const year = Number(ymc.slice(0,4));
  if (isNaN(year) || year < 1990 || year > 2030) {
    return { valid: false, error: 'Invalid year in filename' };
  }
  
  if (!ANGLE_ORDER.includes(angle as AngleCode)) {
    return { valid: false, error: `Invalid angle code. Must be one of: ${ANGLE_ORDER.join(', ')}` };
  }
  
  return { valid: true };
}
