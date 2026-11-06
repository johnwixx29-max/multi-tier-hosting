"""Sample small-industry website (stateless, DB-backed) for the
Automated Multi-Tier Web Application Hosting project.

DATABASE_URL examples:
  local test : sqlite:///local.db            (default)
  AWS RDS    : mysql+pymysql://user:pass@rds-endpoint:3306/bizdb
"""
import os, socket, urllib.request
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from sqlalchemy import create_engine, text

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-me")  # stateless: no server-side sessions
DB_URL = os.environ.get("DATABASE_URL", "sqlite:///local.db")
engine = create_engine(DB_URL, pool_pre_ping=True, pool_size=5, max_overflow=10) \
    if not DB_URL.startswith("sqlite") else create_engine(DB_URL)

SEED = [
    ("Steel Hinges (pack of 50)", "Hardware", 1200),
    ("Industrial Bolts M10 (100 pcs)", "Hardware", 850),
    ("Aluminium Brackets", "Fabrication", 2200),
    ("Custom Sheet Metal Cut", "Fabrication", 3500),
    ("Powder Coating (per sq ft)", "Finishing", 90),
    ("Welding Service (per hour)", "Services", 600),
]

def init_db():
    with engine.begin() as c:
        c.execute(text("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY "
                       + ("AUTO_INCREMENT" if not DB_URL.startswith("sqlite") else "AUTOINCREMENT")
                       + ", name VARCHAR(120), category VARCHAR(60), price INTEGER)"))
        c.execute(text("CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY "
                       + ("AUTO_INCREMENT" if not DB_URL.startswith("sqlite") else "AUTOINCREMENT")
                       + ", name VARCHAR(80), phone VARCHAR(20), message TEXT, "
                       "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"))
        if c.execute(text("SELECT COUNT(*) FROM products")).scalar() == 0:
            for n, cat, p in SEED:
                c.execute(text("INSERT INTO products (name,category,price) VALUES (:n,:c,:p)"),
                          {"n": n, "c": cat, "p": p})

def server_id():
    """EC2 instance ID (IMDSv2) when on AWS, else hostname. Shown in footer to prove load balancing."""
    try:
        t = urllib.request.urlopen(urllib.request.Request(
            "http://169.254.169.254/latest/api/token", method="PUT",
            headers={"X-aws-ec2-metadata-token-ttl-seconds": "60"}), timeout=0.3).read().decode()
        return urllib.request.urlopen(urllib.request.Request(
            "http://169.254.169.254/latest/meta-data/instance-id",
            headers={"X-aws-ec2-metadata-token": t}), timeout=0.3).read().decode()
    except Exception:
        return socket.gethostname()

SERVER_ID = server_id()  # looked up once at startup

@app.context_processor
def inject():
    return {"server_id": SERVER_ID}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/products")
def products():
    with engine.connect() as c:
        rows = c.execute(text("SELECT name,category,price FROM products ORDER BY category,name")).fetchall()
    return render_template("products.html", rows=rows)

@app.route("/inquiry", methods=["GET", "POST"])
def inquiry():
    if request.method == "POST":
        with engine.begin() as c:
            c.execute(text("INSERT INTO inquiries (name,phone,message) VALUES (:n,:p,:m)"),
                      {"n": request.form["name"][:80], "p": request.form["phone"][:20],
                       "m": request.form["message"][:1000]})
        flash("Thank you! We will contact you soon.")
        return redirect(url_for("inquiry"))
    return render_template("inquiry.html")

@app.route("/health")
def health():
    """Load balancer health check: 200 only if the DB is reachable."""
    try:
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
        return jsonify(status="healthy", server=SERVER_ID), 200
    except Exception as e:
        return jsonify(status="unhealthy", error=str(e)[:100]), 503

@app.route("/cpu-burn")
def cpu_burn():
    """Demo only: burns CPU so you can trigger the CPU>70% scaling rule. Remove in production."""
    n = min(int(request.args.get("n", 300000)), 2_000_000)
    s = 0
    for i in range(n):
        s += i * i % 7
    return jsonify(result=s, server=SERVER_ID)

# ---------- JSON API (used by the mobile app; website could use it too) ----------
@app.route("/api/products")
def api_products():
    with engine.connect() as c:
        rows = c.execute(text("SELECT id,name,category,price FROM products ORDER BY category,name")).mappings().all()
    return jsonify(server=SERVER_ID, products=[dict(r) for r in rows])

@app.route("/api/inquiries", methods=["POST"])
def api_inquiry():
    d = request.get_json(silent=True) or {}
    name, phone, msg = (d.get("name") or "").strip(), (d.get("phone") or "").strip(), (d.get("message") or "").strip()
    if not (name and phone and msg):
        return jsonify(error="name, phone and message are required"), 400
    with engine.begin() as c:
        c.execute(text("INSERT INTO inquiries (name,phone,message) VALUES (:n,:p,:m)"),
                  {"n": name[:80], "p": phone[:20], "m": msg[:1000]})
    return jsonify(ok=True, server=SERVER_ID), 201

init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
