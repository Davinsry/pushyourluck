# Matriks Probabilitas Strategi Makan Tahan Pedas 🌶️

Laporan ini berisi analisis matematis eksak dari berbagai urutan makan cabai (strategi) untuk semua karakter. 
Analisis ini menghitung peluang bertahannya karakter dan nilai ekspektasi skor (*Expected Value*) yang diperoleh.

> **Definisi Expected Value (Skor Harapan):**
> $$\text{Expected Score} = \text{Skor Jika Selamat} \times \text{Peluang Selamat}$$
> Strategi terbaik secara matematis adalah yang menghasilkan **Expected Score tertinggi**.

## 👤 Si Lidah Baja (BAJA)
* **Modifikator:** Poin tiap suap $-18$, Pedas $+10$, **Memiliki 1 Nyawa Tambahan per Ronde**.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Ijo + Ijo + Ijo | 3.0 | 54 | 44% | x1.5 | 4 | 84.79% | 15.21% | **3.39** |
| Rawit + Ijo + Ijo | 3.0 | 61 | 51% | x1.5 | 4 | 75.62% | 24.38% | **3.02** |
| Rawit + Rawit | 2.0 | 50 | 40% | x1.5 | 3 | 94.00% | 6.00% | **2.82** |
| Rawit + Rawit + Ijo | 3.0 | 68 | 58% | x1.5 | 4 | 69.06% | 30.94% | **2.76** |
| Carolina + Susu + Carolina | 2.0 | 51 | 41% | x1.5 | 3 | 88.52% | 11.48% | **2.66** |
| Carolina + Ijo | 2.0 | 56 | 46% | x1.5 | 3 | 87.12% | 12.88% | **2.61** |
| Carolina + Rawit | 2.0 | 63 | 53% | x1.5 | 3 | 85.16% | 14.84% | **2.55** |
| Carolina + Carolina | 2.0 | 76 | 66% | x1.5 | 3 | 81.52% | 18.48% | **2.45** |
| Carolina + Ijo + Ijo | 3.0 | 74 | 64% | x1.5 | 4 | 56.25% | 43.75% | **2.25** |
| Ijo + Ijo | 2.0 | 36 | 26% | x1.0 | 2 | 97.92% | 2.08% | **1.96** |
| Rawit + Ijo | 2.0 | 43 | 33% | x1.0 | 2 | 95.05% | 4.95% | **1.9** |
| Carolina + Susu + Ijo | 2.0 | 31 | 21% | x1.0 | 2 | 94.12% | 5.88% | **1.88** |
| Carolina + Susu + Rawit | 2.0 | 38 | 28% | x1.0 | 2 | 92.16% | 7.84% | **1.84** |
| Ijo | 1.0 | 18 | 8% | x1.0 | 1 | 100.00% | 0.00% | **1.0** |
| Rawit | 1.0 | 25 | 15% | x1.0 | 1 | 100.00% | 0.00% | **1.0** |
| Carolina | 1.0 | 38 | 28% | x1.0 | 1 | 100.00% | 0.00% | **1.0** |

---

## 👤 Si Rakus (RAKUS)
* **Modifikator:** Poin tiap suap $+2$, Pedas $+5$.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Rawit | 32.5 | 53 | 43% | x1.5 | 49 | 43.89% | 56.11% | **21.51** |
| Carolina + Carolina | 41.0 | 66 | 56% | x1.5 | 62 | 33.88% | 66.12% | **21.01** |
| Rawit + Rawit + Ijo | 31.5 | 53 | 43% | x1.5 | 47 | 35.91% | 64.09% | **16.88** |
| Carolina | 20.5 | 33 | 23% | x1.0 | 20 | 77.00% | 23.00% | **15.4** |
| Rawit + Rawit | 24.0 | 40 | 30% | x1.0 | 24 | 63.00% | 37.00% | **15.12** |
| Rawit + Ijo | 19.5 | 33 | 23% | x1.0 | 20 | 69.30% | 30.70% | **13.86** |
| Carolina + Ijo | 28.0 | 46 | 36% | x1.0 | 28 | 49.28% | 50.72% | **13.8** |
| Carolina + Ijo + Ijo | 35.5 | 59 | 49% | x1.5 | 53 | 25.13% | 74.87% | **13.32** |
| Ijo + Ijo + Ijo | 22.5 | 39 | 29% | x1.0 | 22 | 57.85% | 42.15% | **12.73** |
| Ijo + Ijo | 15.0 | 26 | 16% | x1.0 | 15 | 81.48% | 18.52% | **12.22** |
| Rawit + Ijo + Ijo | 27.0 | 46 | 36% | x1.0 | 27 | 44.35% | 55.65% | **11.98** |
| Rawit | 12.0 | 20 | 10% | x1.0 | 12 | 90.00% | 10.00% | **10.8** |
| Ijo | 7.5 | 13 | 3% | x1.0 | 8 | 97.00% | 3.00% | **7.76** |

