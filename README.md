# NextChapter

NextChapter is a book rental platform that connects book owners with seekers, allowing owners to list books for rental and seekers to browse and request books.

## Features

### What's Working
* **User Authentication & Authorization**
   * Registration, login, logout with session management
   * Role-based access control (Owners vs Seekers)
   * Profile updates (except password bug)
   * Public profile viewing
* **Book Management**
   * Owners can create/update/delete books
   * Available/rented status system
   * Search with title/author/location/genre filters (partial functionality)
   * Separate views for owned books (owners) vs rented books (seekers)
   * Book request system
* **Core Features**
   * Session-based authentication
   * Pagination-free book listings
   * Basic error handling

### What's Not Working
* **Password Update Bug**
   * Corrupts user data when updating password (critical issue)
* **Search/Filter Limitations**
   * Partial implementation of filters (works for some but not all combinations)

### Bonus Features Implemented
1. Advanced role-based access control system
2. Hybrid book status system (available/rented)
3. Composite search filters (title + location + genre)
4. Rental history endpoints
5. Session management with automatic cookie handling
6. Public/private profile separation

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Go with GoGin Framework
- **Data Storage**: JSON files (users.json, books.json)

## Setup Instructions

### Prerequisites

- Node.js (v20.0.0 or higher)
- Go (v1.20 or higher)
- NPM or Yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

3. Install CompileDaemon for hot-reloading:
   ```bash
   go install github.com/githubnemo/CompileDaemon@latest
   ```

4. Run the server with CompileDaemon:
   ```bash
   CompileDaemon -command="./server" -build="go build -o server main.go"
   ```

The backend server will start on `http://localhost:8080` by default.

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The frontend will be available at `http://localhost:3000`.

## Project Structure

```
└── NextChapter/
    ├── README.md
    ├── client/                # Next.js frontend
    │   ├── src/
    │   │   ├── app/           # Next.js app router pages
    │   │   ├── components/    # React components
    │   │   ├── contexts/      # React contexts (Auth)
    │   │   ├── lib/           # Utility functions and API clients
    │   │   └── types/         # TypeScript type definitions
    └── server/                # Go backend
        ├── data/              # JSON data storage
        ├── handlers/          # HTTP route handlers
        ├── middleware/        # Authentication middleware
        └── models/            # Data models and persistence
```

## API Endpoints
## Authentication

POST /api/register - Register a new user
POST /api/login - User login
POST /api/logout - User logout (authenticated)
GET /api/me - Get current user info (authenticated)

## Users

GET /api/users/:id - Get user profile by ID (authenticated)
PUT /api/me - Update current user profile (authenticated)
GET /api/admin/users - List all users (owner only)

## Books

GET /api/books - List all books (with optional filters)
GET /api/search - Search books with filters
GET /api/books/:id - Get book details
POST /api/books - Add a new book (authenticated)
PUT /api/books/:id - Update book details (authenticated, owner of book)
DELETE /api/books/:id - Delete a book (authenticated, owner of book)
GET /api/my-books - Get all books associated with current user
GET /api/books/owned - Get books owned by current user
GET /api/rented-books - Get books rented by current user
POST /api/books/:id/request - Request to rent a book (authenticated)
PATCH /api/books/:id/status - Update book status (authenticated)

## Authentication

The application uses session-based authentication with cookies. Once logged in, the session cookie is automatically included in all subsequent requests.

## Role-Based Access Control

- **Owners**: Can add, edit, and delete their own books. Can approve rental requests.
- **Seekers**: Can browse books, send rental requests, and return rented books.

## AI Tools Used

* **DeepSeek** - Backend architecture optimization
* **Gork** - Critical bug resolution in session management
* **Claude**
   * Frontend scaffold generation
   * Initial API structure design
   * Boilerplate reduction for React components

## Known Issues

1. Password updates can corrupt user data - avoid using this functionality
2. Some search filter combinations may not work correctly
3. Security concerns with plaintext password storage
4. No email validation during user registration
