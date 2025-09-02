## Financial Fraud Detection

### About
Implemented an XGBoost-based fraud detection system to analyze transaction data and accurately predict fraudulent activities in real time. Includes an interactive web interface for fraud alerts and analytics, deployed on AWS EC2 with static assets served from Amazon S3 for scalability and reliability.

End-to-end project for detecting fraudulent financial transactions with a production-ready web interface and API.

### Overview

- **ML notebooks and artifacts** live under `fraud detection ml model/`
  - Jupyter notebooks for experimentation and training
  - Serialized models: `xgb_model.joblib` and `scaler.joblib`
  - Sample data: `transaction.csv`

- **Web application** lives under `fraud detection webpage/`
  - `front-end/ui/`: React single-page app (SPA)
  - `api/`: Node.js + Python inference bridge to load the trained model and serve predictions

### Repository structure

```
Financial fraud detection/
├─ fraud detection ml model/
│  ├─ existing-research-paper.ipynb
│  ├─ final_model.ipynb
│  ├─ fraud_detection_test.ipynb
│  ├─ fraud-detect-3.ipynb
│  ├─ fraud-detect-4.ipynb
│  ├─ transaction.csv
│  ├─ scaler.joblib
│  ├─ xgb_model.joblib
│  └─ catboost_info/ ...
└─ fraud detection webpage/
   ├─ front-end/ui/ (React app)
   └─ api/ (Node + Python service)
```

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+

### Quick start

1) API service

The API is a Node.js service that calls a Python script (`predict.py`) to run the trained model.

```
cd "fraud detection webpage/api"
npm install

# Start the API (default: http://localhost:5000)
npm start
```

Environment variables (optional):

- `PORT`: Port for the Node API (defaults to 5000)

Key files:

- `index.js`: Express server entry
- `predict.py`: Loads `xgb_model.joblib` and `scaler.joblib` and returns predictions
- `xgb_model.joblib`, `scaler.joblib`: Trained model artifacts

2) Front-end (React UI)

```
cd "fraud detection webpage/front-end/ui"
npm install

# Start the dev server (default: http://localhost:3000)
npm start
```

To build for production:

```
npm run build
```

This outputs to `front-end/ui/build/`.

### API usage

The API exposes a prediction endpoint (see `api/index.js`). Example request (adjust payload according to your model features):

```
POST http://localhost:5000/predict
Content-Type: application/json

{
  "Amount": 123.45,
  "Time": 10000,
  "V1": -1.23,
  "V2": 0.45
  // ... other features as required
}
```

Example response:

```
{
  "fraud": false,
  "score": 0.07
}
```

Note: The exact feature schema depends on your trained model in `predict.py`.

### Data and training

Use the notebooks in `fraud detection ml model/` to reproduce and iterate on experiments. Ensure the final trained artifacts (`xgb_model.joblib`, `scaler.joblib`) are copied to `fraud detection webpage/api/` for inference.

### Development tips

- Keep model and scaler filenames consistent between training and `predict.py`.
- For reproducibility, prefer fixed random seeds in notebooks and training scripts.
- Avoid committing large raw datasets; use small samples or references.

### License

This repository is provided for educational and demonstration purposes.


