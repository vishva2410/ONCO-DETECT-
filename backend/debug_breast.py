import os
import sys

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

from transformers import AutoConfig, AutoModel, AutoModelForImageClassification

model_id = "ianpan/mammoscreen"

try:
    print("Trying AutoModelForImageClassification...")
    model = AutoModelForImageClassification.from_pretrained(model_id, trust_remote_code=True)
    print("Success with AutoModelForImageClassification.")
except Exception as e:
    print(f"Failed AutoModelForImageClassification: {e}")

try:
    print("\nTrying AutoModel...")
    model = AutoModel.from_pretrained(model_id, trust_remote_code=True)
    print("Success with AutoModel.")
except Exception as e:
    print(f"Failed AutoModel: {e}")