---

## 👤 Si Tukang Kompor (KOMPOR)
* **Modifikator:** Multiplier maksimal dibatasi $\times 1.5$.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Carolina | 37.0 | 56 | 46% | x1.5 | 56 | 44.28% | 55.72% | **24.8** |
| Carolina + Susu + Carolina | 37.0 | 31 | 21% | x1.0 | 37 | 64.78% | 35.22% | **23.97** |
| Carolina + Susu + Rawit | 28.5 | 18 | 8% | x1.0 | 28 | 75.44% | 24.56% | **21.12** |
| Carolina + Susu + Ijo | 24.0 | 11 | 1% | x1.0 | 24 | 81.18% | 18.82% | **19.48** |
| Carolina + Rawit | 28.5 | 43 | 33% | x1.0 | 28 | 54.94% | 45.06% | **15.38** |
| Rawit + Rawit | 20.0 | 30 | 20% | x1.0 | 20 | 76.00% | 24.00% | **15.2** |
| Carolina | 18.5 | 28 | 18% | x1.0 | 18 | 82.00% | 18.00% | **14.76** |
| Carolina + Ijo | 24.0 | 36 | 26% | x1.0 | 24 | 60.68% | 39.32% | **14.56** |
| Rawit + Rawit + Ijo | 25.5 | 38 | 28% | x1.0 | 26 | 54.72% | 45.28% | **14.23** |
| Rawit + Ijo + Ijo | 21.0 | 31 | 21% | x1.0 | 21 | 65.29% | 34.71% | **13.71** |
| Rawit + Ijo | 15.5 | 23 | 13% | x1.0 | 16 | 82.65% | 17.35% | **13.22** |
| Ijo + Ijo + Ijo | 16.5 | 24 | 14% | x1.0 | 16 | 80.84% | 19.16% | **12.93** |
| Carolina + Ijo + Ijo | 29.5 | 44 | 34% | x1.0 | 30 | 40.05% | 59.95% | **12.01** |
| Ijo + Ijo | 11.0 | 16 | 6% | x1.0 | 11 | 94.00% | 6.00% | **10.34** |
| Rawit | 10.0 | 15 | 5% | x1.0 | 10 | 95.00% | 5.00% | **9.5** |
| Ijo | 5.5 | 8 | 0% | x1.0 | 6 | 100.00% | 0.00% | **6.0** |

---

