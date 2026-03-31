import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

models = [
    "linakosmina/efficientnetb0-brain-tumor-classification",
    "jawadskript/brain_tumor_detection_CNN_DeepLearning",
    "dorsar/lung-cancer-detection",
    "edziocodes/medgemma-breast-cancer",
    "ianpan/mammoscreen"
]

for model in models:
    url = f"https://huggingface.co/api/models/{model}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, context=ctx) as response:
            data = json.loads(response.read().decode())
            print(f"[OK] {model}")
            print(f"     Tags:     {data.get('tags', [])}")
            print(f"     Pipeline: {data.get('pipeline_tag', 'UNKNOWN')}")
            print(f"     Library:  {data.get('library_name', 'UNKNOWN')}")
            print(f"     Siblings: {[s['rfilename'] for s in data.get('siblings', [])]}")
            print("-" * 40)
    except Exception as e:
         print(f"[ERROR] {model} -> {e}")
