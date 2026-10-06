# Feature Flag Management System

A full-stack Feature Flag Management System that I built to manage feature flags, environments, rollouts, user assignments, scheduled changes, feature usage, evaluations, analytics, and audit logs from a single application.

The project has a FastAPI backend and a React frontend. The backend exposes REST APIs and handles authentication, business logic, database operations, feature evaluation, rollouts, analytics, and audit logging. The frontend provides a web-based dashboard to interact with all these features.

---

## Project Overview

The main purpose of this project is to provide a centralized system for managing feature flags across different environments.

Instead of directly changing application code whenever a feature needs to be enabled or disabled, the feature flag system allows me to control the feature through APIs and the dashboard.

The system also records feature usage and evaluation activity so that the behavior of feature flags can be monitored through analytics.

---

# Features

## Authentication

The system provides authentication for protected APIs.

Features include:

- User login
- Access token based authentication
- Bearer token authorization
- Current user information
- Logout
- Protected API access
- Unauthorized request handling

The frontend stores the access token and automatically attaches it to API requests through Axios interceptors.

---

## User Management

Users can be managed from the system.

Supported operations include:

- List users
- Get user details
- Create users
- Update users
- Delete users

Users can also be used for feature flag targeting and assignments.

---

## Environment Management

The application supports multiple deployment environments.

Examples:

- Development
- Testing
- Staging
- Production

Environment management includes:

- Create environment
- View environment
- Update environment
- Delete environment
- Activate environment
- Deactivate environment
- Search environments
- View active/inactive environments

The frontend also displays environment statistics such as total, active, and inactive environments.

---

## Feature Flag Management

Feature flags are the main part of the system.

I can:

- Create feature flags
- View feature flags
- Update feature flags
- Delete feature flags
- Activate feature flags
- Deactivate feature flags
- Search feature flags
- Manage feature flag configuration

Each feature flag can be associated with different environments and rollout configurations.

---

## Feature Rollouts

The system supports percentage-based feature rollouts.

For example, instead of enabling a feature for everyone immediately, I can configure a rollout such as:

5%
25%
50%
75%
100%

Rollout information includes:

Feature flag
Environment
Rollout percentage
Enabled state
Targeting configuration
Version

This makes it possible to gradually release features.

User Assignments

Specific users can be assigned to feature flags.

This allows targeted feature releases.

For example:

Feature: new_dashboard
User: 101
Environment: production
Enabled: true

Assignment operations include:

List assignments
Get assignment
Create assignment
Update assignment
Delete assignment
Feature Scheduling

Feature changes can also be scheduled.

The system supports:

Creating schedules
Viewing schedules
Updating schedules
Deleting schedules
Activating schedules
Cancelling schedules

This can be useful when a feature needs to automatically become active or inactive at a particular time.

Feature Usage

The system records feature evaluation and usage information.

Usage information can be used to understand:

How frequently a feature is evaluated
Enabled evaluations
Disabled evaluations
Users using a feature
Daily feature usage

This information is also used by the analytics APIs.

Feature Evaluation

One of the important parts of the system is the feature evaluation engine.

The backend can evaluate a feature flag based on information such as:

Feature key
Environment
User ID
Rollout configuration
Assignment configuration
Feature state

Example request:

GET /api/v1/evaluations/evaluate

Example query parameters:

feature_key=dark_mode
environment=production
user_id=1

The response contains information such as:

{
  "enabled": false,
  "feature_key": "dark_mode",
  "environment": "production",
  "user_id": null,
  "reason": "no_rollout_configuration",
  "source": "default",
  "rollout_percentage": null,
  "evaluated_at": "2026-08-19T07:26:34.750020+00:00",
  "cached": false
}

This allows the frontend or another application to determine whether a feature should be enabled for a particular user.

Analytics

The system provides analytics APIs for monitoring feature activity.

The analytics section includes:

Global analytics summary
Feature analytics
Environment analytics
Daily usage
Top features
Rollout analytics
Feature usage recording
Analytics Summary

The summary API provides information such as:

{
  "total_evaluations": 351,
  "enabled_evaluations": 280,
  "disabled_evaluations": 70,
  "unique_users": 180,
  "active_features": 1,
  "active_environments": 1,
  "adoption_rate": 79.77
}
Daily Usage

