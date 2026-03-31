import io
import os
import numpy as np
from PIL import Image
from huggingface_hub import hf_hub_download

# Global Model Caches to prevent re-loading massive files on every request
_MODELS = {
    "breast": None,
    "lung": None,
    "brain": None
}

def load_breast_model():
    if _MODELS["breast"] is None:
        import transformers
        # MONKEY-PATCH: Inject missing attribute into older custom models
        if not hasattr(transformers.PreTrainedModel, "all_tied_weights_keys"):
            transformers.PreTrainedModel.all_tied_weights_keys = property(lambda self: {})

        from transformers import AutoModel
        import torch
        print("Loading PyTorch MammoScreen Model...")
        model = AutoModel.from_pretrained("ianpan/mammoscreen", trust_remote_code=True)
        model.eval()
        _MODELS["breast"] = model
    return _MODELS["breast"]

def load_lung_model():
    if _MODELS["lung"] is None:
        import onnxruntime as ort
        print("Loading ONNX Lung Model...")
        model_path = hf_hub_download(repo_id="dorsar/lung-cancer-detection", filename="Model/lung_cancer_detection_model.onnx")
        _MODELS["lung"] = ort.InferenceSession(model_path)
    return _MODELS["lung"]

def load_brain_model():
    # Suppress TensorFlow logging warnings
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
    if _MODELS["brain"] is None:
        import tensorflow as tf
        print("Loading Keras Brain Model...")
        model_path = hf_hub_download(repo_id="jawadskript/brain_tumor_detection_CNN_DeepLearning", filename="brain_tumor_model.h5")
        _MODELS["brain"] = tf.keras.models.load_model(model_path, compile=False)
    return _MODELS["brain"]

def process_breast_scan(image: Image.Image) -> dict:
    import torch
    model = load_breast_model()
    
    # Mammoscreen expects [0, 255] float tensor, (N, C, H, W)
    img = image.resize((512, 512)).convert("RGB")
    img_array = np.array(img).astype(np.float32)
    img_array = np.transpose(img_array, (2, 0, 1))
    tensor = torch.from_numpy(img_array).unsqueeze(0)
    
    with torch.inference_mode():
        output = model(tensor)
        
    logits = output['cancer'][0][0].item()
    # Apply sigmoid strictly to guarantee 0.0 - 1.0 boundary proxy
    malignant_score = 1.0 / (1.0 + np.exp(-logits))

    return {
        "organ": "breast",
        "probability_score": malignant_score,
        "confidence_band": [max(0, malignant_score - 0.06), min(1, malignant_score + 0.06)],
        "heatmap_base64": None,
        "model_source": "ianpan/mammoscreen (AutoModel PyTorch)"
    }

def process_lung_scan(image: Image.Image) -> dict:
    session = load_lung_model()
    # Typical ONNX export from PyTorch image classifier needs 224x224 normalized CHW
    img = image.resize((224, 224)).convert("RGB")
    img_array = np.array(img).astype(np.float32) / 255.0
    
    # Apply standard ImageNet normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_array = (img_array - mean) / std
    
    # HWC to CHW (Channels-first)
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = np.expand_dims(img_array, axis=0) # Add batch dim
    
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: img_array})
    
    logits = outputs[0][0]
    if len(logits) > 1:
        # Softmax for multi-class
        exp_vals = np.exp(logits - np.max(logits)) # stability
        probs = exp_vals / np.sum(exp_vals)
        # dorsar/lung-cancer-detection 4 classes: Adenocarcinoma, Large Cell, Normal, Squamous
        # Index 2 is 'Normal'. Cancer risk = 1.0 - Normal probability
        score = float(1.0 - probs[2]) if len(probs) > 2 else float(probs[1])
    else:
        # Sigmoid binary
        score = float(1 / (1 + np.exp(-logits[0])))
        
    return {
        "organ": "lung",
        "probability_score": score,
        "confidence_band": [max(0, score - 0.08), min(1, score + 0.08)],
        "heatmap_base64": None,
        "model_source": "dorsar/lung-cancer-detection (ONNX)"
    }

def process_brain_scan(image: Image.Image) -> dict:
    model = load_brain_model()
    # Typical Keras processing: resize, rescale to [0,1], NHWC input
    img = image.resize((224, 224)).convert("RGB")
    img_array = np.array(img).astype(np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    preds = model.predict(img_array, verbose=0)[0]
    
    if len(preds) > 1:
        # jawadskript/brain_tumor_detection 4 classes: glioma, meningioma, no_tumor, pituitary
        # Index 2 is 'no_tumor'. Tumor risk = 1.0 - no_tumor probability
        score = float(1.0 - preds[2]) if len(preds) > 2 else float(preds[1])
    else:
        score = float(preds[0])
        
    return {
        "organ": "brain",
        "probability_score": score,
        "confidence_band": [max(0, score - 0.07), min(1, score + 0.07)],
        "heatmap_base64": None,
        "model_source": "jawadskript/brain_tumor_detection (Keras)"
    }

def evaluate_image(organ_type: str, image_bytes: bytes) -> tuple[dict, str]:
    """
    Main entry point for routing images to their respective real ML model.
    Returns (result_dict, triage_level)
    """
    image = Image.open(io.BytesIO(image_bytes))
    organ = organ_type.lower().strip()
    
    if organ == "breast":
        res = process_breast_scan(image)
    elif organ == "lung":
        res = process_lung_scan(image)
    elif organ == "brain":
        res = process_brain_scan(image)
    else:
        # Fallback if organ is completely unrecognized
        print(f"Warning: Unknown organ '{organ}', defaulting to lung ONNX")
        res = process_lung_scan(image)
        
    score = res["probability_score"]
    triage_level = "high" if score >= 0.65 else ("moderate" if score >= 0.35 else "low")
    
    return res, triage_level
