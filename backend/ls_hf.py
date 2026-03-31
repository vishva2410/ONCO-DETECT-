import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://huggingface.co/api/models/"
models = [
    "dorsar/lung-cancer-detection",
    "jawadskript/brain_tumor_detection_CNN_DeepLearning"
]

for m in models:
    try:
        req = urllib.request.Request(url + m)
        with urllib.request.urlopen(req, context=ctx) as r:
            d = json.loads(r.read().decode())
            print(f"Files for {m}:")
            for s in d.get('siblings', []):
                print(f"  - {s['rfilename']}")
            print("-" * 40)
    except Exception as e:
        print(f"ERROR reading {m}: {e}")
