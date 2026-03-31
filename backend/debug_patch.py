import os
import sys

# Suppress TF logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import transformers

# MONKEY PATCH: Inject missing attribute into older custom models
if not hasattr(transformers.PreTrainedModel, "all_tied_weights_keys"):
    transformers.PreTrainedModel.all_tied_weights_keys = property(lambda self: [])

try:
    from transformers import AutoModel
    model_id = "ianpan/mammoscreen"
    
    print("Loading model...")
    model = AutoModel.from_pretrained(model_id, trust_remote_code=True)
    
    # Check if the object failed to initialize the attribute properly
    if not hasattr(model, "all_tied_weights_keys"):
        model.all_tied_weights_keys = []
        
    print("Success with patched AutoModel.")
except Exception as e:
    print(f"Failed AutoModel: {e}")
