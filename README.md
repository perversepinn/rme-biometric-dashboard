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

# 📁 Struktur Project

```
rme-biometrik/
│
├── backend/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FaceScanner.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Page.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DataPasien.jsx
│   │   │   ├── Pendaftaran.jsx
│   │   │   └── Login.jsx
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```

---

# ⚙️ Instalasi

## 1️⃣ Clone Repository

```bash
git clone https://github.com/username/rme-biometrik.git
cd rme-biometrik
```

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

Masuk ke folder frontend:

```bash
cd frontend
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

# 🗄️ Struktur Database

Database yang digunakan: **MySQL**

## Tabel `patients`

| Field | Tipe |
|------|------|
| id | int |
| noRM | varchar |
| nama | varchar |
| nik | varchar |
| tempatLahir | varchar |
| tanggalLahir | date |
| umur | int |
| jenisKelamin | varchar |
| alamat | text |
| kecamatan | varchar |
| kota | varchar |
| provinsi | varchar |
| telepon | varchar |
| agama | varchar |
| statusPerkawinan | varchar |
| pekerjaan | varchar |
| pendidikan | varchar |
| namaIbu | varchar |
| pekerjaanIbu | varchar |
| namaAyah | varchar |
| pekerjaanAyah | varchar |
| namaKK | varchar |
| jkn | varchar |
| catatan | text |

---

## Tabel `face_biometrics`

| Field | Tipe |
|------|------|
| id | int |
| patient_id | int |
| descriptor | JSON |

---

# 🔎 Cara Kerja Face Recognition

1. Kamera mengambil beberapa frame wajah pasien
2. Sistem menghasilkan **face descriptor**
3. Descriptor disimpan ke database
4. Saat verifikasi:
   - Descriptor baru dibandingkan dengan database
   - Menggunakan **Euclidean Distance**
5. Jika jarak < threshold → pasien teridentifikasi

---

# 🚀 Pengembangan Selanjutnya

Beberapa fitur yang dapat ditambahkan:

- Scan sidik jari menggunakan sensor eksternal
- Multi descriptor wajah untuk meningkatkan akurasi
- Sistem login berbasis biometrik
- Audit log aktivitas pengguna
- Integrasi dengan sistem rekam medis nasional

---

# 👨‍💻 Pengembang

Project ini dikembangkan sebagai **prototype sistem rekam medis elektronik berbasis biometrik**.
