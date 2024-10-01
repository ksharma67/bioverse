# Questionnaire App

This application allows users to complete questionnaires and provides an admin panel for reviewing user responses.

## Features

* **User questionnaires:**
    * Presents questionnaires with various question types (multiple choice, input fields).
    * Stores user responses in a database.
* **Admin panel:**
    * Displays a list of users and their completed questionnaire count.
    * Allows admins to view individual user responses for each questionnaire.
* **Authentication:**
    * Secure user login and authorization.

## Technologies Used

* **Next.js:** React framework for building server-rendered and static web applications.
* **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
* **PostgreSQL:** Relational database for storing user data and questionnaire responses.
* **TypeScript:**  Typed superset of JavaScript for improved code maintainability.

## Installation and Setup

1. **Clone the repository:** `git clone https://github.com/ksharma67/bioverse.git`
2. **Install dependencies:** `npm install`
3. **Set up database:**
    * Create a PostgreSQL database.
    * Update the database connection details in `src/database/db.sql`.
    * Seed the database using the scripts or data in `src/seed_data`.
4. **Run the development server:** `npm run dev`

## Database Schema

The database consists of the following tables:

* **users:** Stores user information (id, username, password_hash, is_admin).
* **questionnaire_questionnaires:** Stores questionnaire titles (id, name).
* **questionnaire_questions:** Stores individual questions (id, question).
* **questionnaire_junction:** Links questions to questionnaires with priority (id, question_id, questionnaire_id, priority).
* **user_answers:** Stores user responses (questionnaire_id, user_id, question_id, answer, created_at).

## API Endpoints

* **`src/app/api/admin`:**
    * **GET:** Fetches user summaries (username, completed questionnaire count) and their responses.

* **`src/app/api/auth/login`:**
    * **POST:**  Handles user authentication.

* **`src/app/api/questionnaires`:**
    * **GET:** Fetches a list of available questionnaires.

* **`src/app/api/questionnaires/[id]/previous-answers`:**
    * **GET:**  Fetches previous answers for a specific questionnaire and user.

* **`src/app/api/questionnaires/[id]/submit`
    * **POST:**  Handles the data inside questionnaires