## 👤 Si Hemat (HEMAT)
* **Modifikator:** Multiplier maksimal dibatasi $\times 1.5$, mendapat **Bonus $+14$ poin** jika menyajikan di bawah pedas 45.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Susu + Carolina | 37.0 | 31 | 21% | x1.0 | 51 | 64.78% | 35.22% | **33.04** |
| Carolina + Susu + Rawit | 28.5 | 18 | 8% | x1.0 | 42 | 75.44% | 24.56% | **31.68** |
| Carolina + Susu + Ijo | 24.0 | 11 | 1% | x1.0 | 38 | 81.18% | 18.82% | **30.85** |
| Carolina | 18.5 | 28 | 18% | x1.0 | 32 | 82.00% | 18.00% | **26.24** |
| Rawit + Rawit | 20.0 | 30 | 20% | x1.0 | 34 | 76.00% | 24.00% | **25.84** |
| Rawit + Ijo | 15.5 | 23 | 13% | x1.0 | 30 | 82.65% | 17.35% | **24.8** |
| Carolina + Carolina | 37.0 | 56 | 46% | x1.5 | 56 | 44.28% | 55.72% | **24.8** |
| Ijo + Ijo + Ijo | 16.5 | 24 | 14% | x1.0 | 30 | 80.84% | 19.16% | **24.25** |
| Ijo + Ijo | 11.0 | 16 | 6% | x1.0 | 25 | 94.00% | 6.00% | **23.5** |
| Carolina + Rawit | 28.5 | 43 | 33% | x1.0 | 42 | 54.94% | 45.06% | **23.07** |
| Carolina + Ijo | 24.0 | 36 | 26% | x1.0 | 38 | 60.68% | 39.32% | **23.06** |
| Rawit + Ijo + Ijo | 21.0 | 31 | 21% | x1.0 | 35 | 65.29% | 34.71% | **22.85** |
| Rawit | 10.0 | 15 | 5% | x1.0 | 24 | 95.00% | 5.00% | **22.8** |
| Rawit + Rawit + Ijo | 25.5 | 38 | 28% | x1.0 | 40 | 54.72% | 45.28% | **21.89** |
| Ijo | 5.5 | 8 | 0% | x1.0 | 20 | 100.00% | 0.00% | **20.0** |
| Carolina + Ijo + Ijo | 29.5 | 44 | 34% | x1.0 | 44 | 40.05% | 59.95% | **17.62** |

---

## 👤 Si Perisai (PERISAI)
* **Modifikator:** Tidak memiliki penalti poin (Poin $+0$).

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Carolina | 37.0 | 56 | 46% | x1.5 | 56 | 44.28% | 55.72% | **24.8** |
| Carolina + Susu + Carolina | 37.0 | 31 | 21% | x1.0 | 37 | 64.78% | 35.22% | **23.97** |
| Carolina + Susu + Rawit | 28.5 | 18 | 8% | x1.0 | 28 | 75.44% | 24.56% | **21.12** |
| Carolina + Susu + Ijo | 24.0 | 11 | 1% | x1.0 | 24 | 81.18% | 18.82% | **19.48** |
| Carolina + Rawit | 28.5 | 43 | 33% | x1.0 | 28 | 54.94% | 45.06% | **15.38** |
| Rawit + Rawit | 20.0 | 30 | 20% | x1.0 | 20 | 76.00% | 24.00% | **15.2** |
| Carolina | 18.5 | 28 | 18% | x1.0 | 18 | 82.00% | 18.00% | **14.76** |
| Carolina + Ijo | 24.0 | 36 | 26% | x1.0 | 24 | 60.68% | 39.32% | **14.56** |
| Rawit + Rawit + Ijo | 25.5 | 38 | 28% | x1.0 | 26 | 54.72% | 45.28% | **14.23** |
| Rawit + Ijo + Ijo | 21.0 | 31 | 21% | x1.0 | 21 | 65.29% | 34.71% | **13.71** |
| Rawit + Ijo | 15.5 | 23 | 13% | x1.0 | 16 | 82.65% | 17.35% | **13.22** |
| Ijo + Ijo + Ijo | 16.5 | 24 | 14% | x1.0 | 16 | 80.84% | 19.16% | **12.93** |
| Carolina + Ijo + Ijo | 29.5 | 44 | 34% | x1.0 | 30 | 40.05% | 59.95% | **12.01** |
| Ijo + Ijo | 11.0 | 16 | 6% | x1.0 | 11 | 94.00% | 6.00% | **10.34** |
| Rawit | 10.0 | 15 | 5% | x1.0 | 10 | 95.00% | 5.00% | **9.5** |
| Ijo | 5.5 | 8 | 0% | x1.0 | 6 | 100.00% | 0.00% | **6.0** |

---

