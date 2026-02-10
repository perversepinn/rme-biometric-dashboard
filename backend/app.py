from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json
import numpy as np

app = Flask(__name__)
CORS(app)

# ================= DATABASE CONNECTION =================
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="rme_puskesmas"
)

# ================= TEST CONNECTION (OPTIONAL) =================
if db.is_connected():
    print("✅ Database connected")

# =====================================================
# ================= REGISTER PASIEN ===================
# =====================================================
@app.route("/register", methods=["POST"])
def register():
    data = request.json

    if not data.get("descriptor"):
        return jsonify({"status": "error", "message": "Descriptor tidak ditemukan"})

    try:
        cursor = db.cursor()

        # 1️⃣ INSERT PATIENT TANPA noRM
        sql_patient = """
            INSERT INTO patients (
                nama, nik, tempatLahir, tanggalLahir, umur,
                jenisKelamin, alamat, kecamatan, kota, provinsi,
                telepon, agama, statusPerkawinan, pekerjaan,
                pendidikan, namaIbu, pekerjaanIbu,
                namaAyah, pekerjaanAyah, namaKK,
                jkn, catatan
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values_patient = (
            data["nama"],
            data["nik"],
            data["tempatLahir"],
            data["tanggalLahir"],
            data["umur"],
            data["jenisKelamin"],
            data["alamat"],
            data["kecamatan"],
            data["kota"],
            data["provinsi"],
            data["telepon"],
            data["agama"],
            data["statusPerkawinan"],
            data["pekerjaan"],
            data["pendidikan"],
            data["namaIbu"],
            data["pekerjaanIbu"],
            data["namaAyah"],
            data["pekerjaanAyah"],
            data["namaKK"],
            data["jkn"],
            data["catatan"]
        )

        cursor.execute(sql_patient, values_patient)

        # 2️⃣ Ambil ID yang baru dibuat
        patient_id = cursor.lastrowid

        # 3️⃣ Generate NoRM
        noRM = f"RM-{patient_id:06d}"

        # 4️⃣ Update noRM
        cursor.execute(
            "UPDATE patients SET noRM = %s WHERE id = %s",
            (noRM, patient_id)
        )

        # 5️⃣ Insert descriptor wajah
        descriptor_json = json.dumps(data["descriptor"])

        cursor.execute(
            "INSERT INTO face_biometrics (patient_id, descriptor) VALUES (%s, %s)",
            (patient_id, descriptor_json)
        )

        db.commit()
        cursor.close()

        return jsonify({
            "status": "success",
            "noRM": noRM
        })

    except Exception as e:
        db.rollback()
        return jsonify({"status": "error", "message": str(e)})
    
# =====================================================
# ================= GENERATE NoRM =====================
# =====================================================
@app.route("/generate-norm", methods=["GET"])
def generate_norm():
    try:
        cursor = db.cursor()
        cursor.execute("SELECT MAX(id) FROM patients")
        result = cursor.fetchone()

        next_id = (result[0] or 0) + 1
        noRM = f"RM-{next_id:06d}"

        return jsonify({
            "status": "success",
            "noRM": noRM
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        })

# =====================================================
# ============ TAMBAHAN 1: VERIFY FACE =================
# =====================================================
@app.route("/verify-face", methods=["POST"])
def verify_face():
    data = request.json
    input_descriptor = np.array(data["descriptor"])

    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, f.descriptor
        FROM patients p
        JOIN face_biometrics f ON p.id = f.patient_id
    """)
    records = cursor.fetchall()

    THRESHOLD = 0.5
    best_match = None
    best_distance = 1.0

    for row in records:
        db_descriptor = np.array(json.loads(row["descriptor"]))
        distance = np.linalg.norm(input_descriptor - db_descriptor)

        if distance < best_distance:
            best_distance = distance
            best_match = row

    if best_match and best_distance < THRESHOLD:
        best_match.pop("descriptor")
        return jsonify({
            "status": "success",
            "patient": best_match,
            "distance": best_distance
        })

    return jsonify({
        "status": "not_found",
        "message": "Wajah belum terdaftar"
    })


# =====================================================
# ============ TAMBAHAN 2: DATA PASIEN =================
# =====================================================
@app.route("/patients", methods=["GET"])
def get_patients():
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            noRM,
            nama,
            nik,
            alamat,
            created_at AS tanggal
        FROM patients
        WHERE status_aktif = 1
        ORDER BY id DESC
    """)
    return jsonify(cursor.fetchall())

# =====================================================
# ================= RUN SERVER =========================
# =====================================================
if __name__ == "__main__":
    app.run(debug=True)
