# GoudSaab

GoudSaab is a rural marketplace platform designed for toddy sellers in Andhra Pradesh & Telangana. It digitizes the process of tracking stock availability and ordering, solving the everyday problems of availability transparency and phone call overload for local sellers.

## 🚀 Features

### Customer Experience
*   **Find Nearby Sellers**: Uses Geolocation API and Haversine formula to find sellers closest to you.
*   **Live Availability**: Check Morning and Evening stock status before reaching out.
*   **Quick Booking System**: Book a specific quantity of fresh toddy for pickup directly through the platform.
*   **WhatsApp Ordering**: 1-click redirect to WhatsApp with a pre-filled ordering message.
*   **Rating System**: Rate sellers out of 5 stars based on the quality of their stock.

### Seller Dashboard
*   **Stock Management**: Update estimated liters in stock and toggle Morning/Evening availability.
*   **Booking Management**: View a real-time list of customer bookings, including quantities and pickup times.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Axios, Lucide React
*   **Backend**: Java 21, Spring Boot, Spring Data JPA, RESTful APIs
*   **Database**: H2 In-Memory Database (MVP Phase) - Configured and ready for MySQL

## 🏃 How to Run Locally

### 1. Start the Backend (Spring Boot)

Open a terminal, navigate to the `backend` directory, and run the Maven wrapper:

```bash
cd backend
./mvnw clean spring-boot:run
```
The Spring Boot server will start on `http://localhost:8080`.

### 2. Start the Frontend (React)

Open a new terminal, navigate to the `frontend` directory, install dependencies, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```
The React frontend will be available at `http://localhost:5173`.

## 🗺️ Future Roadmap
- Phase 4: Integration of Admin Dashboard and Real-Time Payment Gateway.
- Multilingual Support (Telugu & English).
- Native Mobile Application.
