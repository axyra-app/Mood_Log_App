// Increment this value whenever the adult eligibility statement changes materially.
// The accepted text and verification method still require legal review before launch.
export const ADULT_ELIGIBILITY_VERSION = 'co-18plus-v1';

// These identifiers are technical placeholders until Colombian counsel approves the texts.
// Increment each independently when its corresponding document changes materially.
export const TERMS_VERSION = 'co-terms-draft-v2-sensitive-data';
export const PRIVACY_NOTICE_VERSION = 'co-privacy-draft-v4-groq-retention';

// The disclosure covers sensitive content, public retention limits and unverified ZDR/location settings.
export const AI_CONSENT_VERSION = 'co-ai-groq-v3-retention-and-location';

// Bump when the scope or explanation of optional Firebase Analytics collection changes materially.
export const ANALYTICS_CONSENT_VERSION = 'co-analytics-v1';

// Separate optional authorization for saving mood and journal records.
// This draft identifier must be paired with counsel-approved copy before launch.
export const SENSITIVE_SELF_REPORT_CONSENT_VERSION = 'co-sensitive-selfreport-draft-v1';