The daily usage API provides usage information grouped by date.

Top Features

The top features API provides the most frequently evaluated features.

The system maintains audit information for important actions performed in the application.

Audit logs can be used to track:

Action performed
Event type
Resource type
Resource ID
User responsible for the action
Timestamp

This makes it easier to understand what changed in the system and when it changed.

Backend
Backend Technology

The backend is developed using:

Python

FastAPI

SQLAlchemy

Pydantic

MySQL

Alembic

JWT authentication

Uvicorn

FastAPI is used to expose the REST APIs.

Backend Structure

The backend is organized into separate areas for APIs, models, schemas, services, database handling, authentication, and configuration.

A simplified structure is:

backend/

│

├── app/

│   ├── api/

│   │   └── v1/

│   │       ├── auth

│   │       ├── users

│   │       ├── environments

│   │       ├── feature_flags

│   │       ├── feature_rollouts

│   │       ├── assignments

│   │       ├── schedules

│   │       ├── usage

│   │       ├── audit_logs

│   │       ├── analytics

│   │       └── evaluations

│   │

│   ├── models/

│   │

│   ├── schemas/

│   │

│   ├── services/

│   │

│   ├── database/

│   │

│   ├── core/

│   │

│   └── main.py

│

├── alembic/

│

├── requirements.txt

│

└── ...

The exact folder names can vary depending on the backend implementation.

Backend API

The main API prefix is:

/api/v1

The backend exposes APIs for different modules.

Authentication

POST /api/v1/auth/login

POST /api/v1/auth/logout

GET  /api/v1/auth/me

Users

GET    /api/v1/users

GET    /api/v1/users/{id}

POST   /api/v1/users

PUT    /api/v1/users/{id}

DELETE /api/v1/users/{id}

Environments

GET    /api/v1/environments

GET    /api/v1/environments/{id}

POST   /api/v1/environments

PUT    /api/v1/environments/{id}

DELETE /api/v1/environments/{id}

Feature Flags

GET    /api/v1/feature-flags

GET    /api/v1/feature-flags/{id}

POST   /api/v1/feature-flags

PUT    /api/v1/feature-flags/{id}

DELETE /api/v1/feature-flags/{id}



POST /api/v1/feature-flags/{id}/activate

POST /api/v1/feature-flags/{id}/deactivate

Feature Rollouts

GET    /api/v1/feature-rollouts

GET    /api/v1/feature-rollouts/{id}

POST   /api/v1/feature-rollouts

PUT    /api/v1/feature-rollouts/{id}

DELETE /api/v1/feature-rollouts/{id}

Assignments

GET    /api/v1/assignments

GET    /api/v1/assignments/{id}

POST   /api/v1/assignments

PUT    /api/v1/assignments/{id}

DELETE /api/v1/assignments/{id}

Schedules

GET    /api/v1/feature-schedules

GET    /api/v1/feature-schedules/{id}

POST   /api/v1/feature-schedules

PUT    /api/v1/feature-schedules/{id}

DELETE /api/v1/feature-schedules/{id}





POST /api/v1/feature-schedules/{id}/activate

POST /api/v1/feature-schedules/{id}/cancel

Usage

GET /api/v1/feature-usage

GET /api/v1/feature-usage/{id}

Audit Logs

GET /api/v1/audit-logs

GET /api/v1/audit-logs/{id}

Analytics

GET /api/v1/analytics/summary

GET /api/v1/analytics/daily-usage

GET /api/v1/analytics/top-features

GET /api/v1/analytics/features/{feature_flag_id}

GET /api/v1/analytics/environments/{environment_id}

GET /api/v1/analytics/rollouts/{feature_flag_id}




POST /api/v1/analytics/usage

Evaluations

POST /api/v1/evaluations/evaluate

GET  /api/v1/evaluations/evaluate

POST /api/v1/evaluations/evaluate-many

POST /api/v1/evaluations/invalidate

Swagger Documentation



FastAPI automatically provides API documentation.



After starting the backend, I can access:



http://127.0.0.1:8000/docs



This is useful for testing the APIs before connecting them to the frontend.



