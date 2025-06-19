#   <h1 style="margin: 0 auto">Programming School CRM Platform</h1>
This project is a custom Customer Relationship Management (CRM) platform designed for managing a programming school. It supports user management, order tracking, and administrative tasks with a scalable architecture. The stack includes **NestJS**, **TypeScript**, **MySQL**, and **Redis** for the backend, and **React** with **Redux Toolkit** for the frontend.
<div style="background-color: #e7e7e1; padding: 30px;">

<p>
<hr/>

<div style="display: flex; align-items: center; justify-content: center;flex-direction: column; color:black; padding:10px; border-radius:5px;margin: 0 auto;  text-align: center;">
  <img width="225" src="./frontend/public/Okten.jpg" alt="okten_logo" style="border-radius:50%;">
<p style="font-size: 3em; font-weight: bold; color: #5493d6; margin-top: 10px;">Okten School</p>
</div>
<div style="text-align: center; margin-top: 20px;">
<a href="https://www.npmjs.com/package/express" target="_blank"><img src="https://img.shields.io/npm/v/express.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/express" target="_blank"><img src="https://img.shields.io/npm/l/express.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/express" target="_blank"><img src="https://img.shields.io/npm/dm/express.svg" alt="NPM Downloads" /></a>
</div>
<p>Description</p>

## Features

- **User Management:** Role-based access control for Admins and Managers, including activation, banning, and password recovery.
- **Order Management:** Create, edit, delete, and view orders with details like course type, status, and comments.
- **Filters:** Filter orders by attributes such as name, email, course, status, and group.
- **Group Management:**  Add and assign groups to orders for better organization.
- **Filters:** Filter apartments by price and number of rooms.
- **Excel Export:** Generate Excel reports based on filtered order data.
- **API Documentation:** Swagger integration for testing and exploring API endpoints.
- **Email Notifications:** Send activation and recovery emails to managers.

## Technologies

- **Frontend**:
    - React (with TypeScript)
    - Redux Toolkit
    - Axios for API calls
    - Vite for development and build
- **Backend**:
    - NestJS (with TypeScript)
    - MySQL for relational data storage
    - Redis for caching
    - TypeORM for database interactions
    - Swagger for API documentation
-  **Infrastructure**:
    - Docker & Docker Compose
    - Nginx as a reverse proxy and static file server

## Setup Instructions

### 1. Clone the repository
Clone the repository to your local machine:

```bash
$ git clone https://github.com/ivan-andriichak/okten-crm.git
cd okten-crm
```

### 2. Build and Run with Docker
Using Docker Compose, you can run the entire application with live code reloading:

- **Prerequisites**:
  - Install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).
  - Ensure Docker Desktop is running.

From the root directory (okten-crm), run:

```markdown
docker-compose up --build 
```

```markdown
 cd backend
 npm install
```
```markdown
 cd frontend
 npm install
```

- **What happens**:

   - Backend: Builds and runs on port 5000 with nodemon for live reloading. Accessible at http://localhost:5000.
   - Frontend: Builds and runs a Vite development server on port 3000 with Hot Module Replacement (HMR). Accessible at http://localhost:3000.
   - MySQL: Runs as a database service (internal port 3306), connected to the backend.
   - Redis: Runs as a caching service (internal port 6379).
   - Nginx: Serves static files from frontend/dist and proxies API requests to the backend. Accessible at http://localhost (port 80).

- **Live Reloading**:
  - Changes in backend/src/ automatically restart the server.
  - Changes in frontend/src/ instantly update the app at http://localhost:3000.

Stop the application:

```markdown
docker-compose down
```

To stop and remove volumes (e.g., MySQL data):

```markdown
docker-compose down -v
```

### 3. Accessing the Application

| Service   | URL                                                     | Description                                    |
|-----------|---------------------------------------------------------|------------------------------------------------|
| Frontend  | http://localhost:3000                                   | React app with live updates (Vite dev server)  |
| Backend   | http://localhost:5000/docs or http://localhost/api/docs | Direct access to API (e.g., Swagger UI)        |
| Nginx     | http://localhost                                        | Static files + API proxy                       |

  - Note: In development, use http://localhost:3000 and http://localhost:5000 for the full experience with HMR. 
    Nginx (http://localhost) is more suited for production or testing static builds.

### 4. Key Configuration Files
**docker-compose.yml:**

 -  Defines services: backend, frontend, MySQL, Redis, and Nginx.
 -  aps ports: 5000:5000 (backend), 3000:3000 (frontend), 80:80 (Nginx).
 -  Mounts volumes for live code syncing and persistent storage.

**backend/package.json:**
 -  "start:dev": "nodemon --exec ts-node src/main.ts --watch src --legacy-watch" enables live reloading.
 
**frontend/package.json:**
 - "watch": "vite --mode development" runs the Vite dev server with HMR.

**vite.config.js:**
 -  Configures Vite to proxy /api requests to http://backend:5000 and use polling for file watching.

**nginx.conf:**
 - Serves static files from /usr/share/nginx/html (mapped to frontend/dist) 
 - and proxies /api/ to the backend.

### 5. Using Swagger for API Testing

The backend includes Swagger UI for interactive API documentation and testing.

#### Access Swagger:
 - Start the application with docker-compose up --build.
 - Open your browser and navigate to:
  http://localhost:5000/docs/

 - Test endpoints like GET http://localhost:5000/api directly in Swagger.
 - To get the raw Swagger JSON, open:
   http://localhost:5000/swagger-json

### Via Nginx:
 - Alternative, use:

http://localhost/api/docs/

### 6. Testing the Application

### Frontend:

- Open http://localhost:3000.
- Edit a file in frontend/src/ (e.g., Orders.tsx) and verify the page updates instantly.
- Make an API call (e.g., fetch orders) and check the browser console (F12 → Network).

### Backend:

Open http://localhost:5000/docs/.
Edit backend/src/main.ts (e.g., add a console.log), then check logs:

```markdown
docker-compose logs backend
```
- Use curl or Postman

```markdown
curl http://localhost:5000/api/orders
```
### Nginx:
  - Open http://localhost to test static files (requires a built dist folder).
  - Test API proxy:
```markdown
curl http://localhost/api/orders
```

### 7. Local Development (Optional)
If you prefer to run without Docker:

### Backend:

```markdown
 cd backend
 npm install
npm run build
npm run start
```
 - Runs on http://localhost:5000 with live reloading.

### Frontend:

```markdown
cd frontend
npm install
npm run build 
npm run start
```
  - Runs on http://localhost:3000 with HMR.
  - Ensure baseURL in frontend/src/services/api.ts is set to http://localhost:5000/.

- **Note: npm run dev starts the Vite development server (default port: 5173).**
 - Adjust .env variables in backend/environments/local.env (e.g., MySQL and Redis connections) if needed.

## Notes

- Ensure environment variables are set in backend/environments/local.env or prod.env for MySQL, Redis, and AWS (if used).
- Adjust .env variables in backend/.env (e.g., MongoDB URI) if needed.
- Use the provided Postman collection (backend/docs/postman_collection.json) for additional API testing.
- Database migrations are managed via TypeORM in backend/src/database/migrations/.

**Support**

For questions or support, contact the author:





**Author**: Ivan Andriichak



**GitHub**: https://github.com/ivan-andriichak



Twitter: @nestframework

License

This project is MIT licensed.
</div>