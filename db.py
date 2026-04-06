from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/predictive_analytics")

client = None
db = None


def get_db():
    global client, db
    if db is None:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()
    return db


def save_prediction(task_type, input_data, result):
    database = get_db()
    record = {
        "task_type": task_type,
        "input": input_data,
        "prediction": result.get("prediction"),
        "confidence": result.get("confidence"),
        "model_used": result.get("model_used"),
        "timestamp": datetime.utcnow(),
    }
    database.predictions.insert_one(record)
    return str(record.get("_id", ""))


def save_training_run(task_type, results, best_model, dataset_size):
    database = get_db()
    record = {
        "task_type": task_type,
        "results": results,
        "best_model": best_model,
        "dataset_size": dataset_size,
        "timestamp": datetime.utcnow(),
    }
    database.training_runs.insert_one(record)
    return str(record.get("_id", ""))


def get_prediction_history(task_type=None, limit=50):
    database = get_db()
    query = {"task_type": task_type} if task_type else {}
    records = list(
        database.predictions.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )
    for r in records:
        if "timestamp" in r:
            r["timestamp"] = r["timestamp"].isoformat()
    return records


def get_training_history(limit=10):
    database = get_db()
    records = list(
        database.training_runs.find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )
    for r in records:
        if "timestamp" in r:
            r["timestamp"] = r["timestamp"].isoformat()
    return records
