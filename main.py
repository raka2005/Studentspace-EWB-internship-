
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import engine, Base, get_db
from models import Student
from schemas import StudentCreate, StudentUpdate, StudentResponse
from pathlib import Path
from fastapi import Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Create the database table automatically
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(
    title="Student Database Management System",
    description="A simple API to manage student records",
    version="1.0.0"
)
BASE_DIR = Path(__file__).resolve().parent

app.mount(
    "/static",
    StaticFiles(directory=str(BASE_DIR / "static")),
    name="static"
)

templates = Jinja2Templates(
    directory=str(BASE_DIR / "templates")
)


@app.get("/", include_in_schema=False)
def dashboard(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )

# CREATE: Add a new student
@app.post("/students", response_model=StudentResponse, status_code=201)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    if student.email:
        existing_student = db.query(Student).filter(
            Student.email == student.email
        ).first()

        if existing_student:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    new_student = Student(**student.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


# READ: List all students and search by name
@app.get("/students", response_model=list[StudentResponse])
def get_students(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Student)

    if search:
        query = query.filter(Student.name.ilike(f"%{search}%"))

    return query.order_by(Student.id).all()


# READ: Get one student by ID
@app.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


# UPDATE: Replace all student details
@app.put("/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student_data: StudentCreate,
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    if student_data.email:
        duplicate = db.query(Student).filter(
            Student.email == student_data.email,
            Student.id != student_id
        ).first()

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    for field, value in student_data.model_dump().items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return student


# UPDATE: Change selected fields only
@app.patch("/students/{student_id}", response_model=StudentResponse)
def patch_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    changes = student_data.model_dump(exclude_unset=True)

    if "email" in changes and changes["email"]:
        duplicate = db.query(Student).filter(
            Student.email == changes["email"],
            Student.id != student_id
        ).first()

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

    for field, value in changes.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return student


# DELETE: Remove a student
@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    db.delete(student)
    db.commit()

    return {"message": "Student deleted successfully"}
