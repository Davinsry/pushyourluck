# -*- coding: utf-8 -*-
"""
Tahan Pedas 🌶️ — Bot vs Bot Simulator (Kocak Edition)
Porting logika permainan game "Tahan Pedas" ke Python untuk dijalankan di Google Colab.
Menampilkan jalannya giliran bot dengan narasi kocak bahasa Indonesia!
"""

import random

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    from scipy.stats import chisquare
except ImportError:
    chisquare = None


import sys
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# ─────────────────────────────────────────────────────────────
#  KONFIGURASI GAME & KESEIMBANGAN
# ─────────────────────────────────────────────────────────────

CYCLES = 4  # Jumlah ronde per game
SABOTAGE_HEAT = 15  # Pedas dari sabotase lawan
SUSU_COOL = 25  # Pengurangan pedas dari minum susu
BET_STAKE = 5  # Poin taruhan: menang +5, kalah -5
FINAL_MULT = 2  # Pengali ronde pamungkas (ronde 4)

# Cabai: [min_poin, max_poin], pedas
BITES = {
    "ijo": {"name": "Cabe Ijo", "points": (4, 7), "heat": 8},
    "rawit": {"name": "Cabe Rawit", "points": (8, 12), "heat": 15},
    "carolina": {"name": "Cabe Carolina", "points": (15, 22), "heat": 28}
}

# Karakter
CHARS = {
    "baja": {
        "name": "Si Lidah Baja",
        "tag": "Tahan banting",
        "up": "Sekali per ronde, selamat dari 1 kepedesan.",
        "down": "Poin tiap suap -18 & pedas naik lebih cepat (+10).",
        "surviveBust": 1,
        "pointMod": -18,
        "heatMod": 10
    },
    "rakus": {
        "name": "Si Rakus",
        "tag": "High-roller",
        "up": "Poin tiap suap +2.",
        "down": "Pedas naik lebih cepat (+5).",
        "pointMod": 2,
        "heatMod": 5
    },
    "kompor": {
        "name": "Si Tukang Kompor",
        "tag": "Pengganggu",
        "up": "Dapat 3 jatah tambah sambal (lawan 1).",
        "down": "Multiplier mentok x1.5.",
        "sabotage": 3,
        "maxMult": 1.5
    },
    "hemat": {
        "name": "Si Hemat",
        "tag": "Grinder",
        "up": "Sajikan saat pedas < 45 -> bonus +14.",
        "down": "Multiplier mentok x1.5.",
        "safeBonus": 14,
        "safeBelow": 45,
        "maxMult": 1.5
    },
    "perisai": {
        "name": "Si Perisai",
        "tag": "Tahan serangan",
        "up": "Mulai dengan 2 tameng.",
        "down": "Tidak memiliki penalti poin.",
        "tameng": 2,
        "pointMod": 0
    },
    "pendingin": {
        "name": "Si Pendingin",
        "tag": "Adem",
        "up": "Mulai dengan 2 susu.",
        "down": "Pedas naik +2 tiap suap.",
        "susu": 2,
        "heatMod": 2
    }
}

# ─────────────────────────────────────────────────────────────
#  PENGISI NARASI KOCAK (EMOTIONAL ENGINE)
# ─────────────────────────────────────────────────────────────

NARASI_MAKAN = [
    "{nama} melahap {cabe} dengan brutal! Mukanya langsung memerah padam.",
    "{nama} mengunyah {cabe} santai. 'Ah kecil ini mah!' katanya, padahal telinga mulai berasap.",
    "{nama} memasukkan {cabe} ke mulut. Air mata mulai menggenang, tapi gengsi tetap nomor satu!",
    "Nyam! {nama} memakan {cabe}. Keringat dingin sebesar biji jagung mulai bercucuran!"
]

NARASI_MINUM_SUSU = [
    "{nama} buru-buru menenggak Susu dingin. 'AHHH SEGERRR!' Kepedesan berkurang dari {pedas_lama} ke {pedas_baru}.",
    "Susu penyelamat diminum oleh {nama}! Efek pedas langsung diredam. Pemadam kebakaran lambung bekerja!",
    "{nama} gemetaran membuka botol Susu dan langsung meminumnya. Mulutnya terasa dingin kembali."
]

