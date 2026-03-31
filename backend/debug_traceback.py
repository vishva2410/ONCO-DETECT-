import os
import sys
import traceback

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import transformers

if not hasattr(transformers.PreTrainedModel, "all_tied_weights_keys"):
    transformers.PreTrainedModel.all_tied_weights_keys = property(lambda self: {}) # Maybe it needs a dict with keys?

try:
    from transformers import AutoModel
    model = AutoModel.from_pretrained("ianpan/mammoscreen", trust_remote_code=True)
    print("Success with dict patch.")
except Exception as e:
    print("Dict patch failed:")
    traceback.print_exc()

import importlib
importlib.reload(transformers)
try:
    # Try with None
    transformers.PreTrainedModel.all_tied_weights_keys = None
    model = AutoModel.from_pretrained("ianpan/mammoscreen", trust_remote_code=True)
    print("Success with None patch.")
except Exception as e:
    print("None patch failed:")
    traceback.print_exc()
