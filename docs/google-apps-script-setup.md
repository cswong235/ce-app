# Google Apps Script Setup Guide

## Overview

This guide walks you through setting up Google Apps Script to automatically submit Google Form responses to your Laravel class registration endpoint.

---

## Prerequisites

- A Google Form created and connected to a Google Sheet
- Access to the Google Apps Script editor
- Your Laravel app's URL (e.g., `https://myapp.com`)
- Optional: a secret key for webhook security (stored in `.env`)

---

## Step 1: Identify Your Google Form Field Names

Before writing the script, you need to know the exact field names from your Google Form.

### Method 1: Manual inspection

1. Open your Google Form
2. Look at each question title — these are your field names
3. Note them exactly as they appear (case-sensitive)

Example:
- "Full Name"
- "Email"
- "Phone Number"

### Method 2: Use the debug function

1. Open your Google Sheet
2. Go to **Tools > Script editor**
3. Paste the Apps Script template
4. Run the `debugFormFields()` function (click the play button)
5. Check **View > Logs** to see all field names

---

## Step 2: Create a New Google Sheet (Optional)

If you haven't already:

1. Create a Google Sheet
2. Go to **Tools > Create a form**
3. Design your form with questions that map to:
   - `Full Name` (required for `form_name`)
   - `Email` (required for `form_email`)
   - `Phone Number` (optional for `form_phone`)
   - Any custom fields for `form_answers`

---

## Step 3: Set Up the Google Apps Script

### 3.1 Open the Apps Script Editor

1. Go to your Google Sheet
2. Click **Tools > Script editor**
3. Delete the default `myFunction()` placeholder code
4. Paste the entire content of `google-apps-script-template.gs`

### 3.2 Update the Configuration

At the top of the script, update these constants:

```javascript
const APP_URL = 'https://your-app-url.com';  // Change to your Laravel URL
const CLASS_ID = 1;                           // Change to the class ID this form registers for
const WEBHOOK_SECRET = '';                    // Optional: add your secret from .env
```

### 3.3 Update Field Mapping

Map your Google Form field names to the payload keys:

```javascript
const FIELD_MAPPING = {
  'Full Name': 'form_name',           // Match your actual form field name
  'Email': 'form_email',              // Match your actual form field name
  'Phone Number': 'form_phone',       // Match your actual form field name
};
```

If your form has different field names (e.g., "Student Name" instead of "Full Name"), update them to match exactly.

### 3.4 Optional: Add Custom Fields

Any fields not in `FIELD_MAPPING` will automatically go into `form_answers`. To explicitly include custom fields:

```javascript
const CUSTOM_FIELDS = [
  'School Name',
  'Course Interest',
  'Year of Study',
];
```

### 3.5 Save the Script

Click **File > Save** or press `Ctrl+S`.

---

## Step 4: Create the onFormSubmit Trigger

The script needs to know when a form is submitted. Set up a trigger:

1. In the Apps Script editor, go to **Triggers** (clock icon on the left)
2. Click **Create new trigger** (bottom right)
3. Configure:
   - **Which function to run**: `onFormSubmit`
   - **Which deployment should run**: `Head`
   - **Select event source**: `From form`
   - **Select event type**: `On form submit`
4. Click **Create**
5. Grant permissions when prompted

---

## Step 5: Test the Script

### Option 1: Test with a mock submission

1. In the Apps Script editor, find the `testFormSubmission()` function
2. Click the play button (or select it from the dropdown and press Ctrl+Enter)
3. Go to **View > Logs** to see the output

Expected output:
```
Testing form submission with config:
App URL: https://your-app-url.com
Class ID: 1
Webhook Secret: Not configured (or ***)
Field Mapping: {...}
Test payload: {...}
Test result: SUCCESS
```

### Option 2: Submit an actual form

1. Go back to your Google Form
2. Click the preview button (eye icon)
3. Fill out the form with test data
4. Submit it
5. Return to the Apps Script editor and check **View > Logs**

