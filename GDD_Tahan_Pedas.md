# GAME DESIGN DOCUMENT (GDD) — TAHAN PEDAS 🌶️

**Nama Game:** Tahan Pedas  
**Genre:** Push-Your-Luck Party Game  
**Format Game:** Digital Prototype (Web-based: React, Tailwind CSS, Three.js)  
**Target Pemain:** 2 – 4 Pemain (Lokal Pass-and-Play / Online Multiplayer)  

---

## 1. Abstract / Rangkuman

**Tahan Pedas** adalah game pesta digital bertema kompetisi makan pedas untuk 2 hingga 4 pemain yang menggabungkan mekanik *push-your-luck*, taruhan penonton (*spectator betting*), dan sabotase taktis. Pemain secara bergiliran berperan sebagai orang yang memakan cabai untuk mengumpulkan poin sebanyak mungkin. 

Setiap gigitan cabai memberikan poin tetapi juga meningkatkan **Meter Kepedesan** pemain. Semakin tinggi tingkat kepedesan, semakin besar peluang pemain mengalami *Bust* (kepedesan/tersedak), yang akan menghapus semua poin yang dikumpulkan pada ronde tersebut. Untuk memitigasi risiko, pemain dapat meminum Susu untuk meredakan pedas, menggunakan Tameng untuk menahan serangan, atau memilih *Sajikan* (Bank) untuk mengamankan poin mereka dengan tambahan pengali skor (*Level Berani*).

Saat seorang pemain makan, pemain lain tidak hanya menonton, mereka bertindak sebagai penonton yang dapat memasang taruhan (apakah pemain aktif akan sukses atau *bust*) serta menggunakan token Sabotase ("Tambah Sambal") untuk mendongkrak kepedesan pemain aktif secara paksa. Pemenang ditentukan oleh skor tertinggi setelah seluruh ronde selesai (default 4 ronde).

---

## 2. Player

