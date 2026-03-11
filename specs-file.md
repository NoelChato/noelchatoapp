System Specification
Development of a Digital Visitor Logbook Website for School Gate Security
1. System Overview

The Digital Visitor Logbook System is a web-based application designed to manage and record visitor information entering and leaving the school campus. The system replaces the traditional manual logbook used by security guards with a digital platform that stores visitor data securely in a database.

The system allows security personnel to easily register visitors, monitor entry and exit times, and maintain organized records. Administrators can also view and generate visitor reports to improve campus safety and monitoring.

2. Objectives of the System

The system aims to:

Digitize the manual visitor logbook used at the school gate.

Improve the efficiency of recording visitor information.

Maintain accurate records of visitors entering and leaving the school.

Provide searchable visitor records for easier monitoring.

Generate reports for school administrators.

3. Scope of the System

The Digital Visitor Logbook System will focus on managing visitor entries at the school gate.

The system will include:

Visitor registration

Entry and exit time recording

Viewing visitor records

Searching visitor information

Generating visitor reports

User login authentication

The system will be used by security guards and school administrators through a web browser.

4. System Users
4.1 Security Guard

The security guard is responsible for recording visitor information.

Capabilities:

Login to the system

Register new visitors

Record visitor time-in

Record visitor time-out

View visitor records

4.2 Administrator

The administrator manages the system and monitors visitor logs.

Capabilities:

Login to the system

View visitor records

Search visitor information

Generate reports

Manage system data

5. Functional Requirements
5.1 User Login

The system shall allow authorized users to log in using a username and password.

5.2 Visitor Registration

The system shall allow the security guard to record visitor information including:

Visitor name

Address

Contact number

Purpose of visit

Person to visit

Time-in

Date of visit

5.3 Visitor Time-Out

The system shall allow the guard to update the visitor record when the visitor leaves the school.

5.4 View Visitor Records

The system shall display a list of all visitors recorded in the system.

5.5 Search Visitor Records

The system shall allow users to search visitor records by:

Visitor name

Date of visit

5.6 Report Generation

The system shall allow administrators to generate reports such as:

Daily visitor report

Weekly visitor report

Monthly visitor report

6. Non-Functional Requirements
Usability

The system should have a simple and easy-to-use interface for security guards.

Security

The system must require login authentication to prevent unauthorized access.

Performance

The system should quickly store and retrieve visitor records.

Reliability

The system must maintain accurate records without data loss.

7. System Modules

The system will consist of the following modules:

Authentication Module
Handles login and user verification.

Visitor Management Module
Handles visitor registration and time tracking.

Visitor Records Module
Displays and manages visitor logs.

Search Module
Allows searching of visitor records.

Reports Module
Generates visitor reports.

8. System Inputs

The system will accept the following inputs:

Visitor Name

Address

Contact Number

Purpose of Visit

Person to Visit

Date

Time In

Time Out

9. System Outputs

The system will produce:

Visitor log records

Visitor entry and exit times

Search results

Visitor reports (daily, weekly, monthly)

10. Technology Requirements
Frontend

HTML

CSS

TypeScript

Backend

NestJS (TypeScript)

Database

MySQL or SQLite

Development Tools

Visual Studio Code

Node.js

Web Browser