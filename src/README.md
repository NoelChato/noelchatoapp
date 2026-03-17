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

1. Install the required dependencies.
2. Start the development server.
3. Open the browser and go to:

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
