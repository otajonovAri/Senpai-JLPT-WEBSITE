import PublicLayout, { PageHero, CardGrid, Section, CtaBlock } from '../../components/PublicLayout';

const FEATURES = [
  { emoji: '👨‍🏫', title: "O'qituvchi paneli", body: "Guruh yarating, o'quvchilarni qo'shing va har birining progressini bitta ekrandan kuzating." },
  { emoji: '📊', title: 'Batafsil hisobotlar', body: "Kim qancha so'z o'rgandi, qaysi kanjida qiynalmoqda — haftalik va oylik kesimda ko'ring." },
  { emoji: '🎯', title: 'Uy vazifasi tayinlash', body: "Muayyan darslar yoki so'zlar to'plamini vazifa qilib bering, bajarilishini avtomatik tekshiring." },
  { emoji: '🏆', title: 'Sinf reytingi', body: "Sog'lom raqobat o'quvchilarni rag'batlantiradi — guruh ichida ligalar va yutuqlar." },
  { emoji: '📝', title: 'JLPT tayyorgarlik', body: "Rasmiy imtihon formatidagi mock testlar bilan o'quvchilaringizni sinovga tayyorlang." },
  { emoji: '🔐', title: 'Xavfsiz muhit', body: "Reklama yo'q, begona foydalanuvchilar bilan aloqa cheklangan — faqat sizning guruhingiz." },
];

const STEPS = [
  { n: 1, title: 'Ariza qoldiring', body: "Quyidagi tugma orqali muassasangiz haqida qisqacha ma'lumot yuboring." },
  { n: 2, title: 'Demo uchrashuv', body: "Jamoamiz platformani ko'rsatadi va savollaringizga javob beradi." },
  { n: 3, title: 'Guruhlarni sozlash', body: "O'qituvchi hisoblarini ochamiz va o'quvchilarni tizimga kiritishga yordam beramiz." },
];

export default function ForSchools() {
  return (
    <PublicLayout>
      <PageHero
        icon="/footer/School_Institution-removebg-preview.png"
        badge="Ta'lim muassasalari uchun"
        title="Yapon tili darslarini zamonaviy qiling"
        subtitle="O'quv markazlari, maktablar va universitetlar uchun — o'quvchilar progressini kuzating, uy vazifasi bering va JLPT'ga tayyorlang."
      />

      <Section title="Nima olasiz">
        <CardGrid items={FEATURES} />
      </Section>

      <Section title="Qanday boshlanadi">
        <div style={S.steps}>
          {STEPS.map(s => (
            <div key={s.n} style={S.step}>
              <div style={S.stepNum}>{s.n}</div>
              <h3 style={S.stepTitle}>{s.title}</h3>
              <p style={S.stepBody}>{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBlock
        title="Muassasangiz uchun sinab ko'ring"
        body="Dastlabki guruh uchun bepul sinov davri beramiz. Ariza qoldiring — 2 ish kuni ichida bog'lanamiz."
        buttonText="Ariza qoldirish"
        href="https://t.me/ariCoder"
      />
    </PublicLayout>
  );
}

const S = {
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 },
  step: {
    background: 'var(--bg-card, #fff)', borderRadius: 22, padding: '24px 20px',
    border: '1px solid var(--border-light, #EDEFEA)',
  },
  stepNum: {
    width: 40, height: 40, borderRadius: '50%', background: '#58CC02', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 900, marginBottom: 12,
  },
  stepTitle: { fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 6 },
  stepBody: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 },
};
