# Visitor Logbook System

## Project Description

The Visitor Logbook System is a web-based application designed to record and manage visitor information. It helps security personnel or administrative staff track visitors entering the office or university. The system allows users to register visitors and view visitor records in an organized logbook.

---

## Implemented Features

### 1. Visitor Registration

This feature allows staff to register visitors by entering their details into a form.

**Purpose:**
To record visitor information for monitoring and security purposes.

**Main Functionality:**

* Enter visitor name
* Enter address
* Enter contact number
* Enter purpose of visit
* Enter person to visit
* Select date of visit
* Record time in and time out

**Acceptance Criteria:**

* The system allows the user to input visitor information.
* Required fields must be filled before submission.
* The system saves the visitor information successfully.
* A confirmation is shown after successful registration.

---

### 2. Visitor Log

This feature displays a list of all registered visitors in a table format.

**Purpose:**
To monitor and review visitor records stored in the system.

**Main Functionality:**

* Display visitor records in a table
* Show name, address, contact number, purpose, person to visit, date, time in, and time out
* Search visitor by name
* Filter visitor records by date

**Acceptance Criteria:**

* The system displays all registered visitor records.
* Users can search visitors using their name.
* Users can filter visitor records by date.
* Newly registered visitors appear in the log.

---

## Screenshots

### Visitor Registration

![Visitor Registration](screenshots/register-visitor.png)

### Visitor Log

![Visitor Log](screenshots/visitor-log.png)

---

## How to Run the Project

How to Run the Project

Follow the steps below to set up and run the application on your local machine:

1. Clone the Repository

  git clone https://github.com/your-username/visitor-logbook-system.git
  cd visitor-logbook-system

2. Install Dependencies

Make sure you have Node.js installed, then run:

  npm install

3. Set Up the Database

If your project uses a database (e.g., SQLite, MySQL, or PostgreSQL), configure it first.

Example for SQLite:

  # Make sure the database file exists
  touch data/db.sqlite

  If using environment variables, create a .env file:

  DATABASE_URL=your_database_connection_here
  PORT=3000

4. Run the Application

 Start the NestJS server:

  npm run start

 For development mode (auto-reload):

  npm run start:dev

5. Open in Browser

Go to:

  http://localhost:3000


---

## Technologies Used

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js
* Framework: NestJS
* Database: (Add your database here if used)

---

## Author

Developed as part of a course assignment.
