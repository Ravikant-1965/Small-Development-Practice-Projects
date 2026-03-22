# Life Link

Life Link is a beginner-friendly full-stack project built with React, Node.js, Express.js, and SQLite.

Tagline: `Critical health info, when seconds matter`

## Folder Structure

```text
life-link/
├── backend/
│   ├── database.js
│   ├── lifelink.db
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── pages/
│   │       ├── AccessLogPage/
│   │       │   ├── AccessLogPage.css
│   │       │   └── AccessLogPage.jsx
│   │       ├── DashboardPage/
│   │       │   ├── DashboardPage.css
│   │       │   └── DashboardPage.jsx
│   │       ├── EditProfilePage/
│   │       │   ├── EditProfilePage.css
│   │       │   └── EditProfilePage.jsx
│   │       ├── EmergencyPage/
│   │       │   ├── EmergencyPage.css
│   │       │   └── EmergencyPage.jsx
│   │       ├── LandingPage/
│   │       │   ├── LandingPage.css
│   │       │   └── LandingPage.jsx
│   │       ├── LoginPage/
│   │       │   └── LoginPage.jsx
│   │       └── RegisterPage/
│   │           ├── RegisterPage.css
│   │           └── RegisterPage.jsx
│   └── vite.config.js
└── README.md
```

## Features

- Patient registration and login
- JWT-based login session
- Emergency health profile create and edit
- Unique Health ID in `LL-XXXXX` format
- QR code shown on patient dashboard
- Public emergency access page with no login
- Emergency access log visible to patient

## Install Commands

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Run Commands

### Start backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3001`

### Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

## Main Routes

- `/` home page
- `/register` patient register page
- `/login` patient login page
- `/dashboard` patient dashboard
- `/edit-profile` patient profile form
- `/emergency` public emergency access page
- `/access-log` patient access log page
