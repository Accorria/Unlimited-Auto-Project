'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhotoUpload from '@/components/PhotoUpload'

// Vehicle condition options
const conditionOptions = [
  'Excellent',
  'Very Good', 
  'Good',
  'Fair',
  'Poor',
  'Salvage',
  'Rebuilt'
]

// Common vehicle colors
const colorOptions = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Brown', 'Gold', 'Orange', 'Yellow', 'Purple', 'Beige', 'Tan', 'Maroon', 'Navy', 'Other'
]

// Common vehicle makes (alphabetical order)
const commonMakes = [
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar', 'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
]

// Common models by make (alphabetical order)
const commonModels: Record<string, string[]> = {
  'Acura': ['CDX', 'ILX', 'MDX', 'NSX', 'RDX', 'RLX', 'TLX'],
  'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'TT'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'i3', 'i8', 'X1', 'X3', 'X5', 'X7', 'Z4'],
  'Buick': ['Cascada', 'Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal'],
  'Cadillac': ['ATS', 'CT6', 'CTS', 'Escalade', 'XTS', 'XT4', 'XT5', 'XT6'],
  'Chevrolet': ['Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Express', 'Impala', 'Malibu', 'Silverado 1500', 'Silverado 2500 HD', 'Silverado 3500 HD', 'Sonic', 'Spark', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Bolt EV', 'Bolt EUV', 'Blazer', 'Trax'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Grand Caravan', 'Journey'],
  'Ford': ['Bronco', 'Bronco Sport', 'Crown Victoria', 'Edge', 'EcoSport', 'E-Series', 'Escape', 'Excursion', 'Expedition', 'Explorer', 'F-150', 'F-250', 'F-350', 'F-450', 'F-550', 'Focus', 'Fusion', 'Maverick', 'Mustang', 'Ranger', 'Taurus', 'Thunderbird', 'Transit', 'Transit Connect'],
  'GMC': ['Acadia', 'Canyon', 'Savana', 'Sierra', 'Terrain', 'Yukon'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Fit', 'HR-V', 'Insight', 'Passport', 'Pilot', 'Ridgeline'],
  'Hyundai': ['Elantra', 'Genesis', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster', 'Venue'],
  'Infiniti': ['FX', 'G37', 'Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX80'],
  'Jaguar': ['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'S-Type', 'XE', 'XF', 'XJ', 'XK', 'X-Type'],
  'Jeep': [
    'Wrangler', 
    'Wrangler Unlimited', 
    'Wrangler 2-Door', 
    'Wrangler 4-Door', 
    'Grand Cherokee', 
    'Grand Cherokee L', 
    'Cherokee', 
    'Compass', 
    'Renegade', 
    'Gladiator', 
    'Wagoneer', 
    'Grand Wagoneer', 
    'Commander', 
    'Liberty', 
    'Patriot', 
    'Wrangler JK', 
    'Wrangler JL', 
    'Wrangler TJ', 
    'Wrangler YJ'
  ],
  'Kia': ['Forte', 'Niro', 'Optima', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  'Lexus': ['BRZ', 'Crosstrek', 'ES', 'GX', 'GS', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX'],
  'Lincoln': ['Aviator', 'Continental', 'Corsair', 'MKC', 'MKT', 'MKX', 'MKZ', 'Navigator'],
  'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'CLA', 'E-Class', 'G-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'S-Class'],
  'Mini': ['Cooper', 'Cooper S', 'Cooper SE', 'Cooper JCW', 'Countryman', 'Countryman S', 'Countryman JCW', 'Hardtop', 'Hardtop S', 'Hardtop JCW', 'Convertible', 'Convertible S', 'Convertible JCW', 'Clubman', 'Clubman S', 'Clubman JCW', 'Paceman', 'Roadster'],
  'Mitsubishi': ['Eclipse Cross', 'Mirage', 'Outlander', 'Outlander Sport'],
  'Nissan': ['370Z', 'Altima', 'Armada', 'Frontier', 'GT-R', 'Kicks', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Subaru': ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'Toyota': ['4Runner', 'Avalon', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza', 'Yaris'],
  'Volkswagen': ['Atlas', 'Beetle', 'Golf', 'Jetta', 'Passat', 'Tiguan'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
}

// Make-specific trim levels
const makeSpecificTrims: Record<string, string[]> = {
  'Honda': ['Base', 'LX', 'EX', 'EX-L', 'Sport', 'Touring'],
  'Toyota': ['Base', 'LE', 'XLE', 'Limited', 'Platinum'],
  'Ford': ['Base', 'XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum'],
  'Chevrolet': ['Base', 'LS', 'LT', 'LTZ', 'Premier', 'High Country', 'Work Truck (WT)', 'Custom', 'Custom Trail Boss', 'RST', 'LT Trail Boss', 'ZR2', 'SS', 'RS', 'Z71'],
  'Silverado 1500': ['Work Truck (WT)', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'ZR2', 'High Country'],
  'Silverado 2500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
  'Silverado 3500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
  'BMW': ['Base', 'Sport', 'Luxury', 'M Sport', 'M'],
  'Mercedes-Benz': ['Base', 'AMG Line', 'AMG'],
  'Audi': ['Base', 'Premium', 'Premium Plus', 'Prestige'],
  'Lexus': ['Base', 'F Sport', 'Luxury'],
  'Acura': ['Base', 'Technology', 'Advance'],
  'Infiniti': ['Base', 'Luxury', 'Sport'],
  'Jaguar': ['Base', 'Premium', 'Premium Luxury', 'Portfolio', 'S', 'R-Sport', 'SVR', 'R', 'S Sport'],
  'Cadillac': ['Base', 'Luxury', 'Premium Luxury', 'Platinum'],
  'Lincoln': ['Base', 'Reserve', 'Black Label'],
  'Chrysler': ['Base', 'Touring', 'Limited', 'Pinnacle', 'L', 'LX', 'LXI'],
  'Dodge': ['Base', 'SXT', 'GT', 'R/T', 'Scat Pack', 'Hellcat'],
  'Jeep': ['Base', 'Sport', 'Sahara', 'Rubicon', 'Trailhawk'],
  'Ram': ['Base', 'Tradesman', 'Big Horn', 'Laramie', 'Longhorn', 'Limited'],
  'GMC': ['Base', 'SLE', 'SLT', 'Denali'],
  'Nissan': ['Base', 'S', 'SV', 'SL', 'Platinum'],
  'Hyundai': ['Base', 'SE', 'SEL', 'Limited'],
  'Kia': ['Base', 'LX', 'EX', 'SX'],
  'Mazda': ['Base', 'Sport', 'Touring', 'Grand Touring'],
  'Subaru': ['Base', 'Premium', 'Limited', 'Touring'],
  'Volkswagen': ['Base', 'S', 'SE', 'SEL'],
  'Volvo': ['Base', 'Momentum', 'R-Design', 'Inscription']
}

// Model-specific trims - Comprehensive mapping for all models
const modelSpecificTrims: Record<string, Record<string, string[]>> = {
  // Chevrolet
  'Chevrolet': {
    'Cruze': ['LS', 'LT', 'Premier', 'Hatchback LS', 'Hatchback LT', 'Hatchback Premier'],
    'Malibu': ['LS', 'LT', 'Premier', 'RS'],
    'Camaro': ['LS', 'LT', 'SS', 'ZL1', 'RS', '1LE'],
    'Corvette': ['Stingray', 'Grand Sport', 'Z06', 'ZR1', 'C8'],
    'Equinox': ['LS', 'LT', 'Premier', 'RS'],
    'Traverse': ['LS', 'LT', 'Premier', 'RS', 'High Country'],
    'Tahoe': ['LS', 'LT', 'Premier', 'High Country', 'Z71'],
    'Suburban': ['LS', 'LT', 'Premier', 'High Country', 'Z71'],
    'Silverado 1500': ['Work Truck (WT)', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'ZR2', 'High Country'],
    'Silverado 2500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
    'Silverado 3500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
    'Trailblazer': ['LS', 'LT', 'Activ', 'RS', 'Premier'],
    'Blazer': ['LS', 'LT', 'RS', 'Premier'],
    'Trax': ['LS', 'LT', 'Activ', 'Premier'],
    'Sonic': ['LS', 'LT', 'RS', 'LTZ'],
    'Spark': ['LS', '1LT', '2LT', 'Activ'],
    'Express': ['LS', 'LT', 'LTZ'],
    'Impala': ['Base', 'LS', 'LT', 'LTZ', 'Premier', 'SS', 'Limited'],
    'Bolt EV': ['LT', 'Premier'],
    'Bolt EUV': ['LT', 'Premier'],
    'Colorado': ['Work Truck (WT)', 'LT', 'Z71', 'ZR2']
  },
  
  // Ford
  'Ford': {
    'F-150': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor', 'Tremor'],
    'F-250': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'FX4', 'Limited'],
    'F-350': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'FX4', 'Limited'],
    'F-450': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited'],
    'F-550': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum'],
    'Bronco': ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'Everglades', 'Raptor'],
    'Bronco Sport': ['Base', 'Big Bend', 'Outer Banks', 'Badlands', 'Heritage', 'Heritage Limited'],
    'Crown Victoria': ['Base', 'LX', 'LX Sport', 'Police Interceptor'],
    'Edge': ['SE', 'SEL', 'ST', 'Titanium', 'ST-Line'],
    'EcoSport': ['S', 'SE', 'SES', 'Titanium'],
    'E-Series': ['XL', 'XLT', 'Limited'],
    'Escape': ['S', 'SE', 'SEL', 'Titanium', 'ST-Line', 'PHEV'],
    'Excursion': ['XLT', 'Limited', 'Eddie Bauer'],
    'Expedition': ['XL', 'XLT', 'Limited', 'King Ranch', 'Platinum', 'Timberline'],
    'Explorer': ['XLT', 'Limited', 'ST', 'Platinum', 'King Ranch', 'Timberline'],
    'Focus': ['S', 'SE', 'SEL', 'Titanium', 'ST', 'RS'],
    'Fusion': ['S', 'SE', 'SEL', 'Titanium', 'Sport'],
    'Maverick': ['XL', 'XLT', 'Lariat', 'FX4'],
    'Mustang': ['Base', 'EcoBoost', 'EcoBoost Premium', 'GT', 'GT Premium', 'Shelby GT350', 'Shelby GT350R', 'Mach 1', 'Shelby GT500', 'Dark Horse'],
    'Ranger': ['XL', 'XLT', 'Lariat', 'Tremor', 'Raptor'],
    'Taurus': ['S', 'SE', 'SEL', 'Limited', 'SHO'],
    'Thunderbird': ['Base', 'Deluxe', 'LX', 'SC'],
    'Transit': ['XL', 'XLT', 'Limited'],
    'Transit Connect': ['XL', 'XLT', 'Titanium']
  }
}

// Model-specific engine options
const modelSpecificEngines: Record<string, Record<string, string[]>> = {
  // Chevrolet
  'Chevrolet': {
    'Cruze': ['1.4L Turbo 4-Cylinder', '1.6L Turbo Diesel 4-Cylinder'],
    'Malibu': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '1.8L Hybrid'],
    'Camaro': ['2.0L Turbo 4-Cylinder', '3.6L V6', '6.2L V8', '6.2L Supercharged V8'],
    'Corvette': ['6.2L V8', '5.5L V8', '6.2L Supercharged V8'],
    'Equinox': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '1.6L Diesel'],
    'Traverse': ['3.6L V6'],
    'Tahoe': ['5.3L V8', '6.2L V8'],
    'Suburban': ['5.3L V8', '6.2L V8'],
    'Silverado 1500': ['2.7L Turbo 4-Cylinder', '3.0L Turbo Diesel V6', '5.3L V8', '6.2L V8'],
    'Silverado 2500 HD': ['6.6L Turbo Diesel V8', '6.6L Gas V8'],
    'Silverado 3500 HD': ['6.6L Turbo Diesel V8', '6.6L Gas V8'],
    'Trailblazer': ['1.2L Turbo 3-Cylinder', '1.3L Turbo 3-Cylinder'],
    'Blazer': ['2.5L 4-Cylinder', '3.6L V6', '2.0L Turbo 4-Cylinder'],
    'Trax': ['1.4L Turbo 4-Cylinder'],
    'Sonic': ['1.4L Turbo 4-Cylinder', '1.8L 4-Cylinder'],
    'Spark': ['1.4L 4-Cylinder'],
    'Express': ['4.3L V6', '5.3L V8', '6.6L Turbo Diesel V8'],
    'Impala': ['2.5L 4-Cylinder', '3.6L V6'],
    'Bolt EV': ['Electric Motor (200 HP)'],
    'Bolt EUV': ['Electric Motor (200 HP)'],
    'Colorado': ['2.5L 4-Cylinder', '3.6L V6', '2.8L Turbo Diesel']
  },
  
  // Ford
  'Ford': {
    'F-150': ['3.3L V6', '2.7L Turbo V6', '3.5L Turbo V6', '5.0L V8', '3.5L PowerBoost Hybrid'],
    'F-250': ['5.4L V8', '6.8L V10', '6.0L Power Stroke Turbo Diesel V8', '6.4L Power Stroke Turbo Diesel V8', '6.7L Power Stroke Turbo Diesel V8'],
    'F-350': ['5.4L V8', '6.8L V10', '6.0L Power Stroke Turbo Diesel V8', '6.4L Power Stroke Turbo Diesel V8', '6.7L Power Stroke Turbo Diesel V8'],
    'F-450': ['6.8L V10', '6.0L Power Stroke Turbo Diesel V8', '6.4L Power Stroke Turbo Diesel V8', '6.7L Power Stroke Turbo Diesel V8'],
    'F-550': ['6.8L V10', '6.0L Power Stroke Turbo Diesel V8', '6.4L Power Stroke Turbo Diesel V8', '6.7L Power Stroke Turbo Diesel V8'],
    'Bronco': ['2.3L Turbo 4-Cylinder', '2.7L Turbo V6'],
    'Bronco Sport': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Crown Victoria': ['4.6L V8'],
    'Edge': ['2.0L Turbo 4-Cylinder', '2.7L Turbo V6'],
    'EcoSport': ['1.0L EcoBoost I3', '2.0L Ti-VCT I4'],
    'E-Series': ['4.6L V8', '5.4L V8', '6.8L V10'],
    'Escape': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder', '2.5L Hybrid'],
    'Excursion': ['5.4L V8', '6.8L V10', '7.3L Power Stroke Turbo Diesel V8', '6.0L Power Stroke Turbo Diesel V8'],
    'Expedition': ['3.5L Turbo V6', '5.4L V8'],
    'Explorer': ['2.3L Turbo 4-Cylinder', '3.3L Hybrid', '3.0L Turbo V6'],
    'Focus': ['2.0L 4-Cylinder', '1.0L Turbo 3-Cylinder'],
    'Fusion': ['2.5L Hybrid', '2.0L Turbo 4-Cylinder'],
    'Maverick': ['2.5L Hybrid', '2.0L Turbo 4-Cylinder'],
    'Mustang': ['2.3L Turbo 4-Cylinder', '5.0L V8', '5.2L Supercharged V8'],
    'Ranger': ['2.3L Turbo 4-Cylinder'],
    'Taurus': ['3.5L V6', '3.5L EcoBoost V6'],
    'Thunderbird': ['3.9L V8', '4.6L V8'],
    'Transit': ['3.5L V6', '3.5L EcoBoost V6', '3.2L Power Stroke Turbo Diesel I5'],
    'Transit Connect': ['2.0L 4-Cylinder', '2.5L 4-Cylinder']
  },
  
  // Honda
  'Honda': {
    'Civic': ['2.0L 4-Cylinder', '1.5L Turbo 4-Cylinder'],
    'Accord': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '2.0L Hybrid'],
    'CR-V': ['2.0L Hybrid', '1.5L Turbo 4-Cylinder'],
    'Pilot': ['3.5L V6'],
    'Passport': ['3.5L V6'],
    'Ridgeline': ['3.5L V6'],
    'HR-V': ['1.8L 4-Cylinder', '2.0L 4-Cylinder'],
    'Fit': ['1.5L 4-Cylinder'],
    'Insight': ['1.5L Hybrid']
  },
  
  // Toyota
  'Toyota': {
    'Camry': ['2.5L 4-Cylinder', '3.5L V6', '2.5L Hybrid'],
    'Corolla': ['1.8L 4-Cylinder', '2.0L 4-Cylinder', '1.8L Hybrid'],
    'RAV4': ['2.5L 4-Cylinder', '2.5L Hybrid', '2.5L Prime Plug-in Hybrid'],
    'Highlander': ['3.5L V6', '2.5L Hybrid'],
    '4Runner': ['4.0L V6'],
    'Tacoma': ['2.7L 4-Cylinder', '3.5L V6'],
    'Tundra': ['3.5L Twin-Turbo V6', 'i-FORCE MAX Hybrid'],
    'Prius': ['1.8L Hybrid'],
    'Avalon': ['3.5L V6', '2.5L Hybrid'],
    'Sienna': ['2.5L Hybrid'],
    'Venza': ['2.5L Hybrid'],
    'C-HR': ['2.0L 4-Cylinder']
  },
  
  // Nissan
  'Nissan': {
    'Altima': ['2.5L 4-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Sentra': ['2.0L 4-Cylinder'],
    'Maxima': ['3.5L V6'],
    'Rogue': ['2.5L 4-Cylinder'],
    'Pathfinder': ['3.5L V6'],
    'Murano': ['3.5L V6'],
    'Frontier': ['3.8L V6'],
    'Titan': ['5.6L V8'],
    '370Z': ['3.7L V6'],
    'GT-R': ['3.8L Twin-Turbo V6'],
    'Armada': ['5.6L V8'],
    'Versa': ['1.6L 4-Cylinder']
  },
  
  // Jeep
  'Jeep': {
    'Wrangler': ['3.6L V6', '2.0L Turbo 4-Cylinder', '3.0L Turbo Diesel V6', '6.4L V8'],
    'Cherokee': ['2.4L 4-Cylinder', '3.2L V6', '2.0L Turbo 4-Cylinder'],
    'Grand Cherokee': ['3.6L V6', '5.7L V8', '6.4L V8', '6.2L Supercharged V8'],
    'Compass': ['2.4L 4-Cylinder', '1.3L Turbo 4-Cylinder'],
    'Renegade': ['1.3L Turbo 4-Cylinder', '2.4L 4-Cylinder'],
    'Gladiator': ['3.6L V6', '3.0L Turbo Diesel V6'],
    'Grand Wagoneer': ['5.7L V8', '6.4L V8']
  },
  
  // Ram
  'Ram': {
    '1500': ['3.6L V6', '5.7L V8', '3.0L Turbo Diesel V6', '6.2L Supercharged V8'],
    '2500': ['6.4L V8', '6.7L Turbo Diesel I6'],
    '3500': ['6.4L V8', '6.7L Turbo Diesel I6'],
    'ProMaster': ['3.6L V6', '3.0L Turbo Diesel V6'],
    'ProMaster City': ['2.4L 4-Cylinder']
  },
  
  // GMC
  'GMC': {
    'Sierra 1500': ['2.7L Turbo 4-Cylinder', '3.0L Turbo Diesel V6', '5.3L V8', '6.2L V8'],
    'Sierra 2500 HD': ['6.6L V8', '6.6L Turbo Diesel V8', '6.6L Turbo Diesel V8 (High Output)'],
    'Sierra 3500 HD': ['6.6L V8', '6.6L Turbo Diesel V8', '6.6L Turbo Diesel V8 (High Output)'],
    'Acadia': ['2.5L 4-Cylinder', '3.6L V6'],
    'Yukon': ['5.3L V8', '6.2L V8', '3.0L Turbo Diesel'],
    'Yukon XL': ['5.3L V8', '6.2L V8', '3.0L Turbo Diesel'],
    'Terrain': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Canyon': ['2.5L 4-Cylinder', '3.6L V6', '2.8L Turbo Diesel'],
    'Savana': ['4.3L V6', '5.3L V8', '6.6L Turbo Diesel V8']
  },
  
  // Dodge
  'Dodge': {
    'Challenger': ['3.6L V6', '5.7L V8', '6.4L V8', '6.2L Supercharged V8'],
    'Charger': ['3.6L V6', '5.7L V8', '6.4L V8', '6.2L Supercharged V8'],
    'Durango': ['3.6L V6', '5.7L V8', '6.4L V8', '6.2L Supercharged V8'],
    'Journey': ['2.4L 4-Cylinder', '3.6L V6'],
    'Grand Caravan': ['3.6L V6']
  },
  
  // Jaguar
  'Jaguar': {
    'XK': ['4.2L V8', '4.2L Supercharged V8'],
    'XF': ['2.0L Turbo 4-Cylinder', '3.0L Supercharged V6', '5.0L V8', '5.0L Supercharged V8'],
    'XJ': ['3.0L Supercharged V6', '5.0L V8', '5.0L Supercharged V8'],
    'F-Pace': ['2.0L Turbo 4-Cylinder', '3.0L Supercharged V6', '5.0L Supercharged V8'],
    'E-Pace': ['2.0L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder (P300)'],
    'I-Pace': ['Electric Motor (394 HP)'],
    'XE': ['2.0L Turbo 4-Cylinder', '3.0L Supercharged V6'],
    'F-Type': ['3.0L Supercharged V6', '5.0L V8', '5.0L Supercharged V8'],
    'S-Type': ['3.0L V6', '4.0L V8', '4.2L V8'],
    'X-Type': ['2.5L V6', '3.0L V6']
  },
  
  // Acura
  'Acura': {
    'ILX': ['2.4L 4-Cylinder', '2.0L Hybrid'],
    'TLX': ['2.4L 4-Cylinder', '3.5L V6', '2.0L Turbo 4-Cylinder', '3.0L Turbo V6'],
    'RLX': ['3.5L V6', '3.5L Hybrid'],
    'RDX': ['2.0L Turbo 4-Cylinder', '3.5L V6'],
    'MDX': ['3.5L V6', '3.0L Turbo V6', '3.5L Hybrid'],
    'CDX': ['1.5L Turbo 4-Cylinder'],
    'NSX': ['3.5L Twin-Turbo V6 Hybrid'],
    'ZDX': ['3.7L V6']
  },
  
  // Audi
  'Audi': {
    'A3': ['2.0L Turbo 4-Cylinder'],
    'A4': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6'],
    'A5': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6'],
    'A6': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', '4.0L Twin-Turbo V8'],
    'A7': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', '4.0L Twin-Turbo V8'],
    'A8': ['3.0L Turbo V6', '4.0L Twin-Turbo V8'],
    'Q3': ['2.0L Turbo 4-Cylinder'],
    'Q5': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6'],
    'Q7': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6'],
    'Q8': ['3.0L Turbo V6', '4.0L Twin-Turbo V8'],
    'R8': ['5.2L V10', '5.2L V10 Performance'],
    'TT': ['2.0L Turbo 4-Cylinder'],
    'e-tron': ['Electric Motor (402 HP)']
  },
  
  // BMW
  'BMW': {
    '2 Series': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6'],
    '3 Series': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6', 'M3'],
    '4 Series': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6', 'M4'],
    '5 Series': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6', '4.4L Twin-Turbo V8', 'M5'],
    '6 Series': ['3.0L Turbo I6', '4.4L Twin-Turbo V8'],
    '7 Series': ['3.0L Turbo I6', '4.4L Twin-Turbo V8', '6.6L Twin-Turbo V12'],
    'X1': ['2.0L Turbo 4-Cylinder'],
    'X2': ['2.0L Turbo 4-Cylinder'],
    'X3': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6', 'M40i'],
    'X4': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6'],
    'X5': ['3.0L Turbo I6', '4.4L Twin-Turbo V8', 'M50i'],
    'X6': ['3.0L Turbo I6', '4.4L Twin-Turbo V8'],
    'X7': ['3.0L Turbo I6', '4.4L Twin-Turbo V8'],
    'Z4': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6'],
    'i3': ['Electric Motor'],
    'i8': ['1.5L Turbo 3-Cylinder Hybrid']
  },
  
  // Buick
  'Buick': {
    'Encore': ['1.4L Turbo 4-Cylinder'],
    'Envision': ['2.0L Turbo 4-Cylinder', '2.5L 4-Cylinder'],
    'Enclave': ['3.6L V6'],
    'LaCrosse': ['2.4L 4-Cylinder', '3.6L V6'],
    'Regal': ['2.0L Turbo 4-Cylinder', '2.4L 4-Cylinder', '3.6L V6'],
    'Cascada': ['1.6L Turbo 4-Cylinder']
  },
  
  // Cadillac
  'Cadillac': {
    'ATS': ['2.0L Turbo 4-Cylinder', '2.5L 4-Cylinder', '3.6L V6'],
    'CT4': ['2.0L Turbo 4-Cylinder', '2.7L Turbo 4-Cylinder'],
    'CT5': ['2.0L Turbo 4-Cylinder', '3.0L Twin-Turbo V6'],
    'CT6': ['2.0L Turbo 4-Cylinder', '3.0L Twin-Turbo V6', '4.2L Twin-Turbo V8'],
    'CTS': ['2.0L Turbo 4-Cylinder', '3.6L V6', '6.2L V8'],
    'Escalade': ['6.2L V8', '3.0L Turbo Diesel'],
    'XTS': ['3.6L V6', '3.6L Twin-Turbo V6'],
    'XT4': ['2.0L Turbo 4-Cylinder'],
    'XT5': ['2.0L Turbo 4-Cylinder', '3.6L V6'],
    'XT6': ['2.0L Turbo 4-Cylinder', '3.6L V6']
  },
  
  // Chrysler
  'Chrysler': {
    '200': ['2.4L 4-Cylinder', '3.6L V6'],
    '300': ['3.6L V6', '5.7L V8', '6.4L V8'],
    'Pacifica': ['3.6L V6', '3.6L Hybrid'],
    'Voyager': ['3.6L V6']
  },
  
  // Hyundai
  'Hyundai': {
    'Accent': ['1.6L 4-Cylinder'],
    'Elantra': ['2.0L 4-Cylinder', '1.6L Turbo 4-Cylinder'],
    'Sonata': ['2.5L 4-Cylinder', '1.6L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '2.0L Hybrid'],
    'Santa Fe': ['2.5L 4-Cylinder', '2.5L Turbo 4-Cylinder', '3.5L V6'],
    'Tucson': ['2.0L 4-Cylinder', '2.4L 4-Cylinder', '1.6L Turbo 4-Cylinder'],
    'Palisade': ['3.8L V6'],
    'Kona': ['2.0L 4-Cylinder', '1.6L Turbo 4-Cylinder', 'Electric Motor'],
    'Veloster': ['2.0L 4-Cylinder', '1.6L Turbo 4-Cylinder'],
    'Venue': ['1.6L 4-Cylinder'],
    'Ioniq': ['1.6L Hybrid', 'Electric Motor'],
    'Genesis': ['3.8L V6', '5.0L V8']
  },
  
  // Infiniti
  'Infiniti': {
    'Q50': ['2.0L Turbo 4-Cylinder', '3.0L Twin-Turbo V6', '3.7L V6'],
    'Q60': ['2.0L Turbo 4-Cylinder', '3.0L Twin-Turbo V6', '3.7L V6'],
    'Q70': ['3.7L V6', '5.6L V8'],
    'QX30': ['2.0L Turbo 4-Cylinder'],
    'QX50': ['2.0L Turbo 4-Cylinder', '3.5L V6'],
    'QX60': ['3.5L V6'],
    'QX80': ['5.6L V8'],
    'FX': ['3.5L V6', '5.0L V8'],
    'G37': ['3.7L V6']
  },
  
  // Kia
  'Kia': {
    'Forte': ['2.0L 4-Cylinder', '1.6L Turbo 4-Cylinder'],
    'K5': ['1.6L Turbo 4-Cylinder', '2.5L Turbo 4-Cylinder'],
    'Optima': ['2.4L 4-Cylinder', '1.6L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Rio': ['1.6L 4-Cylinder'],
    'Sedona': ['3.3L V6'],
    'Sorento': ['2.4L 4-Cylinder', '3.3L V6', '2.0L Turbo 4-Cylinder'],
    'Soul': ['1.6L 4-Cylinder', '2.0L 4-Cylinder'],
    'Sportage': ['2.4L 4-Cylinder', '2.0L Turbo 4-Cylinder', '2.4L Turbo 4-Cylinder'],
    'Telluride': ['3.8L V6'],
    'Niro': ['1.6L Hybrid', 'Electric Motor'],
    'Seltos': ['2.0L 4-Cylinder', '1.6L Turbo 4-Cylinder'],
    'Stinger': ['2.0L Turbo 4-Cylinder', '2.5L Turbo 4-Cylinder', '3.3L Twin-Turbo V6']
  },
  
  // Lexus
  'Lexus': {
    'ES': ['2.5L 4-Cylinder', '3.5L V6', '2.5L Hybrid'],
    'GS': ['3.5L V6', '2.0L Turbo 4-Cylinder'],
    'GX': ['4.6L V8'],
    'IS': ['2.0L Turbo 4-Cylinder', '3.5L V6'],
    'LC': ['5.0L V8', '3.5L Hybrid'],
    'LS': ['3.5L Twin-Turbo V6', '5.0L V8 Hybrid'],
    'LX': ['5.7L V8'],
    'NX': ['2.0L Turbo 4-Cylinder', '2.5L Hybrid'],
    'RC': ['2.0L Turbo 4-Cylinder', '3.5L V6', '5.0L V8'],
    'RX': ['3.5L V6', '2.5L Hybrid', '3.5L Twin-Turbo V6'],
    'UX': ['2.0L 4-Cylinder', '2.0L Hybrid']
  },
  
  // Lincoln
  'Lincoln': {
    'Aviator': ['3.0L Twin-Turbo V6', '3.0L Hybrid'],
    'Continental': ['2.7L Twin-Turbo V6', '3.0L Twin-Turbo V6', '3.7L V6'],
    'Corsair': ['2.0L Turbo 4-Cylinder', '2.5L Hybrid'],
    'MKC': ['2.0L Turbo 4-Cylinder', '2.3L Turbo 4-Cylinder'],
    'MKT': ['3.7L V6', '3.5L Twin-Turbo V6'],
    'MKX': ['2.0L Turbo 4-Cylinder', '2.7L Twin-Turbo V6', '3.7L V6'],
    'MKZ': ['2.0L Turbo 4-Cylinder', '3.0L Twin-Turbo V6', '2.0L Hybrid'],
    'Navigator': ['3.5L Twin-Turbo V6']
  },
  
  // Mazda
  'Mazda': {
    'CX-3': ['2.0L 4-Cylinder'],
    'CX-30': ['2.5L 4-Cylinder', '2.5L Turbo 4-Cylinder'],
    'CX-5': ['2.5L 4-Cylinder', '2.5L Turbo 4-Cylinder'],
    'CX-9': ['2.5L Turbo 4-Cylinder'],
    'Mazda3': ['2.0L 4-Cylinder', '2.5L 4-Cylinder', '2.5L Turbo 4-Cylinder'],
    'Mazda6': ['2.5L 4-Cylinder', '2.5L Turbo 4-Cylinder'],
    'MX-5 Miata': ['2.0L 4-Cylinder']
  },
  
  // Mercedes-Benz
  'Mercedes-Benz': {
    'A-Class': ['2.0L Turbo 4-Cylinder', 'AMG 2.0L Turbo'],
    'C-Class': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', 'AMG 4.0L Twin-Turbo V8'],
    'CLA': ['2.0L Turbo 4-Cylinder', 'AMG 2.0L Turbo'],
    'CLS': ['3.0L Turbo V6', '4.0L Twin-Turbo V8'],
    'E-Class': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', 'AMG 4.0L Twin-Turbo V8'],
    'S-Class': ['3.0L Turbo V6', '4.0L Twin-Turbo V8', '6.0L Twin-Turbo V12'],
    'G-Class': ['4.0L Twin-Turbo V8', 'AMG 4.0L Twin-Turbo V8'],
    'GLA': ['2.0L Turbo 4-Cylinder', 'AMG 2.0L Turbo'],
    'GLB': ['2.0L Turbo 4-Cylinder'],
    'GLC': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', 'AMG 4.0L Twin-Turbo V8'],
    'GLE': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', 'AMG 4.0L Twin-Turbo V8'],
    'GLS': ['3.0L Turbo V6', '4.0L Twin-Turbo V8', 'AMG 4.0L Twin-Turbo V8']
  },
  
  // Mini
  'Mini': {
    'Cooper': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Cooper S': ['2.0L Turbo 4-Cylinder'],
    'Cooper SE': ['Electric Motor'],
    'Cooper JCW': ['2.0L Turbo 4-Cylinder'],
    'Countryman': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Countryman S': ['2.0L Turbo 4-Cylinder'],
    'Countryman JCW': ['2.0L Turbo 4-Cylinder'],
    'Hardtop': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Hardtop S': ['2.0L Turbo 4-Cylinder'],
    'Hardtop JCW': ['2.0L Turbo 4-Cylinder'],
    'Convertible': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Convertible S': ['2.0L Turbo 4-Cylinder'],
    'Convertible JCW': ['2.0L Turbo 4-Cylinder'],
    'Clubman': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder'],
    'Clubman S': ['2.0L Turbo 4-Cylinder'],
    'Clubman JCW': ['2.0L Turbo 4-Cylinder'],
    'Paceman': ['1.6L Turbo 4-Cylinder'],
    'Roadster': ['1.6L Turbo 4-Cylinder']
  },
  
  // Mitsubishi
  'Mitsubishi': {
    'Eclipse Cross': ['1.5L Turbo 4-Cylinder', '2.4L 4-Cylinder'],
    'Lancer': ['2.0L 4-Cylinder', '2.4L 4-Cylinder'],
    'Mirage': ['1.2L 3-Cylinder'],
    'Mirage G4': ['1.2L 3-Cylinder'],
    'Outlander': ['2.4L 4-Cylinder', '3.0L V6'],
    'Outlander Sport': ['2.0L 4-Cylinder', '2.4L 4-Cylinder']
  },
  
  // Subaru
  'Subaru': {
    'Ascent': ['2.4L Turbo 4-Cylinder'],
    'BRZ': ['2.4L 4-Cylinder'],
    'Crosstrek': ['2.0L 4-Cylinder', '2.5L 4-Cylinder'],
    'Forester': ['2.5L 4-Cylinder'],
    'Impreza': ['2.0L 4-Cylinder'],
    'Legacy': ['2.5L 4-Cylinder', '2.4L Turbo 4-Cylinder'],
    'Outback': ['2.5L 4-Cylinder', '2.4L Turbo 4-Cylinder'],
    'WRX': ['2.0L Turbo 4-Cylinder', '2.4L Turbo 4-Cylinder']
  },
  
  // Tesla
  'Tesla': {
    'Model 3': ['Electric Motor (Standard Range)', 'Electric Motor (Long Range)', 'Electric Motor (Performance)'],
    'Model S': ['Electric Motor (Long Range)', 'Electric Motor (Plaid)'],
    'Model X': ['Electric Motor (Long Range)', 'Electric Motor (Plaid)'],
    'Model Y': ['Electric Motor (Long Range)', 'Electric Motor (Performance)'],
    'Cybertruck': ['Electric Motor (Single Motor)', 'Electric Motor (Dual Motor)', 'Electric Motor (Tri Motor)'],
    'Roadster': ['Electric Motor']
  },
  
  // Volkswagen
  'Volkswagen': {
    'Arteon': ['2.0L Turbo 4-Cylinder'],
    'Atlas': ['2.0L Turbo 4-Cylinder', '3.6L V6'],
    'Beetle': ['2.0L Turbo 4-Cylinder'],
    'Golf': ['1.4L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', 'GTI 2.0L Turbo'],
    'ID.4': ['Electric Motor'],
    'Jetta': ['1.4L Turbo 4-Cylinder', '1.5L Turbo 4-Cylinder'],
    'Passat': ['2.0L Turbo 4-Cylinder'],
    'Tiguan': ['2.0L Turbo 4-Cylinder']
  },
  
  // Volvo
  'Volvo': {
    'S60': ['2.0L Turbo 4-Cylinder', '2.0L Twin-Turbo 4-Cylinder', 'T8 Plug-in Hybrid'],
    'S90': ['2.0L Turbo 4-Cylinder', 'T8 Plug-in Hybrid'],
    'V60': ['2.0L Turbo 4-Cylinder', 'T8 Plug-in Hybrid'],
    'V90': ['2.0L Turbo 4-Cylinder', 'T8 Plug-in Hybrid'],
    'XC40': ['2.0L Turbo 4-Cylinder', 'Electric Motor'],
    'XC60': ['2.0L Turbo 4-Cylinder', '2.0L Twin-Turbo 4-Cylinder', 'T8 Plug-in Hybrid'],
    'XC90': ['2.0L Turbo 4-Cylinder', '2.0L Twin-Turbo 4-Cylinder', 'T8 Plug-in Hybrid']
  }
}

// Make-specific common engines (fallback)
const makeSpecificEngines: Record<string, string[]> = {
  'Honda': ['1.5L 4-Cylinder', '1.8L 4-Cylinder', '2.0L 4-Cylinder', '1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '3.5L V6', '2.0L Hybrid'],
  'Toyota': ['1.8L 4-Cylinder', '2.0L 4-Cylinder', '2.5L 4-Cylinder', '3.5L V6', '4.0L V6', '1.8L Hybrid', '2.5L Hybrid', '3.5L Twin-Turbo V6'],
  'Ford': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder', '2.3L Turbo 4-Cylinder', '2.7L Turbo V6', '3.5L Turbo V6', '5.0L V8'],
  'Chevrolet': ['1.4L Turbo 4-Cylinder', '1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '3.6L V6', '5.3L V8', '6.2L V8'],
  'Nissan': ['1.6L 4-Cylinder', '2.0L 4-Cylinder', '2.5L 4-Cylinder', '3.5L V6', '3.7L V6', '5.6L V8'],
  'BMW': ['2.0L Turbo 4-Cylinder', '3.0L Turbo I6', '4.4L Twin-Turbo V8', 'Electric Motor'],
  'Mercedes-Benz': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', '4.0L Twin-Turbo V8', 'Electric Motor'],
  'Audi': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', '4.0L Twin-Turbo V8', 'Electric Motor'],
  'Hyundai': ['1.6L Turbo 4-Cylinder', '2.0L 4-Cylinder', '2.5L 4-Cylinder', '2.5L Turbo 4-Cylinder', '3.3L Turbo V6'],
  'Kia': ['1.6L Turbo 4-Cylinder', '2.0L 4-Cylinder', '2.5L Turbo 4-Cylinder', '3.3L Turbo V6'],
  'Mazda': ['2.0L 4-Cylinder', '2.5L 4-Cylinder', '2.5L Turbo 4-Cylinder', '2.0L Skyactiv-X'],
  'Subaru': ['2.0L 4-Cylinder', '2.5L 4-Cylinder', '2.4L Turbo 4-Cylinder', '3.6L H6'],
  'Volkswagen': ['1.4L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', 'Electric Motor'],
  'Lexus': ['2.0L Turbo 4-Cylinder', '2.5L 4-Cylinder', '3.5L V6', '5.0L V8', '3.5L Hybrid', '5.0L Hybrid'],
  'Acura': ['2.0L Turbo 4-Cylinder', '2.4L 4-Cylinder', '3.5L V6'],
  'Infiniti': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', '3.7L V6', '5.6L V8'],
  'Cadillac': ['2.0L Turbo 4-Cylinder', '3.6L V6', '4.2L Twin-Turbo V8', '6.2L Supercharged V8'],
  'Lincoln': ['2.0L Turbo 4-Cylinder', '3.0L Turbo V6', '3.5L Twin-Turbo V6'],
  'Buick': ['1.5L Turbo 4-Cylinder', '2.0L Turbo 4-Cylinder', '3.6L V6'],
  'Chrysler': ['2.4L 4-Cylinder', '3.6L V6', '5.7L V8'],
  'Dodge': ['3.6L V6', '5.7L V8', '6.4L V8', '6.2L Supercharged V8'],
  'Jeep': ['2.0L Turbo 4-Cylinder', '3.6L V6', '3.0L Turbo Diesel V6', '6.4L V8'],
  'Ram': ['3.6L V6', '5.7L V8', '6.4L V8', '3.0L Turbo Diesel V6', '6.7L Turbo Diesel I6'],
  'GMC': ['2.7L Turbo 4-Cylinder', '3.6L V6', '5.3L V8', '6.2L V8', '3.0L Turbo Diesel'],
  'Tesla': ['Electric Motor (varies by model)'],
  'Volvo': ['2.0L Turbo 4-Cylinder', '2.0L Twin-Turbo 4-Cylinder', 'Electric Motor'],
  'Mitsubishi': ['2.0L 4-Cylinder', '2.4L 4-Cylinder', '3.0L V6'],
  'Jaguar': ['2.0L Turbo 4-Cylinder', '3.0L Supercharged V6', '4.2L V8', '4.2L Supercharged V8', '5.0L V8', '5.0L Supercharged V8', 'Electric Motor']
}

// MPG database - organized by make, model, and engine
const mpgDatabase: Record<string, Record<string, Record<string, string>>> = {
  'Jaguar': {
    'XK': {
      '4.2L V8': '18 City / 27 Highway',
      '4.2L Supercharged V8': '16 City / 24 Highway'
    },
    'XF': {
      '2.0L Turbo 4-Cylinder': '23 City / 33 Highway',
      '3.0L Supercharged V6': '20 City / 30 Highway',
      '5.0L V8': '16 City / 23 Highway',
      '5.0L Supercharged V8': '15 City / 22 Highway'
    },
    'XJ': {
      '3.0L Supercharged V6': '18 City / 27 Highway',
      '5.0L V8': '16 City / 23 Highway',
      '5.0L Supercharged V8': '15 City / 22 Highway'
    },
    'F-Pace': {
      '2.0L Turbo 4-Cylinder': '22 City / 27 Highway',
      '3.0L Supercharged V6': '18 City / 23 Highway',
      '5.0L Supercharged V8': '16 City / 22 Highway'
    },
    'E-Pace': {
      '2.0L Turbo 4-Cylinder': '21 City / 26 Highway',
      '2.0L Turbo 4-Cylinder (P300)': '21 City / 26 Highway'
    },
    'I-Pace': {
      'Electric Motor (394 HP)': 'N/A'
    },
    'XE': {
      '2.0L Turbo 4-Cylinder': '23 City / 33 Highway',
      '3.0L Supercharged V6': '20 City / 30 Highway'
    },
    'F-Type': {
      '3.0L Supercharged V6': '18 City / 26 Highway',
      '5.0L V8': '16 City / 24 Highway',
      '5.0L Supercharged V8': '15 City / 23 Highway'
    },
    'S-Type': {
      '3.0L V6': '18 City / 26 Highway',
      '4.0L V8': '17 City / 25 Highway',
      '4.2L V8': '17 City / 25 Highway'
    },
    'X-Type': {
      '2.5L V6': '20 City / 28 Highway',
      '3.0L V6': '19 City / 27 Highway'
    }
  },
  'Ford': {
    'F-150': {
      '3.3L V6': '20 City / 24 Highway',
      '2.7L Turbo V6': '20 City / 26 Highway',
      '3.5L Turbo V6': '18 City / 24 Highway',
      '5.0L V8': '17 City / 23 Highway',
      '3.5L PowerBoost Hybrid': '25 City / 26 Highway'
    },
    'Mustang': {
      '2.3L Turbo 4-Cylinder': '21 City / 32 Highway',
      '5.0L V8': '16 City / 25 Highway',
      '5.2L Supercharged V8': '14 City / 22 Highway'
    }
  },
  'Chevrolet': {
    'Silverado 1500': {
      '2.7L Turbo 4-Cylinder': '20 City / 23 Highway',
      '3.0L Turbo Diesel V6': '23 City / 33 Highway',
      '5.3L V8': '16 City / 20 Highway',
      '6.2L V8': '15 City / 20 Highway'
    },
    'Camaro': {
      '2.0L Turbo 4-Cylinder': '22 City / 31 Highway',
      '3.6L V6': '19 City / 29 Highway',
      '6.2L V8': '16 City / 26 Highway',
      '6.2L Supercharged V8': '14 City / 20 Highway'
    }
  },
  'Honda': {
    'Civic': {
      '2.0L 4-Cylinder': '31 City / 40 Highway',
      '1.5L Turbo 4-Cylinder': '31 City / 40 Highway'
    },
    'Accord': {
      '1.5L Turbo 4-Cylinder': '30 City / 38 Highway',
      '2.0L Turbo 4-Cylinder': '22 City / 32 Highway',
      '2.0L Hybrid': '48 City / 48 Highway'
    },
    'CR-V': {
      '2.0L Hybrid': '40 City / 35 Highway',
      '1.5L Turbo 4-Cylinder': '28 City / 34 Highway'
    }
  },
  'Toyota': {
    'Camry': {
      '2.5L 4-Cylinder': '28 City / 39 Highway',
      '3.5L V6': '22 City / 33 Highway',
      '2.5L Hybrid': '51 City / 53 Highway'
    },
    'RAV4': {
      '2.5L 4-Cylinder': '27 City / 35 Highway',
      '2.5L Hybrid': '41 City / 38 Highway',
      '2.5L Prime Plug-in Hybrid': '94 Combined'
    }
  }
}

// Get MPG based on make, model, and engine
const getMPG = (make: string, model: string, engine: string): string => {
  if (!make || !model || !engine) return ''
  
  // Check for exact match in database
  if (mpgDatabase[make] && mpgDatabase[make][model] && mpgDatabase[make][model][engine]) {
    return mpgDatabase[make][model][engine]
  }
  
  // Check for electric vehicles
  if (engine.toLowerCase().includes('electric')) {
    return 'N/A'
  }
  
  return ''
}

// Get engine options based on make and model
const getEngineOptions = (make: string, model: string): string[] => {
  if (!make) {
    return [
      '1.5L 4-Cylinder',
      '2.0L 4-Cylinder',
      '2.5L 4-Cylinder',
      '3.0L V6',
      '3.5L V6',
      '5.0L V8',
      'Electric Motor'
    ]
  }
  
  // Collect all engines for this make from all models
  const allEnginesForMake = new Set<string>()
  
  // First, add model-specific engines if model is selected
  if (model && modelSpecificEngines[make] && modelSpecificEngines[make][model]) {
    modelSpecificEngines[make][model].forEach(engine => allEnginesForMake.add(engine))
  }
  
  // Then, add all engines from all models of this make
  if (modelSpecificEngines[make]) {
    Object.values(modelSpecificEngines[make]).forEach(engines => {
      engines.forEach(engine => allEnginesForMake.add(engine))
    })
  }
  
  // Also add make-specific engines
  if (makeSpecificEngines[make]) {
    makeSpecificEngines[make].forEach(engine => allEnginesForMake.add(engine))
  }
  
  // Convert to sorted array
  const engines = Array.from(allEnginesForMake).sort()
  
  // If we have engines, return them; otherwise fallback
  if (engines.length > 0) {
    return engines
  }
  
  // Final fallback
  return [
    '1.5L 4-Cylinder',
    '2.0L 4-Cylinder',
    '2.5L 4-Cylinder',
    '3.0L V6',
    '3.5L V6',
    '5.0L V8',
    'Electric Motor'
  ]
}

// Vehicle features organized by category
const vehicleFeatures = {
  'Exterior': [
    'Alloy Wheels', 'Chrome Wheels', 'Steel Wheels', 'Fog Lights', 'LED Headlights', 'Xenon Headlights', 'Halogen Headlights', 'Daytime Running Lights', 'Power Mirrors', 'Heated Mirrors', 'Auto-Dimming Mirrors', 'Tinted Windows', 'Privacy Glass', 'Spoiler', 'Running Boards', 'Roof Rails', 'Tow Package', 'Trailer Hitch'
  ],
  'Interior': [
    'Leather Seats', 'Cloth Seats', 'Vinyl Seats', 'Heated Seats', 'Cooled Seats', 'Power Seats', 'Memory Seats', 'Lumbar Support', 'Split Folding Rear Seats', 'Stow \'n Go Seating', 'Third Row Seating', 'Captain\'s Chairs', 'Bench Seating', 'Leather Steering Wheel', 'Wood Trim', 'Carbon Fiber Trim', 'Ambient Lighting', 'Cargo Cover', 'Cargo Net'
  ],
  'Climate Control': [
    'Air Conditioning', 'Automatic Climate Control', 'Dual Zone Climate Control', 'Tri-Zone Climate Control', 'Rear Climate Control', 'Heated Steering Wheel', 'Heated Seats', 'Cooled Seats', 'Remote Start', 'Defrost System'
  ],
  'Technology & Audio': [
    'AM/FM Radio', 'CD Player', 'MP3 Player', 'USB Port', 'Auxiliary Input', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Uconnect Touchscreen', 'Navigation System', 'GPS', 'Satellite Radio', 'HD Radio', 'Premium Audio', 'Bose Audio', 'Harman Kardon', 'JBL Audio', 'Infotainment System', 'WiFi Hotspot', 'Wireless Charging'
  ],
  'Safety & Security': [
    'Backup Camera', 'Rearview Camera', '360° Camera', 'Parking Sensors', 'Blind Spot Monitoring', 'Lane Departure Warning', 'Forward Collision Warning', 'Automatic Emergency Braking', 'Adaptive Cruise Control', 'Lane Keep Assist', 'Traffic Sign Recognition', 'Driver Attention Monitor', 'Tire Pressure Monitoring', 'Stability Control', 'Traction Control', 'Anti-lock Brakes', 'Airbags', 'Security System', 'Immobilizer', 'Theft Deterrent'
  ],
  'Convenience': [
    'Power Windows', 'Power Locks', 'Keyless Entry', 'Push Button Start', 'Remote Start', 'Cruise Control', 'Adaptive Cruise Control', 'Tilt Steering Wheel', 'Telescoping Steering Wheel', 'Power Steering', 'Steering Wheel Controls', 'Cup Holders', 'Storage Compartments', 'Cargo Area', 'Cargo Management', 'Roof Rack', 'Tonneau Cover', 'Bed Liner'
  ],
  'Doors & Access': [
    'Power Sliding Doors', 'Power Liftgate', 'Power Tailgate', 'Keyless Entry', 'Remote Keyless Entry', 'Smart Key', 'Proximity Key', 'Key Fob', 'Manual Doors', 'Manual Liftgate'
  ],
  'Transmission & Performance': [
    'Manual Transmission', 'Automatic Transmission', 'CVT Transmission', 'Semi-Automatic Transmission', 'Paddle Shifters', 'Sport Mode', 'Eco Mode', 'Tow Mode', '4WD', 'AWD', 'FWD', 'RWD', 'Limited Slip Differential', 'Locking Differential'
  ],
  'Special Features': [
    'Sunroof', 'Moonroof', 'Panoramic Sunroof', 'Convertible Top', 'Hardtop', 'Soft Top', 'T-Top', 'Targa Top', 'Hatchback', 'Liftback', 'Wagon', 'Crossover', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'Turbocharged', 'Supercharged', 'V6 Engine', 'V8 Engine', '4-Cylinder Engine', '6-Cylinder Engine', '8-Cylinder Engine'
  ]
}

// Description templates
const descriptionTemplates = [
  {
    name: 'Standard',
    template: ''
  },
  {
    name: 'Premium',
    template: 'Luxury features, low mileage, excellent condition, certified pre-owned'
  },
  {
    name: 'Value',
    template: 'Affordable pricing, reliable transportation, well-maintained'
  },
  {
    name: 'Urgency',
    template: 'Limited time offer, must sell, great deal, call today!'
  }
]

// Get trim options based on make and model
const getTrimOptions = (make: string, model: string): string[] => {
  // Don't show any trims until both make and model are selected
  if (!make || !model) {
    return []
  }
  
  // First, check for model-specific trims (most accurate)
  if (modelSpecificTrims[make] && modelSpecificTrims[make][model]) {
    return modelSpecificTrims[make][model]
  }
  
  // Fall back to make-specific trims ONLY if no model-specific trims found
  // This ensures we never show truck trims for sedans, etc.
  return makeSpecificTrims[make] || ['Base', 'Premium', 'Limited', 'Sport']
}

export default function EditVehicle({ params }: { params: Promise<{ id: string }> }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const router = useRouter()
  const resolvedParams = use(params)

  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    price: '',
    miles: '',
    condition: 'Excellent',
    status: 'active',
    fuelType: 'Gas',
    transmission: 'Automatic',
    drivetrain: 'FWD',
    color: '',
    interiorColor: '',
    vin: '',
    engine: '',
    mpg: '',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: [] as string[],
    description: '',
    images: [] as string[],
    downPayment: 999,
    customDownPayment: ''
  })
  
  const [showCustomEngine, setShowCustomEngine] = useState(false)
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }

    // Fetch vehicle data by ID
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/vehicles/${resolvedParams.id}`)
        if (response.ok) {
          const vehicle = await response.json()
          console.log('Fetched vehicle for editing:', vehicle)
          
          // Transform the vehicle data to match formData structure
          const transformedVehicle = {
            ...vehicle,
            // Map photos to images array (photos are already sorted by angle)
            images: vehicle.photos ? vehicle.photos.map((photo: any) => photo.public_url) : [],
            // Ensure features is an array
            features: Array.isArray(vehicle.features) ? vehicle.features : []
          }
          
          setFormData(transformedVehicle)
        } else {
          console.error('Failed to fetch vehicle')
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicle()
  }, [router, resolvedParams.id])

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.year) newErrors.year = 'Year is required'
    if (!formData.make) newErrors.make = 'Make is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.miles) newErrors.miles = 'Miles is required'
    if (!formData.description) newErrors.description = 'Description is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value || '' }
      
      // Auto-populate MPG when engine is selected
      if (name === 'engine' && value && prev.make && prev.model) {
        const mpg = getMPG(prev.make, prev.model, value)
        if (mpg) {
          updated.mpg = mpg
        }
      }
      
      return updated
    })
    
    // Reset custom engine state when make or model changes
    if (name === 'make' || name === 'model') {
      setShowCustomEngine(false)
      // Also clear MPG when make/model changes
      setFormData(prev => ({ ...prev, mpg: '' }))
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }))
  }

  const generateAIDescription = async () => {
    if (!formData.year || !formData.make || !formData.model) {
      alert('Please fill in Year, Make, and Model before generating a description.')
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: formData.year,
          make: formData.make,
          model: formData.model,
          trim: formData.trim,
          miles: formData.miles ? parseInt(String(formData.miles).replace(/,/g, '')) : null,
          price: formData.price ? parseInt(String(formData.price).replace(/[$,]/g, '')) : null,
          condition: formData.condition,
          features: formData.features || [],
          engine: formData.engine,
          color: formData.color,
          transmission: formData.transmission,
          drivetrain: formData.drivetrain
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate description')
      }

      if (data.success && data.description) {
      setFormData(prev => ({
        ...prev,
          description: data.description
      }))
      } else {
        throw new Error('No description returned from AI')
      }
    } catch (error: any) {
      console.error('Error generating AI description:', error)
      alert(`Failed to generate AI description: ${error.message || 'Please try again.'}`)
    } finally {
      setAiLoading(false)
    }
  }

  const parseNumber = (value: string | number) => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = parseInt(value.replace(/[^0-9]/g, ''))
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Please fix the errors in the form before submitting.')
      return
    }

    setLoading(true)

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        price: parseNumber(formData.price),
        miles: parseNumber(formData.miles)
      }

      console.log('Submitting vehicle data:', submitData)

      // Call the API to update the vehicle
      const response = await fetch(`/api/vehicles/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      let result
      try {
        result = await response.json()
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError)
        const text = await response.text()
        console.error('Response text:', text)
        throw new Error(`Server returned invalid response: ${response.status} ${response.statusText}`)
      }

      console.log('API response:', result)

      if (!response.ok) {
        console.error('API error details:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          details: result.details,
          code: result.code,
          hint: result.hint
        })
        const errorMessage = result.error || 'Failed to update vehicle'
        const errorDetails = result.details ? `: ${result.details}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      console.log('Vehicle updated successfully:', result)
      alert('Vehicle updated successfully!')
      // Force refresh the inventory page
      router.push('/admin/inventory?refresh=' + Date.now())
    } catch (error) {
      console.error('Error updating vehicle:', error)
      alert(`Failed to update vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
          <Link href="/admin/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/inventory" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle</h1>
          <p className="text-gray-600 mt-2">Update vehicle information in your inventory.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI Assistant */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-600">Enable AI to auto-generate descriptions from photos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {aiEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                <select
                  name="year"
                  value={formData.year || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 115 }, (_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                <select
                  name="make"
                  value={formData.make || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Make</option>
                  {commonMakes.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
                {errors.make && <p className="text-red-500 text-sm mt-1">{errors.make}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <select
                  name="model"
                  value={formData.model || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Model</option>
                  {formData.make && commonModels[formData.make]?.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trim</label>
                <select
                  name="trim"
                  value={formData.trim || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Trim</option>
                  {getTrimOptions(formData.make, formData.model).map((trim) => (
                    <option key={trim} value={trim}>
                      {trim}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter price"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miles *</label>
                <input
                  type="text"
                  name="miles"
                  value={formData.miles || ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter miles"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                {errors.miles && <p className="text-red-500 text-sm mt-1">{errors.miles}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
                <select
                  name="downPayment"
                  value={typeof formData.downPayment === 'string' && formData.downPayment === 'custom' ? 'custom' : (formData.downPayment?.toString() || '')}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setFormData(prev => ({ ...prev, downPayment: 'custom' as any }))
                    } else {
                      handleInputChange(e)
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select down payment</option>
                  <option value="0">$0 Down Payment</option>
                  <option value="500">$500 Down Payment</option>
                  <option value="1000">$1,000 Down Payment</option>
                  <option value="1500">$1,500 Down Payment</option>
                  <option value="2000">$2,000 Down Payment</option>
                  <option value="2500">$2,500 Down Payment</option>
                  <option value="3000">$3,000 Down Payment</option>
                  <option value="3500">$3,500 Down Payment</option>
                  <option value="4000">$4,000 Down Payment</option>
                  <option value="4500">$4,500 Down Payment</option>
                  <option value="5000">$5,000 Down Payment</option>
                  <option value="custom">Custom Amount</option>
                </select>
                {(String(formData.downPayment) === 'custom') && (
                  <div className="mt-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="customDownPayment"
                        value={formData.customDownPayment || ''}
                        onChange={handleInputChange}
                        placeholder="Enter custom amount"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                      />
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">This will appear as a badge on the vehicle listing</p>
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  {conditionOptions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
                {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="active">Active (For Sale)</option>
                  <option value="pending">Pending Sale</option>
                  <option value="sold">Sold</option>
                  <option value="reconditioning">Reconditioning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="Gas">Gas</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drivetrain</label>
                <select
                  name="drivetrain"
                  value={formData.drivetrain || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="4WD">4WD</option>
                  <option value="4x4">4x4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <select
                  name="color"
                  value={formData.color || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Color</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interior Color</label>
                <select
                  name="interiorColor"
                  value={formData.interiorColor || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="">Select Interior Color</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VIN</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin || ''}
                  onChange={handleInputChange}
                  maxLength={17}
                  placeholder="Optional"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                <select
                  name="engine"
                  value={showCustomEngine || (formData.engine && !getEngineOptions(formData.make, formData.model).includes(formData.engine)) ? 'custom' : (formData.engine || '')}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setShowCustomEngine(true)
                      if (!formData.engine || getEngineOptions(formData.make, formData.model).includes(formData.engine)) {
                        setFormData(prev => ({ ...prev, engine: '' }))
                      }
                    } else {
                      setShowCustomEngine(false)
                      handleInputChange(e)
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#ffffff', color: '#6b7280' }}>Select engine...</option>
                  {getEngineOptions(formData.make, formData.model).map((engine) => (
                    <option key={engine} value={engine} style={{ backgroundColor: '#ffffff', color: '#111827' }}>
                      {engine}
                    </option>
                  ))}
                  <option value="custom" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Custom (type below)</option>
                </select>
                {(showCustomEngine || (formData.engine && !getEngineOptions(formData.make, formData.model).includes(formData.engine))) && (
                  <input
                    type="text"
                    name="engine"
                    value={formData.engine}
                    onChange={handleInputChange}
                    placeholder="Enter custom engine (e.g., 4.2L V8)"
                    className="w-full mt-2 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MPG</label>
                <input
                  type="text"
                  name="mpg"
                  value={formData.mpg || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 28 City / 39 Highway"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Style</label>
                <select
                  name="bodyStyle"
                  value={formData.bodyStyle || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Wagon">Wagon</option>
                  <option value="Minivan">Minivan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doors</label>
                <input
                  type="number"
                  name="doors"
                  value={formData.doors || ''}
                  onChange={handleInputChange}
                  min="2"
                  max="5"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <input
                  type="number"
                  name="passengers"
                  value={formData.passengers || ''}
                  onChange={handleInputChange}
                  min="2"
                  max="8"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Photos</h2>
            <PhotoUpload 
              onPhotosChange={handleImagesChange}
              vehicleData={{
                year: formData.year,
                make: formData.make,
                model: formData.model
              }}
            />
          </div>

          {/* Features and Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Features and Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Features</label>
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                  {Object.entries(vehicleFeatures).map(([category, features]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {features.map((feature) => (
                          <button
                            key={feature}
                            type="button"
                            onClick={() => handleFeatureToggle(feature)}
                            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                              (formData.features || []).includes(feature)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Click features to select them. Selected: {(formData.features || []).length} features
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Description *</label>
                  {aiEnabled && (
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={aiLoading}
                      className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiLoading ? 'Generating...' : '🤖 Generate with AI'}
                    </button>
                  )}
                </div>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter a detailed description of the vehicle..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                
                {/* Quick Description Templates */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Description Templates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {descriptionTemplates.map((template) => (
                      <div key={template.name} className="border border-gray-300 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{template.name}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, description: template.template }))}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Use
                          </button>
                        </div>
                        <p className="text-xs text-gray-600">{template.template}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/inventory"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating Vehicle...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}