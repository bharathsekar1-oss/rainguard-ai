import sys
import os

# Add the backend directory to the Python path so app.* imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the FastAPI app — Vercel Python runtime expects a variable named 'app'
from app.main import app  # noqa: F401
