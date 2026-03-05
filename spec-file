1. System Overview

QuickWork is a web-based checklist management application that allows users to organize tasks and track their completion.

The system is developed using:

HTML – for structure

CSS – for styling and layout

TypeScript – for dynamic behavior and logic

It is designed for small teams, offices, or community members who need a simple, fast, and interactive task tracking system.

The app runs on a web browser and stores task data in browser LocalStorage.

2. System Objectives

Allow users to create daily or weekly work checklists

Track task completion in real-time

Organize tasks by priority or category

Provide a clean and interactive interface

Enable offline usage through browser storage

3. System Features
3.1 Task Creation Module

Users can create new tasks with a title and description

Tasks can be assigned a category or type (e.g., Daily, Weekly)

Tasks are displayed in a checklist format

3.2 Task Management Module

Mark tasks as completed

Edit task title or description

Delete tasks

Persistent task storage using LocalStorage

3.3 Checklist Overview Module

Display all tasks in a list

Visual indicator for completed vs pending tasks

Real-time update of task status

3.4 User Interface Module

Interactive buttons for adding, deleting, and completing tasks

Responsive layout using CSS

Clean, minimal, user-friendly design

Optional: color-coded tasks for priority

3.5 Local Storage Module

Automatically saves tasks in browser LocalStorage

Tasks remain after closing or refreshing the page

Load tasks from LocalStorage on startup

4. System Boundaries
4.1 In Scope

Task creation, deletion, and completion

Checklist overview and status tracking

LocalStorage persistence

Interactive frontend with HTML/CSS/TS

4.2 Out of Scope

Backend server or database integration

Multi-user synchronization

Notifications (email or SMS)

Authentication or login system

Real-time collaboration

5. User Roles and Permissions
Single User

Create tasks

Mark tasks completed

Delete tasks

Edit tasks

No role differentiation is required in this version, as it is designed for a single user/browser.

6. Technical Specifications

Frontend: HTML, CSS, TypeScript

Data Storage: Browser LocalStorage

Logic: TypeScript for dynamic task management

Browser Compatibility: Modern browsers (Chrome, Edge, Firefox)

Responsive Design: Mobile and desktop layout

7. Non-Functional Requirements

Simple and intuitive interface

Tasks persist between browser sessions

Minimal load time (<1 second)

Works offline (tasks stored locally)

Clean, maintainable TypeScript code

8. Database/Storage Design

Since this is frontend-only, data is stored in LocalStorage as JSON.

Task Object Example
interface Task {
  id: number;
  title: string;
  description: string;
  type: "Daily" | "Weekly";
  completed: boolean;
  createdAt: string;
}

id – unique identifier

title – task name

description – optional details

type – Daily or Weekly

completed – true/false

createdAt – date of creation

All tasks are saved as an array in LocalStorage:

localStorage.setItem("tasks", JSON.stringify(tasksArray));
9. Future Enhancements

Connect to NestJS backend for multi-user capability

Add authentication and user roles

Add priority levels and color-coding

Add category filters (Work, Personal, Community)

Add dashboard with task completion stats

Optional notifications (email or browser push)