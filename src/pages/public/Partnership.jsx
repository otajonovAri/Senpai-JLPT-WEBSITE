import PublicLayout, { PageHero, CardGrid, Section, CtaBlock } from '../../components/PublicLayout';

const TYPES = [
  { emoji: '🏫', title: "O'quv markazlari", body: "Kurslaringizni platformamizda tanishtiring, o'quvchilarga qo'shimcha mashq muhitini bering." },
  { emoji: '🎌', title: 'Til maktablari (Yaponiya)', body: "Yaponiyadagi maktablar bilan o'zbek talabalarini bog'lash dasturlari." },
  { emoji: '📣', title: 'Kontent mualliflari', body: "Blogerlar va o'qituvchilar uchun referal dasturi — har bir faol foydalanuvchi uchun bonus." },
  { emoji: '💼', title: 'Korporativ', body: "Kompaniya xodimlarini yapon tiliga o'rgatish uchun guruh litsenziyalari." },
];

const NUMBERS = [
  { num: '18,000+', label: "so'z bazasi" },
  { num: '2,000+', label: 'kanji' },
  { num: 'N5–N1', label: 'JLPT qamrovi' },
  { num: '100%', label: "o'zbek tilida" },
];

export default function Partnership() {
  return (
    <PublicLayout>
      <PageHero
        icon="/footer/Handshake_Dragon-removebg-preview.png"
        badge="Hamkorlik"
        title="Birgalikda yapon tilini yaqinlashtiramiz"
        subtitle="O'quv markazlari, kontent mualliflari va kompaniyalar bilan uzoq muddatli hamkorlikka ochiqmiz."
      />

      <Section>
        <div style={S.numbers}>
          {NUMBERS.map(n => (
            <div key={n.label} style={S.numCard}>
              <div style={S.num}>{n.num}</div>
              <div style={S.numLabel}>{n.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Hamkorlik yo'nalishlari">
        <CardGrid items={TYPES} />
      </Section>

      <Section title="Nima taklif qilamiz">
        <ul style={S.list}>
          <li style={S.li}>Platformada brendingizni joylashtirish va tanishtirish</li>
          <li style={S.li}>Hamkorlar uchun maxsus tarif va guruh litsenziyalari</li>
          <li style={S.li}>Referal havolalar orqali shaffof hisob-kitob</li>
          <li style={S.li}>Birgalikda kontent va tadbirlar tayyorlash</li>
        </ul>
      </Section>

      <CtaBlock
        title="Taklifingizni yuboring"
        body="Qanday hamkorlikni ko'zlayotganingizni yozing — jamoamiz 2 ish kuni ichida javob beradi."
        buttonText="Bog'lanish"
        href="https://t.me/senpaijlpt_uz"
      />
    </PublicLayout>
  );
}

const S = {
  numbers: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 },
  numCard: {
    background: 'var(--bg-card, #fff)', borderRadius: 20, padding: '22px 16px',
    textAlign: 'center', border: '1px solid var(--border-light, #EDEFEA)',
  },
  num: { fontSize: 28, fontWeight: 900, color: 'var(--primary, #58CC02)', letterSpacing: -0.5 },
  numLabel: { fontSize: 13, color: 'var(--text-light)', fontWeight: 600, marginTop: 4 },
  list: {
    background: 'var(--bg-card, #fff)', borderRadius: 22, padding: '20px 20px 20px 40px',
    border: '1px solid var(--border-light, #EDEFEA)', margin: 0,
  },
  li: { fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.9 },
};
