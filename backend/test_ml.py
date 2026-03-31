import os
import sys

# Suppress massive TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

from reasoning.vision_router import load_breast_model, load_lung_model, load_brain_model

print("--- INITIALIZING ML MODELS & CACHING WEIGHTS ---")

print("\n1/3 Downloading and Loading Breast Model (ianpan/mammoscreen) via Transformers...")
try:
    load_breast_model()
    print("✅ Breast Model successful.")
except Exception as e:
    print(f"❌ Breast Model failed: {e}")

print("\n2/3 Downloading and Loading Lung Model (dorsar/lung-cancer-detection) via ONNX...")
try:
    load_lung_model()
    print("✅ Lung Model successful.")
except Exception as e:
    print(f"❌ Lung Model failed: {e}")

print("\n3/3 Downloading and Loading Brain Model (jawadskript) via TensorFlow/Keras...")
try:
    load_brain_model()
    print("✅ Brain Model successful.")
except Exception as e:
    print(f"❌ Brain Model failed: {e}")

print("\n--- CACHING COMPLETE ---")
