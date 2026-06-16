const INDO_NAMES = [
  "Raja Cabai",
  "Ratu Rawit",
  "Lidah Api",
  "Sambal Gila",
  "Nasi Hangat",
  "Botol Susu",
  "Kerupuk Krenyes",
  "Keringat Dingin",
  "Jagoan Pedas",
  "Pecinta Ijo",
  "Carolina Sultan",
  "Kompor Meledug",
  "Si Tameng",
  "Es Sirup",
  "Teh Manis",
  "Keripik Pedas",
  "Gorengan Hot",
  "Pencari Susu",
  "Lidah Baja",
  "Mouth On Fire"
];

export function getRandomName(): string {
  return INDO_NAMES[Math.floor(Math.random() * INDO_NAMES.length)];
}