NARASI_SAJIKAN = [
    "{nama} melambaikan tangan ke kamera. 'Cukup! Saya sajikan hidangan ini!' Mengamankan {poin} poin ronde.",
    "Takut meledak, {nama} memutuskan bermain aman dan memilih *Sajikan* dengan kepala tegak.",
    "{nama} menyerah pada rasa pedas, tapi tersenyum licik karena berhasil mengunci {poin} poin ronde!"
]

NARASI_BUST = [
    "DUEEERR! Kepala {nama} meledak kepedesan! Matanya mendelik, dia tersedak parah! Poin ronde ini HANGUS!",
    "Bust! {nama} tidak kuat menahan siksaan {cabe}. Dia terbatuk-batuk mencari air. Poin rondenya hangus jadi 0!",
    "Siksaan lambung berakhir! {nama} roboh dari kursi karena kepedesan. Poin ronde ini lenyap ditelan api."
]

NARASI_SABOTASE = [
    "Spectator {lawan} menuangkan satu gayung sambal ulek ke piring {nama}! Kejam sekali!",
    "{lawan} melemparkan bubuk cabai tambahan ke wajah {nama}. 'Makan tuh sambal tambahan!'"
]

NARASI_BET = [
    "Spectator {lawan} bertaruh {nama} bakal {taruhan} ronde ini.",
    "Dengan senyum sinis, {lawan} memasang taruhan bahwa {nama} akan {taruhan}."
]

# ─────────────────────────────────────────────────────────────
#  LOGIKA ATURAN GAME & AI BOT
# ─────────────────────────────────────────────────────────────

def get_bust_chance(heat):
    """Hitung peluang bust (%) berdasarkan tingkat pedas saat ini."""
    return min(100, max(0, round(heat - 10)))

def get_multiplier(heat, char):
    """Hitung Level Berani multiplier."""
    mult = 1.0
    if heat >= 80:
        mult = 2.0
    elif heat >= 50:
        mult = 1.5
        
    # Cap multiplier untuk karakter tertentu
    max_mult = CHARS[char].get("maxMult") if char else None
    if max_mult is not None and mult > max_mult:
        mult = max_mult
    return mult

