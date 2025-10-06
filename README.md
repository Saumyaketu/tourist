
# Smart Tourist Safety Monitoring & Incident Response System

## Project Overview

This repository contains the full-stack digital ecosystem for a **Smart Tourist Safety Monitoring & Incident Response System**. The system is designed to leverage AI, Blockchain, and Geo-Fencing technologies to ensure the safety and security of tourists, especially in remote or high-risk regions.

The architecture is built as a modular microservices project, offering a reliable backbone for real-time monitoring and rapid response by tourism and police authorities.

## Key Features

The system is organized around three main components: Identity/Backend Services, Tourist Mobile App, and Authority Dashboards.

### 1\. Digital Tourist ID & Identity Management (Blockchain Focus)

  * **Digital Tourist ID Platform:** A dedicated microservice (`identity-service`) manages the registration and details of all tourists.
  * **Secure Registration:** Allows agents to quickly onboard tourists and issue unique Digital Tourist IDs.
  * **Blockchain POC:** Includes a mock ledger (`identity-service/blockchain.js`) for anchoring key identity information (e.g., KYC hash) and issuing verifiable credentials (DID/VC) to ensure a tamper-proof identity record valid only for the duration of the visit.
  * **Authentication:** A separate `auth-service` manages secure login/password hash verification (using bcrypt/JWT) for both tourists and agents.

### 2\. Mobile Application for Tourists (`apps/mobile-tourist`)

  * **Real-time Location:** Implements persistent background location tracking (using Expo's `Location` and `TaskManager`) which users can opt-in to for enhanced safety.
  * **Panic Button:** A one-touch panic feature that captures the user's live location and instantly dispatches an emergency alert to the central dashboard.
  * **Geo-fencing Alerts:** Provides proximity alerts when a tourist is entering a pre-defined high-risk or restricted zone (demonstrated via Haversine distance check).
  * **Tourist Safety Score:** Displays a mock real-time safety score based on location and patterns (`src/screens/SafetyScreen.js`).

### 3\. AI-Based Anomaly Detection

  * **Anomaly Service:** The `anomaly-service` continuously consumes location data and triggers alerts for suspicious patterns, such as sudden, prolonged inactivity (`NO_MOVEMENT`) or unusually fast movements (`SUDDEN_JUMP`).

### 4\. Tourism Department & Police Dashboard (`apps/web-dashboard`)

  * **Real-time Visualization:** Displays tourist cluster heat maps and live alerts on a Leaflet-based map interface.
  * **Incident Management:** Provides tools to acknowledge alerts, view full tourist profiles (including emergency contacts, itinerary, and consent flags), and rapidly respond to incidents.
  * **Agent Dashboard (`apps/agent-dashboard`):** A specialized interface for entry points (hotels/airports) to securely create and issue the digital tourist IDs.

## Technical Architecture

The project employs a services-oriented architecture structured as a monorepo.

| Component | Technology Stack | Description |
| :--- | :--- | :--- |
| **Mobile Tourist App** | React Native (Expo) | Cross-platform app providing safety and identity features. |
| **Web Dashboard** | React, Vite, Tailwind CSS, Leaflet | Public-facing monitoring and response interface for authorities. |
| **Agent Dashboard** | React, Vite, Tailwind CSS | UI for registering new tourists and issuing IDs. |
| **Identity Service** | Node.js (Express), MongoDB | Core service for managing tourist profile and DID/VC issuance (POC). |
| **Auth Service** | Node.js (Express), MongoDB | Handles user registration, login, and JWT generation for all users. |
| **Location Ingest Service** | Node.js (Express), MongoDB | Endpoint for receiving and storing real-time location pings from mobile clients. |
| **Dashboard API** | Node.js (Express), MongoDB | API Gateway for the Web Dashboard, managing data retrieval and alert management. |
| **Anomaly Service** | Node.js Consumer (Polling) | Background worker for detecting anomalous behavior from location streams. |
| **Notification Service** | Node.js (Stub) | Placeholder for integrating external notification providers (Twilio, Firebase, Email). |
| **Shared API Client** | Node.js/Browser (Isomorphic) | Utility library for standardized communication between applications and services. |

## Local Development Setup

### Prerequisites

You must have **Node.js (LTS recommended)**, **npm** or **yarn**, and **MongoDB** (running locally or accessible via a URI) installed.

### 1\. Environment Variables

Each service and application requires its own configuration. Use the provided `.env.sample` files in each directory to create local `.env` files.

***Example required variables across services:***

| Service/App | Key Variables to Set (from `.env.sample`) |
| :--- | :--- |
| `services/*` | `MONGO_URI`, `MONGO_DB`, `PORT` |
| `auth-service` | `AUTH_SECRET`, `ADMIN_SECRET` |
| `identity-service` | `PRIVACY_POLICY_VERSION` |
| `apps/web-dashboard` | `VITE_API_BASE` |
| `apps/mobile-tourist` | `AUTH_SERVICE_URL`, `DASHBOARD_API_URL`, `LOCATION_AGENT_URL` |

### 2\. Running Services (Requires MongoDB)

Navigate into each service directory, install dependencies, and run in development mode:

```bash
# In the root of the cloned repository

# 1. Identity Service (Port 4100)
cd services/identity-service
npm install
npm run dev

# 2. Auth Service (Port 4300)
cd ../auth-service
npm install
npm run dev

# 3. Location Ingest Service (Port 4000)
cd ../location-ingest
npm install
npm run dev

# 4. Dashboard API (Port 4200)
cd ../dashboard-api
npm install
npm start

# 5. Anomaly Service (Background worker - No dedicated port)
# NOTE: This runs a polling loop against the Location Ingest service.
cd ../anomaly-service
npm install
node consumer.js

# 6. Notification Service (Port 4500)
cd ../notification-service
npm install
npm start
```

### 3\. Running Frontends

After all backend services are running, start the frontends:

**Web Dashboard (Police/Tourism Authority)**

```bash
# In the root of the cloned repository
cd apps/web-dashboard
npm install
npm run dev 
# Runs on http://localhost:5173
```

**Agent Dashboard (Tourist Onboarding)**

```bash
# In the root of the cloned repository
cd apps/agent-dashboard
npm install
npm run dev
# Runs on http://localhost:5174
```

**Mobile Tourist Application**

```bash
# In the root of the cloned repository
cd apps/mobile-tourist
npm install
npx expo start
# Follow instructions to run on Android/iOS simulator or physical device.
```

## How to Test the Core Flow

1.  **Onboard Tourist:** Access the **Agent Dashboard** (`http://localhost:5174`). Navigate to **Create Tourist ID** and fill out the required fields to register a new tourist. The output will provide a **Tourist ID** and **Temporary Password**.
2.  **Login to App:** Use the generated Tourist ID and Temporary Password to log in on the **Mobile Tourist Application** (ensure you grant background location permissions).
3.  **Monitor Live Data:** Access the **Web Dashboard** (`http://localhost:5173`). You should see the tourist appear on the **Tourists** page and their location data will begin populating on the **Overview** map.
4.  **Trigger Alert:** On the Mobile App's home screen, tap the **PANIC** button. A new alert will instantly appear on the Web Dashboard's **Alerts** tab.
5.  **View Anomaly:** Leave the Mobile App running but stationary for a few minutes. The **Anomaly Service** will detect no movement and create a `NO_MOVEMENT` alert, visible on the dashboard.