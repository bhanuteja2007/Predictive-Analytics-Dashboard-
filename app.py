from flask import Flask
from flask_cors import CORS
from routes.api import api
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(api, url_prefix="/api")


@app.route("/")
def index():
    return {
        "app": "Predictive Analytics API",
        "version": "1.0.0",
        "endpoints": {
            "health":            "GET  /api/health",
            "train":             "POST /api/train",
            "predict":           "POST /api/predict",
            "predict_batch":     "POST /api/predict/batch",
            "model_info":        "GET  /api/models",
            "prediction_history":"GET  /api/history/predictions",
            "training_history":  "GET  /api/history/training",
        }
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
