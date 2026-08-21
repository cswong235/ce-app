# Class Registration Google Form Integration Plan

## Overview

This flow covers how a regular Google Form created outside the app feeds data into the application’s class registration and enrollment system. The app does not need a custom Google Form builder. Instead, the app uses the Google Form as a submission front end and then imports the results into Laravel.

The goal is:

- create a class-specific Google Form
- collect student registration entries
- push responses into Laravel
- store them in the `class_registrations` table for review
- optionally convert approved entries into class enrollments

---

## High-level process flow

1. Committee creates a Google Form for a specific class
2. The form collects the student’s personal data and registration answers
3. A student submits the form
4. Google Forms stores the response
5. A Google Apps Script listens for form submit events
6. The script transforms the response payload into JSON
7. The script sends the payload to a Laravel endpoint
8. Laravel validates and stores the data in `class_registrations`
9. The committee reviews pending registrations
10. Approved registrations are converted into `class_enrollments`

---

## Module relationship map

### Core data flow

- `classes` = the actual class offering
- `class_registrations` = imported responses waiting for review
- `class_enrollments` = final accepted students in the class
- `users` = shared user identity for students and committee

### Intended behavior

- One class may have many registration records
- One class may have many enrollment records
- A registration may later be linked to a user account
- A registration may be approved, rejected, or left pending

---

## Step 1: Create the Google Form

### Purpose

The Google Form is the external intake form used by students to register for a class.

### Typical form fields

Use fields that map to the registration model:

- full name
- email
- phone number
- preferred name or student name
- course or class selection
- any intake questions the class requires
- consent / agreement checkbox if needed

### Form design notes

- Keep the form per class or per course profile when possible
- Add a hidden field for the related class ID if needed
- Use short, simple questions to reduce import complexity
- Keep required fields consistent with Laravel validation

### Best practice

If the class is tied to a `class_id`, include that in a hidden field or in the payload metadata sent from Apps Script. This makes the import easy to map to the right class.

---

## Step 2: Link the Google Form to a Google Sheet

### Purpose

A Google Sheet gives the easiest way to inspect and transform the submission output.

### Recommended setup

- connect the form to a Google Sheet
- keep the sheet as the raw response source
- use Apps Script to process each form submission

### Why this is recommended

- easy to debug
- easy for committee to inspect manually if needed
- simple trigger for script automation

---

## Step 3: Add Google Apps Script for submission handling

### Purpose

Apps Script listens for form submit events and sends the data to the Laravel app.

### Trigger

Use the Google Forms on form submit trigger.

### What the script should do

- read the latest response
- map the response values to expected keys
- package them as JSON
- send a POST request to your Laravel endpoint

### Example payload

```json
{
  "class_id": 12,
  "form_name": "John Doe",
  "form_email": "john@example.com",
  "form_phone": "+60123456789",
  "form_answers": {
    "student_name": "John Doe",
    "phone": "+60123456789",
    "school": "ABC College",
    "course_interest": "Digital Marketing"
  }
}
```

### Apps Script responsibilities

- map response values to fixed keys
- normalize data
- send the payload to Laravel
- optionally log failures for debugging

---

## Step 4: Create the Laravel import endpoint

### Purpose

The app receives the Google Form data and stores it in the registration table for review.

### Recommended route

Example route pattern:

- `POST /class-registration/import`

### Laravel endpoint responsibilities

- validate the payload
- ensure `class_id` exists
- ensure required fields are present
- create a `class_registrations` record
- set status to `pending` by default
- store raw answers in JSON

### Example Laravel flow

- receive payload
- validate:
  - `class_id` required and exists
  - `form_name` required
  - `form_email` required
  - `form_answers` optional JSON
- insert row into `class_registrations`
- return success or validation error

---

## Step 5: Store imported data in the database

### Primary table involved

`class_registrations`

### Standard fields

- `class_id`
- `imported_at`
- `form_name`
- `form_email`
- `form_phone`
- `form_answers` (JSON)
- `status` (`pending`, `approved`, `rejected`)
- `student_id` (nullable, once matched to a user)
- `reviewed_at` (nullable)
- `rejection_reason` (nullable)

### Why this table is important

This table acts as the review buffer between raw external submissions and the final accepted rosters.

It prevents the app from directly trusting external form data.

---

## Step 6: Review and approval flow

### Purpose

Allow committee members to verify registration data before enrollment.

### Typical status logic

- `pending` = new imported record waiting for review
- `approved` = accepted and ready for enrollment
- `rejected` = invalid or duplicate or not eligible

### Committee actions

- review each registration
- match to a student user if they exist
- approve or reject
- optionally create an enrollment record

---

## Step 7: Convert approved registrations to enrollments

### Purpose

Once approved, the app can turn the registration into a final class enrollment.

### Enrollment table

`class_enrollments`

### Example process

- registration status changes to `approved`
- system creates a `class_enrollment` row
- `student_id` is filled if matched
- status is set to active or paid status depending on the workflow

This is where the applicant becomes a genuine class participant.

---

## Recommended Laravel architecture

### Backend components

- `ClassRegistrationController`
- `ClassEnrollmentController`
- `ClassImportController` or import API route

### Example routes

- `POST /class-registration/import`
- `GET /class-registration`
- `PATCH /class-registration/{id}`
- `POST /class-registration/{id}/approve`
- `POST /class-registration/{id}/reject`

### What each controller does

- `import`: accept external Google Form data
- `index`: show pending registrations for review
- `approve`: mark as approved and create enrollment
- `reject`: mark as rejected with reason

---

## Security and validation requirements

### Important rules

- validate every inbound payload in Laravel
- verify `class_id` belongs to a valid class
- handle duplicate submissions
- ignore or flag malformed email / phone data
- restrict the import endpoint to trusted calls only
- use a secret or service token if possible

### Recommended protection

- set an API token or secret key in Apps Script
- check it on Laravel before inserting records
- log import failures to a server log

This prevents random external requests from pushing fake data into your DB.

---

## Recommended deployment pattern

### Best approach for this app

Use:

- Google Form for registration capture
- Google Apps Script for transport
- Laravel endpoint for validation and persistence
- committee dashboard to review imported registrations

This keeps the app maintainable and avoids building a custom form builder inside Laravel.

---

## Example end-to-end flow summary

```text
Committee creates Google Form for Class A
    ↓
Student fills out form
    ↓
Google Form receives response
    ↓
Google Apps Script triggers on submit
    ↓
Script sends JSON to Laravel endpoint
    ↓
Laravel validates request
    ↓
Laravel inserts into class_registrations with status = pending
    ↓
Committee reviews row in dashboard
    ↓
Committee approves or rejects
    ↓
Approved entry becomes a class_enrollment
```

---

## Production notes

- Keep imported data separate from final enrollment records until approved
- Never trust raw Google Form submissions as final enrollment proof
- Maintain a clear review pipeline for committee oversight
- Consider matching form email to an existing `users` record for student identity linkage

---

## Final recommendation

Do not build a Google Form builder inside the app. Use a standard Google Form outside the app and add the import bridge. That is the cleanest and most reliable implementation for your class registration workflow.
