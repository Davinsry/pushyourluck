# -*- coding: utf-8 -*-
"""
Tahan Pedas 🌶️ — Strategy Probability Matrix Calculator
Menghitung probabilitas eksak matematika dari berbagai urutan makan cabai (strategi)
untuk masing-masing karakter. Output disimpan dalam bentuk file Markdown.
"""

import os

# Konfigurasi Cabai
BITES = {
    "ijo": {"name": "Cabe Ijo", "points": (4, 7), "heat": 8},
    "rawit": {"name": "Cabe Rawit", "points": (8, 12), "heat": 15},
    "carolina": {"name": "Cabe Carolina", "points": (15, 22), "heat": 28}
}

# Karakter
CHARS = {
    "baja": {
        "name": "Si Lidah Baja",
        "pointMod": -18,
        "heatMod": 10,
        "surviveBust": 1,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0
    },
    "rakus": {
        "name": "Si Rakus",
        "pointMod": 2,
        "heatMod": 5,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0
    },
    "kompor": {
        "name": "Si Tukang Kompor",
        "pointMod": 0,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 1.5,
        "safeBonus": 0,
        "safeBelow": 0
    },
    "hemat": {
        "name": "Si Hemat",
        "pointMod": 0,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 1.5,
        "safeBonus": 14,
        "safeBelow": 45
    },
    "perisai": {
        "name": "Si Perisai",
        "pointMod": 0,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0
    },
    "pendingin": {
        "name": "Si Pendingin",
        "pointMod": 0,
        "heatMod": 2,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0
    },
    "normal": {
        "name": "Pemain Standar (Tanpa Modifikator)",
        "pointMod": 0,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0
    }
}

# Daftar Strategi Makan untuk dianalisis
STRATEGIES = [
    # 1 Cabai
    ["ijo"],
    ["rawit"],
    ["carolina"],
    
    # 2 Cabai
    ["ijo", "ijo"],
    ["rawit", "ijo"],
    ["carolina", "ijo"],
    ["rawit", "rawit"],
    ["carolina", "rawit"],
    ["carolina", "carolina"],
    
    # 3 Cabai
    ["ijo", "ijo", "ijo"],
    ["rawit", "ijo", "ijo"],
    ["carolina", "ijo", "ijo"],
    ["rawit", "rawit", "ijo"],
    
    # Dengan Susu (mengurangi pedas sebesar 25 di tengah-tengah)
    ["carolina", "susu", "ijo"],
    ["carolina", "susu", "rawit"],
    ["carolina", "susu", "carolina"]
]

def get_bust_chance(heat):
    """Peluang bust (%) di tingkat kepedesan tertentu."""
    return min(100, max(0, round(heat - 10))) / 100.0

def get_multiplier(heat, char_def):
    """Pengali Level Berani berdasarkan tingkat pedas dan batasan karakter."""
    mult = 1.0
    if heat >= 80:
        mult = 2.0
    elif heat >= 50:
        mult = 1.5
    
    max_mult = char_def["maxMult"]
    if mult > max_mult:
        mult = max_mult
    return mult

def evaluate_strategy(char_id, strategy):
    """
    Menghitung probabilitas eksak matematika untuk satu karakter dan strategi tertentu.
    Mengembalikan dict hasil.
    """
    char = CHARS[char_id]
    
    heat = 0
    round_pts = 0
    step_bust_chances = [] # Menyimpan peluang bust di tiap gigitan
    
    has_susu = True  # Asumsikan memiliki 1 susu untuk strategi yang melibatkan susu
    
    for action in strategy:
        if action == "susu":
            # Aksi minum susu (tidak memicu bust roll)
            heat = max(0, heat - 25)
        else:
            # Aksi makan cabai
            cabe = BITES[action]
            added_heat = cabe["heat"] + char["heatMod"]
            heat += added_heat
            
            # Hitung rata-rata poin gigitan (min 1)
            min_p, max_p = cabe["points"]
            avg_p = (min_p + max_p) / 2.0
            gain_p = max(1.0, avg_p + char["pointMod"])
            round_pts += gain_p
            
            # Catat peluang bust saat menggigit
            step_bust_chances.append(get_bust_chance(heat))
            
    # ── HITUNG PROBABILITAS BERTAHAN HIDUP ──
    # Jika surviveBust = 0 (Karakter Biasa)
    # P_survive = perkalian dari P_survive di tiap langkah (1 - p_j)
    n_steps = len(step_bust_chances)
    
    if char["surviveBust"] == 0:
        p_survive = 1.0
        for p in step_bust_chances:
            p_survive *= (1.0 - p)
    else:
        # Jika surviveBust = 1 (Si Lidah Baja)
        # Bisa survive jika 0 gigitan gagal ATAU tepat 1 gigitan gagal
        p_zero_fails = 1.0
        for p in step_bust_chances:
            p_zero_fails *= (1.0 - p)
            
        p_one_fail = 0.0
        for i in range(n_steps):
            p_temp = 1.0
            for j in range(n_steps):
                if j == i:
                    p_temp *= step_bust_chances[j] # Gigitan ke-j gagal
                else:
                    p_temp *= (1.0 - step_bust_chances[j]) # Gigitan ke-j sukses
            p_one_fail += p_temp
            
        p_survive = p_zero_fails + p_one_fail
        
    p_bust = 1.0 - p_survive
    
    # ── HITUNG SKOR JIKA SELAMAT ──
    mult = get_multiplier(heat, char)
    
    # Bonus Si Hemat
    hemat_bonus = 0
    if char_id == "hemat" and heat < char["safeBelow"]:
        hemat_bonus = char["safeBonus"]
        
    score_if_survive = round(round_pts * mult) + hemat_bonus
    
    # Ekspektasi Skor (Expected Value)
    expected_score = score_if_survive * p_survive
    
    return {
        "strategy": " + ".join([a.capitalize() for a in strategy]),
        "final_heat": heat,
        "final_bust_chance": f"{get_bust_chance(heat)*100:.0f}%",
        "avg_raw_pts": round(round_pts, 1),
        "multiplier": f"x{mult}",
        "score_if_survive": score_if_survive,
        "p_survive": f"{p_survive*100:.2f}%",
        "p_bust": f"{p_bust*100:.2f}%",
        "expected_score": round(expected_score, 2)
    }

