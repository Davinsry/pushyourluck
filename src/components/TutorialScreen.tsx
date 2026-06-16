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
  CYCLES,
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
        <h2 className="m-0 text-xl font-extrabold text-chili-dark">Cara Bermain</h2>
      </div>

      <div className="grid gap-3">
        <Section icon={<Trophy size={18} />} title="Tujuan Game">
          Kumpulkan <B>poin sebanyak-banyaknya</B> dengan memakan cabe. Makin banyak & makin pedas cabe yang kamu lahap, makin besar poinnya. 
          Namun, setiap suap meningkatkan <B>level pedas</B> dan risiko <B>kepedesan (bust)</B>. Jika kamu kepedesan sebelum menyajikan, 
          semua poin yang dikumpulkan di ronde tersebut akan <B>hangus</B>! Seni dari game ini adalah tahu kapan harus berhenti.
        </Section>

        <Section icon={<Users size={18} />} title="1. Persiapan & Mode Game">
          Pilih mode bermain: <B>Main Sendiri</B> (lawan bot <Bot size={12} className="inline align-[-1px]" />), 
          <B>Main Bareng</B> (2–4 orang secara lokal pas-dan-main), atau <B>Main Online</B> (membuat/masuk room). 
          Tentukan namamu di awal (bisa diacak dengan dadu, tersimpan di Pengaturan). Tiap pemain kemudian <B>memilih 1 karakter unik</B> dari {Object.keys(CHARS).length} pilihan secara bergantian.
        </Section>

        <Section icon={<Hand size={18} />} title="2. Giliran Bermain (3 Fase)">
          <p className="m-0 mb-1.5">
            <B>a. Fase Penonton (30 Detik):</B> Pemain lain menebak nasibmu: <span className="font-bold text-leaf-dark">Aman</span> atau <span className="font-bold text-chili-dark">Kepedesan</span> (tebakan benar mendapat +{BET_STAKE} poin, tebakan salah kehilangan −{BET_STAKE} poin). Penonton juga bisa mengirim <B>Sambal Sabotase</B> (+{SABOTAGE_HEAT} pedas). Kamu bisa membelanjakan <Shield size={12} className="inline align-[-1px]" /> <B>Tameng</B> untuk menangkis sabotase.
          </p>
          <p className="m-0 mb-1.5">
            <B>b. Fase Makan (60 Detik):</B> Kamu bergantian menyuap cabe. Setiap suap memberimu poin dan meningkatkan pedas. Jika pedas tinggi, ada risiko kepedesan (bust) berdasarkan peluang acak. Gunakan <Milk size={12} className="inline align-[-1px]" /> <B>Minum Susu</B> untuk menurunkan pedas −{SUSU_COOL}.
          </p>
          <p className="m-0">
            <B>c. Fase Sajikan:</B> Klik <B>Sajikan</B> untuk mengamankan poin rondemu (akan dikalikan dengan multiplier level berani).
          </p>
        </Section>

        <Section icon={<Flame size={18} />} title="3. Jenis Cabe & Tingkat Pedas">
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
          <p className="m-0 mt-1.5">Makin tinggi tingkat pedas, makin besar peluang kepedesan (bust) pada suapan berikutnya.</p>
        </Section>

        <Section icon={<Sparkles size={18} />} title="4. Multiplier (Level Berani)">
          Jika kamu menyajikan makanan saat tingkat pedas tinggi, poin yang diperoleh akan dikalikan:
          <div className="mt-1 flex flex-col gap-0.5">
            <div>• Pedas <B>≥ {MULT.t15}</B> → Poin Sajian <B>×1.5</B></div>
            <div>• Pedas <B>≥ {MULT.t2}</B> → Poin Sajian <B>×2.0</B></div>
          </div>
          <p className="m-0 mt-1">*Catatan: Karakter tertentu (Si Tukang Kompor & Si Hemat) memiliki batas multiplier maksimum ×1.5.</p>
        </Section>

        <Section icon={<Shield size={18} />} title="5. Item & Kegunaannya">
          <Shield size={12} className="inline align-[-1px]" /> <B>Tameng</B> — Menangkis seluruh sambal sabotase yang dikirim lawan di awal giliranmu.
          <br />
          <Milk size={12} className="inline align-[-1px]" /> <B>Susu</B> — Menurunkan tingkat pedas sebanyak −{SUSU_COOL} saat giliran makanmu.
          <br />
          <Flame size={12} className="inline align-[-1px]" /> <B>Sambal / Cabai</B> — Mengirim sabotase pedas (+{SABOTAGE_HEAT} pedas) ke pemain yang sedang makan.
        </Section>

        <Section icon={<Coins size={18} />} title="6. Karakter & Sidegrade">
          Setiap karakter memiliki kelebihan dan kekurangan yang unik. Pilih karakter yang sesuai dengan strategi bermainmu:
          <div className="mt-1.5 grid gap-1.5">
            {(Object.keys(CHARS) as (keyof typeof CHARS)[]).map((k) => (
              <div key={k} className="border-t border-cream-2/50 pt-1 first:border-0 first:pt-0">
                <span style={{ color: color(CHARS[k].colorKey) }} className="font-bold">
                  {CHARS[k].name}
                </span>{" "}
                <span className="text-[11px] text-muted-foreground bg-cream-2 px-1.5 py-0.5 rounded ml-1 font-semibold">{CHARS[k].tag}</span>
                <div className="mt-0.5 flex flex-col text-[12px]">
                  <span className="text-leaf-dark">▲ Kelebihan: {CHARS[k].up}</span>
                  <span className="text-chili-dark">▼ Kekurangan: {CHARS[k].down}</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<ShoppingCart size={18} />} title="7. Toko Item (Antar Ronde)">
          Setiap selesai ronde (mulai dari Ronde 1), Toko Item akan dibuka selama <B>60 detik</B>. Belanja bersifat <B>opsional</B> menggunakan poin kemenanganmu:
          <div className="mt-1 flex gap-4">
            <div>• Susu: <B>{SHOP.susu} poin</B></div>
            <div>• Tameng: <B>{SHOP.tameng} poin</B></div>
            <div>• Sambal: <B>{SHOP.cabai} poin</B></div>
          </div>
          <p className="m-0 mt-1.5 text-chili-dark font-semibold">*Membeli item akan mengurangi total skor kemenanganmu, jadi belanjalah dengan bijak!</p>
        </Section>

        <Section icon={<Sparkles size={18} />} title="8. Ronde Pamungkas & Emote">
          <p className="m-0 mb-1.5">
            <B>Ronde Terakhir (Pamungkas):</B> Semua poin yang disajikan di ronde terakhir akan dikalikan <B>×{FINAL_MULT}</B> — kesempatan emas untuk melakukan comeback!
          </p>
          <p className="m-0">
            <B>Emote Panel:</B> Di mode online, kamu bisa mengekspresikan diri atau meledek temanmu dengan tombol emote panel di sisi kanan tengah layar.
          </p>
        </Section>

        <Section icon={<CheckCheck size={18} />} title="9. Kemenangan">
          Setelah seluruh ronde berakhir (standar {CYCLES} ronde), pemain dengan <B>total poin tertinggi</B> akan keluar sebagai juara. Selamat menikmati game terpedas! 🌶️
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
