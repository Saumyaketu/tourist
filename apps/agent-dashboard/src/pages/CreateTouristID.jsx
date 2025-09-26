// src/pages/CreateTouristID.jsx

import React, { useState } from 'react';
import { createTourist } from '../api/identityService';

// simple validators
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreateTouristID({ onCreated }) {
  const [form, setForm] = useState({
    full_name: '', primary_phone: '', primary_email: '', country_of_origin: '',
    arrival_date: '', expected_departure_date: '',
    accommodation_name: '', accommodation_address: '',
    party_size: '', travel_companions: '', language_preference: '',
    places_to_visit: '', 
    preferred_contact_method: '', allergies_medical_conditions: '',
    insurance_policy: '', wearable_id: '', photo: '', notes: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    consent_required: false, tracking_opt_in: false, share_with_police: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.full_name || form.full_name.trim().length < 2) errs.full_name = 'Please enter full name';
    // Phone validation is strict (E.164)
    if (!form.primary_phone || !phoneRegex.test(form.primary_phone)) errs.primary_phone = 'Enter a valid phone in E.164 (e.g. +919812345678)';
    // Email is optional, but if present must be valid
    if (form.primary_email && !emailRegex.test(form.primary_email)) errs.primary_email = 'Enter a valid email address';
    
    // Date validation
    if (form.arrival_date && form.expected_departure_date) {
      const a = new Date(form.arrival_date);
      const d = new Date(form.expected_departure_date);
      if (d < a) errs.expected_departure_date = 'Departure must be same or after arrival';
    }
    
    // Number validation improvement: ensure it's a positive integer if provided
    const partySizeValue = form.party_size;
    if (partySizeValue) {
      const partySizeNum = Number(partySizeValue);
      if (isNaN(partySizeNum) || !Number.isInteger(partySizeNum) || partySizeNum <= 0) {
        errs.party_size = 'Party size must be a whole number greater than 0';
      }
    }
    
    // Emergency phone validation
    if (form.emergency_contact_phone && !phoneRegex.test(form.emergency_contact_phone)) errs.emergency_contact_phone = 'Enter a valid emergency contact phone';
    
    // Required consent check
    if (!form.consent_required) errs.consent_required = 'You must agree to the privacy policy to continue';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    setToast(null);
    if (!validate()) {
      setToast({ type: 'error', text: 'Please fix highlighted fields' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        primary_phone: form.primary_phone,
        primary_email: form.primary_email || null,
        country_of_origin: form.country_of_origin || null,
        arrival_date: form.arrival_date || null,
        expected_departure_date: form.expected_departure_date || null,
        current_accommodation: form.accommodation_name ? { name: form.accommodation_name, address: form.accommodation_address } : null,
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
      setToast({ type: 'success', text: `Tourist created (id: ${res.tourist.tourist_id})` });
      // Reset form fields 
      setForm({
        full_name: '', primary_phone: '', primary_email: '', country_of_origin: '',
        arrival_date: '', expected_departure_date: '',
        accommodation_name: '', accommodation_address: '',
        party_size: '', travel_companions: '', language_preference: '',
        places_to_visit: '',
        preferred_contact_method: '', allergies_medical_conditions: '',
        insurance_policy: '', wearable_id: '', photo: '', notes: '',
        emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
        consent_required: false, tracking_opt_in: false, share_with_police: false
      });
      setErrors({});
      if (onCreated) onCreated(); // refresh listing if parent wants
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 5000);
    }
  }

  function resetForm() {
    setForm({
      full_name: '', primary_phone: '', primary_email: '', country_of_origin: '',
      arrival_date: '', expected_departure_date: '',
      accommodation_name: '', accommodation_address: '',
      party_size: '', travel_companions: '', language_preference: '',
      places_to_visit: '',
      preferred_contact_method: '', allergies_medical_conditions: '',
      insurance_policy: '', wearable_id: '', photo: '', notes: '',
      emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
      consent_required: false, tracking_opt_in: false, share_with_police: false
    });
    setErrors({});
    setToast(null);
  }
  
  /* --- Reusable Class Names for form elements --- */
  const inputClasses = "p-2.5 rounded-lg border border-gray-200 outline-none text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";
  const errorInputClasses = "border-red-500 ring-2 ring-red-100";
  const labelClasses = "text-sm text-gray-700 font-medium";
  const errorMsgClasses = "text-red-500 text-xs mt-1";
  const requiredStar = <span className="text-red-500">*</span>;
  
  return (
    <div className="p-6 flex justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden font-sans">
        <div className="p-5 sm:px-7 bg-gradient-to-r from-sky-500 to-indigo-500 text-white flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold m-0">Create Tourist ID</h3>
            <div className="text-sm opacity-95 m-0">Fast onboarding — keep privacy first. <span className="opacity-90">🔒</span></div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Full name {requiredStar}</label>
              <input className={`${inputClasses} ${errors.full_name ? errorInputClasses : ''}`} value={form.full_name} onChange={e=>update('full_name', e.target.value)} placeholder="e.g. Ramesh" />
              {errors.full_name && <div className={errorMsgClasses}>{errors.full_name}</div>}
            </div>

            {/* Primary Phone */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Primary phone {requiredStar}</label>
              <input className={`${inputClasses} ${errors.primary_phone ? errorInputClasses : ''}`} value={form.primary_phone} onChange={e=>update('primary_phone', e.target.value)} placeholder="+919812345678" />
              {errors.primary_phone && <div className={errorMsgClasses}>{errors.primary_phone}</div>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Email</label>
              <input className={`${inputClasses} ${errors.primary_email ? errorInputClasses : ''}`} value={form.primary_email} onChange={e=>update('primary_email', e.target.value)} placeholder="optional" />
              {errors.primary_email && <div className={errorMsgClasses}>{errors.primary_email}</div>}
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Country</label>
              <input className={inputClasses} value={form.country_of_origin} onChange={e=>update('country_of_origin', e.target.value)} placeholder="e.g. IN / US" />
            </div>

            {/* Arrival Date */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Arrival date</label>
              <input type="date" className={inputClasses} value={form.arrival_date} onChange={e=>update('arrival_date', e.target.value)} />
            </div>

            {/* Expected Departure */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Expected departure</label>
              <input type="date" className={`${inputClasses} ${errors.expected_departure_date ? errorInputClasses : ''}`} value={form.expected_departure_date} onChange={e=>update('expected_departure_date', e.target.value)} />
              {errors.expected_departure_date && <div className={errorMsgClasses}>{errors.expected_departure_date}</div>}
            </div>

            {/* Accommodation Name */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Accommodation name</label>
              <input className={inputClasses} value={form.accommodation_name} onChange={e=>update('accommodation_name', e.target.value)} placeholder="Hotel / Rental Name" />
            </div>

            {/* Accommodation Address */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Accommodation address</label>
              <input className={inputClasses} value={form.accommodation_address} onChange={e=>update('accommodation_address', e.target.value)} placeholder="Full address" />
            </div>
            
            {/* Planned Itinerary (Cities/Places) - NEW FIELD */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className={labelClasses}>Planned Itinerary (Cities/Places)</label>
              <input 
                className={inputClasses} 
                value={form.places_to_visit} 
                onChange={e=>update('places_to_visit', e.target.value)} 
                placeholder="Comma separated cities/places: e.g. Mumbai, Goa, Delhi"
              />
            </div>

            {/* Party Size */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Party size</label>
              <input type="number" min="1" className={`${inputClasses} ${errors.party_size ? errorInputClasses : ''}`} value={form.party_size} onChange={e=>update('party_size', e.target.value)} placeholder="e.g. 2" />
              {errors.party_size && <div className={errorMsgClasses}>{errors.party_size}</div>}
            </div>

            {/* Travel Companions */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Travel companions</label>
              <input className={inputClasses} value={form.travel_companions} onChange={e=>update('travel_companions', e.target.value)} placeholder="Comma separated names" />
            </div>

            {/* Languages */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Languages</label>
              <input className={inputClasses} value={form.language_preference} onChange={e=>update('language_preference', e.target.value)} placeholder="e.g. Hindi, English" />
            </div>

            {/* Preferred Contact Method */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Preferred contact method</label>
              <input className={inputClasses} value={form.preferred_contact_method} onChange={e=>update('preferred_contact_method', e.target.value)} placeholder="sms / call / whatsapp" />
            </div>

            {/* Allergies / Medical */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Allergies / Medical</label>
              <input className={inputClasses} value={form.allergies_medical_conditions} onChange={e=>update('allergies_medical_conditions', e.target.value)} placeholder="Any essential info" />
            </div>

            {/* Insurance */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Insurance</label>
              <input className={inputClasses} value={form.insurance_policy} onChange={e=>update('insurance_policy', e.target.value)} placeholder="Insurer - policy no." />
            </div>

            {/* Wearable ID */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Wearable ID</label>
              <input className={inputClasses} value={form.wearable_id} onChange={e=>update('wearable_id', e.target.value)} placeholder="e.g. Bracelet ID" />
            </div>

            {/* Photo URL */}
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Photo URL</label>
              <input className={inputClasses} value={form.photo} onChange={e=>update('photo', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          {/* Emergency block full width */}
          <fieldset className="p-4 rounded-xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <legend className="px-2 font-bold text-lg text-indigo-700">Emergency Contact</legend>
            
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Name</label>
              <input className={inputClasses} value={form.emergency_contact_name} onChange={e=>update('emergency_contact_name', e.target.value)} placeholder="Contact Name" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className={labelClasses}>Phone</label>
              <input className={`${inputClasses} ${errors.emergency_contact_phone ? errorInputClasses : ''}`} value={form.emergency_contact_phone} onChange={e=>update('emergency_contact_phone', e.target.value)} placeholder="+9198..." />
              {errors.emergency_contact_phone && <div className={errorMsgClasses}>{errors.emergency_contact_phone}</div>}
            </div>
            
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className={labelClasses}>Relation</label>
              <input className={inputClasses} value={form.emergency_contact_relation} onChange={e=>update('emergency_contact_relation', e.target.value)} placeholder="e.g. Spouse / Parent" />
            </div>
          </fieldset>

          {/* Notes section (full width) */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClasses}>Notes (Private)</label>
            <textarea 
              className={`${inputClasses} h-24 resize-y`} 
              value={form.notes} 
              onChange={e=>update('notes', e.target.value)} 
              placeholder="Any internal notes or special instructions regarding this tourist..." 
            />
          </div>


          {/* Consent section and Actions */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-end justify-between pt-2">
            {/* Consent */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={form.consent_required} onChange={e=>update('consent_required', e.target.checked)} />
                <span>I consent to the collection and processing of my personal data. {requiredStar}</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={form.tracking_opt_in} onChange={e=>update('tracking_opt_in', e.target.checked)} />
                <span>Opt-in: allow optional real-time tracking</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked={form.share_with_police} onChange={e=>update('share_with_police', e.target.checked)} />
                <span>Allow sharing limited data with police in emergencies</span>
              </label>
              {errors.consent_required && <div className={errorMsgClasses}>{errors.consent_required}</div>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 items-center w-full md:w-auto">
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex-grow md:flex-grow-0">
                Reset
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-grow md:flex-grow-0">
                {loading ? 'Creating…' : 'Create Tourist ID ✨'}
              </button>
            </div>
            
          </div>

          {/* small note */}
          <div className="col-span-1 text-gray-600 text-xs mt-2">
            Tip: Use the "View Tourists" screen to issue a DID and anchor KYC after creating the tourist.
          </div>
        </form>
      </div>
    </div>
  );
}