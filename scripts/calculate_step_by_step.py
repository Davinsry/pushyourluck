# -*- coding: utf-8 -*-
import os

BITES = {
    "ijo": {"name": "Cabe Ijo", "points": (4, 7), "heat": 8},
    "rawit": {"name": "Cabe Rawit", "points": (8, 12), "heat": 15},
    "carolina": {"name": "Cabe Carolina", "points": (15, 22), "heat": 28}
}

CHARS = {
    "baja": {
        "name": "Si Lidah Baja (BAJA)",
        "pointMod": -3,
        "heatMod": 0,
        "surviveBust": 1,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0,
        "desc": "Sekali di setiap ronde selamat dari bust, poin tiap suap -3."
    },
    "rakus": {
        "name": "Si Rakus (RAKUS)",
        "pointMod": 3,
        "heatMod": 5,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0,
        "desc": "Poin tiap suap +3, pedas naik +5 tiap suap."
    },
    "kompor": {
        "name": "Si Tukang Kompor (KOMPOR)",
        "pointMod": 0,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 1.5,
        "safeBonus": 0,
        "safeBelow": 0,
        "desc": "Dapat 3 token sabotase, multiplier maksimal x1.5."
    },
    "hemat": {
        "name": "Si Hemat (HEMAT)",
        "pointMod": 0,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 1.5,
        "safeBonus": 10,
        "safeBelow": 45,
        "desc": "Bonus +10 poin jika sajikan di bawah pedas 45, multiplier maksimal x1.5."
    },
    "perisai": {
        "name": "Si Perisai (PERISAI)",
        "pointMod": -2,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0,
        "desc": "Mulai dengan 2 tameng, poin tiap suap -2."
    },
    "pendingin": {
        "name": "Si Pendingin (PENDINGIN)",
        "pointMod": 0,
        "heatMod": 2,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0,
        "desc": "Mulai dengan 2 susu, pedas naik +2 tiap suap."
    },
    "normal": {
        "name": "Pemain Standar (NORMAL)",
        "pointMod": 0,
        "heatMod": 0,
        "surviveBust": 0,
        "maxMult": 2.0,
        "safeBonus": 0,
        "safeBelow": 0,
        "desc": "Karakter dasar tanpa modifikasi."
    }
}

def get_bust_chance(heat):
    return min(100, max(0, round(heat))) / 100.0

def get_multiplier(heat, char):
    mult = 1.0
    if heat >= 80:
        mult = 2.0
    elif heat >= 50:
        mult = 1.5
    return min(char["maxMult"], mult)

def calculate_sequence(char_id, char, chili_type, steps=4):
    cabe = BITES[chili_type]
    results = []
    
    heat = 0
    cum_points = 0.0
    step_bust_chances = []
    
    for i in range(1, steps + 1):
        # Tambah pedas
        added_heat = cabe["heat"] + char["heatMod"]
        heat += added_heat
        
        # Hitung poin suap ini
        min_p, max_p = cabe["points"]
        avg_p = (min_p + max_p) / 2.0
        gain_p = max(1.0, avg_p + char["pointMod"])
        cum_points += gain_p
        
        # Catat peluang bust saat menggigit (nominal)
        nominal_bust = get_bust_chance(heat)
        step_bust_chances.append(nominal_bust)
        
        # Hitung peluang selamat kumulatif
        n_steps = len(step_bust_chances)
        if char["surviveBust"] == 0:
            p_survive = 1.0
            for p in step_bust_chances:
                p_survive *= (1.0 - p)
        else:
            # Lidah Baja survive formula
            p_zero_fails = 1.0
            for p in step_bust_chances:
                p_zero_fails *= (1.0 - p)
            
            p_one_fail = 0.0
            for step_idx in range(n_steps):
                p_temp = 1.0
                for j in range(n_steps):
                    if j == step_idx:
                        p_temp *= step_bust_chances[j]
                    else:
                        p_temp *= (1.0 - step_bust_chances[j])
                p_one_fail += p_temp
            p_survive = p_zero_fails + p_one_fail
            
        p_bust = 1.0 - p_survive
        
        # Hitung multiplier & skor jika disajikan
        mult = get_multiplier(heat, char)
        score_if_serve = cum_points
        
        # Terapkan bonus hemat
        if char_id == "hemat" and heat < char["safeBelow"]:
            score_if_serve_final = round(score_if_serve * mult) + char["safeBonus"]
        else:
            score_if_serve_final = round(score_if_serve * mult)
            
        results.append({
            "step": i,
            "chili": cabe["name"],
            "cum_heat": heat,
            "nominal_bust": f"{nominal_bust*100:.0f}%",
            "gain_points": round(gain_p, 1),
            "cum_points": round(cum_points, 1),
            "multiplier": f"x{mult}",
            "score_if_serve": score_if_serve_final,
            "p_survive": f"{p_survive*100:.2f}%",
            "p_bust": f"{p_bust*100:.2f}%",
            "expected_value": round(score_if_serve_final * p_survive, 2)
        })
        
    return results

