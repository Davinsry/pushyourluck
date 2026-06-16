import {
  ArrowLeft,
  Bot,
  CheckCheck,
  Coins,
  Flame,
  Hand,
  Milk,
  Shield,
  ShoppingCart,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import {
  BET_STAKE,
  BITES,
  CHARS,
  FINAL_MULT,
  MULT,
  SABOTAGE_HEAT,
  SHOP,
  SUSU_COOL,
  TURN_SECONDS,
} from "../config/balance";
import { color } from "../ui/theme";

interface Props {
  onBack: () => void;
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-[1.5px] border-cream-2 bg-cream p-4">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-chili-dark">{icon}</span>
        <h3 className="m-0 text-[15px] font-extrabold text-chili-dark">{title}</h3>
      </div>
      <div className="text-[13px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <span className="font-bold text-chili-dark">{children}</span>;

/** Full "how to play" — rules from start to finish, in Bahasa Indonesia. */
export function TutorialScreen({ onBack }: Props) {
  return (
    <div className="mt-[18px] rounded-[20px] bg-card p-6 text-ink">
      <div className="mb-4 flex items-center gap-2">
        <button className="tp-btn rounded-full bg-cream-2 p-2 text-ink" onClick={onBack} aria-label="Kembali">
          <ArrowLeft size={18} />
        </button>
        <h2 className="m-0 text-xl font-extrabold text-chili-dark">Cara Main</h2>
      </div>

      <div className="grid gap-3">
        <Section icon={<Trophy size={18} />} title="Tujuan">
          Kumpulin <B>poin terbanyak</B> dengan makan cabe. Makin banyak & makin pedas yang kamu makan, makin gede
          poinnya — tapi tiap suap nambah <B>level pedas</B> dan risiko <B>kepedesan</B> (bust). Kepedesan = poin
          ronde itu hangus. Seni-nya: tahu kapan harus berhenti.
        </Section>

        <Section icon={<Users size={18} />} title="1. Mulai">
          Pilih mode: <B>Main Sendiri</B> (lawan bot <Bot size={12} className="inline align-[-1px]" />),{" "}
          <B>Main Bareng</B> (2–4 orang satu HP), atau <B>Main Online</B> (join room). Isi nama, lalu tiap pemain{" "}
          <B>pilih 1 karakter</B> dari {Object.keys(CHARS).length} (tiap pemain harus beda). Poin{" "}
          <B>dikumpulin sambil main</B> — dipakai buat menang sekaligus belanja di Toko.
        </Section>

        <Section icon={<Hand size={18} />} title="2. Giliranmu — 3 fase">
          <p className="m-0 mb-1.5">
            <B>a. Penonton.</B> Pemain lain nebak nasibmu: <span className="font-bold text-leaf-dark">Aman</span> atau{" "}
            <span className="font-bold text-chili-dark">Kepedesan</span> (benar +{BET_STAKE}, salah −{BET_STAKE}), dan
            boleh <B>tambah sambal</B> (+{SABOTAGE_HEAT} pedas). Kamu bisa pakai{" "}
            <Shield size={12} className="inline align-[-1px]" /> <B>Tameng</B> buat nangkis semua sambal.
          </p>
          <p className="m-0 mb-1.5">
            <B>b. Makan.</B> Pilih cabe → dapat poin + naik pedas. Tiap suap ada dadu <B>kepedesan</B> sesuai level
            pedas. Boleh <Milk size={12} className="inline align-[-1px]" /> <B>Minum Susu</B> buat turunin pedas −
            {SUSU_COOL}.
          </p>
          <p className="m-0">
            <B>c. Sajikan.</B> Berhenti & amankan poin ronde (dikali multiplier). Kalau keburu kepedesan sebelum
            sajikan, poin ronde <B>hangus</B>.
          </p>
        </Section>

        <Section icon={<Flame size={18} />} title="3. Cabe & level pedas">
          {(Object.keys(BITES) as (keyof typeof BITES)[]).map((k) => (
            <div key={k} className="flex justify-between">
              <span style={{ color: color(BITES[k].colorKey) }} className="font-bold">
                {BITES[k].name}
              </span>
              <span className="text-muted">
                +{BITES[k].points[0]}–{BITES[k].points[1]} poin · pedas +{BITES[k].heat}
              </span>
            </div>
          ))}
          <p className="m-0 mt-1.5">Makin tinggi pedas, makin gede peluang kepedesan tiap suap.</p>
        </Section>

        <Section icon={<Sparkles size={18} />} title="4. Multiplier (Level Berani)">
          Pedas <B>≥ {MULT.t15}</B> → poin sajikan <B>×1.5</B>. Pedas <B>≥ {MULT.t2}</B> → <B>×2</B>. Jadi makin berani
          (pedas tinggi) makin gede hasilnya — tapi makin gampang kepedesan.
        </Section>

        <Section icon={<Shield size={18} />} title="5. Item">
          <Shield size={12} className="inline align-[-1px]" /> <B>Tameng</B> — tangkis semua sambal lawan giliranmu.
          <br />
          <Milk size={12} className="inline align-[-1px]" /> <B>Susu</B> — turunin pedas −{SUSU_COOL}.
          <br />
          <Flame size={12} className="inline align-[-1px]" /> <B>Sambal/Cabai</B> — buat nyabotase lawan (+
          {SABOTAGE_HEAT} pedas) pas kamu jadi penonton.
        </Section>

        <Section icon={<Coins size={18} />} title="6. Karakter">
          {Object.keys(CHARS).length} karakter, semua <B>sidegrade</B> (ada plus & minus) — pilih gaya mainmu:
          <div className="mt-1.5 grid gap-1">
            {(Object.keys(CHARS) as (keyof typeof CHARS)[]).map((k) => (
              <div key={k}>
                <span style={{ color: color(CHARS[k].colorKey) }} className="font-bold">
                  {CHARS[k].name}
                </span>{" "}
                — <span className="text-leaf-dark">{CHARS[k].up}</span>{" "}
                <span className="text-chili-dark">{CHARS[k].down}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<ShoppingCart size={18} />} title="7. Toko (antar ronde)">
          Tiap selesai ronde, Toko kebuka (mulai habis ronde 1). Belanja itu <B>opsional</B>, pakai poin yang udah kamu
          kumpulin: Susu ({SHOP.susu}), Tameng ({SHOP.tameng}), Sambal ({SHOP.cabai}). Hati-hati — belanja = poin
          berkurang, jadi mikir dulu.
        </Section>

        <Section icon={<Sparkles size={18} />} title="8. Ronde Pamungkas & waktu">
          Ronde terakhir = <B>Pamungkas</B>: semua poin ronde itu <B>×{FINAL_MULT}</B> — kesempatan comeback! Tiap
          giliran makan dibatasi <B>{TURN_SECONDS} detik</B>; kehabisan waktu = giliranmu di-skip.
        </Section>

        <Section icon={<CheckCheck size={18} />} title="9. Menang">
          Setelah semua ronde habis, <B>poin tertinggi menang</B>. Seri kalau sama. Selamat tahan pedas! 🌶️
        </Section>
      </div>

      <button
        className="tp-btn mt-4 w-full rounded-[14px] bg-flame py-3.5 text-[17px] font-extrabold text-white"
        onClick={onBack}
      >
        Ngerti, balik ke menu
      </button>
    </div>
  );
}
