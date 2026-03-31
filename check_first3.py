import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://huggingface.co/api/models/"
models = [
    "linakosmina/efficientnetb0-brain-tumor-classification",
    "jawadskript/brain_tumor_detection_CNN_DeepLearning",
    "dorsar/lung-cancer-detection"
]

for m in models:
    try:
        req = urllib.request.Request(url + m)
        with urllib.request.urlopen(req, context=ctx) as r:
            d = json.loads(r.read().decode())
            print(f"{m} -> {d.get('pipeline_tag')}, {d.get('library_name')}")
    except Exception as e:
        print(f"{m} -> ERROR {e}")
