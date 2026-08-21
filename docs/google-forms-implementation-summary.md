# Google Forms Integration - Implementation Summary

## Overview

The class registration system is now fully wired to accept Google Form submissions through Google Apps Script. Students submit forms, responses are automatically sent to Laravel, committee members review and approve/reject them, and approved registrations can be converted to class enrollments.

---

## Architecture

```
Google Form (external)
    ↓ (form submit event)
Google Apps Script
    ↓ (POST JSON payload)
Laravel /class-registration/import endpoint
    ↓ (validates & stores)
class_registrations table (pending status)
    ↓ (committee review)
Committee dashboard (approve/reject modals)
    ↓ (update status)
class_enrollments table (if approved)
```

---

## Implemented Components

### 1. Backend

#### Model: `ClassRegistration`
- Location: [app/Models/ClassRegistration.php](../app/Models/ClassRegistration.php)
- Fields:
  - `class_id` - foreign key to classes
  - `form_name`, `form_email`, `form_phone` - applicant info
  - `form_answers` - JSON array of additional responses
  - `status` - pending | approved | rejected
  - `student_id` - optional link to user account
  - `rejection_reason` - text explaining rejection
  - `reviewed_at` - timestamp of committee action

#### Controller: `ClassRegistrationController`
- Location: [app/Http/Controllers/ClassRegistrationController.php](../app/Http/Controllers/ClassRegistrationController.php)
- Methods:
  - `import()` - receives Google Form payload, validates, stores as pending
  - `index()` - retrieves all registrations with relationships, renders React page
  - `update()` - committee approves, rejects, or links to student account

#### Routes
- Location: [routes/web.php](../routes/web.php)
- Public endpoint (no auth required):
  - `POST /class-registration/import` - Google Apps Script sends submissions here
- Protected endpoints (auth required):
  - `GET /class-registration` - committee views registrations
  - `PATCH /class-registration/{registration}` - committee updates status

### 2. Frontend

#### Page: `ClassRegistration`
- Location: [resources/js/Pages/ClassRegistration/ClassRegistration.jsx](../resources/js/Pages/ClassRegistration/ClassRegistration.jsx)
- Features:
  - Table of all registrations with pagination
  - Filter by status (pending, approved, rejected)
  - Search by name, email, or class
  - Action buttons for View, Approve, Reject

#### Modals
- **ViewRegistrationModal** - displays full registration details and timeline
- **ApproveRegistrationModal** - approve with optional student linking
- **RejectRegistrationModal** - reject with required reason text

#### Navigation
- Added "Registrations" link to [resources/js/Layouts/AuthenticatedLayout.jsx](../resources/js/Layouts/AuthenticatedLayout.jsx)

### 3. Google Apps Script

#### Template: `google-apps-script-template.gs`
- Location: [docs/google-apps-script-template.gs](google-apps-script-template.gs)
- Features:
  - `onFormSubmit()` trigger - listens for form submissions
  - `buildPayload()` - transforms form responses to JSON
  - `sendToLaravel()` - POSTs to the import endpoint
  - `testFormSubmission()` - debug function to test config
  - `debugFormFields()` - shows exact form field names
  - Logging sheet for tracking submissions

#### Setup Guide
- Location: [docs/google-apps-script-setup.md](google-apps-script-setup.md)
- Step-by-step guide including:
  - Field mapping configuration
  - Trigger setup
  - Testing procedures
  - Troubleshooting

---

## Data Flow

### 1. Form Submission

User fills out Google Form and submits:
```
Google Form
├─ Full Name: "John Doe"
├─ Email: "john@example.com"
├─ Phone Number: "+60123456789"
└─ [custom fields...]
```

### 2. Google Apps Script Processing

Script triggers and transforms data:
```javascript
{
  class_id: 12,
  form_name: "John Doe",
  form_email: "john@example.com",
  form_phone: "+60123456789",
  form_answers: {
    "School Name": "ABC College",
    "Course Interest": "Digital Marketing"
  }
}
```

### 3. Laravel Import Endpoint

