# TaskFlow — Task Management Platform

> **The Digital Curator** — A clean, role-based task management web application built for teams.

![TaskFlow Dashboard](./screenshots/dashboard.png)

---

## 🌐 Live Demo

🔗 [task-management-lime-phi.vercel.app](https://task-management-lime-phi.vercel.app)

---

## 📌 Overview

TaskFlow is a lightweight, role-based task management platform designed to help teams track, assign, and manage tasks efficiently. It features a minimal and intuitive UI with real-time task statistics and smooth authentication flow.

---

## ✨ Features

- 🔐 **Authentication System** — Secure Login & Registration with email/password
- 📊 **Dashboard Overview** — At-a-glance stats: Total Tasks, Completed, and Pending
- ✅ **Task Filtering** — Filter tasks by All, Pending, or Completed status
- 👤 **Role-Based Access** — Supports roles like Team Member (expandable to Admin, Manager)
- 🧑‍💼 **User Profile Display** — Shows logged-in user's name, avatar initials, and role badge
- 🗓️ **Date-Aware Greetings** — Personalized greeting with today's date
- 🔒 **Password Management** — Quick access to password settings from the header
- 📱 **Responsive Design** — Clean layout that works across screen sizes

---

## 🖼️ Screenshots

### Login Page
The authentication screen features a centered card layout with Login/Register toggle, email & password fields, and a prominent Sign In button.

### Dashboard (Team Member View)
After login, users see a personalized greeting, task stat cards (Total / Completed / Pending), and a filterable task list. Empty states are handled gracefully with a "No tasks found" message.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js / React |
| Styling | Tailwind CSS |
| Auth | Custom Auth System |
| Deployment | Vercel |

> *Update this table based on the actual stack used in the project.*

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/taskflow.git

# Navigate into the project
cd taskflow

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at `http://localhost:3000`

---

## 🔑 Authentication

| Action | Details |
|---|---|
| Login | Enter registered email and password |
| Register | Create a new account via the Register tab |
| Password | Manage password from the header after login |
| Logout | Click the Logout button in the top-right header |

---

## 📁 Project Structure

```
taskflow/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-based pages (login, dashboard, etc.)
│   ├── styles/         # Global styles / Tailwind config
│   └── utils/          # Helper functions
├── .env.local          # Environment variables (not committed)
├── package.json
└── README.md
```

> *Adjust the structure to match your actual codebase layout.*

---

## 👥 Roles

| Role | Capabilities |
|---|---|
| Team Member | View and manage assigned tasks |
| *(Admin)* | *(Planned) Assign tasks, manage users* |

---

## 🌱 Roadmap

- [ ] Admin panel for task assignment
- [ ] Due dates and priority levels for tasks
- [ ] Notifications and reminders
- [ ] Team/project grouping
- [ ] Activity log and audit trail
- [ ] Dark mode support

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "feat: add your feature"

# Push and open a PR
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Vishal Waghmare**  
B.Tech CSE | Business Analytics & AI Automation Enthusiast  
[GitHub](https://github.com/your-username) • [LinkedIn](https://linkedin.com/in/your-profile)

---

> *Built with focus, shipped with purpose. 🚀*
