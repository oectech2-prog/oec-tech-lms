from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid


class Lesson(BaseModel):
    lesson_id: str = Field(default_factory=lambda: f"lesson_{uuid.uuid4().hex[:8]}")
    title: str
    video_type: str = "youtube"
    video_url: str = ""
    duration: str = "10 min"


class Assignment(BaseModel):
    assignment_id: str = Field(default_factory=lambda: f"assign_{uuid.uuid4().hex[:8]}")
    title: str
    description: str
    is_final_project: bool = False


class Week(BaseModel):
    week_number: int
    title: str
    description: str = ""
    lessons: List[Lesson] = []
    assignment: Optional[Assignment] = None


class CourseCreate(BaseModel):
    title: str
    description: str
    short_description: str
    price: float
    currency: str = "PKR"
    image_url: str = ""
    category: str = ""
    duration: str = ""
    level: str = "Beginner"
    instructor: str = "Hussnain Academy"
    intro_video_url: str = ""
    intro_video_type: str = "youtube"
    requirements: List[str] = []
    what_you_will_learn: List[str] = []
    weeks: List[Week] = []


class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    course_id: str
    title: str
    description: str
    short_description: str
    price: float
    currency: str = "PKR"
    image_url: str
    category: str
    duration: str
    level: str
    instructor: str
    intro_video_url: str = ""
    intro_video_type: str = "youtube"
    requirements: List[str] = []
    what_you_will_learn: List[str] = []
    weeks: List[Week] = []
    is_published: bool = True
    created_at: str = ""


class EnrollmentCreate(BaseModel):
    course_id: str
    payment_method: str
    payment_proof: str = ""
    admission_fee_proof: str = ""
    installment_1_proof: str = ""


class ProgressUpdate(BaseModel):
    lesson_id: str
    completed: bool


class AssignmentSubmission(BaseModel):
    assignment_id: str
    content: str = ""
    file_url: str = ""
    submission_type: str = "text"


class ReviewCreate(BaseModel):
    course_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: str


class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str = ""
    message: str


class PaymentStatusUpdate(BaseModel):
    payment_status: str


class AdminLoginRequest(BaseModel):
    password: str


class Installment2Submit(BaseModel):
    proof_url: str
    payment_method: str = ""
    reference: str = ""


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    picture: Optional[str] = None


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "student"
    created_at: str = ""


class DiplomaEnrollmentCreate(BaseModel):
    track_id: str
    payment_method: str
    payment_proof: str = ""
    admission_fee_proof: str = ""
    installment_1_proof: str = ""


class AssignmentReview(BaseModel):
    status: str
    feedback: str = ""
