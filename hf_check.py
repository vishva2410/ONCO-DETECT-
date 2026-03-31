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
    "ianpan/mammoscreen",
    "edziocodes/medgemma-breast-cancer"
]

for m in models:
    url = f"https://huggingface.co/api/models/{m}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, context=ctx) as r:
            d = json.loads(r.read().decode())
            print(f"Model: {m}")
            print(f"  Pipeline: {d.get('pipeline_tag')}")
            print(f"  Library:  {d.get('library_name')}")
            tags = d.get('tags', [])
            print(f"  Tags:     {tags[:5]}")
            siblings = [s['rfilename'] for s in d.get('siblings', [])]
            print(f"  Has config.json: {'config.json' in siblings}")
            print(f"  Has model weights: {any('safetensors' in s or 'bin' in s or 'h5' in s for s in siblings)}")
            print("-" * 40)
    except Exception as e:
        print(f"Model: {m} -> ERROR {e}")
