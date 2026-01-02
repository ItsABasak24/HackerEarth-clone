Hackerearth Clone – Backend (FastAPI)
📌 Project Overview

This project is the backend implementation of a Hackerearth-like coding platform, developed using Python and FastAPI.
At the current stage, the project focuses on core user authentication and profile management, which forms the foundation of any large-scale coding platform.
The backend is designed in a scalable and modular way, so that additional features like coding problems, submissions, contests, and online judging can be added in future phases.

##

🛠 Tech Stack
   Backend Framework: FastAPI (Python)
  
   Database: MongoDB (Atlas)

   Authentication: JWT (JSON Web Tokens)

   Password Security: bcrypt

   Async Operations: FastAPI async routes

   Data Handling: PyMongo / BSON

##

✨ Features Implemented (Current)

1. User Registration.
   
   New users can register using email and password.
   
   Passwords are securely hashed using bcrypt.
   
   User data is stored in MongoDB.
   

2. User Login
   
   Email and password authentication.
   
   Secure password verification using bcrypt.
   
   JWT-based authentication system.
   
   Access token with limited lifetime for security.

3. Profile Fetching
   
   Token-protected profile endpoint.
   
   Fetches user information securely using JWT.
   
   Sensitive fields like passwords are never returned.
   
   Profile data is merged from related collections.

4. Error Handling
   
   Proper HTTP status codes using FastAPI’s HTTPException.
   
   Clear error messages for invalid credentials, missing users, and unauthorized access.


## 📂 Project Structure

BACKEND/

├── app.py # FastAPI application entry point

├── .gitignore

├── routes/ # API route definitions

│ ├── authRoute.py

│ └── __init__.py

├── controller/ # Request–response handling

│ ├── authController.py

│ └── __init__.py

├── services/ # Business logic layer

│ ├── authService.py

│ └── __init__.py

├── models/ # Pydantic request/response models

│ ├── authModel.py

│ └── __init__.py

├── middlewares/ # Custom middleware (JWT verification)

│ ├── verifyToken.py

│ └── __init__.py

├── config/ # Configuration & database setup

│ ├── Env.py

│ ├── db.py

│ └── __init__.py


##


🔐 Authentication Flow (High Level)

User logs in with email and password.

Backend verifies credentials.

JWT access token is generated.

Token is required to access protected routes (like profile).

Token expiry is handled securely.

##

🚀 Future Enhancements (Planned)

I am actively planning to extend this project with the following features:

✅ Email OTP verification during registration.

✅ Login / Register using Google and GitHub (OAuth).

##

🎯 Learning Objectives
This project helped me understand and implement:

Secure authentication using JWT.

Password hashing and verification.

MongoDB data modeling.

Backend API design using FastAPI.

Real-world authentication workflows.

##

📌 Status

🚧 Backend under active development.
  
   More features will be added incrementally.

##

👤 Author

Arnab Basak

B.Tech (Computer Science & Technology)

Backend Development | FastAPI | MongoDB
