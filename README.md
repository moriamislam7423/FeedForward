
# FeedForward

FeedForward is a web platform that aims to connect local food businesses with volunteers, shelters, and community recipients to reduce food waste and support those in need. It bridges the gap between available surplus food and the people who need it most by replacing inconsistent, informal community networks with a streamlined redistribution system.

### Group Members
* Normand Boris Manzi
* Moriam Islam
* Faiza Sarker 
* Jiecong Wu 

## 🚀 Key Features
* **Dynamic Inventory:** Businesses can post available surplus inventory with photos, dietary information, and automatic expiration timers to ensure food is claimed while fresh.
* **Interactive Volunteer Map:** Volunteers use an interactive map interface to locate and claim nearby pickups.
* **Secure Handoffs:** To ensure food safety and a secure chain of custody, the platform utilizes a One-Time PIN (OTP) system where businesses must verify a unique code provided to the volunteer on-site.
* **Real-time Notifications:** Recipients and shelters receive real-time notifications when relevant food becomes available in their area.
* **Impact Dashboards:** Interactive dashboards calculate and display personal impact metrics like "Pounds of Food Rescued" and "CO2 Emissions Diverted" to incentivize volunteer participation.

## 💻 Tech Stack
**Frontend:**
* ReactJS 
* Tailwind CSS 
* Google Maps API / Mapbox (for live tracking and community maps) 
* Recharts (for interactive impact dashboards) 

**Backend:**
* NodeJS & Express 
* MongoDB 
* Cloudinary (for image uploading and hosting) 
* Web Push / FCM (for in-browser push notifications) 

## 📂 Project Structure
This project follows a lean, functional MERN stack architecture:

```text
feedforward/
├── client/                     # React frontend
│   ├── public/                 # PWA manifest & service workers
│   └── src/
│       ├── components/         # Reusable UI pieces
│       ├── pages/              # One file per route/screen
│       ├── services/           # api.js — centralized Axios calls
│       └── context/            # Global state (AuthContext)
│
├── server/                     # NodeJS/Express backend
│   ├── models/                 # Mongoose schemas (User, Listing, Claim, Notification)
│   ├── routes/                 # Express routes + embedded controller logic
│   ├── middleware/             # Custom middleware (JWT verify, rate limiters)
│   ├── utils/                  # Helper functions (Cloudinary API, Crypto generators)
│   ├── .env                    # Local environment variables
│   └── app.js                  # Express setup, DB connection, and route mounting
│
├── .gitignore
└── package.json
```

