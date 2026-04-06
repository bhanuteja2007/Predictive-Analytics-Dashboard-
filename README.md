# Predictive Analytics Dashboard

End-to-end ML application with a React frontend, Flask REST API, Scikit-learn models, and MongoDB persistence.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| ML / Data  | Python, Scikit-learn, Pandas, NumPy     |
| Backend    | Flask, Flask-CORS, Gunicorn             |
| Database   | MongoDB (via PyMongo)                   |
| Frontend   | React.js, Recharts, React Router        |

---

## Project Structure

```
predictive-analytics/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   ├── ml_pipeline.py      # Train / predict / compare models
│   │   └── saved/              # Persisted model files (auto-created)
│   ├── routes/
│   │   └── api.py              # All REST endpoints
│   └── utils/
│       └── db.py               # MongoDB helpers
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js              # Shell + routing
│       ├── App.css             # Global styles
│       ├── index.js
│       ├── utils/
│       │   └── api.js          # Axios client
│       ├── components/
│       │   ├── ModelComparisonChart.jsx
│       │   └── FeatureImportanceChart.jsx
│       └── pages/
│           ├── DashboardPage.jsx
│           ├── TrainPage.jsx
│           ├── PredictPage.jsx
│           └── HistoryPage.jsx
└── data/
    └── generate_samples.py     # Generate CSV test datasets
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Run the Flask server
python app.py
# → http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

### 3. Generate sample data (optional)

```bash
cd data
python generate_samples.py
# Creates: classification_sample.csv  (churn prediction)
#          regression_sample.csv       (house price prediction)
```

---

## API Reference

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | `/api/health`               | Health check                       |
| POST   | `/api/train`                | Train all models on a dataset      |
| POST   | `/api/predict`              | Single prediction                  |
| POST   | `/api/predict/batch`        | Batch predictions                  |
| GET    | `/api/models`               | Model info + feature importance    |
| GET    | `/api/history/predictions`  | Prediction history from MongoDB    |
| GET    | `/api/history/training`     | Training run history               |

### Train (JSON body)

```json
POST /api/train
{
  "task_type": "classification",
  "target_col": "churn",
  "data": [
    { "age": 35, "tenure_months": 12, "monthly_charges": 65.5, "churn": 1 },
    ...
  ]
}
```

### Train (CSV upload)

```bash
curl -X POST http://localhost:5000/api/train \
  -F "file=@classification_sample.csv" \
  -F "task_type=classification" \
  -F "target_col=churn"
```

### Predict

```json
POST /api/predict
{
  "task_type": "classification",
  "input": {
    "age": 42,
    "tenure_months": 6,
    "monthly_charges": 89.99,
    "support_calls": 5,
    "satisfaction": 2
  }
}
```

---

## ML Models Compared

**Classification**
- Logistic Regression
- Random Forest Classifier
- Gradient Boosting Classifier
- SVM (with probability)
- K-Nearest Neighbors

**Regression**
- Linear Regression
- Ridge / Lasso
- Random Forest Regressor
- Gradient Boosting Regressor

The best model is selected automatically by accuracy (classification) or R² score (regression) and saved to `backend/models/saved/`.

---

## Deployment (Cloud)

```bash
# Backend — Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Frontend — production build
cd frontend && npm run build
# Serve the build/ folder with Nginx or any static host
```

Set `REACT_APP_API_URL=https://your-api-domain.com/api` in the frontend environment before building.

---

## Environment Variables

| Variable    | Default                                          | Description          |
|-------------|--------------------------------------------------|----------------------|
| `MONGO_URI` | `mongodb://localhost:27017/predictive_analytics` | MongoDB connection   |
| `FLASK_ENV` | `development`                                    | Flask environment    |
| `PORT`      | `5000`                                           | API server port      |
| `SECRET_KEY`| —                                                | Flask secret key     |
