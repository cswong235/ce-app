# Class Module Plan

## Overview

The Class module is the operational layer behind a Course Profile. A class is an allocated time slot used to deliver a course profile's syllabus. A course profile can have many classes, while each class belongs to exactly one course profile.

This module should support the same general CRUD patterns as the Course Profile module:

- add a class
- view a class
- update a class
- delete a class
- list classes with pagination and lazy loading
- filter and search as needed
- manage related data like enrollments, registrations, and class admins

---

## Data model foundations

### Classes table

Reference:

- `database/migrations/2026_08_10_092634_create_classes_table.php`
- `database/migrations/2026_08_12_050136_add_end_date_to_classes_table.php`

Core class fields include:

- `id`
- `course_profile_id` — FK to `course_profiles`
- `facilitator_id` — nullable FK to `users`
- `name`
- `description`
- `status` — `planning`, `open`, `in_progress`, `completed`, `cancelled`
- `language`
- `google_form_link` — nullable
- `registration_closing_date`
- `mode` — `online`, `hybrid`, `physical`
- `start_date` — renamed from `class_date`
- `end_date`
- `start_time`
- `end_time`
- timestamps

Important relationship rule:

- A class belongs to one course profile
- A course profile can have many classes

---

## Related tables

### Class admins

Reference:

- `database/migrations/2026_08_10_092739_create_class_admins_table.php`

This is the operational assignment table for class management.

Fields:

- `id`
- `class_id` — unique FK to `classes`
- `committee_id` — FK to `users`
- `assigned_at`
- timestamps

Business meaning:

- Any committee member can be assigned as the Class Admin.
- A class should have one designated Class Admin in this model.
- The user is selected from the existing users table.

This will likely be used for:

- class operations management
- coordination tasks
- admin visibility and assignment ownership

---

### Class enrollments

Reference:

- `database/migrations/2026_08_10_092644_create_class_enrollments_table.php`

Fields:

- `id`
- `class_id`
- `student_id`
- `status` — `active`, `left`, `completed`
- `testimonial` — nullable
- `payment_status` — `paid`, `not_paid`
- `payment_receipt_path` — nullable
- `enrolled_at`
- timestamps

Unique constraint:

- each student can only be enrolled once per class

This gives a class a roster of enrolled students.

---

### Class registrations

Reference:

- `database/migrations/2026_08_10_092658_create_class_registrations_table.php`

Fields:

- `id`
- `class_id`
- `imported_at`
- `form_name`
- `form_email`
- `form_phone` — nullable
- `form_answers` — JSON nullable
- `status` — `pending`, `approved`, `rejected`
- `rejection_reason` — nullable
- `student_id` — nullable FK to `users`
- `reviewed_at` — nullable
- timestamps

Business meaning:

- Google Form submissions can later be imported directly into this table
- they are reviewed before being converted or matched to a final enrollment
- status tracking allows approval or rejection of import data

---

## Module requirements

### 1. CRUD for classes

The class module should behave like the course profile module:

- list all classes in a table
- add a new class
- update a class
- view a class detail modal
- delete a class
- use pagination and lazy loading on the listing page

The table should be the same pattern as current course profile screens:

- table view with actions column
- View button for detail modal
- Edit button for update modal
- Delete or archive button as needed
- page size with navigation buttons and page count

---

### 2. Filtering and search

Like the Course Profile module, the class page should support:

- search by name
- sort or filter by course profile or status
- maybe course type or status filter later

At minimum, the listing should support:

- search by class name
- filter by class status

---

### 3. Relationship behavior

A class should be linked to a single course profile.

This means:

- `Class` belongs to `CourseProfile`
- `CourseProfile` has many `Class` records

For the UI and backend, we need:

- a dropdown or selector for choosing the parent course profile
- the class list should show the related course profile name
- related data should be loaded with `with()` when needed

---

## Suggested module structure

### Backend

- `app/Models/Class.php`
- `app/Http/Controllers/ClassController.php`

### Routes

Add routes in `routes/web.php` similar to course profiles:

- `GET /class` — list
- `POST /class` — store
- `PUT /class/{class}` — update
- `DELETE /class/{class}` — destroy

### Frontend

- `resources/js/Pages/Class/Class.jsx` — list page
- `resources/js/Pages/Class/Partials/CreateClassModal.jsx`
- `resources/js/Pages/Class/Partials/UpdateClassModal.jsx`
- `resources/js/Pages/Class/Partials/ViewClassModal.jsx`
- optionally `resources/js/Pages/Class/Partials/AvailableClassesModal.jsx` for shared class display when needed

---

## Object relationships to plan for

### Class -> CourseProfile

- many classes per course profile
- class must always have a course profile selected

### Class -> ClassAdmin

- one class admin assignment per class at this stage
- `committee_id` from users table

### Class -> ClassEnrollment

- multiple students enrolled in a class
- status tracking for active/left/completed

### Class -> ClassRegistration

- multiple imported registrations per class
- pending review flow before final enrollment

---

## Current implementation priority

### Phase 1

- set up `ClassController` and model
- add route registration
- create list page with pagination and search/filter
- add create modal
- add view modal
- add edit modal and delete support

### Phase 2

- create relationship data display in class details
- show enrolled students count and class admin
- show registration import status if available

### Phase 3

- add admin and enrollment management workflows
- start class registration import review screen

---

## Notes

The class feature should be treated as the operational delivery layer that sits under a course profile. It is not a replacement for the course profile itself; it is the actual scheduled running of that curriculum for a group of learners.

This means the class module should be designed with both:

- course profile context
- operational admin data (enrollments, registration reviews, class admin assignment)

This is the foundation for the next phase of the system.