class PlayerBot:
    def __init__(self, index, char_id, name=None):
        self.index = index
        self.char_id = char_id
        self.char_def = CHARS[char_id]
        self.name = name if name else f"{self.char_def['name']} (Bot {index + 1})"
        self.score = 0
        
        # Inisialisasi perlengkapan berdasarkan karakter
        self.susu = self.char_def.get("susu", 1)
        self.tameng = self.char_def.get("tameng", 1)
        self.sabotage = self.char_def.get("sabotage", 1)

    def reset_for_new_game(self):
        self.score = 0
        self.susu = self.char_def.get("susu", 1)
        self.tameng = self.char_def.get("tameng", 1)
        self.sabotage = self.char_def.get("sabotage", 1)

    def choose_action(self, heat, round_pts, is_final, top_opp_score):
        """Memutuskan aksi selanjutnya: 'MINUM_SUSU', 'SAJIKAN', atau 'SUAP' beserta jenis cabai."""
        chance = get_bust_chance(heat)
        score_diff = top_opp_score - self.score  # positif = tertinggal
        
        # ── 1. Ambang Batas Simpan Poin (Adaptive Bank Threshold) ──
        bank_threshold = 45
        if score_diff > 20:
            bank_threshold += 15  # Tertinggal jauh -> nekat judi
        elif score_diff > 10:
            bank_threshold += 8
        elif score_diff < -15:
            bank_threshold -= 12  # Unggul jauh -> bermain aman
        elif score_diff < -5:
            bank_threshold -= 5
            
        if is_final:
            bank_threshold += 8  # Ronde terakhir -> poin double, dorong lebih agresif
            
        # Batasi agar tetap logis
        bank_threshold = max(30, min(75, bank_threshold))
        
        # Pengali Level Berani
        mult = get_multiplier(heat, self.char_id)
        wants_higher_mult = (mult < 1.5) and (35 <= heat < 50) and (round_pts >= 8)

        # ── 2. Pilihan Minum Susu (Strategis) ──
        # Minum jika pedas sudah panas dan bot berniat lanjut makan
        if heat >= 55 and self.susu > 0 and round_pts >= 6:
            if chance < bank_threshold + 15:
                return "MINUM_SUSU", None
                
        # Keadaan darurat: peluang meledak tinggi tapi poin di tangan berharga
        if chance >= 60 and self.susu > 0 and round_pts >= 10:
            return "MINUM_SUSU", None

        # ── 3. Keputusan Sajikan (Bank) ──
        if round_pts > 0 and chance >= bank_threshold and not wants_higher_mult:
            return "SAJIKAN", None

        # ── 4. Pemilihan Cabai (Strategi Risk-Reward) ──
        bite = "ijo"
        if heat < 15:
            bite = "carolina"  # Sangat aman -> makan yang terbesar
        elif heat < 30:
            if score_diff > 10 or is_final:
                bite = "carolina"
            else:
                bite = "rawit"
        elif heat < 50:
            if score_diff > 15:
                bite = "rawit"
            else:
                bite = "rawit" if chance < 25 else "ijo"
        else:
            if score_diff > 25 and chance < 55:
                bite = "rawit"
            else:
                bite = "ijo"

        # Kemampuan asimetris karakter memengaruhi pemilihan cabai
        if self.char_id == "baja" and chance >= 30:
            # Punya jaring pengaman nyawa tambahan -> lebih berani
            bite = "carolina" if heat < 40 else "rawit"
        elif self.char_id == "hemat" and heat < 35:
            # Si hemat ingin menjaga pedas tetap di bawah 45 demi bonus
            bite = "ijo"
        elif self.char_id == "rakus":
            # Si Rakus dapat flat bonus +3 per suap, Cabe Ijo pun lumayan
            if heat < 35:
                bite = "carolina" if heat < 20 else "rawit"

        return "SUAP", bite

    def choose_block_sabotage(self, heat, pending_heat):
        """Memilih apakah akan memblokir sabotase penonton menggunakan Tameng."""
        if self.tameng <= 0:
            return False
            
        would_be_hot = heat + pending_heat
        # Tameng digunakan jika sambal tambahan cukup menyengat
        if pending_heat >= SABOTAGE_HEAT and (would_be_hot > 45 or get_bust_chance(would_be_hot) > 35):
            return True
        return False

    def get_spectator_actions(self, active_bot, round_heat, rng_val):
        """Menentukan taruhan dan apakah akan menyabotase pemain aktif."""
        actions = {"bet": None, "sabotage": False}
        
        # 1. Pemasangan Taruhan (Betting)
        bust_bias = 0.45
        if active_bot.char_id == "rakus":
            bust_bias += 0.15
        elif active_bot.char_id == "kompor":
            bust_bias += 0.10
        elif active_bot.char_id == "baja":
            bust_bias -= 0.15
        elif active_bot.char_id in ("hemat", "pendingin"):
            bust_bias -= 0.10
            
        actions["bet"] = "bust" if rng_val < bust_bias else "aman"

        # 2. Tindakan Sabotase (Tambah Sambal)
        if self.sabotage > 0:
            sabo_chance = 0.50
            if active_bot.score > self.score + 10:
                sabo_chance += 0.20  # Agresif ke pemimpin skor
            elif active_bot.score < self.score - 10:
                sabo_chance -= 0.15  # Hemat token jika lawan jauh di bawah
            sabo_chance = max(0.1, min(0.9, sabo_chance))
            
            # Kita uji random lagi
            if random.random() < sabo_chance:
                actions["sabotage"] = True
                
        return actions

# ─────────────────────────────────────────────────────────────
#  SIMULATOR ENGINE
# ─────────────────────────────────────────────────────────────