# ─────────────────────────────────────────────────────────────
#  GENERASI REPORT MARKDOWN
# ─────────────────────────────────────────────────────────────

def generate_report():
    report_content = []
    report_content.append("# Matriks Probabilitas Strategi Makan Tahan Pedas 🌶️\n")
    report_content.append("Laporan ini berisi analisis matematis eksak dari berbagai urutan makan cabai (strategi) untuk semua karakter. ")
    report_content.append("Analisis ini menghitung peluang bertahannya karakter dan nilai ekspektasi skor (*Expected Value*) yang diperoleh.\n")
    report_content.append("> **Definisi Expected Value (Skor Harapan):**")
    report_content.append("> $$\\text{Expected Score} = \\text{Skor Jika Selamat} \\times \\text{Peluang Selamat}$$")
    report_content.append("> Strategi terbaik secara matematis adalah yang menghasilkan **Expected Score tertinggi**.\n")
    
    for char_id, char in CHARS.items():
        report_content.append(f"## 👤 {char['name']} ({char_id.upper()})")
        
        # Penjelasan Modifikator Karakter
        if char_id == "baja":
            report_content.append("* **Modifikator:** Poin tiap suap $-18$, Pedas $+10$, **Memiliki 1 Nyawa Tambahan per Ronde**.")
        elif char_id == "rakus":
            report_content.append("* **Modifikator:** Poin tiap suap $+2$, Pedas $+5$.")
        elif char_id == "kompor":
            report_content.append("* **Modifikator:** Multiplier maksimal dibatasi $\\times 1.5$.")
        elif char_id == "hemat":
            report_content.append("* **Modifikator:** Multiplier maksimal dibatasi $\\times 1.5$, mendapat **Bonus $+14$ poin** jika menyajikan di bawah pedas 45.")
        elif char_id == "perisai":
            report_content.append("* **Modifikator:** Tidak memiliki penalti poin (Poin $+0$).")
        elif char_id == "pendingin":
            report_content.append("* **Modifikator:** Pedas naik $+2$ tiap suap, mulai dengan susu ekstra.")
        else:
            report_content.append("* **Modifikator:** Tidak ada (Karakter baseline standar).")
            
        report_content.append("\n| Strategi | Poin Kasar | Pedas Akhir | Peluang Bust Akhir | Pengali | Skor Jika Selamat | Peluang Selamat | Peluang Meledak | Skor Harapan (EV) |")
        report_content.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |")
        
        # Hitung tiap strategi
        results = []
        for strat in STRATEGIES:
            # Jangan tampilkan strategi susu untuk karakter yang tidak mungkin memilikinya
            if "susu" in strat and char_id == "rakus": 
                # Rakus tidak belanja susu di awal dan pedasnya melesat terlalu cepat
                continue
            res = evaluate_strategy(char_id, strat)
            results.append(res)
            
        # Urutkan berdasarkan expected score tertinggi
        results = sorted(results, key=lambda x: x["expected_score"], reverse=True)
        
        for r in results:
            report_content.append(f"| {r['strategy']} | {r['avg_raw_pts']} | {r['final_heat']} | {r['final_bust_chance']} | {r['multiplier']} | {r['score_if_survive']} | {r['p_survive']} | {r['p_bust']} | **{r['expected_score']}** |")
            
        report_content.append("\n---\n")
        
    # Tulis ke file
    file_path = "Strategy_Probability_Matrix.md"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(report_content))
    print(f"Laporan probabilitas berhasil dibuat di: {os.path.abspath(file_path)}")

if __name__ == "__main__":
    generate_report()
