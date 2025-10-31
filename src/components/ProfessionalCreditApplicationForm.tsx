"use client";
import React, { useState } from "react";

type Applicant = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  srJr: string;
  streetAddress: string;
  aptNumber: string;
  howLongYears: string;
  howLongMonths: string;
  city: string;
  state: string;
  zip: string;
  homePhone: string;
  dateOfBirth: string;
  age: string;
  socialSecurityNumber: string;
  housingStatus: string;
  monthlyPayment: string;
  employerName: string;
  howLongEmployedYears: string;
  howLongEmployedMonths: string;
  employerAddress: string;
  positionTitle: string;
  workPhone: string;
  grossAnnualSalary: string;
  annualAmount: string;
  otherIncomeSource: string;
  previousEmployerOrSchool: string;
  previousHowLongYears: string;
  previousHowLongMonths: string;
  autoCreditReference: string;
  autoCreditTrading: string;
  autoCreditBalance: string;
  otherCreditReference: string;
  otherCreditBalance: string;
  nearestRelative: string;
  nearestRelativeRelationship: string;
  nearestRelativeAddress: string;
  nearestRelativePhone: string;
  friendOrRelative: string;
  friendOrRelativePhone: string;
};

type Financing = {
  salesPrice: string;
  downPayment: string;
  netTrade: string;
  amountFinanced: string;
  grossCap: string;
  reduction: string;
  adjustedCap: string;
  msrp: string;
  program: string;
  term: string;
  payment: string;
  term2: string;
};

type Vehicle = {
  vin: string;
  condition: string;
  bookSource: string;
  bookValue: string;
  year: string;
  make: string;
  model: string;
  mileage: string;
  tradeYear: string;
  tradeMake: string;
  tradeModel: string;
};

type FormData = {
  dealerName: string;
  dealerNumber: string;
  programType: string;
  applicant: Applicant;
  jointApplicant: Applicant;
  financing: Financing;
  vehicle: Vehicle;
  applicantSignature: boolean;
  jointApplicantSignature: boolean;
  applicantSignatureDate: string;
  jointApplicantSignatureDate: string;
};

const emptyApplicant: Applicant = {
  firstName: "",
  middleInitial: "",
  lastName: "",
  srJr: "",
  streetAddress: "",
  aptNumber: "",
  howLongYears: "",
  howLongMonths: "",
  city: "",
  state: "",
  zip: "",
  homePhone: "",
  dateOfBirth: "",
  age: "",
  socialSecurityNumber: "",
  housingStatus: "",
  monthlyPayment: "",
  employerName: "",
  howLongEmployedYears: "",
  howLongEmployedMonths: "",
  employerAddress: "",
  positionTitle: "",
  workPhone: "",
  grossAnnualSalary: "",
  annualAmount: "",
  otherIncomeSource: "",
  previousEmployerOrSchool: "",
  previousHowLongYears: "",
  previousHowLongMonths: "",
  autoCreditReference: "",
  autoCreditTrading: "",
  autoCreditBalance: "",
  otherCreditReference: "",
  otherCreditBalance: "",
  nearestRelative: "",
  nearestRelativeRelationship: "",
  nearestRelativeAddress: "",
  nearestRelativePhone: "",
  friendOrRelative: "",
  friendOrRelativePhone: "",
};