def run_single_game(player_bots, verbose=True):
    """Menjalankan satu game simulasi penuh dengan cetak log narasi kocak."""
    num_players = len(player_bots)
    for p in player_bots:
        p.reset_for_new_game()
        
    if verbose:
        print("🌶️🌶️🌶️ PERTANDINGAN TAHAN PEDAS DIMULAI! 🌶️🌶️🌶️")
        print(f"Peserta: {', '.join([p.name for p in player_bots])}\n")

    for round_num in range(1, CYCLES + 1):
        is_final = (round_num == CYCLES)
        if verbose:
            tag = "RONDE PAMUNGKAS (POIN 2X LIPAT!)" if is_final else f"RONDE {round_num}"
            print(f"═══ {tag} ═══")

        # Setiap pemain giliran makan
        for active_idx in range(num_players):
            me = player_bots[active_idx]
            
            # Cari skor tertinggi musuh
            opp_scores = [p.score for i, p in enumerate(player_bots) if i != active_idx]
            top_opp = max(opp_scores) if opp_scores else 0

            if verbose:
                print(f"\n👉 Giliran: {me.name} (Skor: {me.score} | Susu: {me.susu}, Tameng: {me.tameng})")

            # FASE 1: PRE-TURN (TARUHAN & SABOTASE)
            pending_heat = 0
            used_sabo_list = []
            bets = {}  # index -> bet

            for k, opponent in enumerate(player_bots):
                if k == active_idx:
                    continue
                # Bot penonton bertindak
                actions = opponent.get_spectator_actions(me, 0, random.random())
                
                # Bet
                bets[k] = actions["bet"]
                if verbose:
                    taruhan_str = "MELEDAK (Bust)" if actions["bet"] == "bust" else "AMAN-AMAN SAJA"
                    print(random.choice(NARASI_BET).format(lawan=opponent.name, nama=me.name, taruhan=taruhan_str))
                
                # Sabotage
                if actions["sabotage"]:
                    opponent.sabotage -= 1
                    pending_heat += SABOTAGE_HEAT
                    used_sabo_list.append(opponent.name)
                    if verbose:
                        print(random.choice(NARASI_SABOTASE).format(lawan=opponent.name, nama=me.name))

            # Proses Sabotase
            heat = 0
            if pending_heat > 0:
                if me.choose_block_sabotage(0, pending_heat):
                    me.tameng -= 1
                    if verbose:
                        print(f"🛡️ {me.name} mengaktifkan TAMENG! Piring diselimuti medan pelindung, sabotase diblokir!")
                else:
                    heat += pending_heat
                    if verbose:
                        print(f"🔥 {me.name} pasrah menerima kepedesan sabotase! Meter Pedas bertambah +{pending_heat}.")

            # FASE 2: ACTIVE (MAKAN CABAI)
            round_pts = 0
            busted = False
            shield_used_this_turn = False
            susu_drunk_this_turn = 0
            
            while True:
                # Bot menentukan langkah
                decision, bite = me.choose_action(heat, round_pts, is_final, top_opp)
                
                if decision == "MINUM_SUSU":
                    me.susu -= 1
                    pedas_lama = heat
                    heat = max(0, heat - SUSU_COOL)
                    susu_drunk_this_turn += 1
                    if verbose:
                        print(random.choice(NARASI_MINUM_SUSU).format(nama=me.name, pedas_lama=pedas_lama, pedas_baru=heat))
                    continue
                    
                elif decision == "SAJIKAN":
                    # Simpan poin
                    mult = get_multiplier(heat, me.char_id)
                    hemat_bonus = 0
                    if me.char_id == "hemat" and heat < CHARS["hemat"]["safeBelow"]:
                        hemat_bonus = CHARS["hemat"]["safeBonus"]
                        
                    round_score = round(round_pts * mult) + hemat_bonus
                    if is_final:
                        round_score *= FINAL_MULT
                        
                    me.score += round_score
                    if verbose:
                        bonus_str = f" (+{hemat_bonus} Poin Hemat!)" if hemat_bonus > 0 else ""
                        mult_str = f" (Level Berani Multiplier x{mult})" if mult > 1.0 else ""
                        final_str = " (PAMUNGKAS X2!)" if is_final else ""
                        print(random.choice(NARASI_SAJIKAN).format(nama=me.name, poin=round_score))
                        print(f"   => Poin ronde: {round_pts} {mult_str}{bonus_str}{final_str} -> Masuk Bank: +{round_score} Poin!")
                    break
                    
                elif decision == "SUAP":
                    cabe_def = BITES[bite]
                    
                    # Hitung heat & poin suapan
                    heat_mod = me.char_def.get("heatMod", 0)
                    point_mod = me.char_def.get("pointMod", 0)
                    
                    added_heat = cabe_def["heat"] + heat_mod
                    heat += added_heat
                    
                    # Poin minimal 1 per suap (Math.max(1, roll + mod))
                    gain_pts = max(1, random.randint(cabe_def["points"][0], cabe_def["points"][1]) + point_mod)
                    round_pts += gain_pts
                    
                    chance = get_bust_chance(heat)
                    
                    if verbose:
                        print(random.choice(NARASI_MAKAN).format(nama=me.name, cabe=cabe_def["name"]))
                        print(f"   [Gigitan] +{gain_pts} Poin | Pedas +{added_heat} -> Total Pedas: {heat} | Peluang Meledak: {chance}%")
                    
                    # Gulir Kocokan Peluang Bust
                    if random.random() * 100 < chance:
                        # Terjadi Bust! Cek nyawa tambahan Lidah Baja
                        if me.char_id == "baja" and not shield_used_this_turn:
                            shield_used_this_turn = True
                            if verbose:
                                print(f"🛡️ PERUT BAJA AKTIF! {me.name} tersedak asap Carolina Reaper tapi menolaknya mati! Nyawa terselamatkan sekali.")
                            continue
                        else:
                            busted = True
                            if verbose:
                                print(random.choice(NARASI_BUST).format(nama=me.name, cabe=cabe_def["name"]))
                            break

            # FASE 3: PENYELESAIAN TARUHAN Spectator
            if verbose and bets:
                print("--- Penyelesaian Taruhan ---")
            for betor_idx, bet_val in bets.items():
                opponent = player_bots[betor_idx]
                correct = (busted and bet_val == "bust") or (not busted and bet_val == "aman")
                delta = BET_STAKE if correct else -BET_STAKE
                
                # Skor tidak bisa kurang dari 0
                opponent.score = max(0, opponent.score + delta)
                if verbose:
                    bet_status = "BENAR! (+5 poin)" if correct else "SALAH! (-5 poin)"
                    taruhan_kata = "MELEDAK" if bet_val == "bust" else "AMAN"
                    print(f"   * {opponent.name} bertaruh {taruhan_kata} -> Tebakan {bet_status} | Skor Baru: {opponent.score}")

        # FASE BELANJA (SHOP) — Dibuka setelah Ronde 1, 2, dan 3
        if round_num < CYCLES:
            if verbose:
                print("\n🛒 TOKO KELONTONG CABAI DIBUKA! 🛒")
            for p in player_bots:
                # Heuristik belanja bot sederhana:
                # Beli jika stok habis dan poin mencukupi
                bought_items = []
                # Susu (Harga: 8)
                if p.susu == 0 and p.score >= 8:
                    p.score -= 8
                    p.susu += 1
                    bought_items.append("Susu (-8 Poin)")
                # Tameng (Harga: 10)
                if p.tameng == 0 and p.score >= 10:
                    p.score -= 10
                    p.tameng += 1
                    bought_items.append("Tameng (-10 Poin)")
                # Cabai/Sabotase (Harga: 6)
                if p.sabotage == 0 and p.score >= 6:
                    p.score -= 6
                    p.sabotage += 1
                    bought_items.append("Sambal (-6 Poin)")
                
                if verbose and bought_items:
                    print(f"   * {p.name} berbelanja: {', '.join(bought_items)} | Sisa Poin: {p.score}")
            if verbose:
                print("")

    # GAME OVER: Tentukan Pemenang
    scores = [p.score for p in player_bots]
    max_score = max(scores)
    winners = [p for p in player_bots if p.score == max_score]
    
    if verbose:
        print("═══ GAME OVER ═══")
        print("Papan Skor Akhir:")
        for p in sorted(player_bots, key=lambda x: x.score, reverse=True):
            print(f" - {p.name}: {p.score} poin")
        print("")
        if len(winners) == 1:
            print(f"👑 PEMENANGNYA ADALAH: {winners[0].name} dengan {max_score} poin! SELAMAT! 👑")
        else:
            print(f"🤝 HASIL SERI! Juara bersama: {', '.join([w.name for w in winners])} dengan {max_score} poin! 🤝")
            
    return [w.char_id for w in winners]

