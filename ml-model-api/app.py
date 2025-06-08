from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# === Suppress warnings ===
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

# === Initialize Flask App ===
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# === Define model directory ===
MODEL_DIR = r'C:\Users\Hp\Desktop\SBI_DB\ml-model-api\model_files'  # Update this path
os.makedirs(MODEL_DIR, exist_ok=True)

# === Load Model Artifacts ===
try:
    # Load model
    model = joblib.load(os.path.join(MODEL_DIR, 'xgboost_model.pkl'))
    
    # Load label encoders
    label_encoders = joblib.load(os.path.join(MODEL_DIR, 'label_encoders.pkl'))
    
    # Load feature names
    feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.pkl'))
    
    print("✅ Model artifacts loaded successfully.")
    print(f"📊 Features expected by model: {feature_names}")
except Exception as e:
    print(f"❌ Failed to load model artifacts: {str(e)}")
    raise e

# === /predict endpoint ===
@app.route('/predict', methods=['POST'])
def predict():
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON", "status": "failed"}), 400

        data = request.get_json()
        
        # Validate required fields (adjust based on your model's features)
        required_fields = [
            'market', 'founded_year', 'funding_total_usd', 'funding_rounds',
            'country_code', 'city'
        ]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}", "status": "failed"}), 400

        # Check that at least one funding field is provided
        funding_fields = ['seed', 'venture', 'angel', 'debt_financing', 
                          'convertible_note', 'equity_crowdfunding', 
                          'private_equity', 'post_ipo_equity']
        
        if not any(data.get(field, 0) > 0 for field in funding_fields):
            return jsonify({"error": "At least one funding field must be provided", "status": "failed"}), 400

        # Calculate business age
        current_year = datetime.now().year
        business_age = current_year - int(data['founded_year'])

        # Check if business age is at least 5 years
        if business_age < 5:
            return jsonify({"error": "Business must be at least 5 years old to be considered safe", "status": "failed"}), 400

        # Prepare input data
        input_data = {
            'name': data.get('name', 'Unknown'),  # Optional
            'market': data['market'],
            'founded_year': int(data['founded_year']),
            'funding_total_usd': float(data['funding_total_usd']),
            'funding_rounds': int(data['funding_rounds']),
            'seed': float(data.get('seed', 0)),
            'venture': float(data.get('venture', 0)),
            'angel': float(data.get('angel', 0)),
            'debt_financing': float(data.get('debt_financing', 0)),
            'convertible_note': float(data.get('convertible_note', 0)),
            'equity_crowdfunding': float(data.get('equity_crowdfunding', 0)),
            'private_equity': float(data.get('private_equity', 0)),
            'post_ipo_equity': float(data.get('post_ipo_equity', 0)),
            'country_code': data['country_code'],
            'city': data['city'],
            'first_funding_year': int(data.get('first_funding_year', data['founded_year']))  # Default to founded_year if missing
        }

        # Create DataFrame
        df = pd.DataFrame([input_data])

        # Encode categorical features using saved label encoders
        for col in label_encoders:
            if col in df.columns:
                try:
                    df[col] = label_encoders[col].transform(df[col].astype(str))
                except ValueError:
                    df[col] = 0  # Handle unseen labels

        # Ensure feature order matches training
        df = df[feature_names]

        # Predict
        probability = model.predict_proba(df)[0][1]  # Probability of class 1 (Safe)
        prediction = model.predict(df)[0]  # 0 or 1

        return jsonify({
            "prediction": "Safe" if prediction == 1 else "Not Safe",
            "probability": round(float(probability), 4),
            "status": "success"
        })

    except ValueError as ve:
        return jsonify({"error": f"Invalid input: {str(ve)}", "status": "failed"}), 400
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"}), 500

# === /health endpoint ===
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": True,
        "required_features": feature_names
    })

# === Run the server ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)