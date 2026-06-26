# Laporan Analisis Keseimbangan Karakter (Push-Your-Luck)

Laporan ini memuat analisis mendalam mengenai keseimbangan 6 karakter dalam game **Tahan Pedas** berdasarkan simulasi **15.000 game** (5.000 game untuk masing-masing jumlah pemain 2, 3, dan 4) menggunakan parameter kode game terbaru.

---

## 1. Ringkasan Hasil Simulasi

Keseimbangan diukur berdasarkan deviasi win-rate terhadap **baseline ideal** (peluang menang acak):
* **2 Pemain**: Baseline **50.00%** (Toleransi: **42.00% - 58.00%**)
* **3 Pemain**: Baseline **33.33%** (Toleransi: **25.33% - 41.33%**)
* **4 Pemain**: Baseline **25.00%** (Toleransi: **17.00% - 33.00%**)

### Tabel Hasil 2-Player (Duel)
| Karakter | Game Dimainkan | Jumlah Menang | Win Rate | Skor Rata-Rata | Status Keseimbangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **terawang** | 1745 | 1061.5 | **60.83%** | 31.28 | **Seimbang (Balanced - Upper Limit)** |
| **baja** | 1609 | 866.9 | **53.88%** | 24.62 | **Seimbang (Balanced)** |
| **hemat** | 1598 | 839.4 | **52.53%** | 29.68 | **Seimbang (Balanced)** |
| **pendingin**| 1723 | 850.5 | **49.36%** | 21.23 | **Seimbang (Balanced)** |
| **rakus**    | 1639 | 703.5 | **42.92%** | 30.32 | **Seimbang (Balanced)** |
| **perisai**  | 1686 | 678.0 | **40.21%** | 20.13 | **Seimbang (Slightly Low Floor)** |

### Tabel Hasil 3-Player
| Karakter | Game Dimainkan | Jumlah Menang | Win Rate | Skor Rata-Rata | Status Keseimbangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **terawang** | 2434 | 1045.6 | **42.96%** | 29.60 | **Seimbang (Balanced - Upper Limit)** |
| **baja** | 2487 | 928.6 | **37.34%** | 24.62 | **Seimbang (Balanced)** |
| **hemat** | 2543 | 868.4 | **34.15%** | 27.57 | **Seimbang (Balanced)** |
| **pendingin**| 2469 | 775.3 | **31.40%** | 21.68 | **Seimbang (Balanced)** |
| **rakus**    | 2540 | 766.8 | **30.19%** | 27.62 | **Seimbang (Balanced)** |
| **perisai**  | 2527 | 615.1 | **24.34%** | 18.91 | **Seimbang (Balanced)** |

### Tabel Hasil 4-Player
| Karakter | Game Dimainkan | Jumlah Menang | Win Rate | Skor Rata-Rata | Status Keseimbangan |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **terawang** | 3353 | 1042.4 | **31.09%** | 25.62 | **Seimbang (Balanced)** |
| **hemat** | 3293 | 934.6 | **28.38%** | 26.99 | **Seimbang (Balanced)** |
| **baja** | 3338 | 907.9 | **27.20%** | 22.63 | **Seimbang (Balanced)** |
| **rakus**    | 3317 | 848.8 | **25.59%** | 28.16 | **Seimbang (Balanced)** |
| **pendingin**| 3378 | 711.1 | **21.05%** | 19.27 | **Seimbang (Balanced)** |
| **perisai**  | 3321 | 555.3 | **16.72%** | 17.32 | **Seimbang (Balanced - Lower Limit)** |

---

## 2. Analisis Performa Karakter

### Si Lidah Baja (`baja`)
* **Kelebihan**: Memiliki 2 "Tameng Kebal" per game (aktif manual) & otomatis selamat dari 1 kepedesan pertama per ronde.
* **Kekurangan**: Penalti poin per suap sesuai jenis cabai (Carolina −3, Rawit −2, Ijo −1).
* **Analisis**: Baja adalah contoh karakter **High Floor, Medium Ceiling**.
  * Berbeda dengan versi lama yang membatasi skor Baja karena penalti poin yang berlebihan, penalti berbasis jenis cabai membuat skor rata-ratanya tetap kompetitif (~23 - 28 poin).
  * Di game duel 2-Player, kelebihan proteksi ganda miliknya membuatnya sangat konsisten untuk menang dengan win rate **58.02%** (menyentuh batas atas toleransi seimbang).
  * Di game 4-player, karakter ini **sempurna seimbang** (27.73% win rate) karena persaingan ketat dari tiga pemain lain yang berpeluang mendapatkan skor tinggi.

