# 🏥 RME Biometrik Puskesmas

Sistem **Rekam Medis Elektronik (RME)** berbasis biometrik yang memungkinkan identifikasi pasien menggunakan **pengenalan wajah dan sidik jari**.  
Aplikasi ini membantu proses **pendaftaran pasien, verifikasi identitas, dan pengelolaan data pasien** secara lebih cepat dan akurat.

Project ini dibangun menggunakan **React (Frontend)** dan **Flask (Backend API)** dengan penyimpanan data pada **MySQL**.

---

# ✨ Fitur Utama

## 👤 Manajemen Data Pasien
- Pendaftaran pasien baru
- Edit data pasien
- Hapus data pasien
- Detail informasi pasien lengkap
- Generate otomatis **No Rekam Medis (NoRM)**

## 🔐 Identifikasi Biometrik
- Perekaman **biometrik wajah**
- Verifikasi pasien menggunakan **face recognition**
- Indikator status biometrik pada data pasien
- Opsi **lewati perekaman biometrik** saat pendaftaran

## 📊 Dashboard Statistik
Menampilkan ringkasan data seperti:
- Total pasien
- Jumlah pasien dengan biometrik wajah
- Jumlah pasien dengan sidik jari
- Visualisasi statistik menggunakan **Pie Chart**

## 📁 Export Data
- Export data pasien ke **PDF**
- Export data pasien ke **Excel**

---

# 🧰 Teknologi yang Digunakan

## Frontend
- React
- Vite
- TailwindCSS
- Framer Motion
- Recharts
- React Hot Toast
- Lucide Icons

## Backend
- Python
- Flask
- Flask-CORS
- NumPy

## Database
- MySQL

---

# ⚙️ Instalasi

## 1️⃣ Clone Repository

```bash
git clone https://github.com/perversepinn/rme-biometric-dashboard.git
cd rme-biometric-dashboard
```

---

# 🗄️ Setup Database (MySQL)

Project ini menggunakan **MySQL**.  
Anda bisa menggunakan **Laragon** atau **XAMPP**.

## Opsi 1 — Menggunakan Laragon

1. Buka **Laragon**
2. Klik **Start All**
3. Buka browser dan akses:

```
http://localhost/phpmyadmin
```

4. Klik **New**
5. Buat database baru:

```
rme_puskesmas
```

6. Klik database `rme_puskesmas`
7. Pilih tab **Import**
8. Upload file:

```
backend/rme_puskesmas.sql
```

9. Klik **Import**

---

## Opsi 2 — Menggunakan XAMPP

1. Jalankan **XAMPP Control Panel**
2. Start **Apache** dan **MySQL**
3. Buka browser:

```
http://localhost/phpmyadmin
```

4. Klik **New**
5. Buat database:

```
rme_puskesmas
```

6. Pilih database tersebut
7. Klik tab **Import**
8. Upload file:

```
backend/rme_puskesmas.sql
```

9. Klik **Import**

---

# 🖥️ Setup Backend (Flask)

Masuk ke folder backend:

```bash
cd backend
```

Install dependencies:

```bash
pip install flask flask-cors mysql-connector-python numpy
```

Pastikan konfigurasi database di `app.py`:

```python
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="rme_puskesmas"
)
```

Jalankan server:

```bash
python app.py
```

Server akan berjalan di:

```
http://127.0.0.1:5000
```

---

# 💻 Setup Frontend (React)

Masuk ke folder project:

```bash
cd rme-biometric-dashboard
```

Install dependencies:

```bash
npm install
```

Jalankan aplikasi:

```bash
npm run dev
```

Frontend akan berjalan di:

```
http://127.0.0.1:5173
```

---

# 👨‍💻 Pengembang

Project ini dikembangkan sebagai **prototype sistem rekam medis elektronik berbasis biometrik**.