export default function ProfessionalCreditApplicationForm() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  const [data, setData] = useState<FormData>({
    dealerName: "Unlimited Auto Repair & Collision LLC",
    dealerNumber: "",
    programType: "",
    applicant: { ...emptyApplicant },
    jointApplicant: { ...emptyApplicant },
    financing: {
      salesPrice: "",
      downPayment: "1000",
      netTrade: "",
      amountFinanced: "",
      grossCap: "",
      reduction: "",
      adjustedCap: "",
      msrp: "",
      program: "",
      term: "",
      payment: "",
      term2: "",
    },
    vehicle: {
      vin: "",
      condition: "",
      bookSource: "",
      bookValue: "",
      year: "",
      make: "",
      model: "",
      mileage: "",
      tradeYear: "",
      tradeMake: "",
      tradeModel: "",
    },
    applicantSignature: false,
    jointApplicantSignature: false,
    applicantSignatureDate: "",
    jointApplicantSignatureDate: "",
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setApplicant<K extends keyof Applicant>(key: K, value: Applicant[K]) {
    setData((d) => ({ ...d, applicant: { ...d.applicant, [key]: value } }));
  }

  function setJointApplicant<K extends keyof Applicant>(key: K, value: Applicant[K]) {
    setData((d) => ({ ...d, jointApplicant: { ...d.jointApplicant, [key]: value } }));
  }

  function setFinancing<K extends keyof Financing>(key: K, value: Financing[K]) {
    setData((d) => ({ ...d, financing: { ...d.financing, [key]: value } }));
  }

  function setVehicle<K extends keyof Vehicle>(key: K, value: Vehicle[K]) {
    setData((d) => ({ ...d, vehicle: { ...d.vehicle, [key]: value } }));
  }

  function validate(): string[] {
    const e: string[] = [];
    if (!data.applicant.firstName || !data.applicant.lastName) e.push("Applicant name is required.");
    if (!data.applicant.homePhone) e.push("Applicant phone is required.");
    if (!data.applicant.streetAddress) e.push("Applicant address is required.");
    if (!data.vehicle.vin) e.push("Vehicle VIN is required.");
    if (!data.financing.salesPrice) e.push("Sales price is required.");
    if (!data.financing.downPayment || data.financing.downPayment === "" || parseFloat(data.financing.downPayment.replace(/[^0-9.]/g, '')) < 1000) {
      e.push("Down payment selection is required. Please select a down payment option (minimum $1,000).");
    }
    if (!data.applicantSignature) e.push("Applicant signature is required.");
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
    } catch (err: any) {
      setErrors([err.message || "Submission failed."]);
    } finally {
      setLoading(false);
    }
  }

  const applicant = data.applicant;
  const joint = data.jointApplicant;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">Credit Application</h1>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-black">Unlimited Auto Repair & Collision LLC</div>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg font-bold text-black">PLEASE USE BLACK INK</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm">
          <ul className="list-disc pl-5">
            {errors.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      {ok && <div className="mb-4 rounded-xl border border-green-300 bg-green-50 p-3 text-sm">{ok}</div>}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Dealer Information */}
        <div className="grid grid-cols-3 gap-4 border-2 border-black p-4">
          <div>
            <label className="block text-sm font-bold text-black mb-1">DEALER NAME</label>
            <input
              type="text"
              value={data.dealerName}
              onChange={(e) => set("dealerName", e.target.value)}
              className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">DEALER NUMBER</label>
            <input
              type="text"
              value={data.dealerNumber}
              onChange={(e) => set("dealerNumber", e.target.value)}
              className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">PROGRAM TYPE:</label>
            <input
              type="text"
              value={data.programType}
              onChange={(e) => set("programType", e.target.value)}
              className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
            />
          </div>
        </div>

        {/* Applicant Information */}
        <div className="border-2 border-black p-4">
          <h2 className="text-lg font-bold text-black mb-4">Applicant Information (Married May Apply As An Individual)</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Applicant Column */}
            <div>
              <h3 className="text-md font-bold text-black mb-3">APPLICANT (PRINCIPAL DRIVER OF VEHICLE)</h3>
              
              {/* Full Name */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">FULL NAME</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="First"
                    value={applicant.firstName}
                    onChange={(e) => setApplicant("firstName", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                  <input
                    type="text"
                    placeholder="MI"
                    maxLength={1}
                    value={applicant.middleInitial}
                    onChange={(e) => setApplicant("middleInitial", e.target.value)}
                    className="w-12 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                  <input
                    type="text"
                    placeholder="Last"
                    value={applicant.lastName}
                    onChange={(e) => setApplicant("lastName", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={applicant.srJr === "SR"}
                      onChange={(e) => setApplicant("srJr", e.target.checked ? "SR" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">SR</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={applicant.srJr === "JR"}
                      onChange={(e) => setApplicant("srJr", e.target.checked ? "JR" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">JR</span>
                  </label>
                </div>
              </div>

              {/* Address */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">STREET ADDRESS</label>
                <input
                  type="text"
                  value={applicant.streetAddress}
                  onChange={(e) => setApplicant("streetAddress", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">APT #</label>
                  <input
                    type="text"
                    value={applicant.aptNumber}
                    onChange={(e) => setApplicant("aptNumber", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">HOW LONG?</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="YRS."
                      value={applicant.howLongYears}
                      onChange={(e) => setApplicant("howLongYears", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                    <input
                      type="text"
                      placeholder="MOS."
                      value={applicant.howLongMonths}
                      onChange={(e) => setApplicant("howLongMonths", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">CITY</label>
                  <input
                    type="text"
                    value={applicant.city}
                    onChange={(e) => setApplicant("city", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">STATE</label>
                  <input
                    type="text"
                    value={applicant.state}
                    onChange={(e) => setApplicant("state", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ZIP</label>
                  <input
                    type="text"
                    value={applicant.zip}
                    onChange={(e) => setApplicant("zip", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">HOME PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={applicant.homePhone}
                    onChange={(e) => setApplicant("homePhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">DATE OF BIRTH</label>
                  <input
                    type="date"
                    value={applicant.dateOfBirth}
                    onChange={(e) => setApplicant("dateOfBirth", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">AGE</label>
                  <input
                    type="text"
                    value={applicant.age}
                    onChange={(e) => setApplicant("age", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">SOCIAL SECURITY NUMBER</label>
                <input
                  type="text"
                  placeholder="   -  -"
                  value={applicant.socialSecurityNumber}
                  onChange={(e) => setApplicant("socialSecurityNumber", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              {/* Housing Status */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">HOUSING STATUS</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={applicant.housingStatus === "OWN/BUYING"}
                      onChange={(e) => setApplicant("housingStatus", e.target.checked ? "OWN/BUYING" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">OWN/BUYING</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={applicant.housingStatus === "LIVE WITH RELATIVE"}
                      onChange={(e) => setApplicant("housingStatus", e.target.checked ? "LIVE WITH RELATIVE" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">LIVE WITH RELATIVE</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={applicant.housingStatus === "RENT/LEASE"}
                      onChange={(e) => setApplicant("housingStatus", e.target.checked ? "RENT/LEASE" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">RENT/LEASE</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={applicant.housingStatus === "OTHER"}
                      onChange={(e) => setApplicant("housingStatus", e.target.checked ? "OTHER" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">OTHER</span>
                  </label>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-bold text-black mb-1">MONTHLY PAYMENT $</label>
                  <input
                    type="text"
                    value={applicant.monthlyPayment}
                    onChange={(e) => setApplicant("monthlyPayment", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Joint Applicant Column */}
            <div>
              <h3 className="text-md font-bold text-black mb-3">JOINT APPLICANT RELATIONSHIP</h3>
              
              {/* Full Name */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">FULL NAME</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="First"
                    value={joint.firstName}
                    onChange={(e) => setJointApplicant("firstName", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                  <input
                    type="text"
                    placeholder="MI"
                    maxLength={1}
                    value={joint.middleInitial}
                    onChange={(e) => setJointApplicant("middleInitial", e.target.value)}
                    className="w-12 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                  <input
                    type="text"
                    placeholder="Last"
                    value={joint.lastName}
                    onChange={(e) => setJointApplicant("lastName", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={joint.srJr === "SR"}
                      onChange={(e) => setJointApplicant("srJr", e.target.checked ? "SR" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">SR</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={joint.srJr === "JR"}
                      onChange={(e) => setJointApplicant("srJr", e.target.checked ? "JR" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">JR</span>
                  </label>
                </div>
              </div>

              {/* Address */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">STREET ADDRESS</label>
                <input
                  type="text"
                  value={joint.streetAddress}
                  onChange={(e) => setJointApplicant("streetAddress", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">APT #</label>
                  <input
                    type="text"
                    value={joint.aptNumber}
                    onChange={(e) => setJointApplicant("aptNumber", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">HOW LONG?</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="YRS."
                      value={joint.howLongYears}
                      onChange={(e) => setJointApplicant("howLongYears", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                    <input
                      type="text"
                      placeholder="MOS."
                      value={joint.howLongMonths}
                      onChange={(e) => setJointApplicant("howLongMonths", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">CITY</label>
                  <input
                    type="text"
                    value={joint.city}
                    onChange={(e) => setJointApplicant("city", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">STATE</label>
                  <input
                    type="text"
                    value={joint.state}
                    onChange={(e) => setJointApplicant("state", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ZIP</label>
                  <input
                    type="text"
                    value={joint.zip}
                    onChange={(e) => setJointApplicant("zip", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">HOME PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={joint.homePhone}
                    onChange={(e) => setJointApplicant("homePhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">DATE OF BIRTH</label>
                  <input
                    type="date"
                    value={joint.dateOfBirth}
                    onChange={(e) => setJointApplicant("dateOfBirth", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">AGE</label>
                  <input
                    type="text"
                    value={joint.age}
                    onChange={(e) => setJointApplicant("age", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">SOCIAL SECURITY NUMBER</label>
                <input
                  type="text"
                  placeholder="   -  -"
                  value={joint.socialSecurityNumber}
                  onChange={(e) => setJointApplicant("socialSecurityNumber", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              {/* Housing Status */}
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">HOUSING STATUS</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={joint.housingStatus === "OWN/BUYING"}
                      onChange={(e) => setJointApplicant("housingStatus", e.target.checked ? "OWN/BUYING" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">OWN/BUYING</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={joint.housingStatus === "LIVE WITH RELATIVE"}
                      onChange={(e) => setJointApplicant("housingStatus", e.target.checked ? "LIVE WITH RELATIVE" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">LIVE WITH RELATIVE</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={joint.housingStatus === "RENT/LEASE"}
                      onChange={(e) => setJointApplicant("housingStatus", e.target.checked ? "RENT/LEASE" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">RENT/LEASE</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={joint.housingStatus === "OTHER"}
                      onChange={(e) => setJointApplicant("housingStatus", e.target.checked ? "OTHER" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">OTHER</span>
                  </label>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-bold text-black mb-1">MONTHLY PAYMENT $</label>
                  <input
                    type="text"
                    value={joint.monthlyPayment}
                    onChange={(e) => setJointApplicant("monthlyPayment", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Section */}
        <div className="border-2 border-black p-4">
          <h2 className="text-lg font-bold text-black mb-4">Employment</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Applicant Employment */}
            <div>
              <h3 className="text-md font-bold text-black mb-3">APPLICANT</h3>
              
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">EMPLOYER NAME</label>
                <input
                  type="text"
                  value={applicant.employerName}
                  onChange={(e) => setApplicant("employerName", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">HOW LONG?</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="YRS."
                      value={applicant.howLongEmployedYears}
                      onChange={(e) => setApplicant("howLongEmployedYears", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                    <input
                      type="text"
                      placeholder="MOS."
                      value={applicant.howLongEmployedMonths}
                      onChange={(e) => setApplicant("howLongEmployedMonths", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">GROSS ANNUAL SALARY $</label>
                  <input
                    type="text"
                    value={applicant.grossAnnualSalary}
                    onChange={(e) => setApplicant("grossAnnualSalary", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">EMPLOYER ADDRESS</label>
                <input
                  type="text"
                  value={applicant.employerAddress}
                  onChange={(e) => setApplicant("employerAddress", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">POSITION/TITLE</label>
                  <input
                    type="text"
                    value={applicant.positionTitle}
                    onChange={(e) => setApplicant("positionTitle", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">WORK PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={applicant.workPhone}
                    onChange={(e) => setApplicant("workPhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              {/* Legal Notice */}
              <div className="mb-3 p-2 bg-gray-100 border border-gray-400">
                <p className="text-xs text-black">
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ANNUAL AMOUNT $</label>
                  <input
                    type="text"
                    value={applicant.annualAmount}
                    onChange={(e) => setApplicant("annualAmount", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">OTHER INCOME SOURCE $</label>
                  <input
                    type="text"
                    value={applicant.otherIncomeSource}
                    onChange={(e) => setApplicant("otherIncomeSource", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">PREVIOUS EMPLOYER OR SCHOOL</label>
                <input
                  type="text"
                  value={applicant.previousEmployerOrSchool}
                  onChange={(e) => setApplicant("previousEmployerOrSchool", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">HOW LONG?</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="YRS."
                    value={applicant.previousHowLongYears}
                    onChange={(e) => setApplicant("previousHowLongYears", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                  <input
                    type="text"
                    placeholder="MOS."
                    value={applicant.previousHowLongMonths}
                    onChange={(e) => setApplicant("previousHowLongMonths", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Joint Applicant Employment */}
            <div>
              <h3 className="text-md font-bold text-black mb-3">JOINT APPLICANT</h3>
              
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">EMPLOYER NAME</label>
                <input
                  type="text"
                  value={joint.employerName}
                  onChange={(e) => setJointApplicant("employerName", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">HOW LONG?</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="YRS."
                      value={joint.howLongEmployedYears}
                      onChange={(e) => setJointApplicant("howLongEmployedYears", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                    <input
                      type="text"
                      placeholder="MOS."
                      value={joint.howLongEmployedMonths}
                      onChange={(e) => setJointApplicant("howLongEmployedMonths", e.target.value)}
                      className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">GROSS ANNUAL SALARY $</label>
                  <input
                    type="text"
                    value={joint.grossAnnualSalary}
                    onChange={(e) => setJointApplicant("grossAnnualSalary", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">EMPLOYER ADDRESS</label>
                <input
                  type="text"
                  value={joint.employerAddress}
                  onChange={(e) => setJointApplicant("employerAddress", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">POSITION/TITLE</label>
                  <input
                    type="text"
                    value={joint.positionTitle}
                    onChange={(e) => setJointApplicant("positionTitle", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">WORK PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={joint.workPhone}
                    onChange={(e) => setJointApplicant("workPhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">ANNUAL AMOUNT $</label>
                  <input
                    type="text"
                    value={joint.annualAmount}
                    onChange={(e) => setJointApplicant("annualAmount", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">OTHER INCOME SOURCE $</label>
                  <input
                    type="text"
                    value={joint.otherIncomeSource}
                    onChange={(e) => setJointApplicant("otherIncomeSource", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">PREVIOUS EMPLOYER OR SCHOOL</label>
                <input
                  type="text"
                  value={joint.previousEmployerOrSchool}
                  onChange={(e) => setJointApplicant("previousEmployerOrSchool", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">HOW LONG?</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="YRS."
                    value={joint.previousHowLongYears}
                    onChange={(e) => setJointApplicant("previousHowLongYears", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                  <input
                    type="text"
                    placeholder="MOS."
                    value={joint.previousHowLongMonths}
                    onChange={(e) => setJointApplicant("previousHowLongMonths", e.target.value)}
                    className="flex-1 border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* References Section */}
        <div className="border-2 border-black p-4">
          <h2 className="text-lg font-bold text-black mb-4">References</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Applicant References */}
            <div>
              <h3 className="text-md font-bold text-black mb-3">APPLICANT</h3>
              
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">AUTO CREDIT REFERENCE (A/C #)</label>
                <input
                  type="text"
                  value={applicant.autoCreditReference}
                  onChange={(e) => setApplicant("autoCreditReference", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">TRADING?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={applicant.autoCreditTrading === "YES"}
                        onChange={(e) => setApplicant("autoCreditTrading", e.target.checked ? "YES" : "")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-black">YES</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={applicant.autoCreditTrading === "NO"}
                        onChange={(e) => setApplicant("autoCreditTrading", e.target.checked ? "NO" : "")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-black">NO</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">BALANCE $</label>
                  <input
                    type="text"
                    value={applicant.autoCreditBalance}
                    onChange={(e) => setApplicant("autoCreditBalance", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">OTHER CREDIT REFERENCE</label>
                  <input
                    type="text"
                    value={applicant.otherCreditReference}
                    onChange={(e) => setApplicant("otherCreditReference", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">BALANCE $</label>
                  <input
                    type="text"
                    value={applicant.otherCreditBalance}
                    onChange={(e) => setApplicant("otherCreditBalance", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">NEAREST RELATIVE (NOT LIVING WITH YOU)</label>
                <input
                  type="text"
                  value={applicant.nearestRelative}
                  onChange={(e) => setApplicant("nearestRelative", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">RELATIONSHIP</label>
                  <input
                    type="text"
                    value={applicant.nearestRelativeRelationship}
                    onChange={(e) => setApplicant("nearestRelativeRelationship", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={applicant.nearestRelativePhone}
                    onChange={(e) => setApplicant("nearestRelativePhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">ADDRESS</label>
                <input
                  type="text"
                  value={applicant.nearestRelativeAddress}
                  onChange={(e) => setApplicant("nearestRelativeAddress", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">FRIEND OR RELATIVE</label>
                  <input
                    type="text"
                    value={applicant.friendOrRelative}
                    onChange={(e) => setApplicant("friendOrRelative", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={applicant.friendOrRelativePhone}
                    onChange={(e) => setApplicant("friendOrRelativePhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Joint Applicant References */}
            <div>
              <h3 className="text-md font-bold text-black mb-3">JOINT APPLICANT</h3>
              
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">AUTO CREDIT REFERENCE (A/C #)</label>
                <input
                  type="text"
                  value={joint.autoCreditReference}
                  onChange={(e) => setJointApplicant("autoCreditReference", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">TRADING?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={joint.autoCreditTrading === "YES"}
                        onChange={(e) => setJointApplicant("autoCreditTrading", e.target.checked ? "YES" : "")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-black">YES</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={joint.autoCreditTrading === "NO"}
                        onChange={(e) => setJointApplicant("autoCreditTrading", e.target.checked ? "NO" : "")}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-black">NO</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">BALANCE $</label>
                  <input
                    type="text"
                    value={joint.autoCreditBalance}
                    onChange={(e) => setJointApplicant("autoCreditBalance", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">OTHER CREDIT REFERENCE</label>
                  <input
                    type="text"
                    value={joint.otherCreditReference}
                    onChange={(e) => setJointApplicant("otherCreditReference", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">BALANCE $</label>
                  <input
                    type="text"
                    value={joint.otherCreditBalance}
                    onChange={(e) => setJointApplicant("otherCreditBalance", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">NEAREST RELATIVE (NOT LIVING WITH YOU)</label>
                <input
                  type="text"
                  value={joint.nearestRelative}
                  onChange={(e) => setJointApplicant("nearestRelative", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">RELATIONSHIP</label>
                  <input
                    type="text"
                    value={joint.nearestRelativeRelationship}
                    onChange={(e) => setJointApplicant("nearestRelativeRelationship", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={joint.nearestRelativePhone}
                    onChange={(e) => setJointApplicant("nearestRelativePhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">ADDRESS</label>
                <input
                  type="text"
                  value={joint.nearestRelativeAddress}
                  onChange={(e) => setJointApplicant("nearestRelativeAddress", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">FRIEND OR RELATIVE</label>
                  <input
                    type="text"
                    value={joint.friendOrRelative}
                    onChange={(e) => setJointApplicant("friendOrRelative", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">PHONE</label>
                  <input
                    type="text"
                    placeholder="(   )   -"
                    value={joint.friendOrRelativePhone}
                    onChange={(e) => setJointApplicant("friendOrRelativePhone", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Notice and Signatures */}
        <div className="border-2 border-black p-4">
          <h2 className="text-lg font-bold text-black mb-4">Sign / Legal Notices</h2>
          
          <div className="mb-4 p-3 bg-gray-100 border border-gray-400">
            <p className="text-xs text-black leading-relaxed">
              <strong>NOTICE:</strong> I, THE UNDERSIGNED, HEREBY AUTHORIZE THE DEALER, Unlimited Auto Repair & Collision LLC AND/OR (COLLECTIVELY "PROSPECTIVE CREDITORS") TO VERIFY CREDIT AND EMPLOYMENT HISTORY AS STATED ABOVE AND TO ANSWER QUESTIONS ABOUT CREDIT EXPERIENCE WITH ME. I AUTHORIZE THE PROSPECTIVE CREDITORS TO VERIFY MY ELIGIBILITY FOR CREDIT PROGRAMS, INCLUDING INQUIRIES TO SCHOOLS OR EDUCATIONAL INSTITUTIONS. I UNDERSTAND THAT INSURANCE-RELATED CREDIT MAY BE PURCHASED FROM AN INSURER OR AGENT.
            </p>
            <p className="text-xs text-black leading-relaxed mt-2">
              I AUTHORIZE THE PROSPECTIVE CREDITORS TO REQUEST A CONSUMER (CREDIT) REPORT AND TO ADVISE ME IF A REPORT WAS ORDERED, INCLUDING THE AGENCY'S NAME AND ADDRESS. I AUTHORIZE THE PROSPECTIVE CREDITORS TO ORDER SUBSEQUENT CONSUMER CREDIT REPORTS.
            </p>
            <p className="text-xs text-black leading-relaxed mt-2">
              I AUTHORIZE THE PROSPECTIVE CREDITORS TO CONTACT PAST AND CURRENT CREDITORS ("CREDIT REFERENCES") ABOUT MY CREDIT PERFORMANCE. I UNDERSTAND THAT PROVIDING A COPY OF THIS AUTHORIZATION SERVES AS DIRECTION FOR CREDIT REFERENCES TO PROVIDE CREDIT PERFORMANCE INFORMATION.
            </p>
            <p className="text-xs text-black leading-relaxed mt-2">
              I CERTIFY THAT THE INFORMATION PROVIDED IS COMPLETE AND CORRECT AND UNDERSTAND THAT PROSPECTIVE CREDITORS WILL RETAIN THE APPLICATION WHETHER OR NOT IT IS APPROVED. I AGREE TO NOTIFY PROSPECTIVE CREDITORS OF ANY CHANGE IN NAME, ADDRESS, OR EMPLOYMENT.
            </p>
            <p className="text-xs text-black leading-relaxed mt-2">
              I CONSENT FOR THE DEALER, ASSIGNEES, AND AGENTS TO CONTACT ME AT ANY PROVIDED TELEPHONE NUMBER, INCLUDING CELL PHONE NUMBERS, BY ANY MEANS SELECTED, SUCH AS AN AUTOMATIC TELEPHONE DIALING SYSTEM, TEXT MESSAGING, AND/OR AN ARTIFICIAL OR PRE-RECORDED VOICE.
            </p>
          </div>

          <div className="mb-4 p-2 bg-yellow-100 border border-yellow-400">
            <p className="text-sm font-bold text-black">
              CO-APPLICANT'S SIGNATURE MEANS YOU INTEND TO APPLY FOR JOINT CREDIT.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-black">X</span>
                <div className="flex-1 border-b-2 border-black"></div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold text-black">SIGNATURE OF APPLICANT</span>
                <span className="text-sm font-bold text-black">DATE</span>
              </div>
              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.applicantSignature}
                    onChange={(e) => set("applicantSignature", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">I agree and sign</span>
                </label>
                <input
                  type="date"
                  value={data.applicantSignatureDate}
                  onChange={(e) => set("applicantSignatureDate", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black mt-1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-black">X</span>
                <div className="flex-1 border-b-2 border-black"></div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-bold text-black">SIGNATURE OF JOINT APPLICANT</span>
                <span className="text-sm font-bold text-black">DATE</span>
              </div>
              <div className="mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={data.jointApplicantSignature}
                    onChange={(e) => set("jointApplicantSignature", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-black">I agree and sign</span>
                </label>
                <input
                  type="date"
                  value={data.jointApplicantSignatureDate}
                  onChange={(e) => set("jointApplicantSignatureDate", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Proposed Financing Terms / Vehicle Description */}
        <div className="border-2 border-black p-4">
          <div className="grid grid-cols-2 gap-8">
            {/* Proposed Financing Terms */}
            <div>
              <h2 className="text-lg font-bold text-black mb-4">Proposed Financing Terms</h2>
              
              <div className="mb-4">
                <h3 className="text-md font-bold text-black mb-2">RETAIL</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">SALES PRICE $</label>
                    <input
                      type="text"
                      value={data.financing.salesPrice}
                      onChange={(e) => setFinancing("salesPrice", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">
                      DOWN PAYMENT $ <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFinancing("downPayment", "1000")}
                          className={`px-3 py-1 text-sm border ${
                            data.financing.downPayment === "1000" 
                              ? "bg-blue-600 text-white border-blue-600" 
                              : errors.some(e => e.includes('Down payment'))
                                ? "bg-red-50 text-black border-red-500 hover:bg-red-100"
                                : "bg-white text-black border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          $1,000
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinancing("downPayment", "1500")}
                          className={`px-3 py-1 text-sm border ${
                            data.financing.downPayment === "1500" 
                              ? "bg-blue-600 text-white border-blue-600" 
                              : errors.some(e => e.includes('Down payment'))
                                ? "bg-red-50 text-black border-red-500 hover:bg-red-100"
                                : "bg-white text-black border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          $1,500
                        </button>
                        <button
                          type="button"
                          onClick={() => setFinancing("downPayment", "2500")}
                          className={`px-3 py-1 text-sm border ${
                            data.financing.downPayment === "2500" 
                              ? "bg-blue-600 text-white border-blue-600" 
                              : errors.some(e => e.includes('Down payment'))
                                ? "bg-red-50 text-black border-red-500 hover:bg-red-100"
                                : "bg-white text-black border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          $2,500
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Custom amount (minimum $1,000)"
                        value={data.financing.downPayment}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          if (value === '' || parseInt(value) >= 1000) {
                            setFinancing("downPayment", value);
                          }
                        }}
                        className={`w-full border px-2 py-1 bg-white text-black ${
                          errors.some(e => e.includes('Down payment'))
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-400'
                        }`}
                        required
                      />
                      <p className="text-xs text-gray-600">Minimum down payment: $1,000 <span className="text-red-500">*</span> Required</p>
                      {errors.some(e => e.includes('Down payment')) && (
                        <p className="text-red-500 text-xs mt-1">Please select a down payment option (minimum $1,000)</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">NET TRADE $</label>
                    <input
                      type="text"
                      value={data.financing.netTrade}
                      onChange={(e) => setFinancing("netTrade", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">AMT FINANCED $</label>
                    <input
                      type="text"
                      value={data.financing.amountFinanced}
                      onChange={(e) => setFinancing("amountFinanced", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-bold text-black mb-2">LEASE</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">GROSS CAP $</label>
                    <input
                      type="text"
                      value={data.financing.grossCap}
                      onChange={(e) => setFinancing("grossCap", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">REDUCTION $</label>
                    <input
                      type="text"
                      value={data.financing.reduction}
                      onChange={(e) => setFinancing("reduction", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">ADJUSTED CAP $</label>
                    <input
                      type="text"
                      value={data.financing.adjustedCap}
                      onChange={(e) => setFinancing("adjustedCap", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">MSRP $</label>
                    <input
                      type="text"
                      value={data.financing.msrp}
                      onChange={(e) => setFinancing("msrp", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">PROGRAM</label>
                  <input
                    type="text"
                    value={data.financing.program}
                    onChange={(e) => setFinancing("program", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">TERM</label>
                  <input
                    type="text"
                    value={data.financing.term}
                    onChange={(e) => setFinancing("term", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">PAYMENT</label>
                  <input
                    type="text"
                    value={data.financing.payment}
                    onChange={(e) => setFinancing("payment", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">TERM</label>
                  <input
                    type="text"
                    value={data.financing.term2}
                    onChange={(e) => setFinancing("term2", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle Description */}
            <div>
              <h2 className="text-lg font-bold text-black mb-4">Vehicle Description</h2>
              
              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">VIN</label>
                <input
                  type="text"
                  value={data.vehicle.vin}
                  onChange={(e) => setVehicle("vin", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">CONDITION</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={data.vehicle.condition === "NEW"}
                      onChange={(e) => setVehicle("condition", e.target.checked ? "NEW" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">NEW</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={data.vehicle.condition === "USED"}
                      onChange={(e) => setVehicle("condition", e.target.checked ? "USED" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">USED</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={data.vehicle.condition === "DEMO"}
                      onChange={(e) => setVehicle("condition", e.target.checked ? "DEMO" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">DEMO</span>
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">USED VALUE GUIDE:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={data.vehicle.bookSource === "NADA"}
                      onChange={(e) => setVehicle("bookSource", e.target.checked ? "NADA" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">NADA</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={data.vehicle.bookSource === "KELLEY"}
                      onChange={(e) => setVehicle("bookSource", e.target.checked ? "KELLEY" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">KELLEY</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={data.vehicle.bookSource === "BLACK BOOK"}
                      onChange={(e) => setVehicle("bookSource", e.target.checked ? "BLACK BOOK" : "")}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black">BLACK BOOK</span>
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-bold text-black mb-1">BOOK VALUE $</label>
                <input
                  type="text"
                  value={data.vehicle.bookValue}
                  onChange={(e) => setVehicle("bookValue", e.target.value)}
                  className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">YEAR</label>
                  <input
                    type="text"
                    value={data.vehicle.year}
                    onChange={(e) => setVehicle("year", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">MAKE</label>
                  <input
                    type="text"
                    value={data.vehicle.make}
                    onChange={(e) => setVehicle("make", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">MODEL</label>
                  <input
                    type="text"
                    value={data.vehicle.model}
                    onChange={(e) => setVehicle("model", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1">MILEAGE</label>
                  <input
                    type="text"
                    value={data.vehicle.mileage}
                    onChange={(e) => setVehicle("mileage", e.target.value)}
                    className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-md font-bold text-black mb-2">TRADE IN:</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">YEAR</label>
                    <input
                      type="text"
                      value={data.vehicle.tradeYear}
                      onChange={(e) => setVehicle("tradeYear", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">MAKE</label>
                    <input
                      type="text"
                      value={data.vehicle.tradeMake}
                      onChange={(e) => setVehicle("tradeMake", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-black mb-1">MODEL</label>
                    <input
                      type="text"
                      value={data.vehicle.tradeModel}
                      onChange={(e) => setVehicle("tradeModel", e.target.value)}
                      className="w-full border border-gray-400 px-2 py-1 bg-white text-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-8 py-3 text-lg font-bold disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
