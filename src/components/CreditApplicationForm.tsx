"use client";
import React, { useState, useEffect } from "react";
import VehicleSelector from "./VehicleSelector";
import DocumentUpload, { DocumentFile } from "./DocumentUpload";

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
  monthlyPayment: string;
  housingStatus: "own" | "rent" | "relative" | "other" | "";
  howLongYears: string;
  howLongMonths: string;
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
  programType: string;
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
  monthlyPayment: "",
  housingStatus: "",
  howLongYears: "",
  howLongMonths: "",
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
  const commonEmployers = [
    "Ford Motor Company", "General Motors", "Chrysler/Stellantis", "Amazon",
    "Walmart", "Target", "Kroger", "Meijer", "Home Depot", "Lowes",
    "McDonald's", "Subway", "Starbucks", "FedEx", "UPS", "USPS",
    "Detroit Public Schools", "Wayne State University", "University of Michigan",
    "Henry Ford Health System", "Beaumont Health", "Ascension Health",
    "DTE Energy", "Consumers Energy", "Comcast", "AT&T", "Verizon",
    "Bank of America", "Chase", "Wells Fargo", "PNC Bank", "Other"
  ]

  // State to cities mapping (major cities for each state)
  const stateCities: { [key: string]: string[] } = {
    "MI": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing", "Ann Arbor", "Livonia", "Dearborn", "Westland", "Troy", "Farmington Hills", "Kalamazoo", "Wyoming", "Southfield", "Rochester Hills", "Taylor", "Pontiac", "St. Clair Shores", "Royal Oak", "Novi", "Dearborn Heights", "Battle Creek", "Saginaw", "Kentwood", "East Lansing", "Roseville", "Portage", "Midland", "Lincoln Park", "Bay City", "Other"],
    "CA": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland", "Bakersfield", "Anaheim", "Santa Ana", "Riverside", "Stockton", "Irvine", "Chula Vista", "Fremont", "San Bernardino", "Modesto", "Fontana", "Oxnard", "Moreno Valley", "Huntington Beach", "Glendale", "Santa Clarita", "Garden Grove", "Oceanside", "Rancho Cucamonga", "Santa Rosa", "Ontario", "Lancaster", "Other"],
    "TX": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving", "Amarillo", "Grand Prairie", "Brownsville", "Pasadena", "Mesquite", "McKinney", "McAllen", "Killeen", "Frisco", "Waco", "Carrollton", "Pearland", "Denton", "Midland", "Abilene", "Round Rock", "Richardson", "Other"],
    "FL": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Hialeah", "Tallahassee", "Fort Lauderdale", "Port St. Lucie", "Cape Coral", "Pembroke Pines", "Hollywood", "Miramar", "Gainesville", "Coral Springs", "Miami Gardens", "Clearwater", "Palm Bay", "West Palm Beach", "Pompano Beach", "Lakeland", "Davie", "Miami Beach", "Sunrise", "Plantation", "Boca Raton", "Deltona", "Largo", "Deerfield Beach", "Boynton Beach", "Other"],
    "NY": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica", "White Plains", "Hempstead", "Troy", "Niagara Falls", "Binghamton", "Freeport", "Valley Stream", "Long Beach", "Rome", "Ithaca", "Poughkeepsie", "Watertown", "Elmira", "Middletown", "Auburn", "Oswego", "Kingston", "Batavia", "Glens Falls", "Plattsburgh", "Other"]
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
    applicantSignatureDate: "",
    jointApplicantSignatureDate: "",
    programType: "",
    customDownPayment: "",
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function validate(): string[] {
    const e: string[] = [];
    if (!data.applicant.firstName || !data.applicant.lastName) e.push("Applicant full name is required.");
    if (!data.applicant.homePhone) e.push("Applicant phone is required.");
    if (!data.applicant.streetAddress) e.push("Applicant address is required.");
    if (!data.applicant.city || !data.applicant.state || !data.applicant.zip)
      e.push("Applicant city/state/zip required.");
    if (!data.applicantSignature || !data.applicantSignatureName)
      e.push("Applicant must sign and print name.");
    if (data.jointApplicantEnabled && (!data.jointApplicantSignature || !data.jointApplicantSignatureName))
      e.push("Joint applicant must sign and print name.");
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setOk(null);
    const e = validate();
    if (e.length) {
      setErrors(e);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      setOk("Application submitted successfully ✅ We'll be in touch soon.");
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
        applicantSignatureDate: "",
        jointApplicantSignatureDate: "",
        programType: "",
        customDownPayment: "",
      }));
    } catch (err: any) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Credit Application</h1>
        <p className="text-gray-600">Unlimited Auto Repair & Collision LLC</p>
        <p className="text-sm text-gray-500">24645 Plymouth Rd Unit A, Redford Township, MI 48239 | (313) 766-4475</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {ok && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{ok}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-8">
        {/* APPLICANT INFORMATION */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">APPLICANT INFORMATION (MARRIED MAY APPLY AS AN INDIVIDUAL)</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">APPLICANT (PRINCIPAL DRIVER OF VEHICLE)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FULL NAME</label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="hidden sm:flex">
                    <select
                      value={data.applicant.srJr}
                      onChange={(e) => set("applicant", { ...data.applicant, srJr: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">SR/JR</option>
                      <option value="SR">SR</option>
                      <option value="JR">JR</option>
                    </select>
                  </div>
                    <input
                      type="text"
                      value={data.applicant.firstName}
                      onChange={(e) => set("applicant", { ...data.applicant, firstName: e.target.value })}
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
                    onChange={(e) => set("applicant", { ...data.applicant, lastName: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Last Name"
                    autoComplete="family-name"
                    required
                  />
                </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HOW LONG?</label>
                <select
                  value={data.applicant.howLongAtAddressDuration}
                  onChange={(e) => set("applicant", { ...data.applicant, howLongAtAddressDuration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Duration</option>
                  {addressDurationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">HOME PHONE</label>
                <input
                  type="tel"
                  value={data.applicant.homePhone}
                  onChange={(e) => set("applicant", { ...data.applicant, homePhone: formatPhoneNumber(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">YRS. MOS.</label>
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={data.applicant.howLongYears}
                    onChange={(e) => set("applicant", { ...data.applicant, howLongYears: e.target.value })}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                  />
                  <input
                    type="text"
                    value={data.applicant.howLongMonths}
                    onChange={(e) => set("applicant", { ...data.applicant, howLongMonths: e.target.value })}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">EMPLOYMENT</h4>
              
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
                  {data.applicant.employerName === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter employer name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                      onChange={(e) => set("applicant", { ...data.applicant, employerName: e.target.value })}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WORK PHONE</label>
                  <input
                    type="tel"
                    value={data.applicant.workPhone}
                    onChange={(e) => set("applicant", { ...data.applicant, workPhone: formatPhoneNumber(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GROSS ANNUAL SALARY $</label>
                  <select
                    value={data.applicant.grossAnnualSalary}
                    onChange={(e) => set("applicant", { ...data.applicant, grossAnnualSalary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Annual Income</option>
                    {annualIncomeOptions.map((income) => (
                      <option key={income} value={income}>{income}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ANNUAL AMOUNT $</label>
                  <input
                    type="text"
                    value={data.applicant.annualAmount}
                    onChange={(e) => set("applicant", { ...data.applicant, annualAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PREVIOUS EMPLOYER OR SCHOOL</label>
                  <input
                    type="text"
                    value={data.applicant.previousEmployerOrSchool}
                    onChange={(e) => set("applicant", { ...data.applicant, previousEmployerOrSchool: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HOW LONG?</label>
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={data.applicant.previousHowLongYears}
                      onChange={(e) => set("applicant", { ...data.applicant, previousHowLongYears: e.target.value })}
                      className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                    />
                    <input
                      type="text"
                      value={data.applicant.previousHowLongMonths}
                      onChange={(e) => set("applicant", { ...data.applicant, previousHowLongMonths: e.target.value })}
                      className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTHER INCOME SOURCE</label>
                  <input
                    type="text"
                    value={data.applicant.otherIncomeSource}
                    onChange={(e) => set("applicant", { ...data.applicant, otherIncomeSource: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Alimony, child support or separate maintenance income need not be revealed if you do not wish to have it considered as a basis for repaying this debt.</strong>
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
                    <div className="hidden sm:flex">
                      <select
                        value={data.jointApplicant.srJr}
                        onChange={(e) => set("jointApplicant", { ...data.jointApplicant, srJr: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">SR/JR</option>
                        <option value="SR">SR</option>
                        <option value="JR">JR</option>
                      </select>
                    </div>
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
                    {addressDurationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
                    {data.jointApplicant.employerName === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter employer name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                        onChange={(e) => set("jointApplicant", { ...data.jointApplicant, employerName: e.target.value })}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">GROSS ANNUAL SALARY $</label>
                    <select
                      value={data.jointApplicant.grossAnnualSalary}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, grossAnnualSalary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Annual Income</option>
                      {annualIncomeOptions.map((income) => (
                        <option key={income} value={income}>{income}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ANNUAL AMOUNT $</label>
                    <input
                      type="text"
                      value={data.jointApplicant.annualAmount}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, annualAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PREVIOUS EMPLOYER OR SCHOOL</label>
                    <input
                      type="text"
                      value={data.jointApplicant.previousEmployerOrSchool}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, previousEmployerOrSchool: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HOW LONG?</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={data.jointApplicant.previousHowLongYears}
                        onChange={(e) => set("jointApplicant", { ...data.jointApplicant, previousHowLongYears: e.target.value })}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                      />
                      <input
                        type="text"
                        value={data.jointApplicant.previousHowLongMonths}
                        onChange={(e) => set("jointApplicant", { ...data.jointApplicant, previousHowLongMonths: e.target.value })}
                        className="w-16 px-2 py-2 border border-gray-300 rounded-md text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OTHER INCOME SOURCE</label>
                    <input
                      type="text"
                      value={data.jointApplicant.otherIncomeSource}
                      onChange={(e) => set("jointApplicant", { ...data.jointApplicant, otherIncomeSource: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Alimony, child support or separate maintenance income need not be revealed if you do not wish to have it considered as a basis for repaying this debt.</strong>
                </p>
              </div>
            </div>
          )}
        </div>


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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth / Age / Social Security Number</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="date"
                  value={data.applicant.dateOfBirth}
                  onChange={(e) => set("applicant", { ...data.applicant, dateOfBirth: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={data.applicant.age}
                  onChange={(e) => set("applicant", { ...data.applicant, age: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={data.applicant.socialSecurityNumber}
                  onChange={(e) => {
                    // Only allow 4 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    set("applicant", { ...data.applicant, socialSecurityNumber: value });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Signature / Date / SSN (Last 4)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={data.applicantSignatureName}
                    onChange={(e) => set("applicantSignatureName", e.target.value)}
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
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data.applicantSignature}
                      onChange={(e) => set("applicantSignature", e.target.checked)}
                      className="mr-2"
                      required
                    />
                    <span className="text-sm text-gray-700">I agree to the terms and authorize this application</span>
                  </label>
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Type</label>
              <input
                type="text"
                value={data.programType}
                onChange={(e) => set("programType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <DocumentUpload 
            onDocumentsChange={setDocuments}
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            {loading ? "Submitting..." : "Submit Credit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}