Expected log:
```
Form submission detected
Payload constructed: {...}
Sending POST request to: https://your-app-url.com/class-registration/import
Response code: 201
Response body: {"success":true,"registration_id":42,"status":"pending"}
Successfully sent registration to Laravel
```

---

## Step 6: Monitor Submissions

### View Logs in Apps Script

1. Go to **View > Logs** to see recent function executions
2. Look for success or failure messages

### View a Logs Sheet

The script automatically creates a "Logs" sheet in your Google Sheet. This sheet records:
- Timestamp of the attempt
- Status (SUCCESS or FAILURE)
- Form submission time
- Details (error message if any)

To clear logs, run:
```javascript
clearLogs()
```

---

## Step 7: Verify in Laravel

Check your Laravel app's `class_registrations` table:

```bash
php artisan tinker
>>> ClassRegistration::latest()->get();
```

You should see pending registrations for your class.

---

## Troubleshooting

### "Response code: 403"
- Your `WEBHOOK_SECRET` in the script doesn't match `GOOGLE_FORM_WEBHOOK_SECRET` in your `.env`
- Solution: Make sure both values are identical

### "Response code: 422" or validation errors
- A required field is missing or empty
- Check that `form_name`, `form_email` are being captured
- Verify field names match exactly (case-sensitive)
- Run `debugFormFields()` to see what the form actually sends

### "Network error" or "Response code: 0"
- Your `APP_URL` is incorrect or unreachable
- The Laravel app is offline or not accessible
- Check that you're using the full URL with `https://` or `http://`

### No logs appearing
- The trigger may not be set up
- Go to **Triggers** and verify `onFormSubmit` is listed
- Check that the trigger is for "On form submit" (not "On open" or "On change")

### Script runs but nothing happens
- Check **View > Logs** for error messages
- Run `testFormSubmission()` to verify the configuration
- Run `debugFormFields()` to see the exact field names

---

## Advanced: Environment-Specific Configuration

If you have multiple forms or environments, you can adapt the script:

```javascript
// Use different URLs or secrets per environment
const ENVIRONMENT = 'production'; // or 'staging', 'test'

const CONFIGS = {
  'production': {
    APP_URL: 'https://myapp.com',
    WEBHOOK_SECRET: 'prod-secret-key',
  },
  'staging': {
    APP_URL: 'https://staging.myapp.com',
    WEBHOOK_SECRET: 'staging-secret-key',
  },
};

const CONFIG = CONFIGS[ENVIRONMENT];
const APP_URL = CONFIG.APP_URL;
const WEBHOOK_SECRET = CONFIG.WEBHOOK_SECRET;
```

---

## Next Steps

Once submissions are flowing into your Laravel app:

1. **Review Submissions**: Build a UI in your Laravel app to view pending registrations
2. **Approve/Reject**: Implement committee review workflow
3. **Convert to Enrollments**: Move approved registrations to `class_enrollments`
4. **Student Notifications**: Send confirmation emails after approval

---

## Support & Debugging

If you encounter issues:

1. **Check the Logs sheet** in your Google Sheet
2. **Check Apps Script logs**: View > Logs
3. **Test the endpoint manually** using curl or Postman:

```bash
curl -X POST https://your-app-url.com/class-registration/import \
  -H "Content-Type: application/json" \
  -H "X-Apps-Script-Secret: your-secret" \
  -d '{
    "class_id": 1,
    "form_name": "Test User",
    "form_email": "test@example.com",
    "form_phone": "+60123456789",
    "form_answers": {}
  }'
```

Expected response:
```json
{
  "success": true,
  "registration_id": 1,
  "status": "pending"
}
```

---

## Payload Reference

The script sends this structure to `/class-registration/import`:

```json
{
  "class_id": 1,
  "form_name": "Student Name",
  "form_email": "student@example.com",
  "form_phone": "+60123456789",
  "form_answers": {
    "School Name": "ABC College",
    "Course Interest": "Digital Marketing",
    "Any other field": "value"
  }
}
```

Laravel will validate and store it in the `class_registrations` table with `status = 'pending'`.
