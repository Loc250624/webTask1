# Backend Development Requirements (Spring Boot)

## Project Overview

This project extends the existing frontend developed in **WEB Task 1** by implementing a complete backend using **Java Spring Boot** with **RESTful APIs** and **MySQL/MSSQL Server**. The frontend UI is already prepared and should be integrated with the backend APIs.

---

# Functional Requirements

## A. Authentication System

Implement a complete authentication module.

### 1. Sign Up

Create a registration API that allows new users to create an account.

Required fields:

* Username
* Email
* Password

Validation Rules:

* Username

  * Required
  * Must be unique
* Email

  * Required
  * Must follow a valid email format
* Password

  * Required
  * Minimum 6 characters

When validation fails, return meaningful error messages.

Example:

```
Username already exists.
```

```
Invalid email format.
```

```
Password must contain at least 6 characters.
```

---

### 2. Login

Create a login API.

Input:

* Email (or Username)
* Password

Requirements:

* Verify user credentials.
* Return user information after successful login.
* Return appropriate error messages if login fails.

Example:

```
Invalid email or password.
```

---

### 3. Logout

Implement logout functionality.

If JWT authentication is used, simply remove the token from the client side.

---

# B. CRUD Operations

Implement full CRUD functionality for the **main entity** created in WEB Task 1.

The backend must support:

## Create

Create a new record.

Example Endpoint

```
POST /api/{entity}
```

---

## Read

Retrieve all records.

```
GET /api/{entity}
```

Retrieve a single record by ID.

```
GET /api/{entity}/{id}
```

---

## Update

Update an existing record.

```
PUT /api/{entity}/{id}
```

---

## Delete

Delete a record.

```
DELETE /api/{entity}/{id}
```

---

### Data Persistence

All CRUD operations must permanently store data in the database.

Refreshing the application must not lose data.

---

# C. Database Design

Use one of the following databases:

* MySQL
* Microsoft SQL Server

The database must contain **at least two tables**.

## Table 1: Users

Suggested fields

| Field    | Type   |
| -------- | ------ |
| id       | Long   |
| username | String |
| email    | String |
| password | String |

Constraints

* Username UNIQUE
* Email UNIQUE
* Password NOT NULL

---

## Table 2: Main Entity

Use the entity designed in WEB Task 1.

Example fields:

| Field       | Type     |
| ----------- | -------- |
| id          | Long     |
| name        | String   |
| description | String   |
| createdAt   | DateTime |

You may modify these fields to match your existing frontend.

---

# D. Frontend Integration

The frontend has already been completed.

Requirements:

* Reuse the existing UI.
* Connect all pages to the Spring Boot REST APIs.
* Replace any mock/local data with backend data.
* Use Fetch API or Axios for HTTP requests.
* Display validation and server errors appropriately.
* Refresh data automatically after Create, Update, or Delete operations.

---

# Technical Requirements

## Backend Framework

* Java Spring Boot

Recommended dependencies:

* Spring Web
* Spring Data JPA
* Spring Security (optional but recommended)
* MySQL Driver or MSSQL Driver
* Lombok
* Validation

---

## RESTful API Design

Follow REST conventions.

Example API structure

```
POST    /api/auth/signup
POST    /api/auth/login
POST    /api/auth/logout

GET     /api/{entity}
GET     /api/{entity}/{id}
POST    /api/{entity}
PUT     /api/{entity}/{id}
DELETE  /api/{entity}/{id}
```

---

## Project Structure

The project should follow a clean layered architecture.

```
src
└── main
    ├── java
    │   └── com.example.project
    │       ├── controller
    │       ├── service
    │       │   ├── AuthService
    │       │   └── EntityService
    │       ├── repository
    │       ├── entity
    │       ├── dto
    │       ├── config
    │       ├── exception
    │       └── ProjectApplication.java
    │
    └── resources
        ├── application.properties
        └── static
```

---

# Non-Functional Requirements

## Input Validation

Validate all incoming requests.

Examples:

* Empty username
* Invalid email
* Password shorter than 6 characters
* Missing required fields

---

## Error Handling

Implement centralized exception handling using `@ControllerAdvice`.

Return consistent JSON responses.

Example:

```json
{
  "status": 400,
  "message": "Username already exists."
}
```

---

## Clean Code

The project should:

* Follow Java naming conventions.
* Separate business logic from controllers.
* Keep methods concise and maintainable.
* Use meaningful class and method names.

---

## User Interface

The frontend should:

* Maintain a clean and responsive design.
* Display loading indicators during API requests.
* Show user-friendly success and error messages.
* Provide confirmation before deleting data.

---

# Suggested Development Order

1. Configure Spring Boot project.
2. Connect to MySQL/MSSQL.
3. Create database entities.
4. Create repositories.
5. Implement services.
6. Develop authentication APIs.
7. Implement CRUD APIs for the main entity.
8. Test APIs using Postman.
9. Connect frontend to backend.
10. Perform end-to-end testing and fix any remaining issues.
