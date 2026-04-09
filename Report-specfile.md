Visitor Reports
1. Purpose

The purpose of this feature is to allow staff or administrators to view, filter, and generate reports of visitor records. This helps in monitoring visitor activity, reviewing past visits, and producing summarized data for record keeping and decision-making.

2. Expected User

The expected users of this feature are:

Security personnel
Receptionist
Administrative staff
System administrators

They will use this feature to review and analyze visitor records.

3. Main Functionality

The Visitor Reports feature allows users to view and filter recorded visitor data through a report interface.

The feature includes the following:

A filter section where users can:
Select date range (From – To)
Filter by visitor status (All, Inside, Checked Out)
A report table that displays:
Visitor Name
Purpose of Visit
Time In
Time Out
Duration of Visit
Status (Inside or Checked Out)
The system automatically:
Determines the visitor status
Calculates the duration of each visit
The feature also allows users to:
Search records
Sort data
Navigate through pages (pagination)
Export reports (Excel, PDF, Print)
4. Acceptance Criteria
The system allows users to view all recorded visitor data in a report table.
The system allows users to filter reports based on:
Date range
Visitor status
The system correctly displays visitor details including:
Name
Purpose
Time in and time out
The system automatically sets:
Status = "Inside" if time out is not recorded
Status = "Checked Out" if time out is recorded
The system automatically calculates and displays visit duration.
The system allows users to:
Search visitor records
Sort columns
Navigate through paginated results
The system allows users to export the report as:
Excel file
PDF file
Printable format
The system displays accurate and updated data based on selected filters.