def main():
    output = []
    output.append("# 📊 Tabel Simulasi Langkah-Demi-Langkah Karakter & Cabai 🌶️\n")
    output.append("Analisis ini menunjukkan perkembangan status pemain langkah demi langkah setiap kali mengambil cabai tertentu berturut-turut.\n")
    
    # 1. Tabel Ringkasan Nilai Awal 1 Suapan
    output.append("## 🌶️ Perbandingan 1 Suapan Pertama")
    output.append("Berikut adalah poin rata-rata, kepedesan, dan peluang meledak (Bust) pada suapan pertama:")
    output.append("| Karakter | Cabe Ijo (Poin / Pedas / Bust) | Cabe Rawit (Poin / Pedas / Bust) | Cabe Carolina (Poin / Pedas / Bust) |")
    output.append("| :--- | :---: | :---: | :---: |")
    
    for c_id, c in CHARS.items():
        res_ijo = calculate_sequence(c_id, c, "ijo", 1)[0]
        res_rawit = calculate_sequence(c_id, c, "rawit", 1)[0]
        res_caro = calculate_sequence(c_id, c, "carolina", 1)[0]
        
        # Pengecualian surviveBust visual
        bust_ijo = res_ijo["p_bust"]
        bust_rawit = res_rawit["p_bust"]
        bust_caro = res_caro["p_bust"]
        
        output.append(f"| **{c['name']}** | {res_ijo['gain_points']} pts / +{res_ijo['cum_heat']} pedas / {bust_ijo} | {res_rawit['gain_points']} pts / +{res_rawit['cum_heat']} pedas / {bust_rawit} | {res_caro['gain_points']} pts / +{res_caro['cum_heat']} pedas / {bust_caro} |")
    
    output.append("\n---\n")
    
    # 2. Detail Sekuensial Karakter
    for c_id, c in CHARS.items():
        output.append(f"## 👤 {c['name']}")
        output.append(f"*{c['desc']}*\n")
        
        for chili_id in ["ijo", "rawit", "carolina"]:
            steps = 4 if chili_id == "ijo" else (3 if chili_id == "rawit" else 2)
            res_list = calculate_sequence(c_id, c, chili_id, steps)
            
            output.append(f"### 🟢 Urutan Makan: {BITES[chili_id]['name']}")
            output.append("| Langkah | Cabe | Total Pedas | Peluang Bust Langkah Ini | Poin Rata-Rata Didapat | Total Poin Kasar | Pengali | Poin Jika Disajikan | Peluang Selamat Kumulatif | Peluang Meledak Kumulatif | Nilai Harapan (EV) |")
            output.append("| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |")
            for r in res_list:
                output.append(f"| {r['step']} | {r['chili']} | {r['cum_heat']} | {r['nominal_bust']} | {r['gain_points']} | {r['cum_points']} | {r['multiplier']} | {r['score_if_serve']} | {r['p_survive']} | {r['p_bust']} | **{r['expected_value']}** |")
            output.append("")
        output.append("\n---\n")
        
    # Write to a file
    with open("Step_by_Step_Chili_Probability.md", "w", encoding="utf-8") as f:
        f.write("\n".join(output))
    print("File Step_by_Step_Chili_Probability.md generated successfully!")

if __name__ == "__main__":
    main()
