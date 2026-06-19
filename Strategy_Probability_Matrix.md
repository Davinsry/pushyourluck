# Matriks Probabilitas Strategi Makan Tahan Pedas 🌶️

Laporan ini berisi analisis matematis eksak dari berbagai urutan makan cabai (strategi) untuk semua karakter. 
Analisis ini menghitung peluang bertahannya karakter dan nilai ekspektasi skor (*Expected Value*) yang diperoleh.

> **Definisi Expected Value (Skor Harapan):**
> $$\text{Expected Score} = \text{Skor Jika Selamat} \times \text{Peluang Selamat}$$
> Strategi terbaik secara matematis adalah yang menghasilkan **Expected Score tertinggi**.

## 👤 Si Lidah Baja (BAJA)
* **Modifikator:** Poin tiap suap $-3$, **Memiliki 1 Nyawa Tambahan di Setiap Ronde**.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Carolina | 31.0 | 56 | 46% | x1.5 | 46 | 91.72% | 8.28% | **42.19** |
| Carolina + Susu + Carolina | 31.0 | 31 | 21% | x1.0 | 31 | 96.22% | 3.78% | **29.83** |
| Carolina + Susu + Rawit | 22.5 | 18 | 8% | x1.0 | 22 | 98.56% | 1.44% | **21.68** |
| Carolina + Rawit | 22.5 | 43 | 33% | x1.0 | 22 | 94.06% | 5.94% | **20.69** |
| Carolina + Susu + Ijo | 18.0 | 11 | 1% | x1.0 | 18 | 99.82% | 0.18% | **17.97** |
| Carolina + Ijo | 18.0 | 36 | 26% | x1.0 | 18 | 95.32% | 4.68% | **17.16** |
| Carolina + Ijo + Ijo | 20.5 | 44 | 34% | x1.0 | 20 | 83.54% | 16.46% | **16.71** |
| Carolina | 15.5 | 28 | 18% | x1.0 | 16 | 100.00% | 0.00% | **16.0** |
| Rawit + Rawit + Ijo | 16.5 | 38 | 28% | x1.0 | 16 | 92.56% | 7.44% | **14.81** |
| Rawit + Rawit | 14.0 | 30 | 20% | x1.0 | 14 | 99.00% | 1.00% | **13.86** |
| Rawit + Ijo + Ijo | 12.0 | 31 | 21% | x1.0 | 12 | 95.84% | 4.16% | **11.5** |
| Rawit + Ijo | 9.5 | 23 | 13% | x1.0 | 10 | 99.35% | 0.65% | **9.94** |
| Ijo + Ijo + Ijo | 7.5 | 24 | 14% | x1.0 | 8 | 99.16% | 0.84% | **7.93** |
| Rawit | 7.0 | 15 | 5% | x1.0 | 7 | 100.00% | 0.00% | **7.0** |
| Ijo + Ijo | 5.0 | 16 | 6% | x1.0 | 5 | 100.00% | 0.00% | **5.0** |
| Ijo | 2.5 | 8 | 0% | x1.0 | 2 | 100.00% | 0.00% | **2.0** |

---