I used Swagger while developing and testing the different endpoints and verifying their request and response structures.



Frontend

Frontend Technology



The frontend is developed using:



React

TypeScript

Vite

React Router

TanStack React Query

Axios

Tailwind CSS

Lucide React



The frontend communicates with the FastAPI backend using REST APIs.

Frontend Structure

The frontend is organized into pages, components, hooks, services, types, utilities, and API configuration.

frontend/

│

├── src/

│   │

│   ├── components/

│   │   └── common/

│   │

│   ├── hooks/

│   │

│   ├── pages/

│   │   ├── auth/

│   │   ├── users/

│   │   ├── environments/

│   │   ├── feature-flags/

│   │   ├── rollouts/

│   │   ├── assignments/

│   │   ├── schedules/

│   │   ├── usage/

│   │   ├── evaluations/

│   │   ├── analytics/

│   │   └── audit-logs/

│   │

│   ├── services/

│   │   ├── api/

│   │   ├── auth/

│   │   ├── users/

│   │   ├── environments/

│   │   ├── feature-flags/

│   │   ├── rollouts/

│   │   ├── assignments/

│   │   ├── schedules/

│   │   ├── usage/

│   │   ├── evaluations/

│   │   ├── analytics/

│   │   └── audit-logs/

│   │

│   ├── types/

│   │

│   ├── utils/

│   │

│   ├── store/

│   │

│   ├── main.tsx

│   └── index.css

│

├── package.json

├── vite.config.ts

└── ...

Frontend Pages


The application contains pages for:

Login

Provides authentication and starts the user session.

Dashboard

Provides an overview of the feature flag management system.

Users

Used for viewing and managing users.

Environments

Used for creating and managing deployment environments.

The page also displays:

Total environments

Active environments

Inactive environments

Search

Environment details

Feature Flags



Used for managing feature flags and their current state.


Rollouts

Used for configuring gradual feature releases.

Assignments

Used for managing user-specific feature assignments.

Schedules

Used for scheduled feature flag changes.

Feature Usage

Used for viewing recorded feature usage.

Evaluations

Used to evaluate a feature flag for a particular environment and optionally a user.

The evaluation result shows information such as:

Enabled/disabled state

Feature key

Environment

User ID

Reason

Source

Rollout percentage

Cache status

Evaluation timestamp

Analytics



Used for displaying analytics returned by the backend.



The page includes:

Feature analytics

Environment analytics

Analytics summary

Daily usage

Top feature information

Audit Logs



Used for tracking actions and changes performed in the platform.

API Client

I created a centralized Axios API client so that API communication is handled consistently across the application.

The client is responsible for:

Base URL configuration

Request handling

Response handling

Authentication headers

Error handling


The authentication token is retrieved from:

localStorage

and attached to protected requests as:

Authorization: Bearer <access_token>

Authentication Flow

The basic authentication flow is:

User

  |
  
  v

Login Page

  |
  
  v

POST /api/v1/auth/login

  |
  
  v

Backend validates credentials

  |
  
  v

Access Token

  |
  
  v

Frontend stores token
  
  |
  
  v

Axios Interceptor

  |
  
  v

Authorization: Bearer <token>
  
  |
  
  v

Protected APIs


If the backend returns 401 Unauthorized, the frontend clears the stored authentication tokens.

React Query

I used TanStack React Query for server-side data management.

It helps with:

Fetching API data

Loading states

Error states

Caching

Refetching

Mutation handling

Query invalidation


List Response Normalization

Some backend list APIs return data directly as an array while other APIs return an object containing the list.


To handle both formats consistently, I created a reusable normalizeList utility.

It checks common response properties such as:

items

data

results

users

feature_flags

environments

schedules

usage

logs

audit_logs


This keeps the individual frontend pages simpler and prevents errors such as:

items.filter is not a function

Error Handling


The frontend contains reusable error and loading components.

Examples include:

LoadingSpinner

ErrorState

PageHeader

StatusBadge

SearchInput

This allows the pages to have a consistent UI and error handling approach.

Running the Backend

1. Clone the project

git clone <repository-url>

Move into the backend directory:

cd backend

2. Create a virtual environment

Windows:

