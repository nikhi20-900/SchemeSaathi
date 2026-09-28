import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, GraduationCap, IndianRupee, MapPin } from 'lucide-react';
import type { UserProfile, PageId } from '../types';
import { MOCK_PROFILE } from '../services/api';

interface ProfileProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onNavigate: (page: PageId) => void;
}

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', '2A', '2B', '3A', '3B'];
const EDUCATION_LEVELS = ['Below 10th', '10th Pass', '12th Pass', 'Diploma', 'Undergraduate', 'Postgraduate', 'Professional', 'PhD'];

export default function Profile({ profile, onSave, onNavigate }: ProfileProps) {
  const [form, setForm] = useState<UserProfile>({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-charcoal-900 mb-1">Citizen Profile</h1>
        <p className="text-sm text-charcoal-700/60 mb-8">
          Your profile is evaluated deterministically against scheme eligibility criteria.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal */}
          <fieldset className="civic-card rounded-xl p-5">
            <legend className="section-label px-2 -ml-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Personal Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => handleChange('age', parseInt(e.target.value) || 0)}
                  className="input-field"
                  min={1}
                  max={120}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                  className="select-field"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">Student</label>
                <select
                  value={form.student_status ? 'yes' : 'no'}
                  onChange={e => handleChange('student_status', e.target.value === 'yes')}
                  className="select-field"
                >
                  <option value="yes">Yes — Currently enrolled</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </fieldset>

          {/* Location */}
          <fieldset className="civic-card rounded-xl p-5">
            <legend className="section-label px-2 -ml-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Location
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">State</label>
                <select
                  value={form.state}
                  onChange={e => handleChange('state', e.target.value)}
                  className="select-field"
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">District</label>
                <input
                  type="text"
                  value={form.district || ''}
                  onChange={e => handleChange('district', e.target.value)}
                  className="input-field"
                  placeholder="Enter your district"
                />
              </div>
            </div>
          </fieldset>

          {/* Education */}
          <fieldset className="civic-card rounded-xl p-5">
            <legend className="section-label px-2 -ml-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Education
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">Education Level</label>
                <select
                  value={form.education}
                  onChange={e => handleChange('education', e.target.value)}
                  className="select-field"
                >
                  {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-charcoal-800 mb-1">Course</label>
                <input
                  type="text"
                  value={form.course}
                  onChange={e => handleChange('course', e.target.value)}
                  className="input-field"
                  placeholder="e.g. BCA, B.Tech"
                />
              </div>
            </div>
          </fieldset>

          {/* Financial */}
          <fieldset className="civic-card rounded-xl p-5">
            <legend className="section-label px-2 -ml-1 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5" /> Financial Information
            </legend>
            <div className="mt-3">
              <label className="block text-xs font-medium text-charcoal-800 mb-1">Annual Family Income (₹)</label>
              <input
                type="number"
                value={form.annual_income}
                onChange={e => handleChange('annual_income', parseFloat(e.target.value) || 0)}
                className="input-field"
                min={0}
                step={1000}
              />
              <p className="text-xs text-charcoal-700/40 mt-1">
                ₹{form.annual_income.toLocaleString('en-IN')} per year
              </p>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" />
              Save Profile
            </button>
            <button
              type="button"
              onClick={() => onNavigate('results')}
              className="btn-terracotta"
            >
              Check Eligibility
            </button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sage-600 text-sm font-medium"
              >
                ✓ Saved
              </motion.span>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
