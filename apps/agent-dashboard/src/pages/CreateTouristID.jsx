// apps/agent-dashboard/src/pages/CreateTouristID.jsx
import React, { useState } from 'react';
import { createTourist } from '../api/identityService';

// Fallback utility functions
function generateTouristId(prefix = 'T') {
  const timestamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${timestamp}-${rand}`;
}

function generateTempPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// Simple validators
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultForm = {
  full_name: '',
  primary_email: '',
  primary_phone: '',
  country_of_origin: '',
  arrival_date: '',
  expected_departure_date: '',
  accommodation_name: '',
  accommodation_address: '',
  party_size: 1, 
  travel_companions: '',
  language_preference: 'English', 
  places_to_visit: '',
  preferred_contact_method: 'phone', 
  allergies_medical_conditions: '',
  insurance_policy: '',
  wearable_id: '',
  photo: '',
  notes: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relation: '',
  consent_required: true, 
  tracking_opt_in: true, 
  share_with_police: false,
};

// --- TAILWIND CLASS CONSTANTS ---
const inputClasses = "w-full p-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";
const errorInputClasses = "border-red-500 ring-2 ring-red-100";
const labelClasses = "text-sm text-gray-700 font-medium";
const errorMsgClasses = "text-red-500 text-xs mt-1";
const requiredStar = <span className="text-red-500">*</span>;
// --- END STYLING CONSTANTS ---

export default function CreateTouristID({ onCreated }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null); 
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.full_name || form.full_name.trim().length < 2) newErrors.full_name = 'Full name is required (min 2 chars)';
    if (!form.primary_phone || !phoneRegex.test(form.primary_phone)) newErrors.primary_phone = 'Enter a valid phone in E.164 format';
    if (!form.country_of_origin) newErrors.country_of_origin = 'Country of origin is required';
    if (!form.arrival_date) newErrors.arrival_date = 'Arrival date is required';
    
    const trimmedEmail = form.primary_email?.trim();
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
        newErrors.primary_email = 'Must be a valid email address';
    }

    if (form.arrival_date && form.expected_departure_date) {
        const a = new Date(form.arrival_date);
        const d = new Date(form.expected_departure_date);
        if (d < a) newErrors.expected_departure_date = 'Departure must be same or after arrival';
    }
    
    const partySizeValue = form.party_size;
    if (partySizeValue) {
      const partySizeNum = Number(partySizeValue);
      if (isNaN(partySizeNum) || !Number.isInteger(partySizeNum) || partySizeNum <= 0) {
        newErrors.party_size = 'Must be a positive whole number';
      }
    }
    
    if (form.emergency_contact_phone && !phoneRegex.test(form.emergency_contact_phone)) newErrors.emergency_contact_phone = 'Enter a valid emergency contact phone';
    
    if (!form.consent_required) newErrors.consent_required = 'Consent is required to continue';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function resetForm() {
    // This is the action for the "Reset" button, clears all fields and messages
    setForm(defaultForm);
    setErrors({});
    setCreatedCreds(null); 
    setToast(null);
  }
  
  function clearCreatedCreds() {
    // Function to dismiss the success credentials box
    setCreatedCreds(null);
  }

  async function submit(e) {
    e.preventDefault();
    setToast(null);
    setCreatedCreds(null); // Clear previous credentials before new attempt

    if (!validate()) {
      setToast({ type: 'error', text: 'Please fix highlighted fields' });
      return;
    }
    
    setLoading(true);
    try {
      const tourist_id_local = generateTouristId();
      const tempPassword = generateTempPassword(10);

      const payload = {
        tourist_id: tourist_id_local,
        password: tempPassword,
        temporaryPassword: true,
        full_name: form.full_name,
        primary_phone: form.primary_phone,
        primary_email: form.primary_email?.trim() || null, 
        country_of_origin: form.country_of_origin || null,
        arrival_date: form.arrival_date || null,
        expected_departure_date: form.expected_departure_date || null,
        current_accommodation: (form.accommodation_name || form.accommodation_address) ? { name: form.accommodation_name, address: form.accommodation_address } : null,
        party_size: form.party_size ? Number(form.party_size) : null,
        travel_companions: form.travel_companions ? form.travel_companions.split(',').map(s => s.trim()).filter(Boolean) : [],
        language_preference: form.language_preference ? form.language_preference.split(',').map(s => s.trim()).filter(Boolean) : [],
        itinerary: form.places_to_visit ? form.places_to_visit.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferred_contact_method: form.preferred_contact_method || null,
        allergies_medical_conditions: form.allergies_medical_conditions || null,
        insurance_policy: form.insurance_policy || null,
        wearable_id: form.wearable_id || null,
        photo: form.photo || null,
        notes: form.notes || null,
        emergency_contact: (form.emergency_contact_name || form.emergency_contact_phone) ? { name: form.emergency_contact_name, phone: form.emergency_contact_phone, relation: form.emergency_contact_relation } : null,
        consent_flags: {
          consent_required: !!form.consent_required,
          tracking_opt_in: !!form.tracking_opt_in,
          share_with_police: !!form.share_with_police
        }
      };

      const res = await createTourist(payload);

      // FIX: Prioritize the ID returned by the Auth Service (res.auth.user.id), 
      // as this is the ID used for login and stored in the Auth database.
      const returnedId =
        res?.auth?.user?.id || 
        res?.identity?.tourist?.tourist_id ||
        res?.identity?.tourist_id ||
        res?.tourist?.tourist_id ||
        res?.tourist_id ||
        tourist_id_local;

      // 1. Set credentials for display
      setCreatedCreds({ tourist_id: returnedId, tempPassword, backend: res });
      setToast({ type: 'success', text: `Tourist created (id: ${returnedId}). See credentials below.` });

      // 2. Reset the form fields, but keep the credentials display state
      setForm(defaultForm); 
      setErrors({});
      
      if (onCreated) onCreated();

    } catch (err) {
      console.error('CreateTourist submit error', err);
      let msg = 'Save failed. Check console for details.';
      if (err.message) msg = err.message;
      if (err.status) msg = `Server returned ${err.status}: ${err.message}`;
      setToast({ type: 'error', text: msg });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 6000);
    }
  }
  
  // Custom field renderer using Tailwind classes
  const renderField = (key, label, type = 'text', required = false, isTextArea = false, placeholder = '') => {
    const isCheckbox = type === 'checkbox';
    const hasError = errors[key];
    const Tag = isTextArea ? 'textarea' : 'input';

    return (
      <div className={`flex flex-col gap-1.5 ${isTextArea && !required ? 'sm:col-span-2' : ''}`} key={key}>
        <label className={labelClasses}>
          {label} {required && requiredStar}
        </label>
        {isCheckbox ? (
             <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                    type="checkbox" 
                    className="rounded text-blue-600 focus:ring-blue-500" 
                    checked={form[key]} 
                    onChange={e => update(key, e.target.checked)} 
                />
                <span>{label} {required && requiredStar}</span>
             </label>
        ) : (
            <Tag
                type={type === 'number' ? 'number' : type}
                value={form[key]}
                onChange={e => update(key, e.target.value)}
                className={`${inputClasses} ${isTextArea ? 'h-24 resize-y' : ''} ${hasError ? errorInputClasses : ''}`}
                placeholder={placeholder}
                autoComplete="off"
                {...(type === 'number' && { min: '1' })}
            />
        )}
        {hasError && <div className={errorMsgClasses}>{hasError}</div>}
      </div>
    );
  };


  return (
    <div className="p-6 flex justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden font-sans">
        
        <div className="p-5 sm:px-7 bg-gradient-to-r from-sky-500 to-indigo-500 text-white flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold m-0">Register Tourist ID (Agent)</h3>
            <div className="text-sm opacity-95 m-0">Fast onboarding & Credentialing.</div>
          </div>
          <div className="text-right text-xs opacity-95 hidden sm:block">
            <div className="font-semibold">Required</div>
            <div className="text-xs opacity-80">Fields marked {requiredStar} must be filled</div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 grid grid-cols-1 gap-6" noValidate>
          
          {toast && (
            <div className={`p-3 rounded-lg font-semibold ${toast.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-teal-50 text-teal-800'}`}>
              {toast.text}
            </div>
          )}

          {/* Basic Info */}
          <fieldset className="p-4 rounded-xl border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <legend className="px-2 font-bold text-lg text-blue-700">Basic & Contact</legend>
            {renderField('full_name', 'Full Name', 'text', true, false, 'e.g. Ramesh Singh')}
            {renderField('primary_phone', 'Primary Phone', 'text', true, false, '+919812345678 (E.164)')}
            {renderField('primary_email', 'Primary Email', 'email', false, false, 'optional@example.com')}
            {renderField('country_of_origin', 'Country of Origin', 'text', true, false, 'e.g. IN / US')}
            {renderField('arrival_date', 'Arrival Date', 'date', true)}
            {renderField('expected_departure_date', 'Expected Departure Date', 'date')}
            {renderField('party_size', 'Party Size', 'number', false, false, 'e.g. 2')}
            {renderField('language_preference', 'Language Preference', 'text', false, false, 'e.g. Hindi, English')}
            {renderField('preferred_contact_method', 'Preferred Contact Method', 'text', false, false, 'sms / call / email')}
          </fieldset>
          
          {/* Accommodation & Itinerary */}
          <fieldset className="p-4 rounded-xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <legend className="px-2 font-bold text-lg text-indigo-700">Accommodation & Itinerary</legend>
            {renderField('accommodation_name', 'Accommodation Name', 'text', false, false, 'Hotel / Rental Name')}
            {renderField('accommodation_address', 'Accommodation Address', 'text', false, false, 'Full address')}
            {renderField('travel_companions', 'Travel Companions (Comma-separated names)', 'text', false, false, 'Names, e.g. Priya Sharma, Ali Khan')}
            <div className="sm:col-span-2">
                {renderField('places_to_visit', 'Places To Visit (Comma-separated itinerary)', 'text', false, false, 'e.g. Mumbai, Goa, Delhi')}
            </div>
          </fieldset>

          {/* Emergency, Medical & Misc */}
          <fieldset className="p-4 rounded-xl border border-red-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <legend className="px-2 font-bold text-lg text-red-700">Emergency & Medical</legend>
            <div className="sm:col-span-2 text-sm font-semibold text-gray-600 mb-2">Emergency Contact Details</div>
            {renderField('emergency_contact_name', 'Contact Name', 'text', false, false, 'Contact Name')}
            {renderField('emergency_contact_phone', 'Contact Phone', 'text', false, false, '+9198...')}
            {renderField('emergency_contact_relation', 'Contact Relation', 'text', false, false, 'e.g. Spouse / Parent')}
            
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderField('allergies_medical_conditions', 'Allergies / Medical Conditions', 'text', false, true, 'Any essential info (use lines for clarity)')}
                {renderField('insurance_policy', 'Insurance Policy Details', 'text', false, false, 'Insurer - policy no.')}
            </div>
          </fieldset>
          
          {/* Miscellaneous & Notes */}
          <fieldset className="p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <legend className="px-2 font-bold text-lg text-gray-700">Miscellaneous & Agent Notes</legend>
            {renderField('wearable_id', 'Wearable ID (for hardware tag)', 'text', false, false, 'e.g. Bracelet ID')}
            {renderField('photo', 'Photo/Image URL (Optional)', 'text', false, false, 'https://...')}
            {/* Notes field spans full width and uses textarea styling */}
            <div className="sm:col-span-2">
                <label className={labelClasses}>Notes (Agent private notes)</label>
                <textarea 
                    className={`${inputClasses} h-24 resize-y`} 
                    value={form.notes} 
                    onChange={e=>update('notes', e.target.value)} 
                    placeholder="Any internal notes or special instructions..." 
                />
            </div>
          </fieldset>
          
          {/* Consent section and Actions */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-end justify-between pt-2">
            {/* Consent */}
            <div className="flex flex-col gap-2">
                {/* Consent Required Checkbox with error styling */}
                <div className={`p-1 ${errors.consent_required ? 'border border-red-500 rounded-md' : ''}`}>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input 
                            type="checkbox" 
                            className="rounded text-blue-600 focus:ring-blue-500" 
                            checked={form.consent_required} 
                            onChange={e=>update('consent_required', e.target.checked)} 
                        />
                        <span>I consent to the collection and processing of my personal data. {requiredStar}</span>
                    </label>
                    {errors.consent_required && <div className={errorMsgClasses}>{errors.consent_required}</div>}
                </div>
                {/* Optional Opt-ins */}
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={form.tracking_opt_in} onChange={e=>update('tracking_opt_in', e.target.checked)} />
                    <span>Opt-in: allow optional real-time tracking</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={form.share_with_police} onChange={e=>update('share_with_police', e.target.checked)} />
                    <span>Allow sharing limited data with police in emergencies</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 items-center w-full md:w-auto">
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex-grow md:flex-grow-0">
                Reset
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-grow md:flex-grow-0">
                {loading ? 'Creating…' : 'Create Tourist ID'}
              </button>
            </div>
          </div>

          {/* Success Credentials Display - FIXED POP-UP */}
          {createdCreds && (
            <div className="mt-4 p-5 rounded-xl border-2 border-green-500 bg-green-50 shadow-md">
              <h4 className="text-xl font-bold text-green-700 mb-2">Tourist Created Successfully!</h4>
              <p className="text-lg text-gray-800 mb-1">
                <strong>Tourist ID:</strong> <code className="bg-gray-200 p-1 rounded font-mono">{createdCreds.tourist_id}</code>
              </p>
              <p className="text-lg text-gray-800 mb-3">
                <strong>Temporary Password:</strong> <code className="bg-gray-200 p-1 rounded font-mono">{createdCreds.tempPassword}</code>
              </p>
              <p className="text-sm text-red-600 font-medium mb-4">
                ⚠️ Share these credentials with the tourist. They must change their password on first login.
              </p>
              <button 
                type="button" 
                onClick={clearCreatedCreds} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Dismiss Credentials
              </button>
            </div>
          )}
          
          <div className="col-span-1 text-gray-600 text-xs mt-2">
            Tip: Use the "View Tourists" screen to issue a DID and anchor KYC after creating the tourist.
          </div>
        </form>
      </div>
    </div>
  );
}