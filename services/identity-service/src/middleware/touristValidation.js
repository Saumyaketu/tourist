const { checkSchema, validationResult } = require('express-validator');

const touristSchema = {
  full_name: {
    in: ['body'],
    exists: { errorMessage: 'full_name is required' },
    isLength: { options: { min: 2 }, errorMessage: 'full_name must be at least 2 characters' },
    trim: true
  },
  primary_phone: {
    in: ['body'],
    exists: { errorMessage: 'primary_phone is required' },
    matches: {
      options: [/^\+?[1-9]\d{1,14}$/],
      errorMessage: 'primary_phone must be in E.164 format (e.g. +919812345678)'
    }
  },
  primary_email: {
    in: ['body'],
    optional: true,
    isEmail: { errorMessage: 'primary_email must be a valid email' },
    trim: true
  },
  arrival_date: {
    in: ['body'],
    optional: true,
    isISO8601: { errorMessage: 'arrival_date must be a valid date' },
    toDate: true
  },
  expected_departure_date: {
    in: ['body'],
    optional: true,
    isISO8601: { errorMessage: 'expected_departure_date must be a valid date' },
    toDate: true,
    custom: {
      options: (value, { req }) => {
        if (!value || !req.body.arrival_date) return true;
        const arrival = new Date(req.body.arrival_date);
        const dep = new Date(value);
        return dep >= arrival;
      },
      errorMessage: 'expected_departure_date must be the same or after arrival_date'
    }
  },
  itinerary: { 
    in: ['body'],
    optional: true,
    isArray: { errorMessage: 'itinerary must be an array of strings' }
  },
  party_size: {
    in: ['body'],
    optional: true,
    isInt: { options: { min: 1 }, errorMessage: 'party_size must be an integer >= 1' },
    toInt: true
  },
  emergency_contact: {
    in: ['body'],
    optional: true,
    isObject: { errorMessage: 'emergency_contact must be an object' }
  },
  'emergency_contact.phone': {
    in: ['body'],
    optional: true,
    matches: {
      options: [/^\+?[1-9]\d{1,14}$/],
      errorMessage: 'emergency_contact.phone must be a valid phone in E.164 format'
    }
  },
  'consent_flags.consent_required': {
    in: ['body'],
    exists: { errorMessage: 'consent_required must be provided' },
    isBoolean: { errorMessage: 'consent_required must be boolean' },
    toBoolean: true
  },
  'consent_flags.tracking_opt_in': {
    in: ['body'],
    optional: true,
    isBoolean: { errorMessage: 'tracking_opt_in must be boolean' },
    toBoolean: true
  },
  'consent_flags.share_with_police': {
    in: ['body'],
    optional: true,
    isBoolean: { errorMessage: 'share_with_police must be boolean' },
    toBoolean: true
  }
};

const validateTourist = [
  checkSchema(touristSchema),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateTourist };