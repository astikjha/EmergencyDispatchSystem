# 🚑 AI-Powered Real-Time Emergency Response & Ambulance Dispatch System

A production-quality full-stack system that dispatches ambulances to emergencies in real-time using AI severity classification, Dijkstra's shortest path algorithm, and WebSocket live updates.

**Live Demo:** https://emergencydispatchsystem.onrender.com/docs  
**GitHub:** https://github.com/astikjha/EmergencyDispatchSystem

---

## 🎯 Project Highlights

- **AI/ML** — Random Forest classifier predicts emergency severity (Critical/High/Medium/Low) from patient symptoms
- **DSA** — Dijkstra's algorithm on a weighted graph finds the shortest ambulance route using real GPS coordinates
- **Real-Time** — WebSockets push live updates to all connected clients instantly without polling
- **Full-Stack** — React frontend + FastAPI backend + PostgreSQL database
- **Deployed** — Dockerized and live on Render with Supabase cloud database

---

## 🏗️ System Architecture

```
React Frontend (Vite + Tailwind CSS)
        ↓ Axios HTTP + WebSocket
FastAPI Backend
        ↓
   ┌─────────────────────────────┐
   │  Dispatch Service           │
   │  ├── ML Severity Classifier │
   │  ├── Route Planner          │
   │  │   ├── Graph (Adj. List)  │
   │  │   ├── Dijkstra + Heap    │
   │  │   └── Haversine Formula  │
   │  └── WebSocket Manager      │
   └─────────────────────────────┘
        ↓
   PostgreSQL (Supabase Cloud)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Axios, React Router |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL (Supabase) |
| AI/ML | Scikit-Learn, Random Forest, TF-IDF Vectorizer |
| DSA | Graph, Dijkstra, Min-Heap Priority Queue, Haversine |
| Real-Time | FastAPI WebSockets |
| Deployment | Docker, Docker Compose, Render |

---

## 🧠 DSA Implementation

### Graph + Dijkstra's Algorithm
- City modeled as a **weighted undirected graph** using adjacency list (hash map)
- **Dijkstra's algorithm** with **min-heap priority queue** finds the shortest path
- **Haversine formula** calculates real-world GPS distances in kilometers
- Two-leg routing: ambulance → patient → hospital with combined ETA

### OOP Design Patterns
- `BaseEntity` — parent class with shared fields using **inheritance**
- `Ambulance`, `Hospital`, `Patient` — encapsulated entity classes
- `EmergencyRequest` — connects all entities, manages state transitions
- `DispatchCenter` — **Singleton pattern**, central coordinator using hash maps
- `RoutePlanner` — **Strategy pattern** for pluggable routing logic

### AI/ML Pipeline
- **TF-IDF Vectorizer** converts symptom text into numerical feature vectors
- **Random Forest** (100 decision trees) classifies severity with confidence scores
- Returns probability distribution: Critical / High / Medium / Low

---

## ✨ Key Features

- 🚨 Report emergencies with patient name, symptoms, and GPS location
- 🤖 AI predicts severity in real-time using trained Random Forest model
- 🗺️ Finds nearest available ambulance using Haversine GPS distance
- 🏥 Finds nearest hospital with available beds
- 📍 Calculates optimal two-leg route with ETA using Dijkstra's algorithm
- 📡 WebSocket broadcasts live updates to all connected dashboards
- 🚑 Live ambulance location tracking with real-time coordinate updates
- 🏥 Live hospital bed occupancy with color-coded capacity bars
- ✅ Complete emergency lifecycle — create, dispatch, complete, release

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ambulances/` | List all ambulances |
| POST | `/ambulances/` | Register new ambulance |
| PUT | `/ambulances/{id}/location` | Update live GPS location |
| GET | `/hospitals/` | List all hospitals |
| POST | `/hospitals/` | Register new hospital |
| POST | `/emergencies/` | Create emergency + ML severity prediction |
| POST | `/emergencies/{id}/dispatch` | Dispatch ambulance via Dijkstra routing |
| POST | `/emergencies/{id}/complete` | Complete emergency, free ambulance |
| POST | `/ml/predict-severity` | Standalone ML severity prediction |
| WS | `/ws` | WebSocket connection for live updates |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Docker (optional)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/emergency_dispatch
```

```bash
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Docker Setup

```bash
docker compose up --build
```

Runs both backend and PostgreSQL together in containers.

---

## 📁 Project Structure

```
EmergencyDispatchSystem/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── entities.py           # OOP classes (Ambulance, Hospital, Patient)
│   │   │   ├── graph.py              # Graph + Dijkstra's algorithm
│   │   │   ├── route_planner.py      # Routing and ETA calculation
│   │   │   ├── dispatch_center.py    # Singleton dispatch coordinator
│   │   │   ├── database.py           # PostgreSQL connection
│   │   │   └── websocket_manager.py  # WebSocket connection manager
│   │   ├── models/
│   │   │   ├── db_models.py          # SQLAlchemy database models
│   │   │   └── schemas.py            # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── ambulance.py          # Ambulance API endpoints
│   │   │   ├── hospital.py           # Hospital API endpoints
│   │   │   ├── emergency.py          # Emergency + dispatch endpoints
│   │   │   ├── ws.py                 # WebSocket endpoint
│   │   │   └── ml.py                 # ML prediction endpoint
│   │   ├── services/
│   │   │   └── dispatch_service.py   # Core business logic
│   │   ├── ml/
│   │   │   ├── severity_classifier.py # Random Forest model
│   │   │   └── training_data.py       # Labeled training dataset
│   │   └── main.py                   # FastAPI app entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx         # Live overview dashboard
│       │   ├── CreateEmergency.jsx   # Emergency reporting form
│       │   ├── AmbulanceTracking.jsx # Live ambulance tracker
│       │   └── HospitalView.jsx      # Hospital capacity view
│       └── api/
│           └── api.js                # Axios API configuration
├── docker-compose.yml
└── README.md
```

---

## 🎓 Interview Topics Covered

- **Graph Theory** — adjacency list representation, weighted edges
- **Dijkstra's Algorithm** — shortest path with min-heap, time complexity O((V+E) log V)
- **OOP** — encapsulation, inheritance, polymorphism, abstraction
- **Design Patterns** — Singleton, Strategy
- **REST API Design** — proper HTTP methods, status codes, request/response schemas
- **WebSockets** — persistent bidirectional connections, broadcast pattern
- **Machine Learning** — ensemble methods, TF-IDF, classification, confidence scores
- **Docker** — containerization, multi-container orchestration
- **Database Design** — relational schema, foreign keys, SQLAlchemy ORM

---

## ⚠️ Note on Free Tier

This project is deployed on Render's free tier. The server may take **30-50 seconds** to respond after a period of inactivity (cold start). This is expected behavior for free deployments.

---

## 👨‍💻 Author

**Astik Jha**  
B.Tech CSE — Malaviya National Institute of Technology (MNIT), Jaipur  

- GitHub: [@astikjha](https://github.com/astikjha)