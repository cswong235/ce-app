/**
 * Google Apps Script for Google Form submission bridge
 * 
 * This script listens for Google Form submissions and sends the response data
 * to the Laravel app's class registration import endpoint.
 * 
 * SETUP:
 * 1. Open the Google Form connected to your Google Sheet
 * 2. Click Tools > Script editor
 * 3. Replace the default code with this file
 * 4. Update the configuration constants below (APP_URL, CLASS_ID, WEBHOOK_SECRET)
 * 5. Set a trigger: onFormSubmit (automatic on form submission)
 * 6. Save and test
 */

// ============================================================================
// CONFIGURATION - Update these values for your setup
// ============================================================================

/**
 * The base URL of your Laravel application (without trailing slash)
 * Example: https://myapp.com or http://localhost:8000
 */
const APP_URL = 'https://your-app-url.com';

/**
 * The class ID this form is registering students for
 * This should match a class_id in your classes table
 */
const CLASS_ID = 1;

/**
 * Optional: Secret header for webhook verification
 * Set this in your Laravel .env as GOOGLE_FORM_WEBHOOK_SECRET
 * Leave empty if you don't want to use secret-based authentication
 */
const WEBHOOK_SECRET = '';

/**
 * The exact field names from your Google Form (case-sensitive)
 * Map them to the payload keys sent to Laravel
 * 
 * Example form field structure:
 * - "Full Name" (text field) -> form_name
 * - "Email" (email field) -> form_email
 * - "Phone Number" (text field) -> form_phone
 * - Additional custom fields go into form_answers
 */
const FIELD_MAPPING = {
  'Full Name': 'form_name',
  'Email': 'form_email',
  'Phone Number': 'form_phone',
  // Add more standard fields as needed
};

/**
 * List of fields that should go into the form_answers JSON object
 * Any field not in FIELD_MAPPING will be included here if listed
 */
const CUSTOM_FIELDS = [
  // Example:
  // 'School Name',
  // 'Course Interest',
  // 'Year of Study',
];

// ============================================================================
// CORE FUNCTIONS - Do not modify unless you know what you're doing
// ============================================================================

/**
 * Trigger function: called automatically when a form is submitted
 * This is set up via the Triggers menu in the Apps Script editor
 */
function onFormSubmit(e) {
  try {
    Logger.log('Form submission detected');
    
    const response = e.response;
    const itemResponses = response.getItemResponses();
    
    // Build the payload from form responses
    const payload = buildPayload(itemResponses);
    
    // Send to Laravel
    const success = sendToLaravel(payload);
    
    if (success) {
      Logger.log('Successfully sent registration to Laravel');
      logSuccess(response);
    } else {
      Logger.log('Failed to send registration to Laravel');
      logFailure(response, 'Failed to post to Laravel');
    }
  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
    logFailure(e.response, error.toString());
  }
}

/**
 * Build the payload structure from Google Form responses
 * Returns an object with the expected Laravel fields
 */
function buildPayload(itemResponses) {
  const payload = {
    class_id: CLASS_ID,
    form_name: '',
    form_email: '',
    form_phone: null,
    form_answers: {},
  };
  
  // Process each form response
  itemResponses.forEach(function(itemResponse) {
    const question = itemResponse.getItem().getTitle();
    const answer = itemResponse.getResponse();
    
    // Map standard fields
    if (FIELD_MAPPING[question]) {
      const fieldKey = FIELD_MAPPING[question];
      payload[fieldKey] = answer || '';
    }
    // Add custom fields to form_answers
    else if (CUSTOM_FIELDS.includes(question)) {
      payload.form_answers[question] = answer || '';
    }
    // Optionally include all other fields in form_answers for debugging
    else {
      payload.form_answers[question] = answer || '';
    }
  });
  
  Logger.log('Payload constructed: ' + JSON.stringify(payload));
  return payload;
}

/**
 * Send the payload to the Laravel endpoint
 * Returns true if successful, false otherwise
 */
function sendToLaravel(payload) {
  const endpoint = APP_URL + '/class-registration/import';
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  
  // Add secret header if configured
  if (WEBHOOK_SECRET) {
    options.headers = {
      'X-Apps-Script-Secret': WEBHOOK_SECRET,
    };
  }
  
  try {
    Logger.log('Sending POST request to: ' + endpoint);
    const response = UrlFetchApp.fetch(endpoint, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    
    Logger.log('Response code: ' + responseCode);
    Logger.log('Response body: ' + responseBody);
    
    return responseCode >= 200 && responseCode < 300;
  } catch (error) {
    Logger.log('Network error sending to Laravel: ' + error.toString());
    return false;
  }
}

/**
 * Log successful submissions to a sheet for debugging
 */
function logSuccess(response) {
  const sheet = getOrCreateLogSheet();
  const timestamp = new Date();
  sheet.appendRow([
    timestamp,
    'SUCCESS',
    response.getSubmitTime(),
    'Sent to Laravel',
  ]);
}

/**
 * Log failed submissions to a sheet for debugging
 */
function logFailure(response, errorMessage) {
  const sheet = getOrCreateLogSheet();
  const timestamp = new Date();
  sheet.appendRow([
    timestamp,
    'FAILURE',
    response ? response.getSubmitTime() : 'Unknown',
    errorMessage || 'Unknown error',
  ]);
}

/**
 * Get or create a "Logs" sheet for debugging
 */
function getOrCreateLogSheet() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName('Logs');
  
  if (!sheet) {
    sheet = ss.insertSheet('Logs', ss.getSheets().length);
    sheet.appendRow(['Timestamp', 'Status', 'Form Submit Time', 'Details']);
  }
  
  return sheet;
}

// ============================================================================
// TESTING & UTILITIES
// ============================================================================

/**
 * Test function: simulates a form submission for debugging
 * Run this from the Apps Script editor to test your configuration
 */
function testFormSubmission() {
  Logger.log('Testing form submission with config:');
  Logger.log('App URL: ' + APP_URL);
  Logger.log('Class ID: ' + CLASS_ID);
  Logger.log('Webhook Secret: ' + (WEBHOOK_SECRET ? '***' : 'Not configured'));
  Logger.log('Field Mapping: ' + JSON.stringify(FIELD_MAPPING));
  
  const testPayload = {
    class_id: CLASS_ID,
    form_name: 'Test Student',
    form_email: 'test@example.com',
    form_phone: '+60123456789',
    form_answers: {
      'School Name': 'Test School',
      'Course Interest': 'Digital Marketing',
    },
  };
  
  Logger.log('Test payload: ' + JSON.stringify(testPayload));
  const success = sendToLaravel(testPayload);
  Logger.log('Test result: ' + (success ? 'SUCCESS' : 'FAILED'));
}

/**
 * Debug function: check all form field names
 * Run this to see the exact field names in your form
 */
function debugFormFields() {
  const form = FormApp.getActiveForm();
  const items = form.getItems();
  
  Logger.log('Form has ' + items.length + ' fields:');
  items.forEach(function(item, index) {
    Logger.log((index + 1) + '. "' + item.getTitle() + '"');
  });
}

/**
 * Debug function: clear the logs sheet
 */
function clearLogs() {
  const sheet = getOrCreateLogSheet();
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  range.clearContent();
  Logger.log('Logs cleared');
}
