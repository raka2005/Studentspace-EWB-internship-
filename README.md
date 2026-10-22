# 🎓 StudentSpace — Student Database CRUD Application

StudentSpace is a web-based student management application developed as part of an internship assignment at **EWB Edu Tech Pvt. Ltd.** It provides a simple and user-friendly dashboard to manage student records with essential CRUD (Create, Read, Update, Delete) operations.

## 🌐 Live Demo

**Live Application:** https://studentspace-ewb-internship.onrender.com/

**API Documentation:** https://studentspace-ewb-internship.onrender.com/docs

## ✨ Features

- **Dashboard:** View student statistics, including total students, courses represented, and students with contact information.
- **Add Students:** Create new student records through an interactive form.
- **View Students:** Display student details in an organized table.
- **Update Students:** Edit existing student information.
- **Delete Students:** Remove student records with confirmation.
- **Search Students:** Find student records by name.
- **Form Validation:** Validate required fields, email addresses, phone numbers, and dates of birth.
- **REST API:** Perform student management operations through FastAPI endpoints.
- **Responsive UI:** Clean, pastel-themed dashboard designed for ease of use.
- **CSV Export:** Export student records to a CSV file.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| SQLAlchemy | Database ORM |
| SQLite | Database storage |
| HTML5 | Web page structure |
| CSS3 | Styling and responsive layout |
| JavaScript | Frontend interactions |
| Jinja2 | HTML template rendering |
| Uvicorn | ASGI server |
| Render | Cloud deployment |

## 📁 Project Structure

```text
StudentSpace/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── requirements.txt
├── students.db
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── app.js
```

## ⚙️ Installation and Setup

### Prerequisites

- Python 3.10 or later
- pip
- Git (optional)

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd StudentSpace
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository's actual URL.

Alternatively, download the repository as a ZIP file and extract it.

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Application

```bash
uvicorn main:app --reload
```

### 5. Open the Application

Visit the following addresses in your browser:

- **Dashboard:** http://127.0.0.1:8000/
- **API Documentation:** http://127.0.0.1:8000/docs

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/students` | Create a student record |
| GET | `/students` | Retrieve all student records |
| GET | `/students/{student_id}` | Retrieve a specific student |
| PUT | `/students/{student_id}` | Update a complete student record |
| PATCH | `/students/{student_id}` | Partially update a student record |
| DELETE | `/students/{student_id}` | Delete a student record |

The student listing endpoint also supports searching by name using the optional `search` query parameter.

### Example API Request

Create a student using `POST /students`:

```json
{
  "name": "Aarav Sharma",
  "date_of_birth": "2004-05-15",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "course": "Computer Science",
  "address": "Kolkata, West Bengal"
}
```

## 🗄️ Database

StudentSpace uses SQLite for data storage and SQLAlchemy for database interactions.

Each student record can include:

- Student ID
- Full name
- Date of birth
- Email address
- Phone number
- Course
- Address

Email validation and duplicate-email checks are handled by the backend.

## 🚀 Deployment

The application is deployed on **Render**.

- **Live URL:** https://studentspace-ewb-internship.onrender.com/
- **API Docs:** https://studentspace-ewb-internship.onrender.com/docs

The deployed application uses the same FastAPI backend and frontend integration as the local application.

**Note:** SQLite data stored on a hosting platform's temporary filesystem may not persist across restarts or redeployments. Persistent storage or a managed database is recommended for production use.

## 🎯 Project Objective

The objective of StudentSpace is to demonstrate practical implementation of RESTful APIs, database integration, frontend-backend communication, data validation, and CRUD operations through a functional web application.

## 👩‍💻 Author

**Raka Mukherjee**

B.Tech Computer Science and Engineering Student

## 📄 License

This project was developed for educational and internship purposes. Add a license file if you intend to distribute it under a specific open-source license.
