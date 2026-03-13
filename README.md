# Westcoast Education 🎓

A modern course booking platform for Westcoast Education, built as a Proof of Concept. The application allows users to browse, filter and book IT courses, with an admin panel for managing courses and bookings.

---

## 🛠️ Technologies

- **Vanilla JavaScript** (ES6 modules)
- **HTML5** & **CSS3**
- **JSON-Server** (REST API)

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com//westcoast-education.git
   cd westcoast-education
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the JSON-Server:
   ```bash
   npx json-server db.json
   ```

4. Open `index.html` in your browser using a Live Server extension (e.g. VS Code Live Server).

> **Note:** JSON-Server runs on `http://localhost:3000`. Make sure it is running before using the app.

---

## 🔑 Test Credentials

| Role  | Email | Password |
|-------|-------|----------|
| Admin | test@test.se | password123 |
| User  | Register a new account via the Register page | - |

---

## ✨ Features

### Public
- Browse all available courses
- Filter courses by type (Classroom, Distance, Popular)
- View detailed course information (title, course number, duration, price, teacher, dates)
- Register and log in to book courses
- Book a course with billing information
- View booked courses on profile page

### Admin
- Add new courses
- Delete courses
- View all bookings per course
- View all teachers

---

## 📁 Project Structure

```
westcoast-education/
├── index.html
├── courses.html
├── courses-details.html
├── booking.html
├── login.html
├── register.html
├── profile.html
├── admin.html
├── db.json
├── CSS/
│   └── style.css
└── js/
    ├── app.js
    └── modules/
        ├── api.js
        ├── auth.js
        ├── admin.js
        ├── booking.js
        ├── courses.js
        ├── ui.js
        └── utils.js
```

---

## 📱 Responsive Design

The application is fully responsive and works on all screen sizes. On mobile, a slide-in drawer navigation is used.

---

## 👤 Author

Developed as a school project for the Westcoast Education course assignment.
