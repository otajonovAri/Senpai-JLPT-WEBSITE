import PublicLayout, { PageHero, Section } from '../../components/PublicLayout';
import NotFound from '../NotFound';

// Bir nechta matnli sahifa bitta komponentda — har biri uchun alohida fayl ochmaslik uchun.
// Yangi sahifa qo'shish: shu obyektga yozuv qo'shib, App.jsx'ga route bering.
const PAGES = {
  about: {
    icon: '/footer/Brand_About_Us-removebg-preview.png',
    badge: 'Biz haqimizda',
    title: 'SenpaiJLPT nima?',
    subtitle: "Yapon tilini o'zbek tilida, o'yin kabi qiziqarli tarzda o'rgatuvchi platforma.",
    blocks: [
      {
        title: 'Muammo',
        body: "Yapon tilini o'rganmoqchi bo'lgan o'zbekistonliklar ko'pincha ingliz tili orqali o'rganishga majbur. Bu ikki barobar qiyinchilik: avval inglizchani, keyin yaponchani tushunish kerak.",
      },
      {
        title: 'Yechim',
        body: "SenpaiJLPT barcha izohlar, tarjimalar va grammatikani to'g'ridan-to'g'ri o'zbek tilida beradi. Hiragana'dan JLPT N1 gacha — oraliqda hech qanday uchinchi til yo'q.",
      },
      {
        title: 'Yondashuv',
        body: "Ilmiy asoslangan SRS (interval takrorlash) algoritmi so'zlarni aynan unutish arafasida ko'rsatadi. Buning ustiga streak, XP, ligalar va yutuqlar qo'shildi — natijada har kuni qaytib kelish odat bo'ladi.",
      },
    ],
  },
  mission: {
    icon: '/footer/Dragon_Target_Icon-removebg-preview.png',
    badge: 'Maqsadimiz',
    title: "Til to'siqlarini yo'q qilish",
    subtitle: "Har bir o'zbekistonlik yapon tilini ona tilida, bepul va sifatli o'rgana olishi kerak.",
    blocks: [
      {
        title: 'Nega yapon tili?',
        body: "Yaponiya bilan ta'lim va mehnat aloqalari yildan yilga kengaymoqda. Ammo sifatli o'zbekcha o'quv materiallari deyarli yo'q — bu bo'shliqni to'ldirmoqchimiz.",
      },
      {
        title: 'Nega bepul?',
        body: "Asosiy kontent — lug'at, kanji, grammatika va darslar — hamma uchun bepul qoladi. Premium faqat qo'shimcha qulayliklar uchun.",
      },
      {
        title: 'Uzoq muddatli reja',
        body: "N5–N1 to'liq kurs, jonli talaffuz baholash, o'quv markazlari uchun panel va mobil ilova — bosqichma-bosqich ishlab chiqilmoqda.",
      },
    ],
  },
  effectiveness: {
    icon: '/footer/Efficiency_Gears-removebg-preview.png',
    badge: 'Samaradorlik',
    title: 'Usulimiz nega ishlaydi',
    subtitle: "Tasodifiy emas — xotira tadqiqotlariga asoslangan aniq algoritm.",
    blocks: [
      {
        title: 'Interval takrorlash (SRS)',
        body: "Ebbinghaus unutish egri chizig'iga ko'ra, yangi ma'lumot bir necha kun ichida unutiladi. SRS so'zni aynan unutish arafasida qayta ko'rsatadi — natijada har takror xotirani uzoqroq mustahkamlaydi.",
      },
      {
        title: 'Faol eslash',
        body: "Faqat o'qish emas, javobni eslashga majbur qiluvchi mashqlar. Miya ma'lumotni qayta tiklaganida bog'lanish kuchayadi — passiv o'qishdan bir necha barobar samaraliroq.",
      },
      {
        title: 'Kichik, muntazam darslar',
        body: "Kuniga 15 daqiqa — haftada bir marta 2 soatdan yaxshiroq. Streak tizimi aynan shu muntazamlikni saqlashga yordam beradi.",
      },
    ],
  },
  terms: {
    icon: '/footer/Terms_Document-removebg-preview.png',
    badge: 'Hujjat',
    title: 'Foydalanish shartlari',
    subtitle: "SenpaiJLPT platformasidan foydalanish qoidalari.",
    blocks: [
      { title: '1. Umumiy qoidalar', body: "Platformadan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz. Shartlar o'zgarganda foydalanuvchilar oldindan xabardor qilinadi." },
      { title: '2. Hisob', body: "Bir foydalanuvchi bitta hisob ochadi. Hisob ma'lumotlarining xavfsizligi foydalanuvchi zimmasida. Boshqa shaxs hisobidan foydalanish taqiqlanadi." },
      { title: '3. Kontent', body: "Platformadagi barcha o'quv materiallari mualliflik huquqi bilan himoyalangan. Tijorat maqsadida ruxsatsiz nusxalash taqiqlanadi." },
      { title: '4. Xatti-harakat', body: "Boshqa foydalanuvchilarni haqorat qilish, spam tarqatish yoki tizimni buzishga urinish hisobning bloklanishiga olib keladi." },
      { title: '5. Premium', body: "Premium obuna avtomatik yangilanmaydi. To'lov qaytarilishi O'zbekiston qonunchiligiga muvofiq amalga oshiriladi." },
    ],
  },
  privacy: {
    icon: '/footer/Security_Shield-removebg-preview.png',
    badge: 'Hujjat',
    title: 'Maxfiylik va xavfsizlik',
    subtitle: "Ma'lumotlaringiz qanday yig'iladi va himoyalanadi.",
    blocks: [
      { title: 'Qanday ma\'lumot yig\'amiz', body: "Ism, email yoki telefon raqami, o'quv progressi (o'rganilgan so'zlar, ballar, streak) va ixtiyoriy profil rasmi." },
      { title: 'Nima uchun ishlatamiz', body: "Faqat xizmat ko'rsatish uchun: progressni saqlash, takrorlash jadvalini hisoblash va reytingni tuzish. Ma'lumotlar uchinchi shaxslarga sotilmaydi." },
      { title: 'Himoya', body: "Parollar qaytarib bo'lmaydigan usulda shifrlanadi (hash). Aloqa HTTPS orqali. Serverlarga kirish cheklangan." },
      { title: 'Sizning huquqingiz', body: "Istalgan vaqtda ma'lumotlaringizni yuklab olish yoki hisobingizni butunlay o'chirishni so'rashingiz mumkin — sozlamalar bo'limi yoki qo'llab-quvvatlash orqali." },
    ],
  },
  offer: {
    icon: '/footer/Financial_Service_Terms-removebg-preview.png',
    badge: 'Hujjat',
    title: 'Ommaviy oferta',
    subtitle: "Pullik xizmatlar bo'yicha shartnoma shartlari.",
    blocks: [
      { title: 'Oferta predmeti', body: "Ushbu hujjat SenpaiJLPT platformasi pullik obuna xizmatlarini ko'rsatish bo'yicha ommaviy taklif hisoblanadi." },
      { title: 'Xizmat narxi', body: "Amaldagi tariflar Premium sahifasida ko'rsatiladi. Narx o'zgarganda mavjud obunachilarga joriy davr oxirigacha eski narx saqlanadi." },
      { title: "To'lov tartibi", body: "To'lovlar Payme va Click tizimlari orqali qabul qilinadi. To'lov amalga oshgach obuna darhol faollashadi." },
      { title: 'Bekor qilish', body: "Obunani istalgan vaqtda bekor qilish mumkin. Bekor qilinganda joriy to'langan davr oxirigacha xizmat saqlanadi." },
    ],
  },
};

// Mavjud slug'lar — App.jsx route'larni shu ro'yxatdan generatsiya qiladi
export const INFO_SLUGS = Object.keys(PAGES);

export default function InfoPage({ slug }) {
  const page = PAGES[slug];

  // Noma'lum slug — umumiy 404 sahifasi
  if (!page) return <NotFound />;

  return (
    <PublicLayout>
      <PageHero icon={page.icon} badge={page.badge} title={page.title} subtitle={page.subtitle} />
      {page.blocks.map(b => (
        <Section key={b.title} title={b.title}>
          <p style={S.body}>{b.body}</p>
        </Section>
      ))}
    </PublicLayout>
  );
}

const S = {
  body: {
    fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8,
    background: 'var(--bg-card)', borderRadius: 20, padding: '20px 22px',
    border: '2px solid var(--border)',
  },
};
