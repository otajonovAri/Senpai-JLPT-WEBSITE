import PublicLayout, { PageHero, CardGrid, Section, CtaBlock } from '../../components/PublicLayout';

const CAPABILITIES = [
  { emoji: '📚', title: "Lug'at API", body: "18,000+ so'z: o'qilishi, romaji, o'zbekcha ma'nolari va misol gaplar bilan." },
  { emoji: '🈶', title: 'Kanji API', body: "2,000+ kanji: on/kun o'qilishi, chiziqlar soni, JLPT darajasi va chizish tartibi." },
  { emoji: '📖', title: 'Grammatika API', body: "N5–N1 grammatika qoidalari, tuzilishi va o'zbekcha izohlari." },
  { emoji: '🔤', title: 'Kana API', body: "Hiragana va katakana jadvallari, audio va chizish tartibi havolalari bilan." },
];

const SPECS = [
  ['Protokol', 'REST, JSON'],
  ['Autentifikatsiya', 'Bearer token (JWT)'],
  ['Limit', '300 so\'rov / daqiqa'],
  ['Format', 'UTF-8, camelCase'],
  ['Hujjat', 'OpenAPI 3.0 (Swagger)'],
];

export default function ForDevelopers() {
  return (
    <PublicLayout>
      <PageHero
        icon="/mascot/icons/coding.png"
        badge="Dasturchilar uchun"
        title="SenpaiJLPT kontentini o'z ilovangizda ishlating"
        subtitle="Yapon tili lug'ati, kanji va grammatika bazamizga REST API orqali ulaning — o'zbek tilidagi tarjimalar bilan."
      />

      <Section title="Mavjud imkoniyatlar">
        <CardGrid items={CAPABILITIES} />
      </Section>

      <Section title="Texnik ma'lumot">
        <div style={S.specTable}>
          {SPECS.map(([k, v]) => (
            <div key={k} style={S.specRow}>
              <span style={S.specKey}>{k}</span>
              <span style={S.specVal}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Namuna so'rov">
        <pre style={S.code}>
{`curl -H "Authorization: Bearer <TOKEN>" \\
  "https://api.senpaiari.uz/api/vocabulary?level=N5&page=1"`}
        </pre>
        <p style={S.note}>
          Kalit olish uchun ariza qoldiring — notijorat va ta'lim loyihalari uchun bepul.
        </p>
      </Section>

      <CtaBlock
        title="API kalitini oling"
        body="Loyihangiz haqida qisqacha yozing — mos limitni belgilab, kalit va hujjatni yuboramiz."
        buttonText="Kalit so'rash"
        href="https://t.me/ariCoder"
      />
    </PublicLayout>
  );
}

const S = {
  specTable: {
    background: 'var(--bg-card, #fff)', borderRadius: 22,
    border: '1px solid var(--border-light, #EDEFEA)', overflow: 'hidden',
  },
  specRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
    padding: '14px 20px', borderBottom: '1px solid var(--border-light, #EDEFEA)',
  },
  specKey: { fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' },
  specVal: { fontSize: 14, fontWeight: 600, color: 'var(--text)', textAlign: 'right' },
  code: {
    background: '#1E2A22', color: '#B6E99E', borderRadius: 18, padding: '20px 22px',
    fontSize: 13, lineHeight: 1.7, overflowX: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  note: { fontSize: 14, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 },
};