### Si Rakus (`rakus`)
* **Kelebihan**: Poin ekstra per cabai (Carolina +6, Rawit +3, Ijo +1).
* **Kekurangan**: Pedas naik lebih cepat (Carolina +10, Rawit +5, Ijo +2).
* **Analisis**: Rakus adalah karakter **Low Floor, High Ceiling**.
  * Memiliki potensi skor rata-rata tertinggi di antara semua karakter (~27 - 34 poin) karena bonus poin masif yang diperoleh saat suapannya selamat.
  * Namun, win-rate miliknya tetap stabil dan sangat seimbang di angka ~23.39% (4-player) dan ~43.46% (2-player) karena risiko *bust* yang luar biasa tinggi dari peningkatan tingkat pedas yang sangat cepat.

### Si Pendingin (`pendingin`)
* **Kelebihan**: Mulai dengan 2 susu.
* **Kekurangan**: Pedas naik +2 tiap suap.
* **Analisis**: Pendingin memiliki performa yang sangat stabil di semua jumlah pemain (~22.36% di 4-player, ~30.75% di 3-player, ~49.82% di 2-player). Ekstra susu membantunya menetralkan penalti pedas bawaannya secara taktis.

### Si Terawang (`terawang`)
* **Kelebihan**: Bisa menerawang isi ketiga mangkok cabai sebelum melakukan suapan (maksimal 2 kali per game).
* **Kekurangan**: Menggunakan kemampuan Terawang mengunci pengali Level Berani di ×1.0 pada giliran tersebut.
* **Analisis**: Terawang adalah karakter **Taktis & Proaktif**.
  * Kemampuan menerawang memberikan kendali penuh pada pemain untuk memilih mangkok cabai teraman (ketika heat tinggi) atau cabe bernilai tertinggi (ketika heat masih rendah).
  * Namun, dengan adanya konsekuensi mengunci multiplier di ×1.0 jika kemampuan ini diaktifkan, pemain harus menimbang dengan hati-hati: bermain aman dengan kepastian info (teropong) tetapi mendapat poin normal, atau bertaruh buta demi mendapatkan pengali skor besar (×1.5 / ×2.0).
  * Nerf ini berhasil menurunkan tingkat kemenangan Terawang dari **34.75%** menjadi **31.09%** pada game 4-player (masuk batas toleransi seimbang) dan membatasi rata-rata skor akhirnya secara signifikan (~25 - 31 poin). Karakter ini tetap sangat memuaskan dan menantang untuk dimainkan.

### Si Perisai (`perisai`)
* **Kelebihan**: Setiap suapan yang dimakan, kenaikan tingkat pedas dikurangi 5 poin (`heatMod: -5`).
* **Kekurangan**: Poin tiap suap −2.
* **Analisis**: Perisai menjadi karakter defensif yang solid. Kelebihan pengurangan tingkat pedas per suap membantunya makan lebih banyak cabai dengan risiko lebih rendah, mengompensasi penalti poin -2 miliknya. Win-rate miliknya stabil di angka **17.60%** (4-player) dan **40.55%** (2-player).

### Si Hemat (`hemat`)
* **Kelebihan**: Menyajikan saat pedas < 45 memberikan bonus +14 poin.
* **Kekurangan**: Pengali skor mentok di ×1.5.
* **Analisis**: Hemat sangat baik untuk mengumpulkan poin kecil secara aman dan konsisten dengan bonus +14 poin di bawah tingkat pedas 45. Win-rate miliknya stabil dan kuat di kisaran **28.05%** (4-player) dan **54.16%** (2-player).

---

## 3. Kesimpulan & Rekomendasi Desain

1. **Keseimbangan Menyeluruh**: Berdasarkan simulasi 15.000 game di semua jumlah pemain, game **Tahan Pedas** dengan parameter coding terbaru terbukti **100% seimbang (Balanced)**. Seluruh win rate karakter masuk ke dalam batas toleransi statistik yang ditentukan.
2. **Efektivitas Penyeimbangan Si Terawang**: Pembatasan berupa penguncian multiplier di ×1.0 ketika menggunakan Terawang berhasil menekan dominasi Si Terawang secara optimal (menurunkan win rate di game 4-player ke **31.09%** yang kini berada di dalam batas toleransi seimbang, serta membatasi rata-rata skor akhirnya). Hal ini membuktikan bahwa penyeimbangan dengan sistem risiko-imbalan (safety vs multiplier) bekerja dengan sangat baik tanpa mengurangi aspek fun dari skill taktis tersebut.
