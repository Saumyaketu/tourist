// src/pages/ViewTouristIDs.jsx

import React, { useEffect, useState } from 'react';
import { listTourists, getTourist, issueCredential } from '../api/identityService';

export default function ViewTouristIDs() {
  const [tourists, setTourists] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [issueResult, setIssueResult] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listTourists();
      setTourists(data.items || []);
    } catch (e) {
      // Log error but keep existing error state logic
      console.error("Failed to load tourists:", e);
      setError(e.message);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  async function select(id) {
    setError(null);
    setIssueResult(null);
    try {
      const { tourist } = await getTourist(id);
      setSelected(tourist);
    } catch (e) { 
      console.error("Failed to fetch tourist details:", e);
      setError(e.message); 
    }
  }

  async function handleIssue(id) {
    setError(null);
    setIssueResult(null);
    try {
      const res = await issueCredential(id);
      setIssueResult(res);
      // Refresh list and selected tourist details after successful issue
      await load();
      await select(id);
    } catch (e) { 
      console.error("Failed to issue credential:", e);
      setError(e.message); 
    }
  }

  const policyUrl = import.meta.env.VITE_PRIVACY_POLICY_URL;

  // Custom reusable classes
  const infoLabelClasses = "font-semibold text-gray-600 mr-2";

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 bg-white rounded-xl shadow-2xl">
        
        {/* Sidebar: Tourist List */}
        <div className="w-full lg:w-96 p-6 border-b lg:border-r lg:border-b-0 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tourist IDs</h2>
          
          {loading && <div className="text-blue-600 font-medium">Loading list...</div>}
          {error && <div className="text-red-600 p-2 bg-red-50 rounded-lg">Error: {error}</div>}
          
          <ul className="space-y-2 list-none p-0">
            {tourists.map(t => (
              <li key={t.tourist_id}>
                <button 
                  onClick={()=>select(t.tourist_id)} 
                  className={`
                    w-full text-left p-3 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors 
                    ${selected && selected.tourist_id === t.tourist_id ? 'bg-blue-100 font-bold text-blue-700' : 'bg-gray-50'}
                  `}
                >
                  <strong>{t.full_name}</strong>
                  <div className="text-xs text-gray-500">{t.primary_phone}</div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content: Tourist Details */}
        <div className="flex-1 p-6">
          {selected ? (
            <div className="space-y-4">

              {/* Photo & Header */}
              <div className="flex items-center gap-4 border-b pb-4 mb-4">
                {selected.photo ? (
                    <img 
                        src={selected.photo} 
                        alt={`Photo of ${selected.full_name}`} 
                        className="w-20 h-20 rounded-full object-cover border-4 border-indigo-200 shadow-md"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium border-4 border-gray-300">
                        No Photo
                    </div>
                )}
                <h2 className="text-3xl font-extrabold text-indigo-600 m-0">
                  {selected.full_name}
                </h2>
              </div>


              {/* Contact and Travel Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <p><span className={infoLabelClasses}>Phone:</span> {selected.primary_phone}</p>
                <p><span className={infoLabelClasses}>Email:</span> {selected.primary_email || '—'}</p>
                <p><span className={infoLabelClasses}>Country:</span> {selected.country_of_origin || '—'}</p>
                <p><span className={infoLabelClasses}>Arrival:</span> {selected.arrival_date || '—'}</p>
                <p><span className={infoLabelClasses}>Departure:</span> {selected.expected_departure_date || '—'}</p>
                <p><span className={infoLabelClasses}>Party size:</span> {selected.party_size || '—'}</p>
                <p className="md:col-span-2"><span className={infoLabelClasses}>Accommodation:</span> {selected.current_accommodation ? `${selected.current_accommodation.name || ''}, ${selected.current_accommodation.address || ''}` : '—'}</p>
              </div>
              
              {/* Planned Itinerary */}
              <div className="pt-2 border-t border-gray-100 text-sm">
                <p><span className={infoLabelClasses}>Planned Itinerary:</span> {(selected.itinerary || []).join(', ') || '—'}</p>
              </div>

              {/* Emergency Contact Block */}
              {selected.emergency_contact && (selected.emergency_contact.name || selected.emergency_contact.phone) && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-sm space-y-1">
                      <h4 className="font-semibold text-red-800 mb-2">Emergency Contact</h4>
                      <p><span className={infoLabelClasses}>Name:</span> {selected.emergency_contact.name || '—'}</p>
                      <p><span className={infoLabelClasses}>Phone:</span> {selected.emergency_contact.phone || '—'}</p>
                      <p><span className={infoLabelClasses}>Relation:</span> {selected.emergency_contact.relation || '—'}</p>
                  </div>
              )}

              {/* Other Info Section */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                <p><span className={infoLabelClasses}>Travel companions:</span> {(selected.travel_companions || []).join(', ') || '—'}</p>
                <p><span className={infoLabelClasses}>Languages:</span> {(selected.language_preference || []).join(', ') || '—'}</p>
                <p><span className={infoLabelClasses}>Preferred contact:</span> {selected.preferred_contact_method || '—'}</p>
                <p><span className={infoLabelClasses}>Allergies / Medical:</span> {selected.allergies_medical_conditions || '—'}</p>
                <p><span className={infoLabelClasses}>Insurance:</span> {selected.insurance_policy || '—'}</p>
                <p><span className={infoLabelClasses}>Wearable ID:</span> {selected.wearable_id || '—'}</p>
              </div>

              {/* Credential/KYC Status */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
                <p><span className={infoLabelClasses}>Blockchain DID:</span> <span className={`${selected.blockchain_id ? 'text-green-700 font-mono break-all' : 'text-red-500 italic'}`}>{selected.blockchain_id || 'not issued'}</span></p>
                <p><span className={infoLabelClasses}>KYC Hash:</span> <span className="font-mono break-all">{selected.kyc_hash || '—'}</span></p>
              </div>

              {/* Issue Button */}
              <div className="mt-4">
                <button 
                  onClick={()=>handleIssue(selected.tourist_id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                >
                  Issue DID / Anchor KYC
                </button>
              </div>

              {/* Issue Result */}
              {issueResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm border border-gray-300">
                  <h4 className="font-semibold text-gray-800 mb-2">Issue Result</h4>
                  <pre className="whitespace-pre-wrap text-xs bg-white p-3 rounded-md overflow-auto border">
                    {JSON.stringify(issueResult, null, 2)}
                  </pre>
                </div>
              )}

              {/* Consent Block */}
              <div className="mt-4 p-4 border border-green-300 rounded-lg bg-green-50 text-sm space-y-1">
                <h4 className="font-semibold text-green-800">Consent Flags</h4>
                <p><span className={infoLabelClasses}>Privacy acknowledged:</span> {selected.consent_flags && selected.consent_flags.consent_required ? '✅ Yes' : '❌ No'}</p>
                <p><span className={infoLabelClasses}>Tracking opt-in:</span> {selected.consent_flags && selected.consent_flags.tracking_opt_in ? '✅ Yes' : '— No'}</p>
                <p><span className={infoLabelClasses}>Share with police:</span> {selected.consent_flags && selected.consent_flags.share_with_police ? '✅ Yes' : '— No'}</p>
                
                {selected.consent_flags?.consent_ts && (
                  <p><span className={infoLabelClasses}>Consent timestamp (UTC):</span> {selected.consent_flags.consent_ts}</p>
                )}
                {selected.consent_flags?.policy_version && (
                  <p><span className={infoLabelClasses}>Policy version:</span> {selected.consent_flags.policy_version}</p>
                )}
                {policyUrl && (
                  <p className="pt-2"><a href={policyUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 underline">View privacy policy</a></p>
                )}
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <strong className="text-yellow-800">Notes (Agent Private):</strong>
                  <div className="mt-1 text-sm text-yellow-700">{selected.notes}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-60 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <h3 className="text-xl font-semibold">Select a tourist to view details</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}