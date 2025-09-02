import sys
import json
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler  # Import StandardScaler
import xgboost as xgb
import pandas as pd


# Load the model and the scaler
model_path = 'xgb_model.joblib'
model = joblib.load(model_path)

# Load the scaler (make sure to fit and save this scaler when training your model)
scaler_path = 'scaler.joblib'
scaler = joblib.load(scaler_path)  # Load the fitted scaler

def preprocess(data):
    transactionType = data['type']

    # If the transaction type is not CASH_OUT or TRANSFER, return a non-fraudulent response
    if transactionType not in ['CASH_OUT', 'TRANSFER']:
        return None, True

    amount = float(data['amount'])
    if amount <= 0:
        raise ValueError("Amount must be greater than 0")

    senderOldBalance = float(data['senderOldBalance'])
    senderNewBalance = float(data['senderNewBalance'])
    receiverOldBalance = float(data['receiverOldBalance'])
    receiverNewBalance = float(data['receiverNewBalance'])

    origBalance_inacc = (senderOldBalance - amount) - senderNewBalance
    destBalance_inacc = (receiverOldBalance + amount) - receiverNewBalance

    type_CASH_OUT = 1 if transactionType == "CASH_OUT" else 0
    type_TRANSFER = 1 if transactionType == "TRANSFER" else 0

    step = int(data['step'])
    MINUTES_IN_HOUR = 60
    MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR
    DAYS_IN_WEEK = 7

    minute_of_day = step % MINUTES_IN_DAY
    hour = minute_of_day // MINUTES_IN_HOUR
    minute = minute_of_day % MINUTES_IN_HOUR
    day = step // MINUTES_IN_DAY
    day_of_week = day % DAYS_IN_WEEK

    hour_sin = np.sin(2 * np.pi * hour / 24)
    hour_cos = np.cos(2 * np.pi * hour / 24)
    minute_sin = np.sin(2 * np.pi * minute / 60)
    minute_cos = np.cos(2 * np.pi * minute / 60)
    day_of_week_sin = np.sin(2 * np.pi * day_of_week / DAYS_IN_WEEK)
    day_of_week_cos = np.cos(2 * np.pi * day_of_week / DAYS_IN_WEEK)

    isFlaggedFraud = 0  # Assuming 0 for non-flagged transactions as this is used for prediction.

    # Return preprocessed data with all 17 features
    preprocessed_data = [
        step, amount, senderOldBalance, senderNewBalance, receiverOldBalance, receiverNewBalance,
        isFlaggedFraud, origBalance_inacc, destBalance_inacc, type_CASH_OUT, type_TRANSFER,
        hour_sin, hour_cos, minute_sin, minute_cos, day_of_week_sin, day_of_week_cos
    ]
    
    return preprocessed_data, False

def predict(data):
    # Load and preprocess data
    preprocessed_data, skip_prediction = preprocess(data)

    # If not applicable for prediction, return non-fraudulent (0)
    if skip_prediction:
        return 0

    # Convert data into required format for prediction (2D array)
    # Create a DataFrame with appropriate column names (assuming same columns used during training)
    columns = ['step', 'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
               'isFlaggedFraud', 'origBalance_inacc', 'destBalance_inacc', 'type_CASH_OUT', 'type_TRANSFER',
               'hour_sin', 'hour_cos', 'minute_sin', 'minute_cos', 'day_of_week_sin', 'day_of_week_cos']

    prediction_data = pd.DataFrame([preprocessed_data], columns=columns)

    # Standardize the input data using the scaler
    prediction_data_scaled = scaler.transform(prediction_data)

    # Directly use the model to predict without DMatrix
    prediction = model.predict(prediction_data_scaled)
    
    return int(prediction[0])


if __name__ == '__main__':
    # Read input JSON from Node.js
    input_data = json.loads(sys.stdin.read())
    
    try:
        # Perform prediction
        prediction = predict(input_data)
        # Return prediction result as JSON
        print(json.dumps({"prediction": prediction, "success": True}))
    except Exception as e:
        print(json.dumps({"error": str(e), "success": False}))
