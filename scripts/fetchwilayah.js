import fs from "fs";
import axios from "axios";

const BASE = "https://wilayah.id/api";

async function run() {
  try {
    console.log("📥 Ambil data provinsi...");
    const provRes = await axios.get(`${BASE}/provinces.json`);
    const provinces = provRes.data.data; // 🔥 PERBAIKAN DI SINI

    const wilayah = [];

    for (const prov of provinces) {
      console.log(`➡ Provinsi: ${prov.name}`);

      const provObj = {
        code: prov.code,
        name: prov.name,
        regencies: []
      };

      console.log("   📥 Ambil kabupaten/kota...");
      const regRes = await axios.get(`${BASE}/regencies/${prov.code}.json`);
      const regencies = regRes.data.data; // 🔥 .data lagi

      for (const reg of regencies) {
        const regObj = {
          code: reg.code,
          name: reg.name,
          districts: []
        };

        console.log(`      📥 Ambil kecamatan ${reg.name}...`);
        const distRes = await axios.get(`${BASE}/districts/${reg.code}.json`);
        const districts = distRes.data.data; // 🔥 .data lagi

        districts.forEach(dist => {
          regObj.districts.push({
            code: dist.code,
            name: dist.name
          });
        });

        provObj.regencies.push(regObj);
      }

      wilayah.push(provObj);
    }

    fs.writeFileSync(
      "src/data/wilayah.json",
      JSON.stringify(wilayah, null, 2)
    );

    console.log("\n✅ SELESAI! File wilayah.json berhasil dibuat.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

run();