## 👤 Si Pendingin (PENDINGIN)
* **Modifikator:** Pedas naik $+2$ tiap suap, mulai dengan susu ekstra.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Carolina | 37.0 | 60 | 50% | x1.5 | 56 | 40.00% | 60.00% | **22.4** |
| Carolina + Susu + Carolina | 37.0 | 35 | 25% | x1.0 | 37 | 60.00% | 40.00% | **22.2** |
| Carolina + Susu + Rawit | 28.5 | 22 | 12% | x1.0 | 28 | 70.40% | 29.60% | **19.71** |
| Carolina + Susu + Ijo | 24.0 | 15 | 5% | x1.0 | 24 | 76.00% | 24.00% | **18.24** |
| Carolina + Ijo + Ijo | 29.5 | 50 | 40% | x1.5 | 44 | 33.60% | 66.40% | **14.78** |
| Carolina | 18.5 | 30 | 20% | x1.0 | 18 | 80.00% | 20.00% | **14.4** |
| Rawit + Rawit | 20.0 | 34 | 24% | x1.0 | 20 | 70.68% | 29.32% | **14.14** |
| Carolina + Rawit | 28.5 | 47 | 37% | x1.0 | 28 | 50.40% | 49.60% | **14.11** |
| Carolina + Ijo | 24.0 | 40 | 30% | x1.0 | 24 | 56.00% | 44.00% | **13.44** |
| Rawit + Ijo | 15.5 | 27 | 17% | x1.0 | 16 | 77.19% | 22.81% | **12.35** |
| Rawit + Rawit + Ijo | 25.5 | 44 | 34% | x1.0 | 26 | 46.65% | 53.35% | **12.13** |
| Rawit + Ijo + Ijo | 21.0 | 37 | 27% | x1.0 | 21 | 56.35% | 43.65% | **11.83** |
| Ijo + Ijo + Ijo | 16.5 | 30 | 20% | x1.0 | 16 | 72.00% | 28.00% | **11.52** |
| Ijo + Ijo | 11.0 | 20 | 10% | x1.0 | 11 | 90.00% | 10.00% | **9.9** |
| Rawit | 10.0 | 17 | 7% | x1.0 | 10 | 93.00% | 7.00% | **9.3** |
| Ijo | 5.5 | 10 | 0% | x1.0 | 6 | 100.00% | 0.00% | **6.0** |

---

## 👤 Pemain Standar (Tanpa Modifikator) (NORMAL)
* **Modifikator:** Tidak ada (Karakter baseline standar).

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Carolina | 37.0 | 56 | 46% | x1.5 | 56 | 44.28% | 55.72% | **24.8** |
| Carolina + Susu + Carolina | 37.0 | 31 | 21% | x1.0 | 37 | 64.78% | 35.22% | **23.97** |
| Carolina + Susu + Rawit | 28.5 | 18 | 8% | x1.0 | 28 | 75.44% | 24.56% | **21.12** |
| Carolina + Susu + Ijo | 24.0 | 11 | 1% | x1.0 | 24 | 81.18% | 18.82% | **19.48** |
| Carolina + Rawit | 28.5 | 43 | 33% | x1.0 | 28 | 54.94% | 45.06% | **15.38** |
| Rawit + Rawit | 20.0 | 30 | 20% | x1.0 | 20 | 76.00% | 24.00% | **15.2** |
| Carolina | 18.5 | 28 | 18% | x1.0 | 18 | 82.00% | 18.00% | **14.76** |
| Carolina + Ijo | 24.0 | 36 | 26% | x1.0 | 24 | 60.68% | 39.32% | **14.56** |
| Rawit + Rawit + Ijo | 25.5 | 38 | 28% | x1.0 | 26 | 54.72% | 45.28% | **14.23** |
| Rawit + Ijo + Ijo | 21.0 | 31 | 21% | x1.0 | 21 | 65.29% | 34.71% | **13.71** |
| Rawit + Ijo | 15.5 | 23 | 13% | x1.0 | 16 | 82.65% | 17.35% | **13.22** |
| Ijo + Ijo + Ijo | 16.5 | 24 | 14% | x1.0 | 16 | 80.84% | 19.16% | **12.93** |
| Carolina + Ijo + Ijo | 29.5 | 44 | 34% | x1.0 | 30 | 40.05% | 59.95% | **12.01** |
| Ijo + Ijo | 11.0 | 16 | 6% | x1.0 | 11 | 94.00% | 6.00% | **10.34** |
| Rawit | 10.0 | 15 | 5% | x1.0 | 10 | 95.00% | 5.00% | **9.5** |
| Ijo | 5.5 | 8 | 0% | x1.0 | 6 | 100.00% | 0.00% | **6.0** |

---
