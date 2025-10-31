'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PhotoUpload from '@/components/PhotoUpload'
import SmartSelect from '@/components/SmartSelect'

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
  'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mini', 'Mitsubishi', 'Nissan', 'Ram', 'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
]

// Common models by make (alphabetical order)
const commonModels: Record<string, string[]> = {
  'Acura': ['CDX', 'ILX', 'MDX', 'NSX', 'RDX', 'RLX', 'TLX'],
  'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'TT'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'i3', 'i8', 'X1', 'X3', 'X5', 'X7', 'Z4'],
  'Buick': ['Cascada', 'Enclave', 'Encore', 'Envision', 'LaCrosse', 'Regal'],
  'Cadillac': ['ATS', 'CT6', 'CTS', 'Escalade', 'XTS', 'XT4', 'XT5', 'XT6'],
  'Chevrolet': ['Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Express', 'Impala', 'Malibu', 'Silverado 1500', 'Silverado 2500 HD', 'Silverado 3500 HD', 'Sonic', 'Spark', 'Suburban', 'Tahoe', 'Trailblazer', 'Traverse', 'Bolt EV', 'Bolt EUV', 'Blazer', 'Trax'],
  'Chrysler': ['200', '300', 'Pacifica', 'Voyager'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Grand Caravan', 'Journey'],
  'Ford': ['Bronco', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'Focus', 'Fusion', 'Maverick', 'Mustang', 'Ranger', 'Transit'],
  'GMC': ['Acadia', 'Canyon', 'Savana', 'Sierra 1500', 'Sierra 2500 HD', 'Sierra 3500 HD', 'Terrain', 'Yukon'],
  'Honda': ['Accord', 'Civic', 'CR-V', 'Fit', 'HR-V', 'Insight', 'Passport', 'Pilot', 'Ridgeline'],
  'Hyundai': ['Elantra', 'Genesis', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster', 'Venue'],
  'Infiniti': ['FX', 'G37', 'Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX80'],
  'Jeep': ['Cherokee', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Wagoneer', 'Renegade', 'Wrangler'],
  'Kia': ['Forte', 'Niro', 'Optima', 'Seltos', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Telluride'],
  'Lexus': ['ES', 'GX', 'GS', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX'],
  'Lincoln': ['Aviator', 'Continental', 'Corsair', 'MKC', 'MKT', 'MKX', 'MKZ', 'Navigator'],
  'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'CLA', 'E-Class', 'G-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'S-Class'],
  'Mini': ['Cooper', 'Cooper S', 'Cooper SE', 'Cooper JCW', 'Countryman', 'Countryman S', 'Countryman JCW', 'Hardtop', 'Hardtop S', 'Hardtop JCW', 'Convertible', 'Convertible S', 'Convertible JCW', 'Clubman', 'Clubman S', 'Clubman JCW', 'Paceman', 'Roadster'],
  'Mitsubishi': ['Eclipse Cross', 'Lancer', 'Mirage', 'Mirage G4', 'Outlander'],
  'Nissan': ['370Z', 'Altima', 'Armada', 'Frontier', 'GT-R', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Subaru': ['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
  'Tesla': ['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y', 'Roadster'],
  'Toyota': ['4Runner', 'Avalon', 'C-HR', 'Camry', 'Corolla', 'Highlander', 'Prius', 'RAV4', 'Sienna', 'Tacoma', 'Tundra', 'Venza'],
  'Volkswagen': ['Arteon', 'Atlas', 'Beetle', 'Golf', 'ID.4', 'Jetta', 'Passat', 'Tiguan'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
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
    'Impala': ['LS', 'LT', 'Premier'],
    'Bolt EV': ['LT', 'Premier'],
    'Bolt EUV': ['LT', 'Premier'],
    'Colorado': ['Work Truck (WT)', 'LT', 'Z71', 'ZR2']
  },
  
  // Jeep
  'Jeep': {
    'Wrangler': [
      // Base Models
      'Sport', 'Sport (JK)', 'Sport (JL)', 'Sport S', 'Sport S (JK)', 'Sport S (JL)',
      // Sahara
      'Sahara', 'Sahara (JK)', 'Sahara (JL)', 'Sahara Moab', 'Sahara Sport Utility 2D', 'Sahara Sport Utility 4D',
      // Rubicon
      'Rubicon', 'Rubicon (JK)', 'Rubicon (JL)', 'Rubicon X', 'Rubicon Recon', 'Rubicon Recon (JK)', 'Rubicon Hard Rock', 'Rubicon 10th Anniversary',
      // Willys
      'Willys', 'Willys Sport', 'Willys Wheeler', 'Willys Wheeler (JK)', 'Willys Wheeler W', 'Willys Wheeler W (JK)',
      // Unlimited Models (4-door)
      'Unlimited Sport', 'Unlimited Sport S', 'Unlimited Sahara', 'Unlimited Sahara Moab', 'Unlimited Rubicon', 'Unlimited Rubicon X', 'Unlimited Rubicon Recon',
      'Unlimited Rubicon Hard Rock', 'Unlimited Willys', 'Unlimited Willys Wheeler', 'Unlimited Willys Wheeler W',
      // Special Editions
      '70th Anniversary', '70th Anniversary Unlimited', '75th Anniversary Edition', '75th Anniversary Edition Unlimited', '80th Edition', '80th Edition Unlimited',
      'Freedom Edition', 'Freedom Edition (JK)', 'Freedom Edition Unlimited', 'Sport Freedom Edition', 'Sport Freedom Edition Unlimited',
      'Altitude', 'Altitude (JK)', 'Altitude Unlimited', 'Backcountry', 'Backcountry Unlimited', 'Big Bear', 'Big Bear Unlimited',
      'Black Bear', 'Black Bear Unlimited', 'Black & Tan', 'Chief', 'Dragon Edition', 'Dragon Edition Unlimited',
      'Golden Eagle', 'Golden Eagle (JK)', 'Islander', 'Polar Edition', 'Polar Edition Unlimited', 'Recon', 'Recon Unlimited',
      'Renegade', 'Smoky Mountain', 'Winter', 'X',
      // Trim with Doors
      'Sport SUV 2D', 'Sport SUV 4D', 'Sport Utility 2D', 'Sport Utility 4D',
      'Unlimited Sport SUV 2D', 'Unlimited Sport SUV 4D', 'Unlimited Sport Utility 2D', 'Unlimited Sport Utility 4D',
      'Unlimited Rubicon Sport Utility 2D', 'Unlimited Rubicon Sport Utility 4D',
      'Unlimited Sahara Sport Utility 2D', 'Unlimited Sahara Sport Utility 4D',
      'Unlimited Willys Wheeler Sport Utility 2D', 'Unlimited Willys Wheeler Sport Utility 4D',
      // Hybrid & Special
      '4xe (Hybrid)', 'Rubicon 392 (V8)', 'Rubicon 392 Sport Utility 4D',
      // RHD & Special Variants
      'Sport RHD', 'Sport RHD SUV 4D', 'Sport RHD Sport Utility 4D',
      // SE Models
      'SE', 'SE Sport Utility 2D',
      // High Altitude
      'High Altitude', 'High Altitude Unlimited',
      // Unlimited Special Editions
      'Unlimited 70th Anniversary Sport Utility 4D', 'Unlimited 75th Anniversary Edition Sport Utility 4D',
      'Unlimited Altitude Sport Utility 4D', 'Unlimited Backcountry Sport Utility 4D', 'Unlimited Black Bear Sport Utility 4D',
      'Unlimited Dragon Edition Sport Utility 4D', 'Unlimited Freedom Edition Sport Utility 4D',
      'Unlimited Freedom Sport Utility 4D', 'Unlimited Polar Edition Sport Utility 4D',
      'Unlimited Rubicon 10th Anniversary Sport Utility 4D', 'Unlimited Rubicon Hard Rock Sport Utility 4D',
      'Unlimited Rubicon Sport Utility 2D', 'Unlimited Rubicon Sport Utility 4D', 'Unlimited Rubicon X Sport Utility 4D',
      'Unlimited Sahara Moab Sport Utility 4D', 'Unlimited X Sport Utility 4D',
      // All New Models
      'All New Rubicon', 'All New Sport S', 'All New Sport',
      // S Models
      'S Sport Utility', 'S Sport Utility 2D'
    ],
  'Cherokee': ['Latitude', 'Latitude Plus', 'Altitude', 'Trailhawk', 'Limited', 'Overland'],
  'Grand Cherokee': ['Laredo', 'Altitude', 'Limited', 'Overland', 'Summit', 'Trailhawk', 'Trackhawk (SRT)'],
  'Compass': ['Sport', 'Latitude', 'Limited', 'Trailhawk', 'High Altitude'],
  'Renegade': ['Sport', 'Latitude', 'Altitude', 'Limited', 'Trailhawk', 'Upland'],
  'Gladiator': ['Sport', 'Sport S', 'Willys', 'Overland', 'Rubicon', 'Mojave', 'High Altitude'],
    'Patriot': ['Sport', 'Latitude', 'Limited', 'High Altitude'],
    'Grand Wagoneer': ['Series I', 'Series II', 'Series III', 'Obsidian']
  },
  
  // Ford
  'Ford': {
    'F-150': ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor', 'Tremor'],
    'Bronco': ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Badlands', 'Wildtrak', 'Everglades', 'Raptor'],
    'Edge': ['SE', 'SEL', 'ST', 'Titanium', 'ST-Line'],
    'Escape': ['S', 'SE', 'SEL', 'Titanium', 'ST-Line', 'PHEV'],
    'Explorer': ['XLT', 'Limited', 'ST', 'Platinum', 'King Ranch', 'Timberline'],
    'Expedition': ['XL', 'XLT', 'Limited', 'King Ranch', 'Platinum', 'Timberline'],
    'Focus': ['S', 'SE', 'SEL', 'Titanium', 'ST', 'RS'],
    'Fusion': ['S', 'SE', 'SEL', 'Titanium', 'Sport'],
    'Maverick': ['XL', 'XLT', 'Lariat', 'FX4'],
    'Mustang': ['EcoBoost', 'GT', 'Mach 1', 'Shelby GT500', 'Dark Horse'],
    'Ranger': ['XL', 'XLT', 'Lariat', 'Tremor', 'Raptor'],
    'Transit': ['XL', 'XLT', 'Limited']
  },
  
  // Honda
  'Honda': {
    'Civic': ['LX', 'Sport', 'EX', 'EX-L', 'Touring', 'Si', 'Type R'],
    'Accord': ['LX', 'Sport', 'EX-L', 'Touring', 'Hybrid'],
    'CR-V': ['LX', 'EX', 'EX-L', 'Touring', 'Hybrid', 'Sport Touring'],
    'Pilot': ['LX', 'EX', 'EX-L', 'Touring', 'Elite', 'TrailSport'],
    'Passport': ['Sport', 'EX-L', 'Elite', 'TrailSport'],
    'Ridgeline': ['Sport', 'RTL', 'RTL-E', 'Black Edition'],
    'HR-V': ['LX', 'EX', 'EX-L', 'Sport'],
    'Fit': ['LX', 'Sport', 'EX', 'EX-L'],
    'Insight': ['LX', 'EX', 'Touring']
  },
  
  // Toyota
  'Toyota': {
    'Camry': ['LE', 'SE', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid XLE', 'Hybrid XSE'],
    'Corolla': ['L', 'LE', 'XLE', 'SE', 'XSE', 'Apex', 'Hybrid LE'],
    'RAV4': ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Limited', 'Hybrid', 'Prime'],
    'Highlander': ['LE', 'XLE', 'XSE', 'Limited', 'Platinum', 'Hybrid'],
    '4Runner': ['SR5', 'TRD Off-Road', 'TRD Pro', 'Limited', 'Nightshade'],
    'Tacoma': ['SR', 'SR5', 'TRD Off-Road', 'TRD Sport', 'TRD Pro', 'Limited'],
    'Tundra': ['SR', 'SR5', 'Limited', 'Platinum', 'TRD Pro', 'Capstone'],
    'Prius': ['LE', 'XLE', 'Limited', 'Prime'],
    'Avalon': ['XLE', 'XSE', 'Limited', 'Touring', 'TRD'],
    'Sienna': ['LE', 'XLE', 'XSE', 'Limited', 'Platinum'],
    'Venza': ['LE', 'XLE', 'Limited'],
    'C-HR': ['LE', 'XLE', 'Nightshade']
  },
  
  // Nissan
  'Nissan': {
    'Altima': ['S', 'SR', 'SV', 'SL', 'Platinum'],
    'Sentra': ['S', 'SV', 'SR', 'Premium'],
    'Maxima': ['S', 'SV', 'SR', 'Platinum', 'SR Premium'],
    'Rogue': ['S', 'SV', 'SL', 'Platinum', 'Midnight Edition'],
    'Pathfinder': ['S', 'SV', 'SL', 'Platinum'],
    'Murano': ['S', 'SV', 'SL', 'Platinum'],
    'Frontier': ['S', 'SV', 'Pro-4X', 'SL', 'Pro-X'],
    'Titan': ['S', 'SV', 'Pro-4X', 'SL', 'Platinum Reserve'],
    '370Z': ['Sport', 'Sport Touring', 'NISMO'],
    'GT-R': ['Premium Edition', 'Track Edition', 'NISMO'],
    'Armada': ['S', 'SV', 'SL', 'Platinum'],
    'Versa': ['S', 'SV', 'SR']
  },
  
  // Hyundai
  'Hyundai': {
    'Elantra': ['SE', 'SEL', 'Limited', 'N Line', 'N'],
    'Sonata': ['SE', 'SEL', 'Limited', 'N Line', 'N'],
    'Santa Fe': ['SE', 'SEL', 'Limited', 'Calligraphy'],
    'Tucson': ['SE', 'SEL', 'Limited', 'N Line'],
    'Palisade': ['SE', 'SEL', 'Limited', 'Calligraphy'],
    'Kona': ['SE', 'SEL', 'Limited', 'N Line', 'N'],
    'Venue': ['SE', 'SEL', 'Limited'],
    'Veloster': ['2.0', 'Turbo', 'N'],
    'Genesis': ['G70', 'G80', 'G90']
  },
  
  // Kia
  'Kia': {
    'Forte': ['FE', 'LXS', 'GT-Line', 'GT'],
    'Optima': ['LX', 'EX', 'SX', 'SX Turbo'],
    'Sorento': ['LX', 'S', 'EX', 'SX', 'SX-Prestige'],
    'Sportage': ['LX', 'EX', 'SX', 'SX-Prestige'],
    'Telluride': ['LX', 'S', 'EX', 'SX', 'SX-Prestige', 'X-Pro'],
    'Soul': ['LX', 'S', 'GT-Line', 'EX', 'X-Line'],
    'Niro': ['LX', 'EX', 'EX Premium', 'S Touring'],
    'Stinger': ['GT-Line', 'GT1', 'GT2'],
    'Seltos': ['LX', 'S', 'EX', 'SX']
  },
  
  // Dodge
  'Dodge': {
    'Challenger': ['SXT', 'GT', 'R/T', 'Scat Pack', 'Hellcat', 'Hellcat Redeye', 'Demon'],
    'Charger': ['SXT', 'GT', 'R/T', 'Scat Pack', 'Hellcat', 'Hellcat Redeye'],
    'Durango': ['SXT', 'GT', 'Citadel', 'R/T', 'SRT', 'SRT Hellcat'],
    'Journey': ['SE', 'SXT', 'Crossroad', 'GT'],
    'Grand Caravan': ['SE', 'SXT', 'GT']
  },
  
  // Ram
  'Ram': {
    '1500': ['Tradesman', 'Big Horn', 'Laramie', 'Longhorn', 'Limited', 'TRX', 'Rebel'],
    '2500': ['Tradesman', 'Big Horn', 'Laramie', 'Longhorn', 'Limited'],
    '3500': ['Tradesman', 'Big Horn', 'Laramie', 'Longhorn', 'Limited'],
    'ProMaster': ['1500', '2500', '3500', '3500 Extended', '3500 High Roof'],
    'ProMaster City': ['Base', 'SLT']
  },
  
  // GMC
  'GMC': {
    'Sierra 1500': ['Base', 'SLE', 'Elevation', 'SLT', 'AT4', 'Denali', 'Pro', 'Work Truck (WT)', 'Custom', 'Z71'],
    'Sierra 2500 HD': ['Base', 'SLE', 'SLT', 'AT4', 'Denali', 'Pro', 'Work Truck (WT)', 'Custom', 'Z71'],
    'Sierra 3500 HD': ['Base', 'SLE', 'SLT', 'AT4', 'Denali', 'Pro', 'Work Truck (WT)', 'Custom', 'Z71'],
    'Acadia': ['SLE', 'SLT', 'AT4', 'Denali'],
    'Yukon': ['SLE', 'SLT', 'AT4', 'Denali'],
    'Yukon XL': ['SLE', 'SLT', 'AT4', 'Denali'],
    'Terrain': ['SLE', 'SLT', 'AT4'],
    'Canyon': ['SLE', 'Elevation', 'AT4'],
    'Savana': ['1500', '2500', '3500', 'Commercial Cutaway']
  },
  
  // BMW
  'BMW': {
    '3 Series': ['320i', '330i', '330e', 'M340i', 'M3', 'M3 Competition'],
    '5 Series': ['530i', '530e', '540i', 'M550i', 'M5', 'M5 Competition'],
    '7 Series': ['740i', '750i', '760i', 'M760i', 'Alpina B7'],
    'X1': ['sDrive28i', 'xDrive28i'],
    'X3': ['sDrive30i', 'xDrive30i', 'M40i'],
    'X5': ['sDrive40i', 'xDrive40i', 'M50i', 'X5 M'],
    'X7': ['xDrive40i', 'xDrive50i', 'M50i', 'M60i', 'Alpina XB7'],
    'i3': ['Base', 's', 'REx'],
    'i8': ['Base', 'Roadster'],
    'Z4': ['sDrive30i', 'M40i', 'M40i Roadster']
  },
  
  // Mercedes-Benz
  'Mercedes-Benz': {
    'A-Class': ['A 220', 'A 220 4MATIC', 'AMG A 35', 'AMG A 45'],
    'C-Class': ['C 300', 'C 300 4MATIC', 'AMG C 43', 'AMG C 63'],
    'CLA': ['CLA 250', 'CLA 250 4MATIC', 'AMG CLA 35', 'AMG CLA 45'],
    'E-Class': ['E 350', 'E 350 4MATIC', 'AMG E 53', 'AMG E 63'],
    'S-Class': ['S 500', 'S 580', 'AMG S 63', 'Maybach'],
    'G-Class': ['G 550', 'AMG G 63'],
    'GLA': ['GLA 250', 'GLA 250 4MATIC', 'AMG GLA 35', 'AMG GLA 45'],
    'GLC': ['GLC 300', 'GLC 300 4MATIC', 'AMG GLC 43', 'AMG GLC 63'],
    'GLE': ['GLE 350', 'GLE 350 4MATIC', 'AMG GLE 53', 'AMG GLE 63'],
    'GLS': ['GLS 450', 'GLS 580', 'AMG GLS 63', 'Maybach']
  },
  
  // Audi
  'Audi': {
    'A3': ['Premium', 'Premium Plus', 'Prestige', 'S3'],
    'A4': ['Premium', 'Premium Plus', 'Prestige', 'S4'],
    'A6': ['Premium', 'Premium Plus', 'Prestige', 'S6'],
    'A8': ['Premium', 'Premium Plus', 'Prestige'],
    'Q3': ['Premium', 'Premium Plus', 'Prestige'],
    'Q5': ['Premium', 'Premium Plus', 'Prestige', 'SQ5'],
    'Q7': ['Premium', 'Premium Plus', 'Prestige', 'SQ7'],
    'Q8': ['Premium', 'Premium Plus', 'Prestige'],
    'R8': ['R8', 'R8 Performance'],
    'TT': ['Premium', 'Premium Plus', 'Prestige']
  },
  
  // Lexus
  'Lexus': {
    'ES': ['ES 250', 'ES 300', 'ES 350', 'ES 300h', 'ES 350h', 'F Sport', 'Ultra Luxury'],
    'GS': ['GS 350', 'GS 450h', 'GS F'],
    'IS': ['IS 300', 'IS 350', 'IS 500 F Sport'],
    'LS': ['LS 500', 'LS 500h', 'LS 600h L'],
    'NX': ['NX 250', 'NX 350', 'NX 350h', 'NX 450h+', 'F Sport'],
    'RX': ['RX 350', 'RX 350h', 'RX 450h', 'RX 450h+', 'F Sport'],
    'GX': ['GX 460', 'Luxury'],
    'LX': ['LX 600', 'F Sport'],
    'LC': ['LC 500', 'LC 500h'],
    'RC': ['RC 300', 'RC 350', 'RC F']
  },
  
  // Acura
  'Acura': {
    'TLX': ['A-Spec', 'Technology', 'A-Spec Technology', 'Type S'],
    'MDX': ['A-Spec', 'Technology', 'A-Spec Technology', 'Type S'],
    'RDX': ['A-Spec', 'Technology', 'A-Spec Technology', 'Type S'],
    'ILX': ['Premium', 'Technology', 'A-Spec'],
    'NSX': ['Base', 'Type S'],
    'CDX': ['A-Spec', 'Technology', 'A-Spec Technology'],
    'RLX': ['Base', 'Technology', 'Advance', 'Sport Hybrid']
  },
  
  // Mazda
  'Mazda': {
    'Mazda3': ['2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', 'Turbo'],
    'Mazda6': ['Sport', 'Touring', 'Grand Touring', 'Carbon Edition', 'Signature'],
    'CX-5': ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature', 'Turbo'],
    'CX-9': ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature'],
    'CX-30': ['2.5 S', '2.5 S Select', '2.5 S Preferred', '2.5 S Premium', 'Turbo'],
    'CX-3': ['Sport', 'Touring', 'Grand Touring'],
    'MX-5 Miata': ['Sport', 'Club', 'Grand Touring', 'RF']
  },
  
  // Subaru
  'Subaru': {
    'Impreza': ['Base', 'Premium', 'Sport', 'Limited'],
    'Legacy': ['Base', 'Premium', 'Sport', 'Limited', 'XT'],
    'Outback': ['Base', 'Premium', 'Onyx Edition', 'Limited', 'Touring', 'Wilderness', 'XT'],
    'Forester': ['Base', 'Premium', 'Sport', 'Limited', 'Touring', 'Wilderness'],
    'Crosstrek': ['Base', 'Premium', 'Sport', 'Limited', 'Wilderness'],
    'Ascent': ['Base', 'Premium', 'Limited', 'Touring', 'Onyx Edition'],
    'WRX': ['Base', 'Premium', 'Limited', 'GT'],
    'BRZ': ['Premium', 'Limited']
  },
  
  // Volkswagen
  'Volkswagen': {
    'Jetta': ['S', 'SE', 'SEL', 'R-Line'],
    'Passat': ['S', 'SE', 'R-Line', 'SEL Premium'],
    'Golf': ['S', 'SE', 'SEL', 'GTI', 'R'],
    'Tiguan': ['S', 'SE', 'SEL', 'R-Line'],
    'Atlas': ['S', 'SE', 'SEL', 'SEL Premium', 'R-Line'],
    'Arteon': ['SE', 'SEL', 'SEL Premium R-Line'],
    'ID.4': ['Pro', 'Pro S', 'AWD Pro'],
    'Beetle': ['S', 'SE', 'Final Edition']
  },
  
  // Tesla
  'Tesla': {
    'Model 3': ['Standard Range Plus', 'Long Range', 'Performance'],
    'Model S': ['Long Range', 'Plaid', 'Plaid+'],
    'Model X': ['Long Range', 'Plaid'],
    'Model Y': ['Long Range', 'Performance'],
    'Cybertruck': ['Single Motor', 'Dual Motor', 'Tri Motor'],
    'Roadster': ['Base', 'Founders Edition']
  },
  
  // Additional makes
  'Chrysler': {
    '300': ['Touring', 'Limited', 'S', 'C', 'C Platinum'],
    '200': ['LX', 'Limited', 'S', 'C'],
    'Pacifica': ['Touring', 'Touring L', 'Limited', 'Pinnacle'],
    'Voyager': ['LX', 'LXI']
  },
  
  'Buick': {
    'Enclave': ['Preferred', 'Essence', 'Avenir'],
    'Encore': ['Preferred', 'Essence', 'Avenir'],
    'Envision': ['Preferred', 'Essence', 'Avenir'],
    'Cascada': ['Base', 'Premium'],
    'LaCrosse': ['Essence', 'Preferred', 'Premium', 'Avenir'],
    'Regal': ['Base', 'Preferred', 'Essence', 'GS', 'Avenir']
  },
  
  'Cadillac': {
    'Escalade': ['Luxury', 'Premium Luxury', 'Platinum', 'V', 'ESV'],
    'XT5': ['Luxury', 'Premium Luxury', 'Platinum', 'Sport'],
    'XT6': ['Luxury', 'Premium Luxury', 'Sport'],
    'CT6': ['Luxury', 'Premium Luxury', 'Platinum', 'V-Sport'],
    'ATS': ['Luxury', 'Premium Luxury', 'V-Sport', 'V'],
    'CTS': ['Luxury', 'Premium Luxury', 'V-Sport', 'V'],
    'XTS': ['Luxury', 'Premium', 'Platinum', 'V-Sport'],
    'XT4': ['Luxury', 'Premium Luxury', 'Sport']
  },
  
  'Lincoln': {
    'Navigator': ['Standard', 'Reserve', 'Black Label', 'L'],
    'Aviator': ['Standard', 'Reserve', 'Black Label', 'Grand Touring'],
    'Corsair': ['Standard', 'Reserve', 'Black Label'],
    'Continental': ['Select', 'Reserve', 'Black Label'],
    'MKC': ['Premier', 'Reserve', 'Black Label'],
    'MKT': ['Base', 'Limited'],
    'MKX': ['Premier', 'Reserve', 'Black Label'],
    'MKZ': ['Premier', 'Reserve', 'Black Label']
  },
  
  'Infiniti': {
    'Q50': ['Pure', 'Luxe', 'Essential', 'Sensory', 'Red Sport'],
    'Q60': ['Pure', 'Luxe', 'Essential', 'Sensory', 'Red Sport'],
    'Q70': ['3.7', '5.6', 'Luxe', 'Premium', 'Sport'],
    'QX50': ['Pure', 'Luxe', 'Essential', 'Sensory'],
    'QX60': ['Pure', 'Luxe', 'Essential', 'Sensory', 'Autograph'],
    'QX80': ['Luxe', 'Sensory', 'Autograph'],
    'FX': ['35', '37', '50', '50 Sport'],
    'G37': ['Journey', 'Sport', 'S', 'XS', 'Coupe', 'Sedan']
  },
  
  'Mitsubishi': {
    'Outlander': ['ES', 'LE', 'SE', 'SEL', 'GT'],
    'Eclipse Cross': ['ES', 'LE', 'SEL', 'SE'],
    'Mirage': ['ES', 'LE', 'GT'],
    'Mirage G4': ['ES', 'LE', 'SE'],
    'Lancer': ['ES', 'SE', 'SEL', 'Evolution']
  },
  
  'Volvo': {
    'S60': ['Momentum', 'R-Design', 'Inscription', 'Polestar Engineered'],
    'S90': ['Momentum', 'R-Design', 'Inscription'],
    'V60': ['Momentum', 'R-Design', 'Inscription', 'Cross Country'],
    'V90': ['Momentum', 'R-Design', 'Inscription', 'Cross Country'],
    'XC40': ['Momentum', 'R-Design', 'Inscription'],
    'XC60': ['Momentum', 'R-Design', 'Inscription', 'Polestar Engineered'],
    'XC90': ['Momentum', 'R-Design', 'Inscription', 'Excellence']
  },
  
  // Mini - models are structured as trims
  'Mini': {
    'Cooper': ['Base', 'S', 'SE', 'JCW'],
    'Hardtop': ['Base', 'S', 'JCW', '2-Door', '4-Door'],
    'Countryman': ['Base', 'S', 'SE', 'JCW', 'ALL4'],
    'Clubman': ['Base', 'S', 'JCW', 'ALL4'],
    'Convertible': ['Base', 'S', 'JCW'],
    'Paceman': ['Base', 'S', 'JCW'],
    'Roadster': ['Base', 'S', 'JCW']
  }
}

// Make-specific trims
const makeSpecificTrims: Record<string, string[]> = {
  'Mini': ['Base', 'Cooper', 'Cooper S', 'Cooper SE', 'Cooper JCW', 'Hardtop', 'Hardtop S', 'Hardtop JCW', 'Convertible', 'Convertible S', 'Convertible JCW', 'Clubman', 'Clubman S', 'Clubman JCW', 'Countryman', 'Countryman S', 'Countryman JCW', 'Paceman', 'Roadster'],
  'BMW': ['Base', 'M Sport', 'M Performance', 'xDrive', 'sDrive', 'M3', 'M5', 'M8', 'Alpina'],
  'Mercedes-Benz': ['Base', 'AMG', 'AMG Line', '4MATIC', 'EQ', 'Maybach'],
  'Audi': ['Base', 'S-Line', 'RS', 'Quattro', 'e-tron', 'S', 'RS'],
  'Toyota': ['Base', 'LE', 'XLE', 'Limited', 'Platinum', 'TRD', 'Hybrid', 'Prime'],
  'Honda': ['Base', 'LX', 'EX', 'EX-L', 'Touring', 'Sport', 'Type R', 'Hybrid'],
  'Ford': ['Base', 'S', 'SE', 'SEL', 'Titanium', 'ST', 'RS', 'Platinum', 'King Ranch'],
  'Chevrolet': ['Base', 'LS', 'LT', 'LTZ', 'SS', 'RS', 'Z71', 'Premier', 'Work Truck (WT)', 'Custom', 'Custom Trail Boss', 'RST', 'LT Trail Boss', 'ZR2', 'High Country'],
  'Silverado 1500': ['Work Truck (WT)', 'Custom', 'Custom Trail Boss', 'LT', 'RST', 'LT Trail Boss', 'LTZ', 'ZR2', 'High Country'],
  'Silverado 2500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
  'Silverado 3500 HD': ['Work Truck (WT)', 'Custom', 'LT', 'LTZ', 'High Country'],
  'Nissan': ['Base', 'S', 'SV', 'SL', 'Platinum', 'NISMO', 'SR'],
  'Hyundai': ['Base', 'SE', 'SEL', 'Limited', 'N Line', 'N'],
  'Kia': ['Base', 'LX', 'EX', 'SX', 'GT-Line', 'GT'],
  'Mazda': ['Base', 'Sport', 'Touring', 'Grand Touring', 'Signature'],
  'Subaru': ['Base', 'Premium', 'Limited', 'Touring', 'STI', 'Wilderness'],
  'Volkswagen': ['Base', 'S', 'SE', 'SEL', 'R-Line', 'GTI', 'R'],
  'Lexus': ['Base', 'F Sport', 'Luxury', 'Ultra Luxury', 'F'],
  'Acura': ['Base', 'Technology', 'A-Spec', 'Advance', 'Type S'],
  'Infiniti': ['Base', 'Pure', 'Luxe', 'Essential', 'Sensory', 'Autograph'],
  'Cadillac': ['Base', 'Luxury', 'Premium Luxury', 'Platinum', 'V'],
  'Lincoln': ['Base', 'Premier', 'Reserve', 'Black Label'],
  'Buick': ['Base', 'Preferred', 'Essence', 'Avenir'],
  'GMC': ['Base', 'SLE', 'SLT', 'Denali', 'AT4'],
  'Ram': ['Base', 'Tradesman', 'Big Horn', 'Laramie', 'Rebel', 'Limited', 'TRX'],
  'Jeep': ['Base', 'Sport', 'Sahara', 'Rubicon', 'High Altitude', 'Trailhawk'],
  'Dodge': ['Base', 'SXT', 'GT', 'R/T', 'Scat Pack', 'Hellcat', 'Demon'],
  'Chrysler': ['Base', 'LX', 'Limited', 'S', 'C', 'Touring', 'Pinnacle', 'LXI'],
  'Tesla': ['Standard Range', 'Long Range', 'Performance', 'Plaid']
}

// Organized vehicle features by category
const vehicleFeatures = {
  'Exterior': [
    'Alloy Wheels', 'Chrome Wheels', 'Steel Wheels', 'Premium Wheels', 'Fog Lights', 'LED Headlights', 'Xenon Headlights', 'Halogen Headlights', 'Daytime Running Lights', 'Power Mirrors', 'Heated Mirrors', 'Auto-Dimming Mirrors', 'Tinted Windows', 'Privacy Glass', 'Spoiler', 'Running Boards', 'Roof Rails', 'Tow Package', 'Trailer Hitch'
  ],
  'Interior': [
    'Leather Seats', 'Cloth Seats', 'Vinyl Seats', 'Heated Seats', 'Cooled Seats', 'Power Seats', 'Memory Seats', 'Lumbar Support', 'Split Folding Rear Seats', 'Stow \'n Go Seating', 'Third Row Seating', 'Captain\'s Chairs', 'Bench Seating', 'Leather Steering Wheel', 'Wood Trim', 'Carbon Fiber Trim', 'Ambient Lighting', 'Cargo Cover', 'Cargo Net'
  ],
  'Climate Control': [
    'Air Conditioning', 'Automatic Climate Control', 'Dual Zone Climate Control', 'Tri-Zone Climate Control', 'Rear Climate Control', 'Heated Steering Wheel', 'Heated Seats', 'Cooled Seats', 'Remote Start', 'Defrost System'
  ],
  'Technology & Audio': [
    'AM/FM Radio', 'CD Player', 'MP3 Player', 'USB Port', 'Auxiliary Input', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Touchscreen Radio', '7" Touchscreen', '8" Touchscreen', '8.4" Touchscreen', '10" Touchscreen', '12" Touchscreen', 'Uconnect Touchscreen', 'Navigation System', 'GPS', 'Satellite Radio', 'HD Radio', 'Premium Audio', 'Bose Audio', 'Harman Kardon', 'JBL Audio', 'Infotainment System', 'WiFi Hotspot', 'Wireless Charging'
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
    'Sunroof', 'Moonroof', 'Panoramic Sunroof', 'Convertible Top', 'Hardtop', 'Soft Top', 'Removable Hard Top', 'T-Top', 'Targa Top', 'Hatchback', 'Liftback', 'Wagon', 'Crossover', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'Turbocharged', 'Supercharged', 'V6 Engine', 'V8 Engine', '4-Cylinder Engine', '6-Cylinder Engine', '8-Cylinder Engine'
  ]
}

// Description templates
const descriptionTemplates = [
  {
    name: 'Standard',
    description: 'Excellent condition, well-maintained, low miles'
  },
  {
    name: 'Premium', 
    description: 'One owner, garage kept, recent service'
  },
  {
    name: 'Value',
    description: 'Great value, perfect for families, financing available'
  },
  {
    name: 'Urgency',
    description: 'Rare find, pristine condition, won\'t last long'
  }
]

export default function AddVehicle() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null)
  const [customTemplates, setCustomTemplates] = useState(descriptionTemplates)
  const [searchingVehicle, setSearchingVehicle] = useState(false)
  const [vehicleSearchResult, setVehicleSearchResult] = useState<any>(null)
  const router = useRouter()

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
    downPayment: 999
  })
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin/login')
    }
  }, [router])

  // Auto-search vehicle information when year, make, model, and trim are all filled
  useEffect(() => {
    let cancelled = false

    // Only search if we have year, make, model (trim is optional)
    if (!formData.year || !formData.make || !formData.model) {
      return
    }

    const searchVehicleInfo = async () => {
      if (cancelled) return

      setSearchingVehicle(true)
      console.log('Starting vehicle search for:', formData.year, formData.make, formData.model, formData.trim)

      try {
        const queryParams = new URLSearchParams({
          year: formData.year,
          make: formData.make,
          model: formData.model
        })
        
        if (formData.trim) {
          queryParams.append('trim', formData.trim)
        }

        const response = await fetch(`/api/vehicle-search?${queryParams}`)
        const data = await response.json()

        console.log('Vehicle search response:', data)

        if (cancelled) return

        if (data.success && data.specs) {
          console.log('Populating fields with:', data.specs)
          setVehicleSearchResult(data.specs)
          
          // Auto-populate fields (always update if data is available)
          setFormData(prev => {
            const updates: any = {}
            
            // Always update engine and mpg if we got them from search
            if (data.specs.engine) {
              updates.engine = data.specs.engine
            }
            if (data.specs.mpg) {
              updates.mpg = data.specs.mpg
            }
            
            // Update transmission if we have data, otherwise keep current
            if (data.specs.transmission) {
              updates.transmission = data.specs.transmission
            }
            
            // Update drivetrain if we have data, otherwise keep current
            if (data.specs.drivetrain) {
              updates.drivetrain = data.specs.drivetrain
            }

            console.log('Form data updates:', updates)
            if (Object.keys(updates).length > 0) {
              return { ...prev, ...updates }
            }
            return prev
          })
        } else {
          console.warn('Vehicle search did not return specs:', data)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error searching vehicle info:', error)
        }
      } finally {
        if (!cancelled) {
          setSearchingVehicle(false)
        }
      }
    }

    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(() => {
      searchVehicleInfo()
    }, 1500) // Wait 1.5 seconds after user stops typing

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      setSearchingVehicle(false)
    }
  }, [formData.year, formData.make, formData.model, formData.trim])

  // Format number with commas
  const formatNumber = (value: string): string => {
    const number = value.replace(/,/g, '')
    if (number === '') return ''
    return parseInt(number).toLocaleString()
  }

  // Parse number from formatted string
  const parseNumber = (value: string): string => {
    return value.replace(/,/g, '')
  }

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
      'Bronco': ['2.3L Turbo 4-Cylinder', '2.7L Turbo V6'],
      'Edge': ['2.0L Turbo 4-Cylinder', '2.7L Turbo V6'],
      'Escape': ['1.5L Turbo 3-Cylinder', '2.0L Turbo 4-Cylinder', '2.5L Hybrid'],
      'Explorer': ['2.3L Turbo 4-Cylinder', '3.3L Hybrid', '3.0L Turbo V6'],
      'Expedition': ['3.5L Turbo V6'],
      'Focus': ['2.0L 4-Cylinder', '1.0L Turbo 3-Cylinder'],
      'Fusion': ['2.5L Hybrid', '2.0L Turbo 4-Cylinder'],
      'Maverick': ['2.5L Hybrid', '2.0L Turbo 4-Cylinder'],
      'Mustang': ['2.3L Turbo 4-Cylinder', '5.0L V8', '5.2L Supercharged V8'],
      'Ranger': ['2.3L Turbo 4-Cylinder'],
      'Transit': ['3.5L V6', '3.5L EcoBoost V6']
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
      '3500': ['6.4L V8', '6.7L Turbo Diesel I6']
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
      'Durango': ['3.6L V6', '5.7L V8', '6.4L V8', '6.2L Supercharged V8']
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
    'Mitsubishi': ['2.0L 4-Cylinder', '2.4L 4-Cylinder', '3.0L V6']
  }

  // Get engine options based on make and model
  const getEngineOptions = (make: string, model: string): string[] => {
    // First, check for model-specific engines (most accurate)
    if (modelSpecificEngines[make] && modelSpecificEngines[make][model]) {
      return modelSpecificEngines[make][model]
    }
    
    // Fall back to make-specific engines if no model-specific engines found
    return makeSpecificEngines[make] || [
      '1.5L 4-Cylinder',
      '2.0L 4-Cylinder',
      '2.5L 4-Cylinder',
      '3.0L V6',
      '3.5L V6',
      '5.0L V8',
      'Electric Motor'
    ]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Handle number formatting for price and miles
    if (name === 'price' || name === 'miles') {
      const numericValue = parseNumber(value)
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }))
      }
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Reset dependent fields when make or model changes
    if (name === 'make') {
      setFormData(prev => ({ ...prev, model: '', trim: '', engine: '' }))
    }
    if (name === 'model') {
      setFormData(prev => ({ ...prev, trim: '', engine: '' }))
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

  const handleImagesChange = useCallback((images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }))
  }, [])

  const generateAIDescription = async () => {
    if (!formData.images || formData.images.length === 0) {
      alert('Please upload at least one image to generate an AI description.')
      return
    }

    setAiLoading(true)
    try {
      // Simulate AI API call - replace with actual AI service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI-generated description
      const aiDescription = `This ${formData.year} ${formData.make} ${formData.model} ${formData.trim} is in ${formData.condition.toLowerCase()} condition with ${formData.miles ? formatNumber(formData.miles) : 'low'} miles. Features include ${formData.features.join(', ') || 'modern amenities'}. This vehicle offers excellent value and reliability.`
      
      setFormData(prev => ({
        ...prev,
        description: aiDescription
      }))
    } catch (error) {
      console.error('Error generating AI description:', error)
      alert('Failed to generate AI description. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const applyTemplate = (template: any) => {
    const description = template.description
      .replace('{year}', formData.year)
      .replace('{make}', formData.make)
      .replace('{model}', formData.model)
      .replace('{miles}', formData.miles ? formatNumber(formData.miles) : 'low')
      .replace('{features}', formData.features.join(', ') || 'modern amenities')
    
    setFormData(prev => ({
      ...prev,
      description: description
    }))
  }

  const editTemplate = (index: number) => {
    setEditingTemplate(index)
  }

  const saveTemplate = (index: number, newDescription: string) => {
    const updatedTemplates = [...customTemplates]
    updatedTemplates[index].description = newDescription
    setCustomTemplates(updatedTemplates)
    setEditingTemplate(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.year) newErrors.year = 'Year is required'
    if (!formData.make) newErrors.make = 'Make is required'
    if (!formData.model) newErrors.model = 'Model is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.miles) newErrors.miles = 'Miles is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'

    // Numeric validation
    if (formData.price && (isNaN(Number(parseNumber(formData.price))) || Number(parseNumber(formData.price)) <= 0)) {
      newErrors.price = 'Please enter a valid price'
    }
    if (formData.miles && (isNaN(Number(parseNumber(formData.miles))) || Number(parseNumber(formData.miles)) < 0)) {
      newErrors.miles = 'Please enter valid mileage'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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

      // Call the API to save the vehicle
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()
      console.log('API response:', result)

      if (!response.ok) {
        console.error('API error details:', result)
        throw new Error(result.error || 'Failed to save vehicle')
      }

      console.log('Vehicle saved successfully:', result)
      alert('Vehicle added successfully!')
      // Force refresh the inventory page
      router.push('/admin/inventory?refresh=' + Date.now())
    } catch (error) {
      console.error('Error adding vehicle:', error)
      alert(`Failed to add vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/inventory" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Inventory
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
                <p className="text-sm text-gray-600">Add a new vehicle to your inventory</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* AI Assistant Toggle */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-600">Enable AI to auto-generate descriptions from photos</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm font-medium ${aiEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {aiEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => setAiEnabled(!aiEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
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
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 75 }, (_, i) => {
                    const year = 2024 - i
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
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  }`}
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
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.make}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.make ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <SmartSelect
                  name="trim"
                  value={formData.trim}
                  onChange={handleInputChange}
                  options={getTrimOptions(formData.make, formData.model)}
                  placeholder="Select or type trim... ▼"
                  learnType="trims"
                  make={formData.make}
                  model={formData.model}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                {searchingVehicle && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <span className="animate-spin mr-1">⏳</span> Searching vehicle information...
                  </p>
                )}
                {vehicleSearchResult && !searchingVehicle && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <span className="mr-1">✓</span> Vehicle specs found and populated!
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    name="price"
                    value={formData.price ? formatNumber(formData.price) : ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter price"
                    className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miles *</label>
                <input
                  type="text"
                  name="miles"
                  value={formData.miles ? formatNumber(formData.miles) : ''}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter miles"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.miles ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.miles && <p className="text-red-500 text-sm mt-1">{errors.miles}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="downPayment"
                    value={formData.downPayment || ''}
                    onChange={handleInputChange}
                    placeholder="Enter down payment amount"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                  />
                </div>
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
                  value={formData.condition}
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                >
                  <option value="active">Active (For Sale)</option>
                  <option value="pending">Pending Sale</option>
                  <option value="sold">Sold</option>
                  <option value="not-for-sale">Not For Sale</option>
                  <option value="maintenance">In Maintenance</option>
                  <option value="reserved">Reserved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
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
                  value={formData.transmission}
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
                  value={formData.drivetrain}
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
                  value={formData.color}
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
                  value={formData.interiorColor}
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
                  value={formData.vin}
                  onChange={handleInputChange}
                  maxLength={17}
                  placeholder="Optional"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                <SmartSelect
                  name="engine"
                  value={formData.engine}
                  onChange={handleInputChange}
                  options={getEngineOptions(formData.make, formData.model)}
                  placeholder="Select or type engine..."
                  learnType="engines"
                  make={formData.make}
                  model={formData.model}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MPG <span className="text-xs text-gray-500">(City / Highway)</span>
                </label>
                <input
                  type="text"
                  name="mpg"
                  value={formData.mpg}
                  onChange={handleInputChange}
                  placeholder="e.g., 28 City / 39 Highway or 33 Combined"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter MPG format: "28 City / 39 Highway" or "33 Combined" or "N/A" for electric vehicles
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Style</label>
                <select
                  name="bodyStyle"
                  value={formData.bodyStyle}
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
                  value={formData.doors}
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
                  value={formData.passengers}
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
            <div className="space-y-6">
              {/* Features - Clickable Buttons */}
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
                              formData.features.includes(feature)
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
                  Click features to select them. Selected: {formData.features.length} features
                </p>
              </div>

              {/* Description */}
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
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Enter a detailed description of the vehicle..."
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-base ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                {aiEnabled && (
                  <p className="text-sm text-purple-600 mt-1">
                    💡 AI Assistant is enabled. Upload photos and click "Generate with AI" to auto-create descriptions.
                  </p>
                )}
                
                {/* Editable Description Templates */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">💡 Quick Description Templates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customTemplates.map((template, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{template.name}</span>
                          <div className="flex space-x-1">
                            <button
                              type="button"
                              onClick={() => editTemplate(index)}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => applyTemplate(template)}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              Use
                            </button>
                          </div>
                        </div>
                        {editingTemplate === index ? (
                          <div className="space-y-2">
                            <textarea
                              value={template.description}
                              onChange={(e) => {
                                const updatedTemplates = [...customTemplates]
                                updatedTemplates[index].description = e.target.value
                                setCustomTemplates(updatedTemplates)
                              }}
                              className="w-full text-xs p-2 border border-gray-300 rounded"
                              rows={2}
                            />
                            <div className="flex space-x-1">
                              <button
                                type="button"
                                onClick={() => saveTemplate(index, template.description)}
                                className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTemplate(null)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">{template.description}</p>
                        )}
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}