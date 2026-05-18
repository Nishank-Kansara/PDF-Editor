import requests
import json

url = "https://pdf-editor-0eg9.onrender.com/edit"
data = {
    "file_id": "aa1e067d-1011-4c9b-ae36-98e1365b575b",
    "instruction": "Can you add the black background to the file and give me the final?"
}

res = requests.post(url, json=data)
print(res.status_code)
print(res.json())
