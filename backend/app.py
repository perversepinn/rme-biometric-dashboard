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

if db.is_connected():
    print("✅ Database connected")

# =====================================================
# ================= REGISTER PASIEN ===================
# =====================================================
@app.route("/register", methods=["POST"])
def register():
    data = request.json

    if not data or not data.get("descriptor"):
        return jsonify({
            "status": "error",
            "message": "Descriptor tidak ditemukan"
        })

    try:
        cursor = db.cursor()

        # 1️⃣ Insert pasien tanpa noRM
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
            data.get("nama"),
            data.get("nik"),
            data.get("tempatLahir"),
            data.get("tanggalLahir"),
            data.get("umur"),
            data.get("jenisKelamin"),
            data.get("alamat"),
            data.get("kecamatan"),
            data.get("kota"),
            data.get("provinsi"),
            data.get("telepon"),
            data.get("agama"),
            data.get("statusPerkawinan"),
            data.get("pekerjaan"),
            data.get("pendidikan"),
            data.get("namaIbu"),
            data.get("pekerjaanIbu"),
            data.get("namaAyah"),
            data.get("pekerjaanAyah"),
            data.get("namaKK"),
            data.get("jkn"),
            data.get("catatan")
        )

        cursor.execute(sql_patient, values_patient)

        # 2️⃣ Ambil ID
        patient_id = cursor.lastrowid

        # 3️⃣ Generate NoRM dari ID
        noRM = f"RM-{patient_id:06d}"

        # 4️⃣ Update noRM
        cursor.execute(
            "UPDATE patients SET noRM = %s WHERE id = %s",
            (noRM, patient_id)
        )

        # 5️⃣ Simpan descriptor wajah
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
        return jsonify({
            "status": "error",
            "message": str(e)
        })


# =====================================================
# ================= GENERATE NoRM (PREVIEW) ============
# =====================================================
@app.route("/generate-norm", methods=["GET"])
def generate_norm():
    try:
        cursor = db.cursor()
        cursor.execute("SELECT MAX(id) FROM patients")
        result = cursor.fetchone()
        cursor.close()

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
# ================= VERIFY FACE =======================
# =====================================================
@app.route("/verify-face", methods=["POST"])
def verify_face():
    data = request.json

    if not data or not data.get("descriptor"):
        return jsonify({
            "status": "error",
            "message": "Descriptor tidak ditemukan"
        })

    input_descriptor = np.array(data["descriptor"])

    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.*, f.descriptor
        FROM patients p
        JOIN face_biometrics f ON p.id = f.patient_id
    """)
    records = cursor.fetchall()
    cursor.close()

    THRESHOLD = 0.6
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
            "distance": float(best_distance)
        })

    return jsonify({
        "status": "not_found",
        "message": "Wajah belum terdaftar"
    })


# =====================================================
# ================= LIST DATA PASIEN ==================
# =====================================================
@app.route("/patients", methods=["GET"])
def get_patients():
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT *
        FROM patients
        ORDER BY id DESC
    """)

    return jsonify(cursor.fetchall())


# tabel data pasien
@app.route("/update-patient/<noRM>", methods=["PUT"])
def update_patient(noRM):
    data = request.json
    cursor = db.cursor()

    cursor.execute("""
        UPDATE patients SET
        nama=%s,
        nik=%s,
        alamat=%s
        WHERE noRM=%s
    """, (
        data["nama"],
        data["nik"],
        data["alamat"],
        noRM
    ))

    db.commit()
    return jsonify({"status": "success"})

@app.route("/delete-patient/<noRM>", methods=["DELETE"])
def delete_patient(noRM):
    cursor = db.cursor()

    # hapus biometrik dulu
    cursor.execute("""
        DELETE FROM face_biometrics
        WHERE patient_id = (
            SELECT id FROM patients WHERE noRM=%s
        )
    """, (noRM,))

    # hapus pasien
    cursor.execute("DELETE FROM patients WHERE noRM=%s", (noRM,))

    db.commit()
    return jsonify({"status": "success"})

@app.route("/update-biometric/<noRM>", methods=["PUT"])
def update_biometric(noRM):
    data = request.json
    descriptor_json = json.dumps(data["descriptor"])
    cursor = db.cursor()

    cursor.execute("""
        UPDATE face_biometrics
        SET descriptor=%s
        WHERE patient_id = (
            SELECT id FROM patients WHERE noRM=%s
        )
    """, (descriptor_json, noRM))

    db.commit()
    return jsonify({"status": "success"})


# =====================================================
# ================= RUN SERVER ========================
# =====================================================
if __name__ == "__main__":
    app.run(debug=True)