Game ini dirancang untuk kelompok bermain kasual (*party game*) dengan fokus interaksi sosial yang tinggi.
* **Target Audience:** Remaja hingga dewasa (usia 12+), pecinta game kasual/pesta (*party games* seperti *Liar's Dice*, *Exploding Kittens*, atau *Uno*).
* **Jumlah Pemain:** 2 - 4 pemain.
* **Peran Pemain:**
  1. **Pemain Aktif (Eater):** Pemain yang sedang mendapat giliran untuk makan cabai, mengatur tingkat kepedesan, menggunakan item pertahanan, atau memutuskan untuk mengamankan skor.
  2. **Penonton (Spectators/Bystanders):** Pemain lain yang sedang menunggu giliran. Mereka aktif memasang taruhan (*Bet*) pada keberhasilan pemain aktif dan melakukan sabotase (*Sabotage*) menggunakan token cabai untuk menjatuhkan lawan.
* **Mode Bermain:**
  * **Main Sendiri (Solo Mode):** 1 Pemain manusia melawan AI (bot) dengan perilaku cerdas yang dapat disesuaikan tingkat kesulitannya.
  * **Main Bareng (Local Pass-and-Play):** 2 - 4 Pemain menggunakan satu perangkat secara bergantian.
  * **Main Online (Online Multiplayer):** Pemain dapat membuat/bergabung ke room menggunakan kode akses melalui sinkronisasi realtime (Supabase Realtime).

---

## 3. Goal

Tujuan utama dari setiap pemain adalah **mengumpulkan poin sebanyak-banyaknya di akhir game (setelah 4 ronde)** untuk menjadi pemenang (Juara Makan Pedas).
Poin dapat diperoleh melalui tiga cara:
1. **Makan Cabai secara Konsisten:** Mengambil keputusan berani untuk terus makan cabai bernilai tinggi, lalu mengamankan skor (*Sajikan/Bank*) di saat yang tepat dengan memanfaatkan pengali skor *Level Berani* (hingga 2.0x).
2. **Taruhan Penonton (Spectator Betting):** Menebak dengan tepat apakah pemain aktif akan berhasil menyimpan poin (*Aman*) atau gagal (*Bust*). Setiap tebakan benar memberikan +5 poin, sementara tebakan salah mengurangi -5 poin.
3. **Efisiensi Belanja & Bonus Karakter:** Membeli item di Toko dengan cerdas tanpa menguras poin kemenangan secara berlebihan, serta memaksimalkan bonus khusus karakter (seperti Si Hemat yang mendapat +8 poin tambahan jika bermain aman).

---

## 4. Challenge

Tantangan utama dalam game ini berpusat pada pengelolaan risiko dan gangguan sosial:
* **Ketidakpastian Risiko (Risk of Busting):** Setiap gigitan cabai meningkatkan tingkat kepedesan. Peluang *bust* meningkat secara linear seiring bertambahnya kepedesan. Pemain harus menebak peluang secara intuitif (misalnya, *"Apakah saya berani mengambil risiko 35% bust untuk Cabe Carolina?"*).
* **Sabotase Sosial (Spectator Sabotage):** Penonton dapat menyabotase pemain aktif dengan menambahkan +15 kepedesan secara tiba-tiba di awal giliran. Jika pemain aktif tidak memiliki *Tameng*, ini bisa menempatkan mereka langsung pada zona bahaya tinggi.
* **Manajemen Ekonomi Poin (Shop vs Score):** Toko item dibuka di antara ronde. Pemain harus mengorbankan poin kemenangan yang sudah mereka kumpulkan untuk membeli Susu (8 poin), Tameng (10 poin), atau Cabai Sabotase (6 poin). Terlalu banyak belanja akan mengurangi skor akhir, tetapi terlalu hemat bisa membuat pemain rentan mengalami *bust*.
* **Batas Waktu (Turn Timer):** Pemain memiliki batas waktu 60 detik per giliran. Kehabisan waktu akan memaksa giliran hangus (poin ronde hilang).

---

## 5. Rules

### A. Struktur Ronde dan Giliran
1. Game dimainkan sebanyak **4 Ronde (Cycles)**.
2. Setiap ronde, pemain bergiliran searah jarum jam sebagai Pemain Aktif.
3. Giliran Pemain Aktif dibagi menjadi 3 fase:

#### **Fase 1: Preturn (Fase Taruhan & Sabotase)**
* Penonton dapat memasang taruhan: **Aman** atau **Bust**.
* Penonton dapat mengirimkan token Sabotase ("Tambah Sambal"). Setiap sabotase yang sukses menambah **+15 kepedesan** yang akan diterima pemain aktif.
* Jika ada sabotase masuk, Pemain Aktif diberikan pilihan:
  * **Gunakan Tameng (Shield):** Menghabiskan 1 item Tameng untuk memblokir seluruh sabotase penonton (kepedesan tidak bertambah).
  * **Terima Kepedesan:** Menerima tambahan kepedesan tersebut tanpa kehilangan Tameng.

#### **Fase 2: Active (Fase Makan)**
Pemain Aktif dapat memilih satu dari aksi berikut berulang kali selama belum *bust* atau *bank*:
* **Suap (Bite):** Memilih salah satu dari 3 jenis cabai di meja. Memberikan poin acak dan menambah kepedesan. Setelah makan, sistem melakukan kocokan peluang (*bust roll*). Jika gagal, pemain mengalami *Bust* (giliran berakhir, poin ronde 0).
* **Minum Susu:** Mengurangi kepedesan sebesar **-25**. Hanya dapat dilakukan maksimal **1 kali per giliran** (jika memiliki item Susu). Aksi ini aman dan tidak memicu *bust roll*.
* **Sajikan (Bank/Sajikan):** Mengunci poin ronde yang telah dikumpulkan. Poin dikalikan dengan *Level Berani* dan ditambah bonus karakter, lalu ditambahkan ke skor permanen. Giliran berakhir dengan aman.

#### **Fase 3: Result (Fase Hasil)**
* Menampilkan ringkasan hasil giliran (Poin yang diperoleh, pengali, apakah terjadi *bust*).
* Memproses taruhan penonton:
  * Tebakan Benar: Skor Penonton +5 poin.
  * Tebakan Salah: Skor Penonton -5 poin (skor tidak bisa turun di bawah 0).
* Memindahkan giliran ke pemain berikutnya.

### B. Aturan Khusus Ronde Pamungkas (Ronde 4)
* Ronde terakhir ditandai sebagai **Ronde Pamungkas**.
* Seluruh poin yang berhasil disimpan (*banked*) pada ronde ini akan **dikalikan 2 (Final Multiplier)**, membuat ronde ini sangat menentukan kemenangan.

---

## 6. Mechanic

### A. Rumus Peluang Bust (Kegagalan)
Peluang gagal (*Bust Chance*) dalam persen dihitung secara dinamis dari tingkat kepedesan saat ini dengan rumus:
$$\text{Bust Chance (\%)} = \text{clamp}(\text{Kepedesan} - 10, 0, 95)$$
* *Catatan:* Kepedesan di bawah 10 memiliki peluang *bust* sebesar 0%. Peluang *bust* maksimal dibatasi pada angka 95% (selalu ada 5% peluang keberuntungan untuk bertahan hidup).

### B. Rumus Pengali Skor (Level Berani)
Skor ronde dikalikan berdasarkan tingkat kepedesan akhir saat pemain memilih *Sajikan*:
* $\text{Kepedesan} \ge 80 \rightarrow \text{Multiplier } \times 2.0$
* $\text{Kepedesan} \ge 50 \rightarrow \text{Multiplier } \times 1.5$
* $\text{Kepedesan} < 50 \rightarrow \text{Multiplier } \times 1.0$

### C. Karakter Asimetris (Karakter)
Terdapat 6 pilihan karakter unik yang memberikan kelebihan (*upside*) dan kekurangan (*downside*):

| Karakter | Nama Karakter | Kelebihan (Upside) | Kekurangan (Downside) |
| :---: | :--- | :--- | :--- |
| 🛡️ | **Si Perisai** | Mulai dengan 2 Tameng (standar 1). | Poin tiap suap berkurang -1. |
| ❄️ | **Si Pendingin** | Mulai dengan 2 Susu (standar 1). | Kepedesan bertambah ekstra +2 tiap suap. |
| 🔩 | **Si Lidah Baja** | Sekali per ronde, otomatis selamat dari *bust* pertama. | Penalti poin tiap suap -15 & kepedesan naik ekstra +6 tiap suap. |
| 😋 | **Si Rakus** | Poin tiap suap mendapat tambahan +3. | Kepedesan bertambah ekstra +4 tiap suap. |
| 🔥 | **Si Tukang Kompor** | Mulai dengan 3 token Sabotase (standar 1). | Pengali Level Berani mentok di ×1.5. |
| 💰 | **Si Hemat** | Menyajikan saat pedas < 45 memberikan bonus +8 poin. | Pengali Level Berani mentok di ×1.5. |

---

## 7. Space

Game ini memiliki ruang permainan (*game space*) yang membagi interaksi menjadi dua mode visual:

### A. Dimensi Ruang 2D (Fungsional & Responsif)
* **HUD Atas:** Menampilkan info Ronde, Nama Pemain Aktif, dan Sisa Waktu (Timer).
* **Area Tengah (Eater Zone):** Menampilkan Meter Kepedesan (0-100) dengan indikator warna dinamis (Hijau $\rightarrow$ Kuning $\rightarrow$ Merah Api), indikator persentase peluang *bust*, dan tombol aksi utama (Suap Cabe, Minum Susu, Sajikan).
* **Area Bawah (Spectator & Inventory Zone):** Menampilkan sisa item pemain (Susu, Tameng, Sabotase) dan panel taruhan penonton saat fase preturn.
* **Scoreboard Samping:** Menampilkan daftar klasemen skor seluruh pemain secara realtime.

### B. Dimensi Ruang 3D (Imersif Layer)
Menggunakan React Three Fiber (Web GL) untuk menyajikan visualisasi meja makan interaktif:
* **Circular Table Space:** Pemain diposisikan melingkar mengelilingi meja makan kayu. Posisi sudut kursi dihitung dinamis dengan rumus:
  $$\theta = \frac{2\pi}{N} \times i$$
  Di mana $N$ adalah jumlah pemain, dan $i$ adalah indeks pemain.
* **Clickable 3D Bowls:** Cabai disajikan dalam mangkuk-mangkuk 3D yang dapat diklik langsung oleh pemain untuk memicu aksi makan.
* **Responsive Avatar (Chili-Head):** Karakter digambarkan sebagai kepala cabai 3D bergaya *low-poly* yang akan mengeluarkan efek partikel keringat (sweat), uap (steam), hingga api membara (fire) seiring meningkatnya meter kepedesan.
* **Camera Rig:** Kamera bergerak secara dinamis (*lerp*) berpindah sudut pandang fokus ke wajah karakter yang sedang aktif makan.

---

## 8. Component

Komponen-komponen utama yang digunakan dalam game ini meliputi:

### A. Cabai (Bahan Utama)
Terdapat 3 tingkat kesulitan cabai yang dapat dipilih di meja:
1. **Cabe Ijo:** Poin: [4 - 7] | Efek Pedas: +8
2. **Cabe Rawit:** Poin: [8 - 12] | Efek Pedas: +15
3. **Cabe Carolina:** Poin: [15 - 22] | Efek Pedas: +28

### B. Item & Perlengkapan (Starting Kit & Shop)
Setiap pemain memulai game dengan starter kit berupa: **1 Susu, 1 Tameng, 1 Sabotase** (kecuali dimodifikasi oleh kemampuan karakter). Item tambahan dapat dibeli di toko menggunakan poin:
* **Susu (Milk Bottle):** Mengurangi kepedesan sebesar -25 (Harga: 8 Poin).
* **Tameng (Shield Badge):** Menghalau seluruh sabotase lawan pada fase preturn (Harga: 10 Poin).
* **Cabai Sabotase (Sabotage Token):** Digunakan penonton untuk memberikan +15 kepedesan pada lawan (Harga: 6 Poin).

### C. Komponen Sistem & Jaringan
* **Game Engine Reducer:** Pengelola state utama game yang murni (*pure function reducer*) untuk memastikan sinkronisasi state yang sama persis antar pemain.
* **AI Bot Brain Engine:** Algoritma bot otomatis yang mengambil keputusan berdasarkan ambang batas risiko (*heuristic threshold*) kepedesan.
* **Supabase Realtime Channel:** Komponen backend serverless untuk menyiarkan aksi (*action broadcast*) dan mendeteksi kehadiran pemain (*presence list*) saat bermain online.
* **Synth Sound Engine:** Generator efek suara sintesis (SFX makan, minum susu, tersedak, dan latar musik) tanpa memerlukan file audio aset eksternal yang besar.
