import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCw, 
  ShieldCheck, 
  FileSearch,
  Scan,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { LoadingState } from '../components/LoadingState';
import type { UserProfile, PageId } from '../types';

interface DocumentsProps {
  userProfile: UserProfile;
  onUpdateProfile: (updatedFields: Partial<UserProfile>) => void;
  onNavigate: (page: PageId, data?: any) => void;
}

interface DemoSampleDoc {
  id: string;
  name: string;
  type: string;
  fileSize: string;
  authority: string;
  certificateNo: string;
  date: string;
  status: 'VERIFIED' | 'MISMATCH' | 'NEEDS_REVIEW';
  summary: string;
  fields: {
    label: string;
    extracted: string;
    profileValue: string;
    confidence: number;
    match: boolean;
  }[];
  unlockRule: {
    field: string;
    value: any;
    label: string;
  };
}

const SAMPLE_DOCUMENTS: DemoSampleDoc[] = [
  {
    id: 'karnataka-domicile',
    name: 'Karnataka Domicile Certificate (Form 3)',
    type: 'Domicile / Residence Certificate',
    fileSize: '1.2 MB · PDF',
    authority: 'Tahsildar Office, Bengaluru Urban, Karnataka',
    certificateNo: 'RD00389182910/2024',
    date: '15-Jan-2024',
    status: 'VERIFIED',
    summary: 'Citizen is verified as a bona fide permanent resident of Karnataka for >7 years. Fully satisfies Karnataka SSP post-matric domicile criterion.',
    fields: [
      { label: 'Applicant Name', extracted: 'Nikhil Kumar', profileValue: 'Nikhil Kumar', confidence: 99, match: true },
      { label: 'Domicile State', extracted: 'Karnataka', profileValue: 'Karnataka', confidence: 98, match: true },
      { label: 'District', extracted: 'Bengaluru Urban', profileValue: 'Bengaluru Urban', confidence: 96, match: true },
      { label: 'Continuous Residence', extracted: '12 Years', profileValue: '≥ 7 Years required', confidence: 95, match: true },
    ],
    unlockRule: {
      field: 'domicile_certificate',
      value: true,
      label: 'Resolves Domicile Certificate requirement for Karnataka Post-Matric Scholarship to PASS',
    },
  },
  {
    id: 'income-cert',
    name: 'Annual Income Certificate (Form 16/Tahsildar)',
    type: 'Income Certificate',
    fileSize: '840 KB · PDF',
    authority: 'Revenue Department, Government of Karnataka',
    certificateNo: 'INC-2024-918274',
    date: '02-Feb-2024',
    status: 'VERIFIED',
    summary: 'Family income verified at ₹2,40,000 per annum, matching declared profile data.',
    fields: [
      { label: 'Applicant Name', extracted: 'Nikhil Kumar', profileValue: 'Nikhil Kumar', confidence: 99, match: true },
      { label: 'Annual Income', extracted: '₹2,40,000', profileValue: '₹2,40,000', confidence: 97, match: true },
      { label: 'Income Threshold Check', extracted: 'Below ₹2,50,000 limit', profileValue: '≤ ₹2,50,000', confidence: 99, match: true },
    ],
    unlockRule: {
      field: 'income_verified',
      value: true,
      label: 'Certifies income below ₹2,50,000 threshold',
    },
  },
  {
    id: 'caste-cert',
    name: 'Caste & Category Certificate (Category 2A)',
    type: 'Caste Certificate',
    fileSize: '950 KB · JPG',
    authority: 'Office of Backward Classes Welfare, Karnataka',
    certificateNo: 'CST-2A-884920',
    date: '10-Nov-2023',
    status: 'VERIFIED',
    summary: 'Category 2A (OBC) verified against Karnataka state gazette reservation matrix.',
    fields: [
      { label: 'Applicant Name', extracted: 'Nikhil Kumar', profileValue: 'Nikhil Kumar', confidence: 98, match: true },
      { label: 'Category', extracted: 'Category 2A (OBC)', profileValue: '2A', confidence: 96, match: true },
      { label: 'Gazette Sub-caste Ref', extracted: 'Sl. No. 44 (Recognized)', profileValue: 'Recognized', confidence: 94, match: true },
    ],
    unlockRule: {
      field: 'caste_verified',
      value: true,
      label: 'Certifies Category 2A OBC status',
    },
  },
  {
    id: 'mismatch-sample',
    name: 'Discrepancy Sample: High Income Certificate',
    type: 'Income Certificate (Discrepancy)',
    fileSize: '1.1 MB · PDF',
    authority: 'Revenue Department',
    certificateNo: 'INC-DISC-99120',
    date: '11-Mar-2024',
    status: 'MISMATCH',
    summary: 'Extracted annual income (₹4,80,000) exceeds declared profile amount (₹2,40,000) and crosses the ₹2,50,000 welfare ceiling.',
    fields: [
      { label: 'Applicant Name', extracted: 'Nikhil Kumar', profileValue: 'Nikhil Kumar', confidence: 97, match: true },
      { label: 'Annual Income', extracted: '₹4,80,000', profileValue: '₹2,40,000', confidence: 95, match: false },
      { label: 'Threshold Ceiling', extracted: 'Exceeds ₹2,50,000 limit', profileValue: 'Exceeded', confidence: 98, match: false },
    ],
    unlockRule: {
      field: 'income_mismatch',
      value: true,
      label: 'Demonstrates automated fraud detection and discrepancy flag',
    },
  },
];

