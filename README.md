# Golf Charity Subscription Platform

A modern, full-stack web application designed for a golf-themed charity subscription service. Built with a stunning glassmorphism UI, real-time updates, and secure payment processing.

## 🚀 Overview

The Golf Charity Subscription Platform allows users to subscribe to charitable causes while participating in golf-related events and draws. The platform features a premium admin dashboard for managing subscriptions, tracking draws, and optimizing workflows with real-time feedback.

### Key Features
- **Premium Admin Dashboard**: Overhauled with a glassmorphism design for a modern, sleek aesthetic.
- **Draw Engine**: Integrated administrative tools for managing charity draws and participant updates.
- **Subscription Management**: Secure handling of member subscriptions via Stripe.
- **Real-time Notifications**: A unified toast system for non-blocking user feedback.
- **Supabase Integration**: Robust backend for data persistence and authentication.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Feedback**: [React Hot Toast](https://react-hot-toast.com/)

### Backend
- **Server**: [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Payments**: [Stripe](https://stripe.com/)
- **Automation**: Custom scripts for Stripe price creation and storage setup.

---

## 📂 Project Structure

```text
GolfCharitySubscriptionPlatform/
├── frontend/               # React (Vite) frontend application
├── backend/                # Node.js (Express) server-side logic
├── database_schema.sql    # Database schema for Supabase setup
└── README.md               # Main project documentation
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (Latest LTS version)
- npm or yarn
- Supabase Project & API Keys
- Stripe API Keys

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your Environment Variables:
   Create a `.env` file in the `backend` directory with the following:
   ```env
   PORT=5000
   SUPABASE_URL=
   SUPABASE_SERVICE_KEY=
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   STRIPE_PRICE_MONTHLY=
   STRIPE_PRICE_YEARLY=

   ```
4. Start the server (Dev Mode):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your Environment Variables:
   Create a `.env` file in the `frontend` directory with the following:
   ```env
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   VITE_API_URL=http://localhost:5000
   ```
4. Run the application:
   ```bash
   npm run dev
   ```

---

## 🔒 License
This project is licensed under the ISC License.
