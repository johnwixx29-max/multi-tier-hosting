# Small-industry sample site (Phase 1 of the project)
## Run locally
    python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python app.py          # open http://localhost:5000
Check: / , /products , /inquiry , /health
## Run like production (what AWS will use)
    gunicorn -w 2 -b 0.0.0.0:80 app:app
## Switch to MySQL / RDS
    export DATABASE_URL="mysql+pymysql://user:pass@HOST:3306/bizdb"
## Load test (baseline "before" numbers)
    k6 run -e BASE=http://localhost:5000 loadtest/k6.js
## API for the mobile app
    GET  /api/products                 -> {"server": "...", "products": [...]}
    POST /api/inquiries  {"name","phone","message"} -> 201
