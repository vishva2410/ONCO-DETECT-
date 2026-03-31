import requests

models = [
    "linakosmina/efficientnetb0-brain-tumor-classification",
    "jawadskript/brain_tumor_detection_CNN_DeepLearning",
    "dorsar/lung-cancer-detection",
    "edziocodes/medgemma-breast-cancer",
    "ianpan/mammoscreen"
]

for model in models:
    url = f"https://huggingface.co/api/models/{model}"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        pipeline_tag = data.get("pipeline_tag", "UNKNOWN")
        library_name = data.get("library_name", "UNKNOWN")
        print(f"[OK] {model}")
        print(f"     Pipeline: {pipeline_tag}")
        print(f"     Library:  {library_name}")
    else:
        print(f"[ERROR {resp.status_code}] {model}")
