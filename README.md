# FlowMind 🧠

FlowMind is an AI-powered project and task management application designed to help individuals and teams organize their work efficiently. It combines a modern Kanban board interface with generative AI to automate task breakdowns and generate daily standup summaries.

## ✨ Features

* **Secure Authentication:** User login and registration using NextAuth.js (supports Credentials and Google OAuth).
* **Project Management:** Create, customize (color-code), and manage multiple projects.
* **Interactive Kanban Board:** Drag-and-drop task management across customizable columns (To Do, In Progress, In Review, Done) powered by `@dnd-kit`.
* **Rich Task Details:** Manage subtasks, priorities, due dates, and detailed descriptions.
* **AI Task Breakdown:** Simply input a high-level goal, and FlowMind's AI will automatically break it down into actionable subtasks with assigned priorities.
* **AI Standup Summaries:** Generate instant, motivating daily standup reports based on the current status of your project's tasks.
* **Dark Mode Support:** Fully integrated light and dark themes.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14/15](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
* **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
* **Authentication:** [NextAuth.js (v5)](https://authjs.dev/)
* **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) & Google Gemini (`gemini-1.5-flash`)
* **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
* **Drag & Drop:** [@dnd-kit](https://dndkit.com/)

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* A running PostgreSQL database instance
* A Google Cloud account (for Google OAuth & Gemini API Key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/flowmind.git](https://github.com/yourusername/flowmind.git)
   cd flowmind
````

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and fill in your details:

    ```bash
    cp .env.local.example .env.local
    ```

    *You can generate a `NEXTAUTH_SECRET` by running `openssl rand -base64 32` in your terminal.*

4.  **Initialize the Database:**
    Generate the Prisma client and push the schema to your PostgreSQL database:

    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Start the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the application.

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `.env.local` file:

| Variable | Description |
| :--- | :--- |
| `DATABASE_URL` | Your PostgreSQL connection string. |
| `NEXTAUTH_SECRET` | A random 32-character string for encrypting sessions. |
| `NEXTAUTH_URL` | The base URL of your application (e.g., `http://localhost:3000`). |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID (optional, for Google Login). |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret (optional). |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Google Gemini API key for AI features. |

## 📂 Project Structure

  * `/app`: Next.js App Router pages, layouts, and API routes.
  * `/components`: Reusable UI components (including `shadcn/ui` primitives and feature-specific components like the Kanban board and AI dialogs).
  * `/lib`: Utility functions, database configuration, AI setup, and validation schemas.
  * `/prisma`: Database schema definitions (`schema.prisma`).
  * `/store`: Zustand state management stores (e.g., UI state)