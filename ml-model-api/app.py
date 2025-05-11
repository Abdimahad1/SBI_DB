from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import scipy.sparse
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
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model_files')
os.makedirs(MODEL_DIR, exist_ok=True)

# === Load Model Artifacts ===
try:
    artifact_path = os.path.join(MODEL_DIR, 'optimized_risk_model.pkl')
    if not os.path.exists(artifact_path):
        raise FileNotFoundError(f"Model artifact file not found at {artifact_path}")

    artifacts = joblib.load(artifact_path)
    model = artifacts['model']
    encoder = artifacts['encoder']
    base_features = artifacts.get('numeric_features') or artifacts.get('base_features')
    categorical_cols = artifacts['categorical_cols']
    feature_names = artifacts['feature_names']

    print("✅ Model artifacts loaded successfully.")
    print(f"📊 Base features: {base_features}")
    print(f"🧩 Categorical columns: {categorical_cols}")
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
        required_fields = ['income', 'expenses', 'risk_score']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}", "status": "failed"}), 400

        current_year = datetime.now().year
        input_data = {
            'income': float(data['income']),
            'expenses': float(data['expenses']),
            'risk_score': float(data['risk_score']),
            'founded_year': int(data.get('founded_year', current_year)),
            'category_list': data.get('category_list', 'Unknown'),
            'country_code': data.get('country_code', 'Unknown'),
            'city': data.get('city', 'Unknown'),
            'status': data.get('status', 'Unknown')
        }

        # Calculate business age
        input_data['business_age'] = current_year - input_data['founded_year']

        # Create DataFrame
        df = pd.DataFrame([input_data])

        # Prepare features
        X_num = df[base_features].values.astype('float32')
        X_cat = encoder.transform(df[categorical_cols]) if categorical_cols else None
        X_combined = scipy.sparse.hstack([X_num, X_cat]) if X_cat is not None else X_num

        # Predict model probability (class 1 = Safe)
        probability = model.predict_proba(X_combined)[0][1]

        # Business rule override
        business_rule = input_data['income'] > input_data['expenses'] and input_data['risk_score'] >= 5
        label = "Safe" if business_rule else "Not Safe"

        return jsonify({
            "prediction": label,
            "probability": round(float(probability), 4),
            "business_rule_check": business_rule,
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
        "base_features": base_features,
        "categorical_columns": categorical_cols
    })

# === Run the server on port 3000 ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)