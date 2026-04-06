import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "/api";

const client = axios.create({ baseURL: BASE_URL, timeout: 30000 });

export const api = {
  health: () => client.get("/health"),

  train: (taskType, targetCol, data) =>
    client.post("/train", { task_type: taskType, target_col: targetCol, data }),

  trainCSV: (formData) =>
    client.post("/train", formData, { headers: { "Content-Type": "multipart/form-data" } }),

  predict: (taskType, input) =>
    client.post("/predict", { task_type: taskType, input }),

  predictBatch: (taskType, inputs) =>
    client.post("/predict/batch", { task_type: taskType, inputs }),

  getModels: () => client.get("/models"),

  getPredictionHistory: (taskType, limit = 50) =>
    client.get("/history/predictions", { params: { task_type: taskType, limit } }),

  getTrainingHistory: () => client.get("/history/training"),
};