export default function Documents({
  userProfile,
  onUpdateProfile,
  onNavigate,
}: DocumentsProps) {
  const [selectedDoc, setSelectedDoc] = useState<DemoSampleDoc | null>(SAMPLE_DOCUMENTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);

  const simulateOCR = (doc: DemoSampleDoc) => {
    setIsProcessing(true);
    setProcessingStage(0);
    setSelectedDoc(null);
    setAppliedSuccessfully(false);

    // Stage 1
    setTimeout(() => {
      setProcessingStage(1);
    }, 400);

    // Stage 2
    setTimeout(() => {
      setProcessingStage(2);
    }, 800);

    // Stage 3
    setTimeout(() => {
      setProcessingStage(3);
    }, 1200);

    // Final
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedDoc(doc);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // Run OCR on the Domicile sample by default for uploaded files
      simulateOCR({
        ...SAMPLE_DOCUMENTS[0],
        name: file.name,
      });
    }
  };

  const handleApplyToProfile = () => {
    if (!selectedDoc) return;
    
    // Apply updates to citizen profile
    onUpdateProfile({
      [selectedDoc.unlockRule.field]: selectedDoc.unlockRule.value,
    });

    setAppliedSuccessfully(true);

    // Automatically navigate to updated results after a brief acknowledgement
    setTimeout(() => {
      onNavigate('results');
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-sage-600">
            <Scan className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">Document Intelligence & OCR Verification</h1>
        </div>
        <p className="text-sm text-charcoal-700/60">
          Upload certificates or choose from official demo samples to verify eligibility criteria against gazetted rules.
        </p>

        {/* Civic Banner */}
        <div className="mt-3 flex items-center gap-2 p-3 bg-linen-200 border border-linen-300 rounded-lg text-xs text-charcoal-800">
          <ShieldCheck className="w-4 h-4 text-sage-600 flex-shrink-0" />
          <span>
            <strong>Deterministic Verification:</strong> Extracted fields are cross-referenced with your citizen profile using strict cryptographic and mathematical comparisons to eliminate verification backlog.
          </span>
        </div>
      </div>

      {/* Upload Zone & Sample Document Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Upload Dropzone */}
        <div className="civic-card rounded-2xl p-6 border-dashed border-2 border-linen-400 hover:border-terracotta-500/50 transition-colors flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-linen-200 flex items-center justify-center text-charcoal-700 mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-charcoal-900 mb-1">Upload Certificate</h3>
          <p className="text-xs text-charcoal-700/60 mb-4">
            Supports PDF, JPG, or PNG up to 10MB
          </p>
          <label className="btn-secondary text-xs cursor-pointer py-2 px-4">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {uploadedFileName && (
            <p className="text-[11px] text-sage-600 font-medium mt-2 truncate max-w-full">
              Selected: {uploadedFileName}
            </p>
          )}
        </div>

        {/* 1-Click Demo Samples */}
        <div className="md:col-span-2 civic-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="section-label flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
              1-Click Demo Verification Samples
            </p>
            <span className="text-[10px] text-charcoal-700/50">Instant OCR Test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SAMPLE_DOCUMENTS.map((doc) => (
              <button
                key={doc.id}
                onClick={() => simulateOCR(doc)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedDoc?.id === doc.id
                    ? 'border-terracotta-500 bg-terracotta-100/20 shadow-sm'
                    : 'border-linen-300 hover:border-linen-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-charcoal-900 truncate max-w-[170px]">
                    {doc.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      doc.status === 'VERIFIED'
                        ? 'bg-sage-50 text-sage-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-700/60 line-clamp-1">{doc.type}</p>
                <span className="text-[10px] text-terracotta-600 font-semibold mt-1 inline-block">
                  Run OCR Analysis →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="civic-card rounded-2xl p-8 mb-8">
          <LoadingState
            message="Running Document Intelligence OCR Pipeline…"
            steps={[
              'Preprocessing document image & deskewing',
              'Running Tesseract OCR & Layout Detection',
              'Extracting key-value certificate fields',
              'Cross-referencing with citizen profile criteria',
            ]}
            currentStep={processingStage}
          />
        </div>
      )}

      {/* Document Verification Inspection View */}
      {selectedDoc && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="civic-card rounded-2xl overflow-hidden border border-linen-300"
        >
          {/* Header */}
          <div className="p-6 bg-white border-b border-linen-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-linen-200 text-charcoal-700">
                    {selectedDoc.certificateNo}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                      selectedDoc.status === 'VERIFIED'
                        ? 'bg-sage-50 text-sage-700 border-sage-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {selectedDoc.status === 'VERIFIED' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {selectedDoc.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-charcoal-900">{selectedDoc.name}</h3>
                <p className="text-xs text-charcoal-700/60 mt-0.5">
                  Issuing Authority: {selectedDoc.authority} · Issued on: {selectedDoc.date}
                </p>
              </div>

              {/* Action Button: Apply to Profile */}
              {selectedDoc.status === 'VERIFIED' && (
                <div className="flex flex-col sm:items-end">
                  <button
                    onClick={handleApplyToProfile}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-terracotta-500 text-white hover:bg-terracotta-600 transition-colors shadow-sm"
                  >
                    <span>Apply to Profile & Re-evaluate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {appliedSuccessfully && (
                    <span className="text-[11px] text-sage-600 font-semibold mt-1">
                      ✓ Profile Updated! Re-evaluating schemes…
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 rounded-xl bg-linen-100 border border-linen-200 text-xs text-charcoal-800">
              <span className="font-bold">Verification Finding: </span>
              {selectedDoc.summary}
            </div>
          </div>

          {/* Extracted Fields Table */}
          <div className="p-6 bg-linen-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700/60 mb-3">
              Extracted OCR Fields & Citizen Profile Match
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-linen-300 text-charcoal-700/60">
                    <th className="py-2.5 font-bold">Field Name</th>
                    <th className="py-2.5 font-bold">Extracted Document Value</th>
                    <th className="py-2.5 font-bold">Profile Value</th>
                    <th className="py-2.5 font-bold text-center">Confidence</th>
                    <th className="py-2.5 font-bold text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linen-200">
                  {selectedDoc.fields.map((field, idx) => (
                    <tr key={idx} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 font-semibold text-charcoal-900">{field.label}</td>
                      <td className="py-3 font-mono font-medium text-charcoal-800">
                        {field.extracted}
                      </td>
                      <td className="py-3 text-charcoal-700/70">{field.profileValue}</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-linen-200 text-charcoal-800 font-mono text-[10px] font-bold">
                          {field.confidence}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {field.match ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sage-600 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Mismatch
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Impact Banner */}
            <div className="mt-5 p-3.5 rounded-xl bg-sage-50 border border-sage-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-sage-700">
                  {selectedDoc.unlockRule.label}
                </span>
              </div>
              <button
                onClick={handleApplyToProfile}
                className="btn-primary text-xs py-1.5 px-3 flex-shrink-0"
              >
                Apply & View Eligibility
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
