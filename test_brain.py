import os
import io
import numpy as np
from PIL import Image
from huggingface_hub import hf_hub_download
import tensorflow as tf

def main():
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 
    print("Loading model...")
    model_path = hf_hub_download(repo_id="jawadskript/brain_tumor_detection_CNN_DeepLearning", filename="brain_tumor_model.h5")
    model = tf.keras.models.load_model(model_path, compile=False)
    
    # Create a dummy image (black/empty, which might look like background/healthy)
    img = Image.new('RGB', (224, 224), color='black')
    img_array = np.array(img).astype(np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    preds = model.predict(img_array, verbose=0)[0]
    print(f"Model output shape: {preds.shape}")
    print(f"Model raw output (black image): {preds}")

    # Let's try with random noise
    noise = np.random.rand(1, 224, 224, 3).astype(np.float32)
    preds_noise = model.predict(noise, verbose=0)[0]
    print(f"Model raw output (noise image): {preds_noise}")

if __name__ == "__main__":
    main()