python -m venv venv

Activate it:

venv\Scripts\activate

Linux/macOS:


python3 -m venv venv

source venv/bin/activate

3. Install dependencies

pip install -r requirements.txt

4. Configure the database


Create/configure the database used by the backend.

The database connection settings should be configured according to the backend configuration.

Make sure the database is running before starting the application.

5. Run migrations

If Alembic migrations are configured:

alembic upgrade head

6. Start FastAPI

uvicorn app.main:app --reload

The backend will normally be available at:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs

Running the Frontend

Open another terminal.

Go to the frontend:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173

Frontend Build

To check the TypeScript project and create a production build:

npm run build

The build runs TypeScript checking before Vite creates the production bundle.

Development Flow

The overall development flow of the project is:

Frontend

   |
   
   v
  
  Axios
   
   |
   
   v

FastAPI REST API
   
  
   |
   
   v

Service Layer

   
   |
   
   v

Database

For feature evaluation:

Frontend

   |
   
   v

Evaluation API

   |
   
   v

Feature Flag

   |
   
   +---- Environment
   
   |
   
   +---- User Assignment
   
   |
   
   +---- Rollout
   
   |
   
   +---- Schedule
   
   |
   v

Evaluation Result

Example Feature Evaluation Flow


Suppose I have a feature:

dark_mode

and an environment:

production

The frontend sends:

GET /api/v1/evaluations/evaluate

with:

feature_key=dark_mode

environment=production

user_id=1

The backend checks the applicable configuration and returns the final state.


The frontend then displays the evaluation result.

Testing APIs with Postman

I also use Postman to test the backend APIs independently from the frontend.

The basic process is:

Login
   
   ↓

Get access token

   ↓

Set Bearer token

   ↓

Test GET APIs


This helps me verify whether an issue is coming from the backend API or from the frontend.

API Response Handling

The frontend does not assume that every list API returns exactly the same structure.


while another endpoint may return:

[]

The frontend normalizes these responses before displaying them.

This makes the UI more reliable when working with different API response structures.

Security

The project uses token-based authentication for protected APIs.

The frontend:

Stores the access token locally

Adds the token to API requests

Removes tokens when authentication expires

Handles 401 Unauthorized responses

Protected backend endpoints require a valid Bearer token.


Main Technologies

Backend

Technology	Purpose

Python	Backend programming language

FastAPI	REST API framework

SQLAlchemy	Database ORM

Pydantic	Request/response validation

MySQL	Database

Alembic	Database migrations

JWT	Authentication

Uvicorn	ASGI server

Frontend

Technology	Purpose

React	UI

TypeScript	Type-safe frontend development

Vite	Frontend build tool

React Router	Routing

Axios	API communication

TanStack React Query	Server state management

Tailwind CSS	Styling


Lucide React	Icons

Project Architecture


The project follows a separation between frontend and backend responsibilities.

Backend

Responsible for:

Authentication

API endpoints

Validation

Business logic

Feature evaluation

Rollouts

Database operations

Analytics

Audit logging

Frontend


Responsible for:

User interface

Navigation

Forms

API integration

Loading states

Error states

Search

Data presentation

User interactions



This separation makes the project easier to maintain and extend.

Future Improvements

Some improvements that can be added in the future include:

More detailed analytics charts

Advanced feature targeting rules

More rollout strategies

Role-based access control

Improved notification system

More detailed audit log filtering

Pagination for large datasets

Exporting analytics and audit data

Automated testing

Docker deployment

CI/CD pipeline

Production monitoring

More advanced dashboard visualizations

What I Learned From This Project


While working on this project, I worked with both backend and frontend development.

On the backend side, I worked with:

FastAPI APIs

Authentication

Database integration


API request/response models

Feature evaluation logic

Rollout handling

Analytics APIs

Audit logs

Database migrations


On the frontend side, I worked with:

React

TypeScript

React Router

Axios

React Query

API service layers

Reusable hooks

Reusable components

Loading and error handling

Search and filtering

TypeScript type errors

API response normalization


One of the important things I learned from this project was how the frontend and backend communicate through well-defined REST APIs and how to troubleshoot issues by testing the backend independently using Swagger and Postman.