# ─────────────────────────────────────────────────────────────
#  BATCH RUNNER UNTUK ANALISIS STATISTIK
# ─────────────────────────────────────────────────────────────

def run_batch_simulation(games_count=1000):
    """Menjalankan simulasi ribuan game untuk melihat statistik win-rate & keseimbangan."""
    player_counts = [2, 3, 4]
    char_list = list(CHARS.keys())
    
    all_records = []
    
    print(f"Memulai simulasi batch sebanyak {games_count} game per jumlah pemain...")
    
    for num_players in player_counts:
        # Siapkan statistik kemenangan
        wins = {c: 0.0 for c in char_list}
        scores_sum = {c: 0.0 for c in char_list}
        counts = {c: 0 for c in char_list}
        
        for game_id in range(games_count):
            # Acak karakter yang dimainkan
            selected_chars = random.sample(char_list, num_players)
            bots = [PlayerBot(i, c) for i, c in enumerate(selected_chars)]
            
            # Jalankan game
            winning_chars = run_single_game(bots, verbose=False)
            
            # Catat hasil
            win_share = 1.0 / len(winning_chars)
            for b in bots:
                counts[b.char_id] += 1
                scores_sum[b.char_id] += b.score
                if b.char_id in winning_chars:
                    wins[b.char_id] += win_share
                    
                # Simpan ke record list untuk analisis rinci jika diinginkan
                all_records.append({
                    "game_id": game_id,
                    "player_count": num_players,
                    "character": b.char_id,
                    "score": b.score,
                    "is_winner": 1 if b.char_id in winning_chars else 0
                })
                
        # Tampilkan ringkasan hasil
        print(f"\n==========================================")
        print(f"📊 HASIL SIMULASI BATCH: {num_players} PEMAIN")
        print(f"==========================================")
        print(f"{'Karakter':<10} | {'Dimainkan':<9} | {'Kemenangan':<10} | {'Win Rate':<8} | {'Rata2 Skor':<10}")
        print(f"--------------------------------------------------")
        
        chi_obs = []
        for c in char_list:
            games_played = counts[c]
            if games_played == 0:
                continue
            wr = (wins[c] / games_played) * 100
            avg_score = scores_sum[c] / games_played
            chi_obs.append(wins[c])
            print(f"{c:<10} | {games_played:<9} | {wins[c]:<10.1f} | {wr:<7.2f}% | {avg_score:<10.2f}")
            
        # Uji Chi-Square untuk pembuktian keseimbangan statistik
        total_wins = sum(chi_obs)
        expected = [total_wins / len(chi_obs)] * len(chi_obs)
        if chisquare is not None:
            chi2_stat, p_val = chisquare(chi_obs, f_exp=expected)
            print(f"--------------------------------------------------")
            print(f"Statistik Chi-Square: {chi2_stat:.4f}")
            print(f"p-value: {p_val:.4e}")
            if p_val <= 0.05:
                print("Kesimpulan: TERJADI KETIDAKSEIMBANGAN SIGNIFIKAN secara statistik (p <= 0.05)")
            else:
                print("Kesimpulan: SEIMBANG secara statistik (p > 0.05). Perbedaan win-rate murni fluktuasi acak.")
        else:
            # Hitung manual statistik Chi-Square jika scipy tidak terinstal
            chi2_stat = sum(((o - e)**2) / e for o, e in zip(chi_obs, expected))
            print(f"--------------------------------------------------")
            print(f"Statistik Chi-Square (Manual): {chi2_stat:.4f}")
            print("Peringatan: library scipy tidak terdeteksi. Silakan jalankan di Colab untuk analisis p-value lengkap.")

    if pd is not None:
        return pd.DataFrame(all_records)
    return all_records

# ─────────────────────────────────────────────────────────────
#  DEMO JALANNYA PERMAINAN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    print("Selamat datang di Tahan Pedas Simulator!")
    print("1. Jalankan 1 Game Demo (Pemain: Si Lidah Baja vs Si Rakus vs Si Tukang Kompor)")
    print("2. Jalankan Batch Simulasi (1.000 game untuk analisis statistik)")
    
    choice = input("\nPilih opsi (1/2): ")
    if choice == "1":
        # 3 pemain
        selected = ["baja", "rakus", "kompor"]
        bots = [PlayerBot(i, c) for i, c in enumerate(selected)]
        run_single_game(bots, verbose=True)
    else:
        run_batch_simulation(1000)
