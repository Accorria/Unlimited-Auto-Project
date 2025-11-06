"use client";
import React, { useState, useEffect } from "react";
import VehicleSelector from "./VehicleSelector";
import DocumentUpload, { DocumentFile } from "./DocumentUpload";
import ClientOnly from "./ClientOnly";
import DatePicker from "./DatePicker";

type Applicant = {
  fullName: string;
  srJr: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  state: string;
  streetAddress: string;
  aptNumber: string;
  howLongAtAddress: string;
  city: string;
  zip: string;
  homePhone: string;
  email: string;
  monthlyPayment: string;
  housingStatus: "own" | "rent" | "relative" | "other" | "";
  howLongYears: string;
  howLongMonths: string;
  employmentStatus: "employed" | "unemployed" | "disability" | "retired" | "self-employed" | "student" | "";
  employerName: string;
  employerHowLongYears: string;
  employerHowLongMonths: string;
  employerAddress: string;
  positionTitle: string;
  workPhone: string;
  grossAnnualSalary: string;
  annualAmount: string;
  previousEmployerOrSchool: string;
  previousHowLongYears: string;
  previousHowLongMonths: string;
  otherIncomeSource: string;
  dateOfBirth: string;
  age: string;
  socialSecurityNumber: string;
  // New fields for better UX
  employerHowLongDuration: string; // Dropdown for employment duration
  previousHowLongDuration: string; // Dropdown for previous employment duration
  howLongAtAddressDuration: string; // Dropdown for address duration
};

type Financing = {
  salesPrice: string;
  downPayment: string;
  netTrade: string;
  amountFinanced: string;
  program: string;
  term: string;
  grossCapReduction: string;
  adjustedCap: string;
  msrp: string;
  program2: string;
  paymentTerm: string;
  condition: "new" | "used" | "demo" | "";
  vehicleId: string; // New field for selected vehicle
  year: string;
  make: string;
  model: string;
  retailLeaseVin: string;
  usedValueGuide: "NADA" | "Kelley" | "Black Book" | "";
  bookValue: string;
  mileage: string;
  tradeYear: string;
  tradeMake: string;
  tradeModel: string;
  tradeMileage: string;
  hasTradeIn: boolean;
};

type Reference = {
  name: string;
  relationship: string;
  phone: string;
  address: string;
  trading: "yes" | "no" | "";
  balance: string;
};

type FormData = {
  dealerName: string;
  dealerNumber: string;
  applicant: Applicant;
  jointApplicantEnabled: boolean;
  jointApplicant: Applicant;
  jointApplicantRelationship: string;
  financing: Financing;
  autoCreditReference: Reference;
  otherCreditReference: Reference;
  nearestRelative: Reference;
  friendRelative: Reference;
  consentCallSms: boolean;
  applicantSignature: boolean;
  jointApplicantSignature: boolean;
  applicantSignatureName: string;
  jointApplicantSignatureName: string;
  applicantSignatureDate: string;
  jointApplicantSignatureDate: string;
  customDownPayment: string;
};

const emptyApplicant: Applicant = {
  fullName: "",
  srJr: "",
  firstName: "",
  middleInitial: "",
  lastName: "",
  state: "",
  streetAddress: "",
  aptNumber: "",
  howLongAtAddress: "",
  city: "",
  zip: "",
  homePhone: "",
  email: "",
  monthlyPayment: "",
  housingStatus: "",
  howLongYears: "",
  howLongMonths: "",
  employmentStatus: "",
  employerName: "",
  employerHowLongYears: "",
  employerHowLongMonths: "",
  employerAddress: "",
  positionTitle: "",
  workPhone: "",
  grossAnnualSalary: "",
  annualAmount: "",
  previousEmployerOrSchool: "",
  previousHowLongYears: "",
  previousHowLongMonths: "",
  otherIncomeSource: "",
  dateOfBirth: "",
  age: "",
  socialSecurityNumber: "",
  // New fields
  employerHowLongDuration: "",
  previousHowLongDuration: "",
  howLongAtAddressDuration: "",
};

const emptyReference: Reference = {
  name: "",
  relationship: "",
  phone: "",
  address: "",
  trading: "",
  balance: "",
};

