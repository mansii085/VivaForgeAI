<div align="center">
  <h1>🚀 VivaForge AI</h1>
  <p><strong>A Full-Stack, AI-Powered Career Preparation Platform</strong></p>
</div>

> **VivaForge AI** is a comprehensive career readiness tool that helps job seekers manage resumes, check ATS compatibility, match job descriptions, practice mock interviews with AI feedback, track learning roadmaps, and chat with their career documents. Built as a scalable **pnpm monorepo**.

---

## 📑 Table of Contents
- [✨ Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [🛠️ Project Architecture](#️-project-architecture)
- [⚙️ Getting Started](#️-getting-started)
- [🗺️ Roadmap & Known Limitations](#️-roadmap--known-limitations)
- [🤝 Contributing](#-contributing)
- [📄 License & Author](#-license--author)

---

## ✨ Features

<details open>
<summary><b>📄 Resume Management</b></summary>
Upload PDF resumes and automatically extract raw text using <code>pdf-parse</code>. Employs <b>Google Gemini</b> to parse resumes into structured data (Name, Skills, Experience, Education, Projects) while maintaining version history for each user.
<br><br>
</details>

<details>
<summary><b>🎯 ATS Resume Analyzer</b></summary>
Returns an AI-generated ATS score for any uploaded PDF resume. Breaks down formatting, impact metrics, and keyword usage. Provides actionable, categorized improvement suggestions.
<br><br>
</details>

<details>
<summary><b>💼 Job Description Matcher</b></summary>
Compares your stored resume against a pasted job description to provide an overall match percentage, highlight missing/matched skills, and estimate interview difficulty.
<br><br>
</details>

<details>
<summary><b>🎤 AI Mock Interview</b></summary>
Generates role- and company-specific interview questions (technical, HR, behavioral). Evaluates your answers with a score, strengths, areas for improvement, and ideal answers, finishing with a comprehensive readiness scorecard.
<br><br>
</details>

<details>
<summary><b>📚 Learning Hub</b></summary>
Generates a week-by-week, personalized learning roadmap toward a target role based on your current skillset. Tracks topic-level progress seamlessly.
<br><br>
</details>

<details>
<summary><b>🤖 AI Career Assistant (Document Q&A)</b></summary>
Upload career-related documents (PDF/TXT) and ask questions. The AI answers using your documents as context, providing source citations. *(Note: Currently uses context-stuffing; vector-based RAG is planned).*
<br><br>
</details>

<details>
<summary><b>🔐 Authentication & Dashboard</b></summary>
Secure Email/Password auth via <b>JWT access + refresh token rotation</b> (httpOnly cookie), Google OAuth 2.0 integration, and a centralized dashboard to track all your career prep progress.
</details>

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4, Zustand, TanStack React Query, Framer Motion, React Router, Recharts |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB + Mongoose |
| **AI** | Google Gemini API (`@google/generative-ai`) |
| **File Uploads** | Multer (in-memory) + Cloudinary (avatar/media) |
| **Auth** | JWT (access + refresh), Passport Google OAuth 2.0, bcrypt |
| **Validation** | Zod (shared schemas between client & server) |
| **Tooling** | pnpm workspaces (Monorepo) |

---

## 🛠️ Project Architecture

```text
VivaForge AI/
├── client/                  # React + Vite SPA
│   └── src/
│       ├── components/      # Layout & Shared UI
│       ├── features/        # Auth, Resume, ATS, Interview, Learning, RAG, etc.
│       ├── lib/             # Axios instance & React Query client
│       └── store/           # Zustand auth/UI store
│
├── server/                  # Express + TypeScript API
│   └── src/
│       ├── config/          # Environment, DB, Cloudinary setup
│       ├── features/        # Model → Service → Route implementation
│       ├── middleware/      # Auth guard, Error handler, Validation, Upload
│       └── utils/           # AI JSON response parsing helper
│
└── shared/                  # Shared Types, Zod Schemas & Constants
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [pnpm](https://pnpm.io/) (v9 or higher)
- A [MongoDB](https://www.mongodb.com/) Database (Local or Atlas)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone & Install

```bash
git clone https://github.com/mansii085/VivaForge-AI.git
cd VivaForge-AI
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:
```bash
cp .env.example .env
```

| Variable | Required | Notes |
|---|:---:|---|
| `PORT`, `NODE_ENV`, `CLIENT_URL` | ✅ | Server basics |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | ✅ | Use long random strings (32+ chars) |
| `GEMINI_API_KEY` | ✅ | Required for all AI features |
| `GOOGLE_CLIENT_ID/SECRET` | ⬜ | For Google OAuth login |
| `CLOUDINARY_*` | ⬜ | For avatar/media uploads |

> [!WARNING]  
> **Security Notice:** Never commit your real `.env` file. Keep your keys secure and rotate them if exposed.

### 3. Run in Development

```bash
pnpm dev
```
> Runs the client (`http://localhost:5173`) and server (`http://localhost:5000`) concurrently.

### 4. Build for Production

```bash
pnpm build
```

---

## 🗺️ Roadmap & Known Limitations

> **Transparency Note:** Here is the current state of the project to help prioritize next steps.

- **RAG Architecture:** Uploaded documents are chunked by word count and stuffed into the prompt. **Next step:** Integrate real embedding-based retrieval (e.g., Pinecone).
- **Password Reset:** Tokens are generated and logged to the server console. An email provider (Resend/SMTP) needs to be integrated.
- **Data Fetching:** React Query is installed but most pages still use `useState`/`useEffect`.
- **Testing:** A `test` script exists, but automated tests (unit/integration) need to be written.
- **File Storage:** Resume binaries are currently stored directly in MongoDB. Migrating this to Cloudinary/AWS S3 is planned for better scalability.

### 🌟 Planned Features
- [ ] Real vector-based RAG (Pinecone/embeddings)
- [ ] AI Resume Builder & Cover Letter Generator
- [ ] Voice-based mock interviews
- [ ] Company-specific interview question banks
- [ ] Admin analytics dashboard
- [ ] CI/CD pipeline & Docker setup

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License & Author

- **Author:** [Mansi Murvariya](https://github.com/mansii085)
- **License:** Developed for educational and portfolio purposes.

<div align="center">
  <b>⭐ If you found this project useful or interesting, please consider giving it a star! ⭐</b>
</div>
