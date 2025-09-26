const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const issuer = require('../services/issuerService');

const COLLECTION = 'tourists';

// Helper to send a development-friendly error response but keep production safe.

function handleError(res, err) {
  console.error('Controller error:', err && err.stack ? err.stack : err);
  const safeBody = { error: (err && err.message) ? err.message : 'internal error' };
  if (process.env.NODE_ENV !== 'production') {
    safeBody.stack = err && err.stack ? err.stack : null;
  }
  // 500 status
  return res.status(500).json(safeBody);
}

async function registerTourist(req, res) {
  try {
    const payload = req.body || {};
    console.log('registerTourist called, payload keys:', Object.keys(payload || {}));

    // normalize arrays and fields
    // Removed redundant itinerary normalization. Payload.itinerary is now a clean array/null from frontend.
    const transport_modes = Array.isArray(payload.transport_modes) ? payload.transport_modes : (payload.transport_modes ? [payload.transport_modes] : []);
    const travel_companions = Array.isArray(payload.travel_companions) ? payload.travel_companions : (payload.travel_companions ? payload.travel_companions.split(',').map(s=>s.trim()).filter(Boolean) : []);
    const language_preference = Array.isArray(payload.language_preference) ? payload.language_preference : (payload.language_preference ? payload.language_preference.split(',').map(s=>s.trim()).filter(Boolean) : []);

    // Build consent flags (server records timestamp & policy version)
    const providedConsent = (payload.consent_flags && payload.consent_flags.consent_required) ? true : false;
    const consent_flags = {
      consent_required: !!(payload.consent_flags && payload.consent_flags.consent_required),
      tracking_opt_in: !!(payload.consent_flags && payload.consent_flags.tracking_opt_in),
      share_with_police: !!(payload.consent_flags && payload.consent_flags.share_with_police),
      consent_ts: providedConsent ? new Date().toISOString() : null,
      policy_version: process.env.PRIVACY_POLICY_VERSION || '1.0'
    };

    const tourist = {
      tourist_id: uuidv4(),
      full_name: payload.full_name,
      primary_phone: payload.primary_phone,
      primary_email: payload.primary_email || null,
      national_id_type: payload.national_id_type || null,
      national_id_hash: payload.national_id_hash || null,
      country_of_origin: payload.country_of_origin || null,
      arrival_date: payload.arrival_date || null,
      expected_departure_date: payload.expected_departure_date || null,
      current_accommodation: payload.current_accommodation || null,
      itinerary: payload.itinerary || [], 
      transport_modes,
      party_size: payload.party_size ? Number(payload.party_size) : null,
      travel_companions,
      tourist_safety_score: null,
      risk_flags: payload.risk_flags || [],
      allergies_medical_conditions: payload.allergies_medical_conditions || null,
      language_preference,
      preferred_contact_method: payload.preferred_contact_method || null,
      KYC_documents: payload.KYC_documents || [],
      blockchain_id: payload.blockchain_id || null,
      wearable_id: payload.wearable_id || null,
      last_known_location: payload.last_known_location || null,
      location_history: [],
      alert_history: [],
      incident_reports: [],
      insurance_policy: payload.insurance_policy || null,
      photo: payload.photo || null,
      notes: payload.notes || null,
      emergency_contact: payload.emergency_contact || null,
      consent_flags,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Attempt DB insert
    const col = await db.getCollection(COLLECTION);
    if (!col) {
      throw new Error('DB collection unavailable - check Mongo connection (MONGO_URI/MONGO_DB).');
    }
    const r = await col.insertOne(tourist);
    console.log('Inserted tourist _id:', r.insertedId);

    // Return created tourist (omit internal DB fields if you wish)
    return res.status(201).json({ tourist });
  } catch (e) {
    return handleError(res, e);
  }
}

async function listTourists(req, res) {
  try {
    const col = await db.getCollection(COLLECTION);
    const items = await col.find({}).toArray();
    res.json({ items });
  } catch (e) {
    return handleError(res, e);
  }
}

async function getTourist(req, res) {
  try {
    const id = req.params.id;
    const col = await db.getCollection(COLLECTION);
    const t = await col.findOne({ tourist_id: id });
    if (!t) return res.status(404).json({ error: 'not found' });
    res.json({ tourist: t });
  } catch (e) {
    return handleError(res, e);
  }
}

async function issueCredential(req, res) {
  try {
    const id = req.params.id;
    const col = await db.getCollection(COLLECTION);
    const t = await col.findOne({ tourist_id: id });
    if (!t) return res.status(404).json({ error: 'not found' });

    const { did, kycHash, anchor, vc } = await issuer.issueTouristCredential(t);

    const update = {
      blockchain_id: did,
      kyc_hash: kycHash,
      kyc_anchor: anchor,
      updated_at: new Date()
    };
    await col.updateOne({ tourist_id: id }, { $set: update });

    res.json({ ok: true, did, kycHash, anchor, vc });
  } catch (e) {
    return handleError(res, e);
  }
}

module.exports = { registerTourist, listTourists, getTourist, issueCredential };