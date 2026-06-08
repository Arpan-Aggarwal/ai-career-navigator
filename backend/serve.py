"""
Windows-compatible production server script using waitress.
Run with: python serve.py

Use this instead of gunicorn on Windows.
Gunicorn is Linux/Mac only (it requires fcntl which doesn't exist on Windows).

For actual deployment on Render (Linux), gunicorn is used automatically.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_navigator.settings')

from waitress import serve
from career_navigator.wsgi import application

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting waitress server on http://0.0.0.0:{port}")
    print("Press Ctrl+C to stop.\n")
    serve(application, host='0.0.0.0', port=port, threads=4)
