# CheckAround 🗺️

> **Discover events happening around your location — in real time.**

CheckAround is a full-stack event discovery web platform that lets users search and explore local events based on their location. It aggregates event data through web scraping and provides a clean, fast interface to find what's happening near you.

🌐 **Live:** [check-around1.vercel.app](https://check-around1.vercel.app)
📁 **Repo:** [github.com/piyushandpiyush/CheckAround](https://github.com/piyushandpiyush/CheckAround)

---

## ✨ Features

- 📍 **Location-based event search** — find events happening around your area
- 🔍 **Web scraping** — real-time event data fetched using Cheerio
- 🗂️ **Event listing & filtering** — browse events by category and city
- 🔐 **Admin panel** — secure authentication for admins to manage and verify events
- ✅ **Admin verification layer** — only admin-approved events are published publicly
- 👥 **Role-based access** — User, Volunteer, and Admin roles with dedicated interfaces
- 📱 **Responsive UI** — works seamlessly on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Express.js (Node.js) |
| Database | MongoDB |
| Web Scraping | Cheerio |
| Authentication | JWT (Admin Panel) |
| Deployment | Vercel (Frontend) |

---

## 📁 Project Structure

```
CheckAround/
├── frontend/          # React.js client
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
│
├── backend/           # Express.js server
│   ├── routes/
│   ├── models/        # MongoDB schemas
│   ├── scraper/       # Cheerio web scraping logic
│   ├── middleware/    # Auth middleware
│   └── server.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/piyushandpiyush/CheckAround.git
cd CheckAround
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`

---

## 🔐 Admin Panel

The admin panel is protected by JWT-based authentication. Admins can:

- Review and verify user-submitted events
- Publish or reject event listings
- Manage all platform content

To access the admin panel, navigate to `/admin` and log in with admin credentials.

---

## 🌍 How It Works

1. User visits the platform and enters their location or allows location access
2. The backend scrapes event data from external sources using **Cheerio**
3. Community-submitted events are stored in **MongoDB** and queued for admin review
4. Admin verifies and publishes events through the **Admin Panel**
5. Users browse, filter, and discover verified local events

---

## 📸 Screenshots

> _Add screenshots of the home page, event listing, and admin panel here._

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "Add: your feature description"

# Push and open a PR
git push origin feature/your-feature-name
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Piyush Kumar**
- GitHub: [@piyushandpiyush](https://github.com/piyushandpiyush)
- LinkedIn: [piyushkumar](https://www.linkedin.com/in/piyush-kumar-66a379310)
- Email: piyushkumarbgp417@gmail.com
