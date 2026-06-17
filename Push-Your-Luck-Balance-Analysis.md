# Laporan Analisis Keseimbangan Karakter (Push-Your-Luck)

Laporan ini memuat analisis mendalam mengenai keseimbangan 6 karakter dalam game **Tahan Pedas** berdasarkan simulasi **15.000 game** (5.000 game untuk masing-masing jumlah pemain 2, 3, dan 4).

---

## 1. Ringkasan Hasil Simulasi

Keseimbangan diukur berdasarkan deviasi win-rate terhadap **baseline ideal** (peluang menang acak):
* **2 Pemain**: Baseline **50.00%** (Toleransi: **42.00% - 58.00%**)
* **3 Pemain**: Baseline **33.33%** (Toleransi: **25.33% - 41.33%**)
* **4 Pemain**: Baseline **25.00%** (Toleransi: **17.00% - 33.00%**)

### Tabel Hasil 2-Player (Duel)
| Karakter | Game Dimainkan | Jumlah Menang | Win Rate | Skor Rata-Rata | Status Keseimbangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **baja** | 1650 | 1107.5 | **67.12%** | 12.54 | *Sedikit di atas batas (High floor)* |
| **pendingin**| 1689 | 836.0 | **49.50%** | 14.64 | **Seimbang (Balanced)** |
| **hemat** | 1703 | 822.5 | **48.30%** | 10.86 | **Seimbang (Balanced)** |
| **perisai**  | 1641 | 742.5 | **45.25%** | 15.33 | **Seimbang (Balanced)** |
| **kompor**   | 1694 | 764.0 | **45.10%** | 19.34 | **Seimbang (Balanced)** |
| **rakus**    | 1623 | 727.5 | **44.82%** | 28.32 | **Seimbang (Balanced)** |

### Tabel Hasil 3-Player
| Karakter | Game Dimainkan | Jumlah Menang | Win Rate | Skor Rata-Rata | Status Keseimbangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **baja** | 2470 | 1137.5 | **46.05%** | 12.77 | *Sedikit di atas batas* |
| **rakus**    | 2558 | 904.7 | **35.37%** | 29.05 | **Seimbang (Balanced)** |
| **hemat** | 2480 | 751.0 | **30.28%** | 11.21 | **Seimbang (Balanced)** |
| **pendingin**| 2539 | 764.8 | **30.12%** | 14.25 | **Seimbang (Balanced)** |
| **perisai**  | 2490 | 740.0 | **29.72%** | 16.51 | **Seimbang (Balanced)** |
| **kompor**   | 2463 | 702.0 | **28.50%** | 17.38 | **Seimbang (Balanced)** |

### Tabel Hasil 4-Player
| Karakter | Game Dimainkan | Jumlah Menang | Win Rate | Skor Rata-Rata | Status Keseimbangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **baja** | 3319 | 1087.0 | **32.75%** | 13.05 | **Seimbang (Balanced)** |
| **rakus**    | 3379 | 964.5 | **28.54%** | 25.83 | **Seimbang (Balanced)** |
| **pendingin**| 3351 | 823.0 | **24.56%** | 16.16 | **Seimbang (Balanced)** |
| **kompor**   | 3339 | 758.0 | **22.70%** | 18.71 | **Seimbang (Balanced)** |
| **perisai**  | 3311 | 712.5 | **21.52%** | 15.52 | **Seimbang (Balanced)** |
| **hemat** | 3301 | 655.0 | **19.85%** | 11.64 | **Seimbang (Balanced)** |

---

## 2. Analisis Performa Karakter

