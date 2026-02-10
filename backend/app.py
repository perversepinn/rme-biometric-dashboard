from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import json
import numpy as np

app = Flask(__name__)
CORS(app)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="rme_puskesmas"
)

cursor = db.cursor()

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

        # 5️⃣ Insert descriptor
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

if __name__ == "__main__":
    app.run(debug=True)