export default function CreditApplicationForm() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  // Fetch vehicles for the dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?dealer=unlimited-auto')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data.vehicles || [])
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      }
    }
    fetchVehicles()
  }, [])

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '')
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 4) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
  }

  // US States array
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  // Vehicle Makes array
  const vehicleMakes = [
    'Acura', 'Audi', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge', 'Ford', 'GMC',
    'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus', 'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi',
    'Nissan', 'Ram', 'Subaru', 'Toyota', 'Volkswagen', 'Volvo'
  ].sort()

  // Vehicle Models by Make
  const vehicleModels: Record<string, string[]> = {
    'Acura': ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'ZDX', 'NSX'],
    'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT'],
    'BMW': ['2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4'],
    'Buick': ['Encore', 'Envision', 'Enclave', 'LaCrosse', 'Regal', 'Cascada'],
    'Cadillac': ['ATS', 'CT4', 'CT5', 'CT6', 'Escalade', 'XT4', 'XT5', 'XT6', 'XTS'],
    'Chevrolet': ['Blazer', 'Camaro', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Impala', 'Malibu', 'Silverado', 'Suburban', 'Tahoe', 'Traverse', 'Trax', 'Volt'],
    'Chrysler': ['300', 'Pacifica', 'Voyager'],
    'Dodge': ['Challenger', 'Charger', 'Durango', 'Grand Caravan', 'Journey', 'Ram Pickup'],
    'Ford': ['Bronco', 'Edge', 'Escape', 'Expedition', 'Explorer', 'F-150', 'F-250', 'F-350', 'Fiesta', 'Focus', 'Fusion', 'Mustang', 'Ranger', 'Taurus'],
    'GMC': ['Acadia', 'Canyon', 'Sierra', 'Terrain', 'Yukon'],
    'Honda': ['Accord', 'Civic', 'Clarity', 'CR-V', 'HR-V', 'Insight', 'Odyssey', 'Passport', 'Pilot', 'Ridgeline'],
    'Hyundai': ['Accent', 'Elantra', 'Ioniq', 'Kona', 'Palisade', 'Santa Fe', 'Sonata', 'Tucson', 'Veloster', 'Venue'],
    'Infiniti': ['Q50', 'Q60', 'Q70', 'QX30', 'QX50', 'QX60', 'QX80'],
    'Jeep': ['Cherokee', 'Compass', 'Grand Cherokee', 'Renegade', 'Wrangler', 'Gladiator', 'Wagoneer'],
    'Kia': ['Forte', 'K5', 'Niro', 'Optima', 'Rio', 'Sedona', 'Sorento', 'Soul', 'Sportage', 'Telluride'],
    'Lexus': ['ES', 'GS', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'UX'],
    'Lincoln': ['Aviator', 'Continental', 'Corsair', 'MKZ', 'Nautilus', 'Navigator'],
    'Mazda': ['CX-3', 'CX-30', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6', 'MX-5 Miata'],
    'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'G-Class'],
    'Mitsubishi': ['Eclipse Cross', 'Mirage', 'Outlander', 'Outlander Sport'],
    'Nissan': ['Altima', 'Armada', 'Frontier', 'Kicks', 'Leaf', 'Maxima', 'Murano', 'Pathfinder', 'Rogue', 'Sentra', 'Titan', 'Versa'],
    'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
    'Subaru': ['Ascent', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'WRX'],
    'Toyota': ['4Runner', 'Avalon', 'Camry', 'C-HR', 'Corolla', 'Highlander', 'Land Cruiser', 'Prius', 'RAV4', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra', 'Venza', 'Yaris'],
    'Volkswagen': ['Arteon', 'Atlas', 'Jetta', 'Passat', 'Tiguan', 'Golf', 'Beetle'],
    'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90']
  }

  // Get models for selected make
  const getModelsForMake = (make: string): string[] => {
    return vehicleModels[make] || []
  }

  // Format mileage with commas
  const formatMileage = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '')
    // Add commas for thousands
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Years at address options
  const yearsAtAddress = Array.from({ length: 51 }, (_, i) => i)

  // Monthly payment options
  const monthlyPaymentOptions = [
    '$0', '$100', '$200', '$300', '$400', '$500', '$600', '$700', '$800', '$900',
    '$1,000', '$1,200', '$1,400', '$1,600', '$1,800', '$2,000', '$2,200', '$2,400', '$2,600', '$2,800',
    '$3,000', '$3,500', '$4,000', '$4,500', '$5,000', '$5,500', '$6,000', '$6,500', '$7,000', '$7,500',
    '$8,000', '$8,500', '$9,000', '$9,500', '$10,000+'
  ]

  // Payment terms options
  const paymentTerms = ['36', '48', '60', '72', '84', '96']

  // Down payment options
  const downPaymentOptions = [
    '$500', '$1,000', '$1,500', '$2,000', '$2,500', '$3,000', '$3,500', '$4,000', '$4,500', '$5,000',
    '$5,500', '$6,000', '$6,500', '$7,000', '$7,500', '$8,000', '$8,500', '$9,000', '$9,500', '$10,000+'
  ]

  // Annual income options
  const annualIncomeOptions = [
    '$20,000', '$25,000', '$30,000', '$35,000', '$40,000', '$45,000', '$50,000', '$55,000', '$60,000', '$65,000',
    '$70,000', '$75,000', '$80,000', '$85,000', '$90,000', '$95,000', '$100,000', '$110,000', '$120,000', '$130,000',
    '$140,000', '$150,000', '$160,000', '$170,000', '$180,000', '$190,000', '$200,000+'
  ]

  // Employment duration options
  const employmentDurationOptions = [
    { value: "30-days", label: "30 days" },
    { value: "60-days", label: "60 days" },
    { value: "90-days", label: "90 days" },
    { value: "6-months", label: "6 months" },
    { value: "1-year", label: "1 year" },
    { value: "2-years", label: "2 years" },
    { value: "3-years", label: "3 years" },
    { value: "4-years", label: "4 years" },
    { value: "5-years", label: "5 years" },
    { value: "6-years", label: "6 years" },
    { value: "7-years", label: "7 years" },
    { value: "8-years", label: "8 years" },
    { value: "9-years", label: "9 years" },
    { value: "10-years", label: "10+ years" }
  ]

  // Address duration options
  const addressDurationOptions = [
    { value: "6-months", label: "6 months" },
    { value: "1-year", label: "1 year" },
    { value: "2-years", label: "2 years" },
    { value: "3-years", label: "3 years" },
    { value: "4-years", label: "4 years" },
    { value: "5-years", label: "5 years" },
    { value: "6-years", label: "6 years" },
    { value: "7-years", label: "7 years" },
    { value: "8-years", label: "8 years" },
    { value: "9-years", label: "9 years" },
    { value: "10-years", label: "10+ years" }
  ]

  // Position titles organized by industry
  const positionTitles = {
    automotive: [
      "Manager", "Supervisor", "Team Lead", "Senior", "Specialist", "Coordinator",
      "Analyst", "Assistant", "Clerk", "Technician", "Operator", "Driver",
      "Sales Representative", "Customer Service", "Administrative Assistant",
      "Accountant", "Engineer", "Other"
    ],
    energy: [
      "Manager", "Supervisor", "Team Lead", "Senior", "Specialist", "Coordinator",
      "Analyst", "Assistant", "Clerk", "Technician", "Operator", "Driver",
      "Sales Representative", "Customer Service", "Administrative Assistant",
      "Accountant", "Engineer", "Other"
    ],
    healthcare: [
      "Manager", "Supervisor", "Team Lead", "Senior", "Specialist", "Coordinator",
      "Analyst", "Assistant", "Clerk", "Technician", "Sales Representative", 
      "Customer Service", "Administrative Assistant", "Accountant", "Doctor", 
      "Nurse", "Other"
    ],
    legal: [
      "Manager", "Supervisor", "Team Lead", "Senior", "Specialist", "Coordinator",
      "Analyst", "Assistant", "Clerk", "Sales Representative", "Customer Service", 
      "Administrative Assistant", "Accountant", "Lawyer", "Other"
    ],
    general: [
      "Manager", "Supervisor", "Team Lead", "Senior", "Specialist", "Coordinator",
      "Analyst", "Assistant", "Clerk", "Technician", "Operator", "Driver",
      "Sales Representative", "Customer Service", "Administrative Assistant",
      "Accountant", "Engineer", "Teacher", "Nurse", "Doctor", "Lawyer",
      "Construction Worker", "Mechanic", "Electrician", "Plumber", "Other"
    ]
  }

  // Function to get position titles based on employer
  const getPositionTitlesForEmployer = (employer: string) => {
    if (!employer) return positionTitles.general
    
    if (employer === 'Ford Motor Company' || employer === 'General Motors' || employer === 'Chrysler/Stellantis') {
      return positionTitles.automotive
    } else if (employer === 'DTE Energy' || employer === 'Consumers Energy' || employer === 'Michigan Public Service Commission') {
      return positionTitles.energy
    } else if (employer === 'Henry Ford Health System' || employer === 'Beaumont Health' || employer === 'Ascension Health') {
      return positionTitles.healthcare
    } else if (employer === 'Other') {
      return positionTitles.general
    } else {
      return positionTitles.general
    }
  }

  // Common employers in Michigan area
  const [commonEmployers, setCommonEmployers] = useState<string[]>([
    "Ford Motor Company", "General Motors", "Chrysler/Stellantis", "Amazon",
    "Walmart", "Target", "Kroger", "Meijer", "Home Depot", "Lowes",
    "McDonald's", "Subway", "Starbucks", "FedEx", "UPS", "USPS",
    "Detroit Public Schools", "Wayne State University", "University of Michigan",
    "Henry Ford Health System", "Beaumont Health", "Ascension Health",
    "DTE Energy", "Consumers Energy", "Comcast", "AT&T", "Verizon",
    "Bank of America", "Chase", "Wells Fargo", "PNC Bank", "Other"
  ])

  // Load learned employers on component mount
  useEffect(() => {
    fetch('/api/learn?type=employers')
      .then(res => res.json())
      .then(data => {
        if (data.entries && data.entries.length > 0) {
          setCommonEmployers(prev => [...new Set([...prev, ...data.entries])])
        }
      })
      .catch(console.error)
  }, [])

  // State to cities mapping (major cities for each state)
  const stateCities: { [key: string]: string[] } = {
    "AL": ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa", "Hoover", "Auburn", "Dothan", "Decatur", "Madison", "Other"],
    "AK": ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan", "Wasilla", "Kenai", "Kodiak", "Bethel", "Palmer", "Other"],
    "AZ": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Glendale", "Gilbert", "Tempe", "Peoria", "Surprise", "Other"],
    "AR": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro", "North Little Rock", "Conway", "Rogers", "Pine Bluff", "Bentonville", "Other"],
    "CA": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Stockton", "Irvine", "Chula Vista", "Fremont", "San Bernardino", "Modesto", "Fontana", "Oxnard", "Moreno Valley", "Huntington Beach", "Glendale", "Santa Clarita", "Garden Grove", "Oceanside", "Rancho Cucamonga", "Santa Rosa", "Ontario", "Lancaster", "Other"],
    "CO": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton", "Arvada", "Westminster", "Pueblo", "Greeley", "Other"],
    "CT": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury", "Norwalk", "Danbury", "New Britain", "West Hartford", "Greenwich", "Other"],
    "DE": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna", "Milford", "Seaford", "Georgetown", "Elsmere", "Laurel", "Other"],
    "FL": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral", "Pembroke Pines", "Hollywood", "Miramar", "Gainesville", "Coral Springs", "Miami Gardens", "Clearwater", "Palm Bay", "West Palm Beach", "Pompano Beach", "Lakeland", "Davie", "Miami Beach", "Sunrise", "Plantation", "Boca Raton", "Deltona", "Largo", "Deerfield Beach", "Boynton Beach", "Other"],
    "GA": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens", "Sandy Springs", "Roswell", "Macon", "Johns Creek", "Albany", "Other"],
    "HI": ["Honolulu", "Hilo", "Kailua", "Kaneohe", "Pearl City", "Waipahu", "Kahului", "Ewa Beach", "Mililani", "Kihei", "Other"],
    "ID": ["Boise", "Nampa", "Meridian", "Idaho Falls", "Pocatello", "Caldwell", "Coeur d'Alene", "Twin Falls", "Lewiston", "Post Falls", "Other"],
    "IL": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield", "Peoria", "Elgin", "Waukegan", "Cicero", "Other"],
    "IN": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers", "Bloomington", "Hammond", "Gary", "Muncie", "Other"],
    "IA": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City", "Waterloo", "Council Bluffs", "Ames", "West Des Moines", "Dubuque", "Other"],
    "KS": ["Wichita", "Overland Park", "Kansas City", "Olathe", "Topeka", "Lawrence", "Shawnee", "Manhattan", "Lenexa", "Salina", "Other"],
    "KY": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington", "Hopkinsville", "Richmond", "Florence", "Georgetown", "Henderson", "Other"],
    "LA": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles", "Kenner", "Bossier City", "Monroe", "Alexandria", "Houma", "Other"],
    "ME": ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn", "Biddeford", "Sanford", "Saco", "Augusta", "Waterville", "Other"],
    "MD": ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie", "Annapolis", "College Park", "Salisbury", "Laurel", "Greenbelt", "Other"],
    "MA": ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge", "New Bedford", "Brockton", "Quincy", "Lynn", "Fall River", "Other"],
    "MI": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing", "Ann Arbor", "Livonia", "Dearborn", "Westland", "Troy", "Farmington Hills", "Kalamazoo", "Wyoming", "Southfield", "Rochester Hills", "Taylor", "Pontiac", "St. Clair Shores", "Royal Oak", "Novi", "Dearborn Heights", "Battle Creek", "Saginaw", "Kentwood", "East Lansing", "Roseville", "Portage", "Midland", "Lincoln Park", "Bay City", "Other"],
    "MN": ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park", "Plymouth", "St. Cloud", "Eagan", "Woodbury", "Other"],
    "MS": ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi", "Meridian", "Tupelo", "Greenville", "Olive Branch", "Horn Lake", "Other"],
    "MO": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Lee's Summit", "O'Fallon", "St. Joseph", "St. Charles", "St. Peters", "Other"],
    "MT": ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte", "Helena", "Kalispell", "Havre", "Anaconda", "Miles City", "Other"],
    "NE": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney", "Fremont", "Hastings", "North Platte", "Norfolk", "Columbus", "Other"],
    "NV": ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks", "Carson City", "Fernley", "Elko", "Mesquite", "Boulder City", "Other"],
    "NH": ["Manchester", "Nashua", "Concord", "Derry", "Rochester", "Dover", "Salem", "Merrimack", "Londonderry", "Hudson", "Other"],
    "NJ": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison", "Woodbridge", "Lakewood", "Toms River", "Hamilton", "Trenton", "Other"],
    "NM": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell", "Farmington", "Clovis", "Hobbs", "Alamogordo", "Carlsbad", "Other"],
    "NY": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica", "White Plains", "Hempstead", "Troy", "Niagara Falls", "Binghamton", "Freeport", "Valley Stream", "Long Beach", "Rome", "Ithaca", "Poughkeepsie", "Watertown", "Elmira", "Middletown", "Auburn", "Oswego", "Kingston", "Batavia", "Glens Falls", "Plattsburgh", "Other"],
    "NC": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville", "Cary", "Wilmington", "High Point", "Concord", "Other"],
    "ND": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo", "Williston", "Dickinson", "Mandan", "Jamestown", "Wahpeton", "Other"],
    "OH": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Parma", "Canton", "Youngstown", "Lorain", "Other"],
    "OK": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton", "Edmond", "Moore", "Midwest City", "Enid", "Stillwater", "Other"],
    "OR": ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro", "Bend", "Beaverton", "Medford", "Springfield", "Corvallis", "Other"],
    "PA": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem", "Lancaster", "Harrisburg", "Altoona", "Other"],
    "RI": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence", "Woonsocket", "Newport", "Central Falls", "Westerly", "Cumberland", "Other"],
    "SC": ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Rock Hill", "Greenville", "Summerville", "Sumter", "Hilton Head Island", "Florence", "Other"],
    "SD": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown", "Mitchell", "Yankton", "Pierre", "Huron", "Vermillion", "Other"],
    "TN": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro", "Franklin", "Jackson", "Johnson City", "Bartlett", "Other"],
    "TX": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie", "Brownsville", "Pasadena", "Mesquite", "McKinney", "McAllen", "Killeen", "Frisco", "Waco", "Carrollton", "Pearland", "Denton", "Midland", "Abilene", "Round Rock", "Richardson", "Other"],
    "UT": ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem", "Sandy", "Ogden", "St. George", "Layton", "Taylorsville", "Other"],
    "VT": ["Burlington", "Essex", "South Burlington", "Colchester", "Rutland", "Montpelier", "Barre", "St. Albans", "Brattleboro", "Milton", "Other"],
    "VA": ["Virginia Beach", "Norfolk", "Richmond", "Chesapeake", "Newport News", "Alexandria", "Hampton", "Portsmouth", "Suffolk", "Roanoke", "Other"],
    "WA": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent", "Everett", "Renton", "Yakima", "Federal Way", "Other"],
    "WV": ["Charleston", "Huntington", "Parkersburg", "Morgantown", "Wheeling", "Martinsburg", "Fairmont", "Beckley", "Clarksburg", "South Charleston", "Other"],
    "WI": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton", "Waukesha", "Oshkosh", "Eau Claire", "Janesville", "Other"],
    "WY": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs", "Sheridan", "Green River", "Evanston", "Riverton", "Jackson", "Other"]
  }

  // Helper function to get cities for a state
  const getCitiesForState = (state: string): string[] => {
    return stateCities[state] || []
  }

  const [data, setData] = useState<FormData>({
    dealerName: "Unlimited Auto Repair & Collision LLC",
    dealerNumber: "",
    applicant: { ...emptyApplicant },
    jointApplicantEnabled: false,
    jointApplicant: { ...emptyApplicant },
    jointApplicantRelationship: "",
    financing: {
      salesPrice: "",
      downPayment: "",
      netTrade: "",
      amountFinanced: "",
      program: "",
      term: "",
      grossCapReduction: "",
      adjustedCap: "",
      msrp: "",
      program2: "",
      paymentTerm: "",
      condition: "",
      vehicleId: "",
      year: "",
      make: "",
      model: "",
      retailLeaseVin: "",
      usedValueGuide: "",
      bookValue: "",
      mileage: "",
      tradeYear: "",
      tradeMake: "",
      tradeModel: "",
      tradeMileage: "",
      hasTradeIn: false,
    },
    autoCreditReference: { ...emptyReference },
    otherCreditReference: { ...emptyReference },
    nearestRelative: { ...emptyReference },
    friendRelative: { ...emptyReference },
    consentCallSms: true,
    applicantSignature: false,
    jointApplicantSignature: false,
    applicantSignatureName: "",
    jointApplicantSignatureName: "",
    applicantSignatureDate: new Date().toISOString().split('T')[0], // Today's date
    jointApplicantSignatureDate: new Date().toISOString().split('T')[0], // Today's date
    customDownPayment: "",
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => {
      const newData = { ...d, [key]: value };
      
      // Auto-update signature name when applicant name changes
      if (key === 'applicant' && typeof value === 'object' && value !== null) {
        const applicant = value as Applicant;
        if (applicant.firstName || applicant.lastName) {
          newData.applicantSignatureName = `${applicant.firstName} ${applicant.lastName}`.trim();
        }
      }
      
      return newData;
    });
  }

  // Track incomplete leads when user starts filling out form
  // Defined after data is initialized
  const trackIncompleteLead = async (formStep: string, overrideData?: { firstName?: string; lastName?: string; email?: string; phone?: string }) => {
    // Use override data if provided, otherwise use current state
    const firstName = overrideData?.firstName ?? data?.applicant?.firstName ?? ''
    const lastName = overrideData?.lastName ?? data?.applicant?.lastName ?? ''
    const phone = overrideData?.phone ?? data?.applicant?.homePhone ?? ''
    const email = overrideData?.email ?? data?.applicant?.email ?? ''
    
    console.log('📝 trackIncompleteLead called:', { formStep, firstName, lastName, email, phone })
    
    if (firstName || phone || email) {
      const trackingData = {
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        email: email,
        formStep: formStep,
        source: 'credit_application'
      }
      
      console.log('📤 Sending tracking data:', trackingData)
      
      try {
        const response = await fetch('/api/leads/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackingData)
        })
        
        const result = await response.json()
        console.log('✅ Tracking response:', result)
        
        if (!response.ok) {
          console.error('❌ Tracking failed:', result)
        }
      } catch (error) {
        console.error('❌ Error tracking incomplete lead:', error)
      }
    } else {
      console.log('⚠️ No contact info to track')
    }
  }

  function validate(): string[] {
    const e: string[] = [];
    
    console.log('🔍 VALIDATING FORM DATA:', data);
    
    if (!data.applicant.firstName || !data.applicant.lastName) e.push("Applicant full name is required.");
    if (!data.applicant.homePhone) e.push("Applicant phone is required.");
    if (!data.applicant.streetAddress) e.push("Applicant address is required.");
    if (!data.applicant.city || !data.applicant.state || !data.applicant.zip)
      e.push("Applicant city/state/zip required.");
    if (!data.applicant.dateOfBirth) e.push("Applicant date of birth is required.");
    if (!data.applicant.socialSecurityNumber) e.push("Applicant SSN (last 4 digits) is required.");
    if (!data.financing.vehicleId) e.push("Please select a vehicle from inventory.");
    // Condition is auto-populated from vehicle selection
    if (!data.financing.salesPrice) e.push("Sales price is required.");
    if (!data.financing.downPayment || data.financing.downPayment === "") e.push("Down payment selection is required. Please select a down payment option.");
    console.log('🔍 SIGNATURE VALIDATION:', {
      applicantSignature: data.applicantSignature,
      applicantSignatureName: data.applicantSignatureName,
      applicantSignatureDate: data.applicantSignatureDate,
      applicantName: `${data.applicant.firstName} ${data.applicant.lastName}`.trim()
    });
    
    if (!data.applicantSignature || !data.applicantSignatureName)
      e.push("Applicant must sign and print name.");
    if (!data.applicantSignatureDate) e.push("Applicant signature date is required.");
    if (data.jointApplicantEnabled) {
      if (!data.jointApplicant.firstName || !data.jointApplicant.lastName) e.push("Joint applicant full name is required.");
      if (!data.jointApplicant.homePhone) e.push("Joint applicant phone is required.");
      if (!data.jointApplicant.dateOfBirth) e.push("Joint applicant date of birth is required.");
      if (!data.jointApplicant.socialSecurityNumber) e.push("Joint applicant SSN (last 4 digits) is required.");
      if (!data.jointApplicantSignature || !data.jointApplicantSignatureName)
        e.push("Joint applicant must sign and print name.");
      if (!data.jointApplicantSignatureDate) e.push("Joint applicant signature date is required.");
    }
    
    console.log('❌ VALIDATION ERRORS:', e);
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    console.log('🚀 FORM SUBMIT CLICKED!', data);
    console.log('🔍 Form event:', ev);
    console.log('🔍 Current loading state:', loading);
    setOk(null);
    setErrors([]);
    
    const e = validate();
    console.log('🔍 Validation errors:', e);
    
    if (e.length) {
      console.log('❌ Validation failed:', e);
      setErrors(e);
      // Only scroll to top if there are validation errors on form submission
      // Don't scroll if this is triggered by document upload
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
      return;
    }
    
    console.log('✅ Validation passed, submitting...');
    setLoading(true);
    
    try {
      console.log('📤 Sending request to /api/applications...');
      console.log('📎 Documents to send:', documents);
      
      const requestData = {
        ...data,
        documents: documents.map(doc => ({
          type: doc.type,
          url: doc.url,
          uploaded: doc.uploaded
        }))
      };
      
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      
      console.log('📥 Response received:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error:', errorText);
        throw new Error(errorText);
      }
      
      const result = await res.json();
      console.log('✅ Success response:', result);
      
      setOk(`Application submitted successfully! ✅ We'll contact you within 24 hours. Thank you for submitting your application.`);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      // Reset form
      setData((d) => ({
        ...d,
        applicant: { ...emptyApplicant },
        jointApplicant: { ...emptyApplicant },
        jointApplicantRelationship: "",
        applicantSignature: false,
        jointApplicantSignature: false,
        applicantSignatureName: "",
        jointApplicantSignatureName: "",
        applicantSignatureDate: new Date().toISOString().split('T')[0],
        jointApplicantSignatureDate: new Date().toISOString().split('T')[0],
        customDownPayment: "",
      }));
      
    } catch (err: any) {
      console.error('❌ Form submission error:', err);
      setErrors([err.message || "Submission failed."]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <style jsx>{`
        input::placeholder,
        select::placeholder {
          color: #374151 !important;
          opacity: 0.8 !important;
        }
        input, select {
          min-width: 0;
          box-sizing: border-box;
        }
        select {
          color: #000000 !important;
        }
        select option {
          color: #000000 !important;
        }
        input[readonly] {
          color: #000000 !important;
        }
        .flex-1 {
          flex: 1 1 0%;
          min-width: 0;
        }
      `}</style>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pre-approval</h1>
        <p className="text-gray-600">Unlimited Auto Repair & Collision LLC</p>
        <p className="text-sm text-gray-500">24645 Plymouth Rd Unit A, Redford Township, MI 48239 | (313) 766-4475</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6 shadow-lg">
          <h3 className="font-bold text-red-900 mb-3 text-lg">❌ Please fix the following errors:</h3>
          <ul className="list-disc list-inside text-red-800 space-y-2">
            {errors.map((error, i) => (
              <li key={i} className="font-medium">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {loading && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-800 font-medium">Submitting your application...</span>
          </div>
        </div>
      )}

      {ok && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mb-6 shadow-lg">
          <h3 className="font-bold text-green-900 mb-2 text-lg">✅ Success!</h3>
          <p className="text-green-800 text-lg font-medium">{ok}</p>
        </div>
      )}


      <form onSubmit={onSubmit} className="space-y-8">
        {/* APPLICANT INFORMATION */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">APPLICANT INFORMATION</h2>
          
          <div className="mb-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FULL NAME</label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      value={data.applicant.firstName}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        set("applicant", { ...data.applicant, firstName: newValue });
                      }}
                      onBlur={() => {
                        // Track when user leaves name field if we have email or phone
                        if (data.applicant.email || data.applicant.homePhone) {
                          trackIncompleteLead('applicant_name', { 
                            firstName: data.applicant.firstName, 
                            lastName: data.applicant.lastName, 
                            email: data.applicant.email, 
                            phone: data.applicant.homePhone 
                          });
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="First Name"
                      autoComplete="given-name"
                      required
                    />
                  <input
                    type="text"
                    value={data.applicant.middleInitial}
                    onChange={(e) => set("applicant", { ...data.applicant, middleInitial: e.target.value })}
                    className="w-16 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="MI"
                    autoComplete="additional-name"
                  />
                  <input
                    type="text"
                    value={data.applicant.lastName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      set("applicant", { ...data.applicant, lastName: newValue });
                    }}
                    onBlur={() => {
                      // Track when user leaves name field if we have email or phone
                      if (data.applicant.email || data.applicant.homePhone) {
                        trackIncompleteLead('applicant_name', { 
                          firstName: data.applicant.firstName, 
                          lastName: data.applicant.lastName, 
                          email: data.applicant.email, 
                          phone: data.applicant.homePhone 
                        });
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Last Name"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={data.applicant.email || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    set("applicant", { ...data.applicant, email: newValue });
                  }}
                  onBlur={(e) => {
                    // ALWAYS track when email is entered (user specifically requested this)
                    // Use the event target value to get current value (not state which might be stale)
                    const currentEmail = e.target.value;
                    if (currentEmail && currentEmail.includes('@')) {
                      // Use setTimeout to ensure state is updated, but pass the current values directly
                      setTimeout(() => {
                        trackIncompleteLead('applicant_email', { 
                          firstName: data.applicant.firstName, 
                          lastName: data.applicant.lastName, 
                          email: currentEmail, // Use the event value, not state
                          phone: data.applicant.homePhone 
                        });
                      }, 100);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="your.email@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">STATE</label>
                <select
                  value={data.applicant.state}
                  onChange={(e) => set("applicant", { ...data.applicant, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select State</option>
                  {usStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">STREET ADDRESS</label>
                <input
                  type="text"
                  value={data.applicant.streetAddress}
                  onChange={(e) => set("applicant", { ...data.applicant, streetAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">APT #</label>
                <input
                  type="text"
                  value={data.applicant.aptNumber}
                  onChange={(e) => set("applicant", { ...data.applicant, aptNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CITY</label>
                <select
                  value={data.applicant.city}
                  onChange={(e) => set("applicant", { ...data.applicant, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select City</option>
                  {getCitiesForState(data.applicant.state).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {data.applicant.city === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter city name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                    onChange={(e) => set("applicant", { ...data.applicant, city: e.target.value })}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  type="text"
                  value={data.applicant.zip}
                  onChange={(e) => set("applicant", { ...data.applicant, zip: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <DatePicker
                  label="DATE OF BIRTH"
                  value={data.applicant.dateOfBirth}
                  maxDate={new Date().toISOString().split('T')[0]}
                  onChange={(birthDate) => {
                    set("applicant", { ...data.applicant, dateOfBirth: birthDate });
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HOME PHONE</label>
                  <input
                    type="tel"
                    value={data.applicant.homePhone}
                    onChange={(e) => {
                      const formattedPhone = formatPhoneNumber(e.target.value);
                      set("applicant", { ...data.applicant, homePhone: formattedPhone });
                      // Track with current value immediately (pass it to function)
                      if (formattedPhone.replace(/\D/g, '').length >= 10) {
                        trackIncompleteLead('applicant_phone', { firstName: data.applicant.firstName, lastName: data.applicant.lastName, email: data.applicant.email, phone: formattedPhone });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HOUSING STATUS</label>
                <select
                  value={data.applicant.housingStatus}
                  onChange={(e) => set("applicant", { ...data.applicant, housingStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select...</option>
                  <option value="own">OWN/BUYING</option>
                  <option value="rent">RENT/LEASE</option>
                  <option value="relative">LIVE WITH RELATIVE</option>
                  <option value="other">OTHER</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MONTHLY PAYMENT $</label>
                <select
                  value={data.applicant.monthlyPayment}
                  onChange={(e) => set("applicant", { ...data.applicant, monthlyPayment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Amount</option>
                  {monthlyPaymentOptions.map((amount) => (
                    <option key={amount} value={amount}>{amount}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HOW LONG AT ADDRESS</label>
                <select
                  value={data.applicant.howLongAtAddressDuration}
                  onChange={(e) => {
                    const [years, months] = e.target.value.split('-');
                    set("applicant", { 
                      ...data.applicant, 
                      howLongAtAddressDuration: e.target.value,
                      howLongYears: years || '',
                      howLongMonths: months || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select duration...</option>
                  <option value="0-6">6 months</option>
                  <option value="1-0">1 year</option>
                  <option value="2-0">2 years</option>
                  <option value="3-0">3 years</option>
                  <option value="4-0">4 years</option>
                  <option value="5-0">5 years</option>
                  <option value="6-0">6 years</option>
                  <option value="7-0">7 years</option>
                  <option value="8-0">8 years</option>
                  <option value="9-0">9 years</option>
                  <option value="10-0">10+ years</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">EMPLOYMENT</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EMPLOYMENT STATUS <span className="text-red-500">*</span></label>
                  <select
                    value={data.applicant.employmentStatus}
                    onChange={(e) => set("applicant", { ...data.applicant, employmentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="disability">Disability</option>
                    <option value="retired">Retired</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="student">Student</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EMPLOYER NAME</label>
                  <select
                    value={data.applicant.employerName}
                    onChange={(e) => {
                      const newEmployer = e.target.value;
                      set("applicant", { 
                        ...data.applicant, 
                        employerName: newEmployer,
                        positionTitle: "" // Reset position when employer changes
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Employer</option>
                    {commonEmployers.map((employer) => (
                      <option key={employer} value={employer}>
                        {employer}
                      </option>
                    ))}
                  </select>
                  {(data.applicant.employerName === "Other" || 
                    (data.applicant.employerName && 
                     !commonEmployers.includes(data.applicant.employerName))) && (
                    <input
                      type="text"
                      value={data.applicant.employerName === "Other" ? "" : data.applicant.employerName}
                      placeholder="Enter employer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                      onChange={(e) => {
                        // Keep the custom employer name even when typing
                        set("applicant", { ...data.applicant, employerName: e.target.value });
                      }}
                      onFocus={(e) => {
                        // If "Other" is selected, clear it so they can type freely
                        if (data.applicant.employerName === "Other") {
                          set("applicant", { ...data.applicant, employerName: "" });
                        }
                      }}
                      onBlur={(e) => {
                        // When user finishes typing, save the employer if it's not empty and not in the list
                        const employerValue = e.target.value.trim();
                        if (employerValue && 
                            employerValue !== "Other" && 
                            !commonEmployers.includes(employerValue)) {
                          // Learn the new employer
                          fetch('/api/learn', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              type: 'employers',
                              value: employerValue
                            })
                          })
                          .then(() => {
                            console.log(`Learned new employer: ${employerValue}`)
                            // Add to local list
                            setCommonEmployers(prev => [...prev, employerValue].sort())
                          })
                          .catch(console.error)
                        }
                      }}
                      autoFocus={data.applicant.employerName === "Other"}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HOW LONG?</label>
                  <select
                    value={data.applicant.employerHowLongDuration}
                    onChange={(e) => set("applicant", { ...data.applicant, employerHowLongDuration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Duration</option>
                    {employmentDurationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">EMPLOYER ADDRESS</label>
                  <input
                    type="text"
                    value={data.applicant.employerAddress}
                    onChange={(e) => set("applicant", { ...data.applicant, employerAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">POSITION/TITLE</label>
                  <select
                    value={data.applicant.positionTitle}
                    onChange={(e) => set("applicant", { ...data.applicant, positionTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Position</option>
                    {getPositionTitlesForEmployer(data.applicant.employerName).map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                  {data.applicant.positionTitle === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter position title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                      onChange={(e) => set("applicant", { ...data.applicant, positionTitle: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WORK PHONE (Optional)</label>
                  <input
                    type="tel"
                    value={data.applicant.workPhone}
                    onChange={(e) => set("applicant", { ...data.applicant, workPhone: formatPhoneNumber(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ANNUAL AMOUNT $</label>
                  <select
                    value={data.applicant.annualAmount}
                    onChange={(e) => set("applicant", { ...data.applicant, annualAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Annual Amount</option>
                    {annualIncomeOptions.map((income) => (
                      <option key={income} value={income}>{income}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
              </p>
            </div>
          </div>
        </div>

        {/* JOINT APPLICANT INFORMATION */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">JOINT APPLICANT INFORMATION</h2>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.jointApplicantEnabled}
                onChange={(e) => set("jointApplicantEnabled", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enable Joint Applicant</span>
            </label>
          </div>

          {data.jointApplicantEnabled && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">JOINT APPLICANT RELATIONSHIP</label>
                <input
                  type="text"
                  value={data.jointApplicantRelationship}
                  onChange={(e) => set("jointApplicantRelationship", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FULL NAME</label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      value={data.jointApplicant.firstName}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, firstName: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="First Name"
                      autoComplete="given-name"
                    />
                    <input
                      type="text"
                      value={data.jointApplicant.middleInitial}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, middleInitial: e.target.value })}
                      className="w-16 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="MI"
                      autoComplete="additional-name"
                    />
                    <input
                      type="text"
                      value={data.jointApplicant.lastName}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, lastName: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Last Name"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              {/* Joint Applicant Address and Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">STATE</label>
                  <select
                    value={data.jointApplicant.state}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select State</option>
                    {usStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">STREET ADDRESS</label>
                  <input
                    type="text"
                    value={data.jointApplicant.streetAddress}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, streetAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">APT #</label>
                  <input
                    type="text"
                    value={data.jointApplicant.aptNumber}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, aptNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HOW LONG?</label>
                  <select
                    value={data.jointApplicant.howLongAtAddressDuration}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, howLongAtAddressDuration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Duration</option>
                    <option value="0-6">6 months</option>
                    <option value="1-0">1 year</option>
                    <option value="2-0">2 years</option>
                    <option value="3-0">3 years</option>
                    <option value="4-0">4 years</option>
                    <option value="5-0">5 years</option>
                    <option value="6-0">6 years</option>
                    <option value="7-0">7 years</option>
                    <option value="8-0">8 years</option>
                    <option value="9-0">9 years</option>
                    <option value="10-0">10+ years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CITY</label>
                  <select
                    value={data.jointApplicant.city}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select City</option>
                    {getCitiesForState(data.jointApplicant.state).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {data.jointApplicant.city === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter city name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, city: e.target.value })}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={data.jointApplicant.zip}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, zip: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <DatePicker
                    label="DATE OF BIRTH"
                    value={data.jointApplicant.dateOfBirth}
                    maxDate={new Date().toISOString().split('T')[0]}
                    onChange={(birthDate) => {
                      set("jointApplicant", { ...data.jointApplicant, dateOfBirth: birthDate });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HOME PHONE</label>
                  <input
                    type="tel"
                    value={data.jointApplicant.homePhone}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, homePhone: formatPhoneNumber(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HOUSING STATUS</label>
                  <select
                    value={data.jointApplicant.housingStatus}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, housingStatus: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select...</option>
                    <option value="own">OWN/BUYING</option>
                    <option value="rent">RENT/LEASE</option>
                    <option value="relative">LIVE WITH RELATIVE</option>
                    <option value="other">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MONTHLY PAYMENT $</label>
                  <select
                    value={data.jointApplicant.monthlyPayment}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, monthlyPayment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Amount</option>
                    {monthlyPaymentOptions.map((amount) => (
                      <option key={amount} value={amount}>{amount}</option>
                    ))}
                  </select>
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YRS. MOS.</label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={data.jointApplicant.howLongYears}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, howLongYears: e.target.value })}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                  />
                  <input
                    type="text"
                    value={data.jointApplicant.howLongMonths}
                    onChange={(e) => set("jointApplicant", { ...data.jointApplicant, howLongMonths: e.target.value })}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                  />
                </div>
              </div>
              </div>

              {/* Joint Applicant Employment */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">EMPLOYMENT</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EMPLOYER NAME</label>
                    <select
                      value={data.jointApplicant.employerName}
                      onChange={(e) => {
                        const newEmployer = e.target.value;
                        set("jointApplicant", { 
                          ...data.jointApplicant, 
                          employerName: newEmployer,
                          positionTitle: "" // Reset position when employer changes
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Employer</option>
                      {commonEmployers.map((employer) => (
                        <option key={employer} value={employer}>
                          {employer}
                        </option>
                      ))}
                    </select>
                    {(data.jointApplicant.employerName === "Other" || 
                      (data.jointApplicant.employerName && 
                       !commonEmployers.includes(data.jointApplicant.employerName))) && (
                      <input
                        type="text"
                        value={data.jointApplicant.employerName === "Other" ? "" : data.jointApplicant.employerName}
                        placeholder="Enter employer name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                        onChange={(e) => {
                          // Keep the custom employer name even when typing
                          set("jointApplicant", { ...data.jointApplicant, employerName: e.target.value });
                        }}
                        onFocus={(e) => {
                          // If "Other" is selected, clear it so they can type freely
                          if (data.jointApplicant.employerName === "Other") {
                            set("jointApplicant", { ...data.jointApplicant, employerName: "" });
                          }
                        }}
                        onBlur={(e) => {
                          // When user finishes typing, save the employer if it's not empty and not in the list
                          const employerValue = e.target.value.trim();
                          if (employerValue && 
                              employerValue !== "Other" && 
                              !commonEmployers.includes(employerValue)) {
                            // Learn the new employer
                            fetch('/api/learn', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                type: 'employers',
                                value: employerValue
                              })
                            })
                            .then(() => {
                              console.log(`Learned new employer: ${employerValue}`)
                              // Add to local list
                              setCommonEmployers(prev => [...prev, employerValue].sort())
                            })
                            .catch(console.error)
                          }
                        }}
                        autoFocus={data.jointApplicant.employerName === "Other"}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HOW LONG?</label>
                    <select
                      value={data.jointApplicant.employerHowLongDuration}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, employerHowLongDuration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select Duration</option>
                      {employmentDurationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EMPLOYER ADDRESS</label>
                    <input
                      type="text"
                      value={data.jointApplicant.employerAddress}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, employerAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">POSITION/TITLE</label>
                    <select
                      value={data.jointApplicant.positionTitle}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, positionTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Position</option>
                      {getPositionTitlesForEmployer(data.jointApplicant.employerName).map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                    {data.jointApplicant.positionTitle === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter position title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                        onChange={(e) => set("jointApplicant", { ...data.jointApplicant, positionTitle: e.target.value })}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WORK PHONE</label>
                    <input
                      type="tel"
                      value={data.jointApplicant.workPhone}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, workPhone: formatPhoneNumber(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ANNUAL AMOUNT $</label>
                    <select
                      value={data.jointApplicant.annualAmount}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, annualAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Annual Amount</option>
                      {annualIncomeOptions.map((income) => (
                        <option key={income} value={income}>{income}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                </p>
              </div>
            </div>
          )}
        </div>

        {/* VEHICLE INFORMATION */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">VEHICLE INFORMATION</h2>
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SELECT VEHICLE FROM INVENTORY</label>
              <ClientOnly fallback={<div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">Loading vehicles...</div>}>
                <VehicleSelector
                  selectedVehicle={data.financing.vehicleId}
                  onVehicleChange={(vehicleId) => {
                    const selectedVehicle = vehicles.find(v => v.id === vehicleId)
                    set("financing", {
                      ...data.financing,
                      vehicleId: vehicleId,
                      year: selectedVehicle?.year?.toString() || '',
                      make: selectedVehicle?.make || '',
                      model: selectedVehicle?.model || '',
                      salesPrice: selectedVehicle?.price?.toString() || '',
                      condition: 'used', // Auto-populate as used since these are used cars
                      mileage: selectedVehicle?.miles?.toString() || ''
                    })
                  }}
                  required
                />
              </ClientOnly>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SALES PRICE $</label>
              <input
                type="text"
                value={data.financing.salesPrice}
                onChange={(e) => set("financing", { ...data.financing, salesPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter sales price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DOWN PAYMENT $ <span className="text-red-500">*</span>
              </label>
              <select
                value={data.financing.downPayment}
                onChange={(e) => set("financing", { ...data.financing, downPayment: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md ${
                  !data.financing.downPayment && errors.some(e => e.includes('Down payment')) 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Down Payment *</option>
                {downPaymentOptions.map((amount) => (
                  <option key={amount} value={amount}>{amount}</option>
                ))}
              </select>
              {errors.some(e => e.includes('Down payment')) && (
                <p className="text-red-500 text-xs mt-1">Please select a down payment option</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NET TRADE $</label>
              <input
                type="text"
                value={data.financing.netTrade}
                onChange={(e) => set("financing", { ...data.financing, netTrade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Trade-in value"
              />
            </div>
          </div>

          {/* Trade-In Vehicle Information */}
          <div className="mb-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="hasTradeIn"
                checked={data.financing.hasTradeIn}
                onChange={(e) => {
                  const hasTradeIn = e.target.checked
                  set("financing", {
                    ...data.financing,
                    hasTradeIn: hasTradeIn,
                    // Clear trade-in fields if unchecked
                    tradeMake: hasTradeIn ? data.financing.tradeMake : "",
                    tradeModel: hasTradeIn ? data.financing.tradeModel : "",
                    tradeMileage: hasTradeIn ? data.financing.tradeMileage : "",
                    tradeYear: hasTradeIn ? data.financing.tradeYear : "",
                  })
                }}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hasTradeIn" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                Yes, I have a vehicle to trade in
              </label>
            </div>

            {data.financing.hasTradeIn && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Trade-In Vehicle Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade-In Make <span className="text-red-500">*</span>
                    </label>
                    {!data.financing.tradeMake || vehicleMakes.includes(data.financing.tradeMake) || data.financing.tradeMake === 'Other' ? (
                      <select
                        value={vehicleMakes.includes(data.financing.tradeMake) ? data.financing.tradeMake : 'Other'}
                        onChange={(e) => {
                          const make = e.target.value
                          if (make === 'Other') {
                            set("financing", {
                              ...data.financing,
                              tradeMake: 'Other',
                              tradeModel: "", // Clear model when make changes
                            })
                          } else {
                            set("financing", {
                              ...data.financing,
                              tradeMake: make,
                              tradeModel: "", // Clear model when make changes
                            })
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !data.financing.tradeMake && data.financing.hasTradeIn
                            ? 'border-gray-300'
                            : 'border-gray-300'
                        }`}
                        required={data.financing.hasTradeIn}
                      >
                        <option value="">Select Make</option>
                        {vehicleMakes.map((make) => (
                          <option key={make} value={make}>
                            {make}
                          </option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    ) : null}
                    {(data.financing.tradeMake === 'Other' || (data.financing.tradeMake && !vehicleMakes.includes(data.financing.tradeMake))) && (
                      <input
                        type="text"
                        value={data.financing.tradeMake === 'Other' ? '' : data.financing.tradeMake}
                        onChange={(e) => {
                          set("financing", {
                            ...data.financing,
                            tradeMake: e.target.value,
                            tradeModel: "", // Clear model when make changes
                          })
                        }}
                        placeholder="Enter vehicle make"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                        required={data.financing.hasTradeIn}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade-In Model <span className="text-red-500">*</span>
                    </label>
                    {data.financing.tradeMake && 
                     data.financing.tradeMake !== 'Other' && 
                     vehicleMakes.includes(data.financing.tradeMake) && (
                      <>
                        {!data.financing.tradeModel || 
                         getModelsForMake(data.financing.tradeMake).includes(data.financing.tradeModel) || 
                         data.financing.tradeModel === 'Other' ? (
                          <select
                            value={data.financing.tradeModel && getModelsForMake(data.financing.tradeMake).includes(data.financing.tradeModel) 
                              ? data.financing.tradeModel 
                              : data.financing.tradeModel === 'Other' ? 'Other' : ''}
                            onChange={(e) => {
                              const model = e.target.value
                              set("financing", { ...data.financing, tradeModel: model })
                            }}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300`}
                            required={data.financing.hasTradeIn}
                          >
                            <option value="">Select Model</option>
                            {getModelsForMake(data.financing.tradeMake).map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        ) : null}
                        {(data.financing.tradeModel === 'Other' || 
                          (data.financing.tradeModel && 
                           !getModelsForMake(data.financing.tradeMake).includes(data.financing.tradeModel) &&
                           data.financing.tradeModel !== 'Other')) && (
                          <input
                            type="text"
                            value={data.financing.tradeModel === 'Other' ? '' : data.financing.tradeModel}
                            onChange={(e) => {
                              set("financing", { ...data.financing, tradeModel: e.target.value })
                            }}
                            placeholder="Enter vehicle model"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                            required={data.financing.hasTradeIn}
                          />
                        )}
                      </>
                    )}
                    {(data.financing.tradeMake === 'Other' || 
                      (data.financing.tradeMake && !vehicleMakes.includes(data.financing.tradeMake))) && (
                      <input
                        type="text"
                        value={data.financing.tradeModel || ''}
                        onChange={(e) => {
                          set("financing", { ...data.financing, tradeModel: e.target.value })
                        }}
                        placeholder="Enter vehicle model"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={data.financing.hasTradeIn}
                      />
                    )}
                    {!data.financing.tradeMake && (
                      <p className="text-xs text-gray-500 mt-1">Please select a make first</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trade-In Mileage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.financing.tradeMileage}
                      onChange={(e) => {
                        const formatted = formatMileage(e.target.value)
                        set("financing", { ...data.financing, tradeMileage: formatted })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 50,000"
                      required={data.financing.hasTradeIn}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  * Required fields. We'll use this information to evaluate your trade-in value.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TERM (MONTHS)</label>
              <select
                value={data.financing.paymentTerm}
                onChange={(e) => set("financing", { ...data.financing, paymentTerm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Term</option>
                {paymentTerms.map((term) => (
                  <option key={term} value={term}>{term} months</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">VIN (Optional)</label>
              <input
                type="text"
                value={data.financing.retailLeaseVin}
                onChange={(e) => set("financing", { ...data.financing, retailLeaseVin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Vehicle VIN (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MILEAGE</label>
              <input
                type="text"
                value={data.financing.mileage}
                onChange={(e) => set("financing", { ...data.financing, mileage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Vehicle mileage"
              />
            </div>
          </div>
        </div>

        {/* REQUIRED DOCUMENTS (disabled as per request) */}
        {false && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">REQUIRED DOCUMENTS</h2>
            <p className="text-gray-600 mb-6">Please upload the following documents for your pre-approval:</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">📋 Required Documents Checklist</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-blue-800 text-sm">Valid Driver's License</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-blue-800 text-sm">Two Most Recent Pay Stubs</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-blue-800 text-sm">Must have 30+ days on current job</span>
                </div>
              </div>
            </div>
            <ClientOnly fallback={<div className="text-center py-8 text-gray-500">Loading document upload...</div>}>
              <DocumentUpload onDocumentsChange={setDocuments} />
            </ClientOnly>
          </div>
        )}

        {/* NOTICE & AUTHORIZATION */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">NOTICE & AUTHORIZATION</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              I, the undersigned, hereby authorize the dealer, <strong>Unlimited Auto Repair & Collision LLC</strong>, and/or ("prospective creditors") to verify credit and employment history as stated above and to answer questions about credit experience with me.
            </p>
            
            <p>
              If this application is made pursuant to any credit program for attendees and/or graduates of schools or educational institutions, then prospective creditors may verify my eligibility for such program, including by inquiry to my school(s) or educational institution(s).
            </p>
            
            <p>
              Insurance related to the credit for which I am applying may be purchased from an insurer or agent of my choice who meets prospective creditor standards.
            </p>
            
            <p>
              In connection with this application for credit, prospective creditors may request a consumer (credit) report. On my request, prospective creditors will advise me if the report was actually ordered and, if so, the name and address of the agency that furnished the report.
            </p>
            
            <p>
              Prospective creditors may order subsequent consumer (credit) reports.
            </p>
            
            <p>
              I authorize prospective creditors to ask my past and current creditors ("credit references"), including creditors listed above or on my consumer (credit) report, about my credit performance with them. Provision by prospective creditors of a copy of this authorization shall serve as my direction that my credit references provide my credit performance information.
            </p>
            
            <p>
              Everything that I have stated in this application is complete and correct to the best of my knowledge and constitutes my entire application for credit with the prospective creditors.
            </p>
            
            <p>
              I understand that prospective creditors will retain this application whether or not it is approved. I will notify prospective creditors, if applicable, within a reasonable time of any change in my name, address, or employment.
            </p>
            
            <p>
              To the extent permitted by law, I consent that you, your assignees, and your agents may contact me at any telephone number you have for me, including any cell phone numbers and any phone numbers listed on this document, by any means you select, including an automatic telephone dialing system, text messaging, and/or an artificial or pre-recorded voice.
            </p>
          </div>
        </div>

        {/* SIGNATURES */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SIGNATURES</h2>
          
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Signature / Date / SSN (Last 4)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={data.applicantSignatureName || `${data.applicant.firstName} ${data.applicant.lastName}`.trim()}
                    onChange={(e) => {
                      console.log('📝 Signature name changed:', e.target.value);
                      set("applicantSignatureName", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Print Full Name"
                    required
                  />
                  <input
                    type="date"
                    value={data.applicantSignatureDate}
                    onChange={(e) => set("applicantSignatureDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    value={data.applicant.socialSecurityNumber}
                    onChange={(e) => {
                      // Only allow 4 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      set("applicant", { ...data.applicant, socialSecurityNumber: value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Last 4 digits of SSN"
                    maxLength={4}
                    required
                  />
                  <div className="flex items-center p-3 bg-white border border-gray-300 rounded">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="applicantSignature"
                        checked={data.applicantSignature}
                        onChange={(e) => {
                          console.log('🔘 Checkbox onChange triggered!', e.target.checked);
                          console.log('🔘 Current state before change:', data.applicantSignature);
                          set("applicantSignature", e.target.checked);
                          console.log('🔘 State should now be:', e.target.checked);
                        }}
                        className="mr-3 w-5 h-5 text-green-600 bg-white border-2 border-gray-600 rounded focus:ring-green-500 cursor-pointer appearance-none transition-all duration-200 hover:border-green-500"
                        required
                      />
                      {data.applicantSignature && (
                        <div className="absolute top-0 left-0 w-5 h-5 flex items-center justify-center pointer-events-none">
                          <svg 
                            className="w-3 h-3 text-green-600" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="applicantSignature" 
                      className="text-sm text-gray-900 cursor-pointer"
                    >
                      I agree to the terms and authorize this application
                    </label>
                  </div>
                </div>
              </div>
              
              {data.jointApplicantEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joint Applicant Signature / Date / SSN (Last 4)</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={data.jointApplicantSignatureName}
                      onChange={(e) => set("jointApplicantSignatureName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Print Full Name"
                      required
                    />
                    <input
                      type="date"
                      value={data.jointApplicantSignatureDate}
                      onChange={(e) => set("jointApplicantSignatureDate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <input
                      type="text"
                      value={data.jointApplicant.socialSecurityNumber}
                      onChange={(e) => {
                        // Only allow 4 digits
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        set("jointApplicant", { ...data.jointApplicant, socialSecurityNumber: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Last 4 digits of SSN"
                      maxLength={4}
                      required
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={data.jointApplicantSignature}
                        onChange={(e) => set("jointApplicantSignature", e.target.checked)}
                        className="mr-2"
                        required
                      />
                      <span className="text-sm text-gray-700">I agree to the terms and authorize this application</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Co-applicant's signature means you intend to apply for joint credit.
              </p>
            </div>
            
          </div>
        </div>



        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              console.log('🔘 BUTTON CLICKED!', { loading, data });
              console.log('🔍 Current form data:', JSON.stringify(data, null, 2));
            }}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 px-12 rounded-lg text-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Submitting...
              </div>
            ) : (
              "Submit Pre-approval Application"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}