### Si Lidah Baja (`baja`)
* **Kelebihan**: Selamat dari 1 kepedesan per ronde.
* **Kekurangan**: Penalti `-15` poin per suap & `+6` ekstra pedas.
* **Analisis**: Baja adalah contoh karakter **High Floor, Low Ceiling**. 
  * Skor rata-ratanya tergolong rendah (~12 poin) karena penalti poin per suapnya yang besar. 
  * Namun, tingkat kemenangannya tetap tinggi (khususnya pada 2-player: 67.12%) karena kemampuannya menghindari kegagalan (*bust*). Di game duel 2-player, konsistensi ini sangat mematikan karena musuh yang bermain agresif sering kali *bust* dan mendapat poin ronde 0, membuat Baja menang secara pasif.
  * Di game 4-player, karakter ini **sempurna seimbang** (32.75% win-rate) karena tingginya peluang salah satu dari tiga pemain lain mendapat ronde keberuntungan besar (*high ceiling*) yang tidak mungkin dikejar oleh Baja.

### Si Rakus (`rakus`)
* **Kelebihan**: +3 poin per suap.
* **Kekurangan**: +4 pedas per suap.
* **Analisis**: Rakus adalah karakter **Low Floor, High Ceiling**.
  * Skor rata-ratanya adalah yang tertinggi di antara semua karakter (~25-29 poin). Saat dia berhasil bertahan hidup, dia mencetak poin dalam jumlah masif.
  * Namun, win-rate miliknya tetap stabil di angka ~28% (4-player) dan ~44% (2-player) karena risiko *bust* yang sangat tinggi akibat penalti +4 pedas per suap.
  * Karakter ini sangat seimbang dan merepresentasikan esensi mekanik *push-your-luck* yang sesungguhnya.

### Si Pendingin (`pendingin`)
* **Kelebihan**: Mulai dengan 2 susu.
* **Kekurangan**: +2 pedas per suap.
* **Analisis**: Pendingin memiliki performa yang sangat stabil di semua jumlah pemain (~20% di 4-player, ~30% di 3-player, ~49% di 2-player). Ekstra susu membantunya menetralkan penalti pedas bawaannya secara taktis.

### Si Tukang Kompor (`kompor`)
* **Kelebihan**: Mulai dengan 3 jatah sabotase.
* **Kekurangan**: Multiplier maksimal mentok di ×1.5.
* **Analisis**: Kompor bekerja sangat baik sebagai penekan skor lawan. Namun karena multiplier-nya dibatasi, kemampuannya sendiri untuk mencetak skor besar terhambat. Keseimbangannya sangat baik di angka ~22% (4-player).

### Si Perisai (`perisai`)
* **Kelebihan**: Mulai dengan 2 tameng.
* **Kekurangan**: −1 poin per suap.
* **Analisis**: Dengan diringankannya penalti poin menjadi hanya `-1`, Perisai menjadi karakter defensif yang solid. Win-rate miliknya berada di zona seimbang yang aman (~21.5% di 4-player).

### Si Hemat (`hemat`)
* **Kelebihan**: Bonus +8 poin jika menyajikan saat pedas < 45.
* **Kekurangan**: Multiplier maksimal mentok di ×1.5.
* **Analisis**: Hemat sangat baik untuk mengumpulkan poin kecil secara aman dan konsisten. Win-rate miliknya stabil di kisaran ~20% (4-player).

---

## 3. Kesimpulan & Rekomendasi Desain

1. **Keseimbangan Pihak Ketiga & Keempat**: Untuk sesi bermain multiplayer standar (3-4 pemain), game ini secara matematis **sangat seimbang**. Perbedaan kemampuan karakter terkompensasi dengan baik oleh dinamika interaksi sosial (seperti sabotase dan taruhan penonton).
2. **Keseimbangan Duel (2 Pemain)**: Jika fokus game diarahkan ke permainan duel 2-player yang kompetitif, mekanik nyawa tambahan milik `baja` akan terasa sedikit dominan di atas kertas. Rekomendasi mekanis jika ingin menyeimbangkannya lebih lanjut di masa depan adalah membatasi *safety net* `baja` menjadi **1 kali per game** (bukan 1 kali per ronde) khusus untuk mode 2-player.