## 👤 Si Rakus (RAKUS)
* **Modifikator:** Poin tiap suap $+3$, Pedas $+5$.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Rawit | 34.5 | 53 | 43% | x1.5 | 52 | 43.89% | 56.11% | **22.82** |
| Carolina + Carolina | 43.0 | 66 | 56% | x1.5 | 64 | 33.88% | 66.12% | **21.68** |
| Rawit + Rawit + Ijo | 34.5 | 53 | 43% | x1.5 | 52 | 35.91% | 64.09% | **18.67** |
| Carolina | 21.5 | 33 | 23% | x1.0 | 22 | 77.00% | 23.00% | **16.94** |
| Rawit + Rawit | 26.0 | 40 | 30% | x1.0 | 26 | 63.00% | 37.00% | **16.38** |
| Rawit + Ijo | 21.5 | 33 | 23% | x1.0 | 22 | 69.30% | 30.70% | **15.25** |
| Ijo + Ijo + Ijo | 25.5 | 39 | 29% | x1.0 | 26 | 57.85% | 42.15% | **15.04** |
| Carolina + Ijo | 30.0 | 46 | 36% | x1.0 | 30 | 49.28% | 50.72% | **14.78** |
| Carolina + Ijo + Ijo | 38.5 | 59 | 49% | x1.5 | 58 | 25.13% | 74.87% | **14.58** |
| Ijo + Ijo | 17.0 | 26 | 16% | x1.0 | 17 | 81.48% | 18.52% | **13.85** |
| Rawit + Ijo + Ijo | 30.0 | 46 | 36% | x1.0 | 30 | 44.35% | 55.65% | **13.31** |
| Rawit | 13.0 | 20 | 10% | x1.0 | 13 | 90.00% | 10.00% | **11.7** |
| Ijo | 8.5 | 13 | 3% | x1.0 | 8 | 97.00% | 3.00% | **7.76** |

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
* **Modifikator:** Multiplier maksimal dibatasi $\times 1.5$, mendapat **Bonus $+10$ poin** jika menyajikan di bawah pedas 45.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Susu + Carolina | 37.0 | 31 | 21% | x1.0 | 47 | 64.78% | 35.22% | **30.45** |
| Carolina + Susu + Rawit | 28.5 | 18 | 8% | x1.0 | 38 | 75.44% | 24.56% | **28.67** |
| Carolina + Susu + Ijo | 24.0 | 11 | 1% | x1.0 | 34 | 81.18% | 18.82% | **27.6** |
| Carolina + Carolina | 37.0 | 56 | 46% | x1.5 | 56 | 44.28% | 55.72% | **24.8** |
| Carolina | 18.5 | 28 | 18% | x1.0 | 28 | 82.00% | 18.00% | **22.96** |
| Rawit + Rawit | 20.0 | 30 | 20% | x1.0 | 30 | 76.00% | 24.00% | **22.8** |
| Rawit + Ijo | 15.5 | 23 | 13% | x1.0 | 26 | 82.65% | 17.35% | **21.49** |
| Ijo + Ijo + Ijo | 16.5 | 24 | 14% | x1.0 | 26 | 80.84% | 19.16% | **21.02** |
| Carolina + Rawit | 28.5 | 43 | 33% | x1.0 | 38 | 54.94% | 45.06% | **20.88** |
| Carolina + Ijo | 24.0 | 36 | 26% | x1.0 | 34 | 60.68% | 39.32% | **20.63** |
| Rawit + Ijo + Ijo | 21.0 | 31 | 21% | x1.0 | 31 | 65.29% | 34.71% | **20.24** |
| Ijo + Ijo | 11.0 | 16 | 6% | x1.0 | 21 | 94.00% | 6.00% | **19.74** |
| Rawit + Rawit + Ijo | 25.5 | 38 | 28% | x1.0 | 36 | 54.72% | 45.28% | **19.7** |
| Rawit | 10.0 | 15 | 5% | x1.0 | 20 | 95.00% | 5.00% | **19.0** |
| Carolina + Ijo + Ijo | 29.5 | 44 | 34% | x1.0 | 40 | 40.05% | 59.95% | **16.02** |
| Ijo | 5.5 | 8 | 0% | x1.0 | 16 | 100.00% | 0.00% | **16.0** |

---

## 👤 Si Perisai (PERISAI)
* **Modifikator:** Poin tiap suap $-2$.

| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Carolina + Carolina | 33.0 | 56 | 46% | x1.5 | 50 | 44.28% | 55.72% | **22.14** |
| Carolina + Susu + Carolina | 33.0 | 31 | 21% | x1.0 | 33 | 64.78% | 35.22% | **21.38** |
| Carolina + Susu + Rawit | 24.5 | 18 | 8% | x1.0 | 24 | 75.44% | 24.56% | **18.11** |
| Carolina + Susu + Ijo | 20.0 | 11 | 1% | x1.0 | 20 | 81.18% | 18.82% | **16.24** |
| Carolina + Rawit | 24.5 | 43 | 33% | x1.0 | 24 | 54.94% | 45.06% | **13.19** |
| Carolina | 16.5 | 28 | 18% | x1.0 | 16 | 82.00% | 18.00% | **13.12** |
| Rawit + Rawit | 16.0 | 30 | 20% | x1.0 | 16 | 76.00% | 24.00% | **12.16** |
| Carolina + Ijo | 20.0 | 36 | 26% | x1.0 | 20 | 60.68% | 39.32% | **12.14** |
| Rawit + Rawit + Ijo | 19.5 | 38 | 28% | x1.0 | 20 | 54.72% | 45.28% | **10.94** |
| Rawit + Ijo | 11.5 | 23 | 13% | x1.0 | 12 | 82.65% | 17.35% | **9.92** |
| Rawit + Ijo + Ijo | 15.0 | 31 | 21% | x1.0 | 15 | 65.29% | 34.71% | **9.79** |
| Carolina + Ijo + Ijo | 23.5 | 44 | 34% | x1.0 | 24 | 40.05% | 59.95% | **9.61** |
| Ijo + Ijo + Ijo | 10.5 | 24 | 14% | x1.0 | 10 | 80.84% | 19.16% | **8.08** |
| Rawit | 8.0 | 15 | 5% | x1.0 | 8 | 95.00% | 5.00% | **7.6** |
| Ijo + Ijo | 7.0 | 16 | 6% | x1.0 | 7 | 94.00% | 6.00% | **6.58** |
| Ijo | 3.5 | 8 | 0% | x1.0 | 4 | 100.00% | 0.00% | **4.0** |

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
