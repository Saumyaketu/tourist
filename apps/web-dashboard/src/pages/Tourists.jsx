import React, { useEffect, useState } from "react";
import { getTourists, getTouristDetails } from "../api/client"; 
import { formatDate } from "../utils/formatters"; // Assuming you have this utility

// Utility function to format arrays for display (e.g., [a, b] -> "a, b")
const formatList = (arr) => Array.isArray(arr) ? arr.join(', ') : '—';

// Simple utility function to format the departure date for a cleaner look
const formatDepartureDate = (dateString) => {
    if (!dateString) return "—";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};

export default function Tourists() {
  const [tourists, setTourists] = useState([]);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // --- Data Loading Logic ---
  async function loadTourists() {
    setLoadingList(true);
    setError(null);
    try {
      const data = await getTourists();
      setTourists(data.items || []);
    } catch (e) {
      console.error("Failed to load tourists list:", e);
      setError(e.message);
    } finally { 
      setLoadingList(false);
    }
  }

  useEffect(() => { loadTourists(); }, []);

  async function selectTourist(id) {
    setLoadingDetails(true);
    setSelectedTourist(null);
    setError(null); 
    
    try {
      // getTouristDetails hits the Identity Service via proxy
      const { tourist } = await getTouristDetails(id); 
      setSelectedTourist(tourist);
    } catch (e) { 
      console.error("Failed to fetch tourist details:", e);
      setError(e.message); 
    } finally {
      setLoadingDetails(false);
    }
  }
  
  // Custom reusable classes (matching Agent Dashboard)
  const infoLabelClasses = "font-semibold text-gray-600 mr-2";

  const TouristListItem = ({ t }) => (
    <button 
      onClick={() => selectTourist(t.tourist_id)} 
      className={`
        w-full text-left p-3 rounded-lg transition-colors 
        ${selectedTourist && selectedTourist.tourist_id === t.tourist_id 
          ? 'bg-blue-100 font-bold text-blue-700' 
          : 'bg-gray-50 hover:bg-blue-50 text-gray-700'
        }
      `}
    >
      <strong>{t.full_name}</strong>
      <div className="text-xs text-gray-500">{t.tourist_id ? `ID: ${t.tourist_id.substring(0, 8)}...` : '—'}</div>
    </button>
  );

  return (
    // Mimics the Agent Dashboard's main container styling
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Tourist Registry</h2>

      {/* Main Split Pane Container (mimics ViewTouristIDs.jsx) */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 bg-white rounded-xl shadow-2xl">
        
        {/* Sidebar: Tourist List (Left Panel) */}
        <div className="w-full lg:w-96 p-6 border-b lg:border-r lg:border-b-0 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            All Tourists ({tourists.length})
          </h3>
          
          {loadingList && <div className="text-blue-600 font-medium p-3">Loading list...</div>}
          {error && <div className="text-red-600 p-3 bg-red-50 rounded-lg">Error: {error}</div>}

          <ul className="space-y-2 list-none p-0 overflow-y-auto max-h-[70vh]">
            {tourists.map(t => <li key={t.tourist_id}><TouristListItem t={t} /></li>)}
            {!loadingList && tourists.length === 0 && <div className="p-3 text-center text-gray-500">No registered tourists</div>}
          </ul>
        </div>

        {/* Main Content: Tourist Details (Right Panel) */}
        <div className="flex-1 p-6">
          {loadingDetails && <div className="text-center p-10 text-blue-600">Loading details...</div>}
          
          {!selectedTourist && !loadingDetails ? (
            <div className="flex flex-col items-center justify-center h-full min-h-60 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <h3 className="text-xl font-semibold">Select a tourist to view details</h3>
            </div>
          ) : (
            selectedTourist && (
              <div className="space-y-6">
                
                {/* Photo & Header */}
                <div className="flex items-center gap-4 border-b pb-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium border-4 border-gray-300">
                        {selectedTourist.photo ? 'Photo' : 'No Photo'} 
                    </div>
                    <h2 className="text-3xl font-extrabold text-indigo-600 m-0">
                        {selectedTourist.full_name}
                    </h2>
                </div>

                {/* Contact and Travel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm border-b pb-4">
                    <p><span className={infoLabelClasses}>Phone:</span> {selectedTourist.primary_phone}</p>
                    <p><span className={infoLabelClasses}>Email:</span> {selectedTourist.primary_email || '—'}</p>
                    <p><span className={infoLabelClasses}>Country:</span> {selectedTourist.country_of_origin || '—'}</p>
                    <p><span className={infoLabelClasses}>Arrival:</span> {formatDate(selectedTourist.arrival_date) || '—'}</p>
                    <p><span className={infoLabelClasses}>Departure:</span> {formatDepartureDate(selectedTourist.expected_departure_date) || '—'}</p>
                    <p><span className={infoLabelClasses}>Party size:</span> {selectedTourist.party_size || '—'}</p>
                    <p className="md:col-span-2"><span className={infoLabelClasses}>Accommodation:</span> {selectedTourist.current_accommodation ? `${selectedTourist.current_accommodation.name || ''}, ${selectedTourist.current_accommodation.address || ''}` : '—'}</p>
                </div>
                
                {/* Planned Itinerary */}
                <div className="pt-2 text-sm">
                    <p><span className={infoLabelClasses}>Planned Itinerary:</span> {formatList(selectedTourist.itinerary)}</p>
                </div>

                {/* Emergency Contact Block (Red box style) */}
                {selectedTourist.emergency_contact && (selectedTourist.emergency_contact.name || selectedTourist.emergency_contact.phone) && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-sm space-y-1">
                        <h4 className="font-semibold text-red-800 mb-2">Emergency Contact</h4>
                        <p><span className={infoLabelClasses}>Name:</span> {selectedTourist.emergency_contact.name || '—'}</p>
                        <p><span className={infoLabelClasses}>Phone:</span> {selectedTourist.emergency_contact.phone || '—'}</p>
                        <p><span className={infoLabelClasses}>Relation:</span> {selectedTourist.emergency_contact.relation || '—'}</p>
                    </div>
                )}

                {/* Other Info Section */}
                <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                    <p><span className={infoLabelClasses}>Travel companions:</span> {formatList(selectedTourist.travel_companions)}</p>
                    <p><span className={infoLabelClasses}>Languages:</span> {formatList(selectedTourist.language_preference)}</p>
                    <p><span className={infoLabelClasses}>Preferred contact:</span> {selectedTourist.preferred_contact_method || '—'}</p>
                    <p><span className={infoLabelClasses}>Allergies / Medical:</span> {selectedTourist.allergies_medical_conditions || '—'}</p>
                    <p><span className={infoLabelClasses}>Insurance:</span> {selectedTourist.insurance_policy || '—'}</p>
                    <p><span className={infoLabelClasses}>Wearable ID:</span> {selectedTourist.wearable_id || '—'}</p>
                </div>

                {/* Credential/KYC Status (Blue box style) */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
                    <p><span className={infoLabelClasses}>Blockchain DID:</span> <span className={`${selectedTourist.blockchain_id ? 'text-green-700 font-mono break-all' : 'text-red-500 italic'}`}>{selectedTourist.blockchain_id || 'not issued'}</span></p>
                    <p><span className={infoLabelClasses}>KYC Hash:</span> <span className="font-mono break-all">{selectedTourist.kyc_hash || '—'}</span></p>
                </div>

                {/* Consent Block (Green box style) */}
                <div className="mt-4 p-4 border border-green-300 rounded-lg bg-green-50 text-sm space-y-1">
                    <h4 className="font-semibold text-green-800">Consent Flags</h4>
                    <p><span className={infoLabelClasses}>Privacy acknowledged:</span> {selectedTourist.consent_flags?.consent_required ? '✅ Yes' : '❌ No'}</p>
                    <p><span className={infoLabelClasses}>Tracking opt-in:</span> {selectedTourist.consent_flags?.tracking_opt_in ? '✅ Yes' : '— No'}</p>
                    <p><span className={infoLabelClasses}>Share with police:</span> {selectedTourist.consent_flags?.share_with_police ? '✅ Yes' : '— No'}</p>
                    
                    {selectedTourist.consent_flags?.consent_ts && (
                        <p><span className={infoLabelClasses}>Consent timestamp (UTC):</span> {selectedTourist.consent_flags.consent_ts}</p>
                    )}
                    {selectedTourist.consent_flags?.policy_version && (
                        <p><span className={infoLabelClasses}>Policy version:</span> {selectedTourist.consent_flags.policy_version}</p>
                    )}
                    <p className="pt-2"><a href="#" className="text-blue-600 hover:text-blue-800 underline">View privacy policy</a></p>
                </div>
                
                {/* Notes (Yellow box style) */}
                {selectedTourist.notes && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <strong className="text-yellow-800">Notes (Agent Private):</strong>
                        <div className="mt-1 text-sm text-yellow-700">{selectedTourist.notes}</div>
                    </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}