Endpoint validates and stores:
- Checks `class_id` exists in database
- Validates required fields (name, email)
- Creates `ClassRegistration` record with `status = 'pending'`
- Returns 201 success response

### 4. Committee Review

Committee member views registrations:
- Sees pending, approved, rejected status
- Can view full details and answers
- Approve and link to existing student user
- Reject with reason text

### 5. Conversion to Enrollment

*(Not yet implemented - for future work)*
- Approved registrations can be converted to `class_enrollments`
- System creates enrollment record with linked student
- Sends confirmation email to student

---

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Optional: Add webhook secret for additional security
GOOGLE_FORM_WEBHOOK_SECRET=your-secure-random-string-here
```

### Google Apps Script Configuration

In the `.gs` file, update these constants:

```javascript
const APP_URL = 'https://your-app-url.com';  // Your Laravel app URL
const CLASS_ID = 1;                           // Which class this form registers for
const WEBHOOK_SECRET = '';                    // Should match .env value
const FIELD_MAPPING = {
  'Full Name': 'form_name',                   // Map to your form field names
  'Email': 'form_email',
  'Phone Number': 'form_phone',
};
```

---

## Payload Contract

### Import Endpoint Request

```http
POST /class-registration/import
Content-Type: application/json
X-Apps-Script-Secret: [optional-secret]

{
  "class_id": 12,
  "form_name": "John Doe",
  "form_email": "john@example.com",
  "form_phone": "+60123456789",
  "form_answers": {
    "School Name": "ABC College",
    "Course Interest": "Digital Marketing"
  }
}
```

### Import Endpoint Response

Success (201):
```json
{
  "success": true,
  "registration_id": 42,
  "status": "pending"
}
```

Error (422 - validation failed):
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "class_id": ["The class_id field is required."],
    "form_email": ["The form_email must be a valid email address."]
  }
}
```

Error (403 - invalid secret):
```json
{
  "success": false,
  "message": "Unauthorized webhook request."
}
```

---

## Security Notes

1. **CSRF Protection**: The import endpoint explicitly bypasses Laravel's CSRF middleware to allow external Google Apps Script requests.

2. **Webhook Secret**: Optional but recommended. If `GOOGLE_FORM_WEBHOOK_SECRET` is set in `.env`, the import endpoint requires the matching header.

3. **Email Validation**: All submitted emails are validated in Laravel before storage.

4. **Status Enum**: Registrations can only be `pending`, `approved`, or `rejected`.

5. **Soft Delete**: Consider implementing soft deletes if registrations should be archived rather than deleted.

---

## Testing

### 1. Test with Mock Data

In Google Apps Script editor:
1. Run `testFormSubmission()` function
2. Check Logs (View > Logs)
3. Verify response code is 201

### 2. Test with Actual Form

1. Submit a test form entry
2. Check Google Apps Script logs for POST result
3. Verify entry appears in Laravel admin dashboard
4. Check `class_registrations` table directly:
   ```php
   php artisan tinker
   >>> ClassRegistration::latest()->get();
   ```

### 3. Manual Endpoint Test

Using curl:
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

Expected response: 201 with success message

---

## Future Work

### Phase 1: Enrollment Conversion (Recommended Next)
- Button to convert approved registration to class enrollment
- Auto-create enrollment record in `class_enrollments` table
- Send confirmation email to student
- Optional payment status workflow

### Phase 2: Student Self-Enrollment Portal
- Students can view their registration status
- Portal shows approved vs pending vs rejected
- Download receipt or confirmation

### Phase 3: Bulk Operations
- Bulk approve multiple registrations at once
- Bulk reject with template reason
- Export registrations to CSV/Excel

### Phase 4: Advanced Filtering
- Filter by date range
- Filter by course type
- Export registration analytics

### Phase 5: Payment Integration
- Collect payment status in form
- Mark paid/unpaid in registration
- Generate payment receipts

---

## Troubleshooting

### Google Apps Script Issues

**Q: Script runs but nothing appears in logs**
- A: Check that the trigger is set to `onFormSubmit`
- A: Go to Triggers menu and verify the trigger exists and is enabled

