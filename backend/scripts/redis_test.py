"""Small script to test Redis connectivity using environment variables.

Usage:
  python backend/scripts/redis_test.py
"""
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

def load_env_file():
    env_path = backend_dir.parent / ".env"
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'").strip('"')
                    os.environ[k] = v

load_env_file()

def main():
    redis_url = os.getenv("REDIS_URL")
    print(f"Testing Redis connection using REDIS_URL: {redis_url[:30]}..." if redis_url else "No REDIS_URL found")
    
    try:
        import redis
        kwargs = {"decode_responses": True}
        if redis_url.startswith("rediss://"):
            kwargs["ssl_cert_reqs"] = None

        client = redis.from_url(redis_url, **kwargs)
        set_res = client.set("notarychain_test_key", "redis_cloud_connected")
        print("SET notarychain_test_key ->", set_res)
        get_res = client.get("notarychain_test_key")
        print("GET notarychain_test_key ->", get_res)
        client.delete("notarychain_test_key")
        print("PING ->", client.ping())
        print("\nSUCCESS: Redis Cloud connection verified and working perfectly!")
    except Exception as exc:
        print("Redis test exception:", exc)

if __name__ == "__main__":
    main()
