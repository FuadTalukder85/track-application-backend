# 💼 Job Application Tracker — Backend API

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-8.x-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/pnpm-10.x-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
</p>

A clean, robust, and strongly-typed RESTful API for tracking and managing job applications, interview stages, compensation details, and pipeline statistics.

---

## 🌟 Features

- **Full Application CRUD**: Create, read, update, and delete job applications with rich metadata.
- **Search & Filtering**: Multi-field full-text search (company, title, location, notes, requirements) and discrete filtering by status, work mode, and job type.
- **Sorting & Pagination**: Configurable sort fields (application date, company name, salary) with ascending/descending order and pagination support.
- **Analytics & Statistics**: Dedicated `/api/applications/stats` endpoint returning breakdown counts across stages, work modes, and job types.
- **Strong Typing**: Built entirely in TypeScript with strict Mongoose data modeling and validation.
- **Error Handling**: Centralized error middleware with standardized JSON responses.

---

## 🏗️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Development Tooling**: `tsx` (TypeScript Execute & Watch)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                         # MongoDB connection logic & DNS resolver
│   ├── controllers/
│   │   └── jobApplicationController.ts   # CRUD logic & aggregation analytics
│   ├── middlewares/
│   │   └── errorHandler.ts               # Centralized error handler
│   ├── models/
│   │   └── JobApplication.ts             # Mongoose Schema & TypeScript interfaces
│   ├── routes/
│   │   └── jobApplicationRoutes.ts       # Express router endpoints
│   └── index.ts                          # App entry point, middleware & server init
├── .env.example                          # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📋 Data Schema

| Field | Type | Description | Values / Example |
|---|---|---|---|
| `companyName` | `String` (Required) | Name of the hiring company | `"Google"`, `"Stripe"` |
| `jobTitle` | `String` (Required) | Title of the position | `"Senior Full-Stack Engineer"` |
| `jobDescription` | `String` | Role overview and mission | Full text / markdown |
| `jobRequirements`| `String` | Qualifications and tech stack | `"React, Node, TypeScript"` |
| `jobLocation` | `String` | Physical office or remote base | `"San Francisco, CA"`, `"Remote"` |
| `jobType` | `String` (Enum) | Employment category | `Full-time`, `Part-time`, `Contract`, `Internship`, `Freelance`, `Other` |
| `workMode` | `String` (Enum) | Workplace flexibility | `Remote`, `Hybrid`, `On-site` |
| `jobPostingUrl` | `String` | Direct link to posting | `"https://careers.google.com/..."` |
| `applicationDate`| `Date` | Date application was submitted | Defaults to `Date.now` |
| `salaryRange` | `String` | Advertised compensation range | `"$130,000 - $160,000"` |
| `expectedSalary` | `Number` | Your desired compensation | `145000` |
| `currentSalary` | `Number` | Baseline compensation | `120000` |
| `offeredSalary` | `Number` | Final offer amount | `155000` |
| `salaryCurrency` | `String` | Currency symbol/code | `"USD"`, `"EUR"`, `"GBP"`, `"CAD"`, `"BDT"`, `"INR"` |
| `applicationStatus`| `String` (Enum) | Current stage in pipeline | `Wishlist`, `Applied`, `Screening`, `Interview`, `Technical Assessment`, `Offer`, `Rejected`, `Withdrawn` |
| `notes` | `String` | Follow-ups, contacts, referral notes | Freeform text |

---

## 🔌 API Endpoints

### Base URL: `http://localhost:5000/api`

### 1. Applications

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/applications` | Create a new job application |
| `GET` | `/applications` | List applications with search, filtering, and sorting |
| `GET` | `/applications/:id` | Retrieve single application by ID |
| `PUT` | `/applications/:id` | Update entire application |
| `PATCH` | `/applications/:id` | Partially update application (e.g. status) |
| `DELETE`| `/applications/:id` | Remove an application |

#### Query Parameters for `GET /api/applications`:
- `search` (string) — Searches across `companyName`, `jobTitle`, `jobLocation`, `jobRequirements`, and `notes`.
- `status` (string) — Filter by application status (`Applied`, `Interview`, etc.)
- `jobType` (string) — Filter by job type (`Full-time`, `Contract`, etc.)
- `workMode` (string) — Filter by work mode (`Remote`, `Hybrid`, `On-site`)
- `sortBy` (string) — Field to sort by (`applicationDate`, `companyName`, `jobTitle`, `expectedSalary`). Default: `applicationDate`
- `sortOrder` (`asc` \| `desc`) — Default: `desc`
- `page` (number) — Page number (Default: `1`)
- `limit` (number) — Results per page (Default: `50`)

---

### 2. Analytics & Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/applications/stats` | Aggregated metrics (total count, status breakdown, work mode breakdown) |
| `GET` | `/health` | Health check probe |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **pnpm** installed globally (`npm install -g pnpm`)
- **MongoDB** instance (Local MongoDB server or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FuadTalukder85/track-application-backend.git
   cd track-application-backend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.az94fyn.mongodb.net/job-tracker
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   > Server will start at **http://localhost:5000** with hot reloading enabled.

5. **Build for Production:**
   ```bash
   pnpm build
   pnpm start
   ```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `pnpm dev` | Starts development server with `tsx watch` |
| `build` | `pnpm build` | Compiles TypeScript into JavaScript (`dist/`) |
| `start` | `pnpm start` | Runs compiled production build from `dist/index.js` |

---

## 🛡️ License

This project is licensed under the **ISC License**.