**Q: Response code 422 (validation error)**
- A: Check field names match exactly (case-sensitive)
- A: Verify required fields (form_name, form_email) are in your form
- A: Run `debugFormFields()` to see exact field names

**Q: Response code 403 (secret mismatch)**
- A: Verify `WEBHOOK_SECRET` in Apps Script matches `.env` value
- A: If using secret, both must be identical

### Laravel Issues

**Q: Registrations not appearing in dashboard**
- A: Check `class_registrations` table exists (run migrations)
- A: Verify class_id in import payload exists in `classes` table
- A: Check Laravel logs: `tail -f storage/logs/laravel.log`

**Q: 404 on import endpoint**
- A: Verify route is registered: `php artisan route:list | grep import`
- A: Check route URL matches Apps Script `APP_URL` constant

**Q: Permission errors when viewing dashboard**
- A: Ensure user is authenticated and has access
- A: Check auth middleware is applied to GET route

---

## Database Schema

### class_registrations table

```sql
CREATE TABLE class_registrations (
  id BIGINT PRIMARY KEY,
  class_id BIGINT FOREIGN KEY,
  imported_at TIMESTAMP,
  form_name VARCHAR(255),
  form_email VARCHAR(255),
  form_phone VARCHAR(255) NULLABLE,
  form_answers JSON NULLABLE,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT NULLABLE,
  student_id BIGINT FOREIGN KEY NULLABLE,
  reviewed_at TIMESTAMP NULLABLE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## File Locations

- Backend Model: [app/Models/ClassRegistration.php](../app/Models/ClassRegistration.php)
- Backend Controller: [app/Http/Controllers/ClassRegistrationController.php](../app/Http/Controllers/ClassRegistrationController.php)
- Backend Routes: [routes/web.php](../routes/web.php)
- Frontend Page: [resources/js/Pages/ClassRegistration/ClassRegistration.jsx](../resources/js/Pages/ClassRegistration/ClassRegistration.jsx)
- Frontend Modals: [resources/js/Pages/ClassRegistration/Partials/](../resources/js/Pages/ClassRegistration/Partials/)
- Frontend Layout: [resources/js/Layouts/AuthenticatedLayout.jsx](../resources/js/Layouts/AuthenticatedLayout.jsx)
- Apps Script Template: [docs/google-apps-script-template.gs](google-apps-script-template.gs)
- Setup Guide: [docs/google-apps-script-setup.md](google-apps-script-setup.md)
- Import Flow Doc: [docs/class-google-form-import-flow.md](class-google-form-import-flow.md)

---

## Deployment Checklist

- [ ] Run migrations: `php artisan migrate`
- [ ] Set `GOOGLE_FORM_WEBHOOK_SECRET` in `.env` (optional but recommended)
- [ ] Create Google Form with fields mapping to form_name, form_email, form_phone
- [ ] Copy Apps Script template into Google Sheet's script editor
- [ ] Update `APP_URL`, `CLASS_ID`, `WEBHOOK_SECRET` in Apps Script
- [ ] Update `FIELD_MAPPING` with actual form field names
- [ ] Set up `onFormSubmit` trigger in Apps Script
- [ ] Test with `testFormSubmission()` function
- [ ] Submit a test form entry
- [ ] Verify entry appears in "Registrations" dashboard
- [ ] Test approve workflow (link to student, change status)
- [ ] Test reject workflow (add reason, change status)

---

## Status

✅ **COMPLETE**: Google Form → Apps Script → Laravel import endpoint
✅ **COMPLETE**: Committee review dashboard
✅ **COMPLETE**: Approve/reject workflow with modals
⏳ **PENDING**: Enrollment conversion (turn approval into actual class enrollment)
⏳ **PENDING**: Student confirmation emails
⏳ **PENDING**: Payment workflow integration

---

## Next Steps

1. **Set up the Google Form** using the field names configured in your Apps Script
2. **Deploy the Apps Script** following the setup guide
3. **Test the flow** end-to-end with a test submission
4. **Review pending registrations** in the dashboard
5. **Implement enrollment conversion** logic when ready

For detailed setup steps, see [google-apps-script-setup.md](google-apps-script-setup.md).
