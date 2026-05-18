import requests
import os

BASE_URL = "http://localhost:8000"

def test_api():
    print("Testing Health...")
    try:
        r = requests.get(f"{BASE_URL}/health")
        print("Health Status:", r.status_code, r.text)
    except Exception as e:
        print("Backend not running or unreachable:", e)
        return

    print("\nTesting Upload...")
    try:
        with open("dummy.pdf", "rb") as f:
            files = {"file": ("dummy.pdf", f, "application/pdf")}
            r = requests.post(f"{BASE_URL}/upload", files=files)
            print("Upload Status:", r.status_code)
            try:
                res_json = r.json()
                print("Upload Response:", res_json)
                file_id = res_json.get("file_id")
            except Exception as e:
                print("Upload Response (text):", r.text)
                return
    except Exception as e:
        print("Upload failed:", e)
        return
        
    if not file_id:
        print("No file_id received, aborting.")
        return

    print("\nTesting Edit...")
    try:
        payload = {
            "file_id": file_id,
            "instruction": "Replace text 'Hello' with 'World'"
        }
        r = requests.post(f"{BASE_URL}/edit", json=payload)
        print("Edit Status:", r.status_code)
        try:
            res_json = r.json()
            print("Edit Response:", res_json)
            download_url = res_json.get("download_url")
        except Exception as e:
            print("Edit Response (text):", r.text)
            return
    except Exception as e:
        print("Edit failed:", e)
        return

    if not download_url:
        print("No download URL received, aborting.")
        return

    print("\nTesting Download...")
    try:
        r = requests.get(f"{BASE_URL}{download_url}")
        print("Download Status:", r.status_code)
        print("Downloaded file size:", len(r.content))
    except Exception as e:
        print("Download failed:", e)

if __name__ == "__main__":
    test_api()
