# SenpaiAri Frontend — Qilinadigan ishlar konteksti

> Yangilangan: 2026-07-25. Manba: backend (~130 endpoint, 24 controller, `D:\JapaneseMobileApp_BACKEND`)
> va frontend (77 sahifa, 76 route, 12 API modul `src/api/`) to'liq solishtiruvi.

## Umumiy holat

- 130 endpointdan 125 tasi frontend'ga ulangan, barcha sahifalar haqiqiy API bilan ishlaydi (mock yo'q).
- 2026-07-25: lug'at N5–N1 to'liq seed qilindi — jami 8 212 so'z. N5 (718) misol gaplar va
  o'zbekcha tarjimalar bilan; N4–N1 (~7 500) hozircha faqat inglizcha ma'nolar (`meaningsUz` bo'sh).
- YANGI sahifa ochish kerak EMAS — hamma funksional oqimlar uchun sahifa mavjud.
  Ishlar faqat mavjud sahifalarni kengaytirish va bitta optimallashtirish.

---

## A. UPDATE qilinadigan sahifalar — ✅ BARCHASI BAJARILDI (2026-07-25)

### A1. `src/pages/admin/AdminMockTests.jsx` — ✅ BAJARILDI
- Backend: `GET/POST/PUT/DELETE /api/admin/mock-tests` qo'shildi
  (`MockTestAdminCommands.cs`, `AdminMockTestQueries.cs`; PUT savollarni to'liq almashtiradi).
- Frontend: to'liq CRUD UI — daraja filtri, savollar muharriri (bo'lim, variantlar
  har qatorda bittadan, to'g'ri javob select, audio URL), yaratish/tahrirlash/o'chirish.
- Smoke test o'tdi: create → update (savollar almashtirildi) → delete.

### A2. `src/pages/admin/AdminPodcasts.jsx` — ✅ BAJARILDI
- Backend: `PUT/DELETE /api/podcasts/{id}` va `PUT/DELETE /api/podcasts/episodes/{id}` qo'shildi
  (epizod o'chirilganda `EpisodeCount` sinxronlanadi, podcast o'chirilganda epizodlar cascade).
- Frontend: podcast edit/delete + "Epizodlar" boshqaruv modali (ro'yxat, tahrirlash, o'chirish).
- Smoke test o'tdi: podcast/epizod to'liq CRUD sikli + episodeCount sinxron.

### A3. `src/pages/Dashboard.jsx` — ✅ BAJARILDI
- `src/api/home.js` yaratildi (`getHomeDashboard`), Dashboard 3 so'rovdan 2 so'rovga tushdi
  (`/home/dashboard` + `/daily-quests`); levelProgress endi hardcode (800/100/80) emas,
  backend'dagi haqiqiy totallar (718/80/42).
- Brauzerda tasdiqlandi: student dashboard to'g'ri sonlar bilan, konsolda xato yo'q.

> ⚠️ EF eslatma (kelajakdagi shunga o'xshash kod uchun): `BaseEntity` Id'ni klientda
> generatsiya qiladi — navigation orqali qo'shilgan yangi child entity'larni EF `Modified`
> deb taxmin qilib `DbUpdateConcurrencyException` beradi. Yangi child'larni doim repository
> orqali aniq `AddRange` qilish kerak (misol: `IMockTestRepository.AddQuestionsAsync`).

### A4. `src/pages/auth/PlacementTest.jsx` — ✅ QAYTA YOZILDI (2026-07-25)
- **Eski muammo:** `correctIndex` clientga kelardi va score'ni client hisoblardi (cheat),
  faqat vocab savollari, maksimum N3, natija hech narsani ochmasdi.
- **Yangi oqim:** 6 variantli daraja picker (Boshlang'ich / N4 / N3 / N2 / N1 / Bilmayman).
  - "Boshlang'ich" → test yo'q, darhol N5.
  - Daraja tanlansa → 15 savollik tasdiqlash testi (10 ta o'z darajasidan + 5 nazorat).
  - "Bilmayman" → auto zinapoya: N5→N1, har bosqichda 5 savol, yiqilguncha.
- **API:** `POST /placement-test/start` `{mode, declaredLevel}` + `POST /placement-test/answer` `{answers}`
  (`src/api/shop.js` → `startPlacementTest`, `answerPlacementTest`). Eski `getPlacementQuestions`/
  `submitPlacementTest` O'CHIRILDI — boshqa joyda ishlatilmaydi.
- **Natija endi roadmap'ni ochadi:** N3 chiqsa N5/N4/N3 ochiq bo'ladi (`LevelGating` placement'ni o'qiydi).

### A4. N4–N1 o'zbekcha tarjima kelganda — frontend ishi YO'Q ✅
- `Dictionary.jsx`: N5–N1 daraja filtri allaqachon bor.
- `WordDetail.jsx:56`: `meaningsUz` bo'sh bo'lsa inglizchaga fallback bor.
- UZ tarjimalar backend'da seed qilinsa, UI avtomatik ko'rsatadi — hech narsa o'zgartirilmaydi.

---

## B. Sahifasi tayyor, backend kutilyapti (frontend ishi yo'q)

| Sahifa | Holat |
|---|---|
| `exercises/Pronunciation*.jsx` (3 ta) | Backend 501 qaytaradi — Azure Speech key (`AzureSpeech__Key`) sozlanishi kerak. Sahifa xatoni chiroyli ko'rsatadi. |
| `listening/EpisodePlayer.jsx` | Seed'dagi audio URL'lar soxta domen — haqiqiy mp3'lar R2'ga yuklanib, seed URL yangilanishi kerak. |
| `lessons/Roadmap.jsx` (N3–N1 tablari) | ✅ HAL QILINDI (2026-07-25): LessonSeeder endi barcha darajalarni quradi — N5:102, N4:92, N3:191, N2:197, N1:365 dars (jami 947). Grammatika darslari faqat N5'da (N4–N1 grammatika kontenti hali yo'q — kelajak ishi). |

## C. Ataylab ulanmagan endpointlar (tegilmasin)

- `POST /subscription/confirm`, `POST /subscription/webhook` — to'lov provayderi chaqiradi (AllowAnonymous).
- `GET /app/version` — mobil ilova uchun (majburiy yangilash tekshiruvi).
- `GET /lessons` — UI o'rniga `/roadmap/{level}` ishlatadi.

---

## API konvensiyalari (yangi integratsiya yozishda MAJBURIY)

Backend'da `JsonStringEnumConverter` yo'q:
- Request **body**'da enum har doim RAQAM (`itemType: 0`, `provider: 2`).
- **Query/route**'da enum NOM (`?level=N5`, `/league/Bronze`).
- Response'da aralash: `level`/`tier`/`section`/`language` raqam; `role`/`mastery`/`status` matn.
- `JlptLevel` teskari: N5=5 … N1=1.
- Xato formati ikki xil: controller'dan `{message}`, middleware'dan `{success:false, message, errors}`.
- Mock test topshirishda `{id}` = **attemptId** (testId EMAS).
- Bu qoidalar `src/api/enums.js`da kodlangan (`toEnumInt`, `jlptName`, `sectionLabel`) — yangi kodda shulardan foydalanish.
- To'liq hujjat: `D:\JapaneseMobileApp_BACKEND\API_REFERENCE_FULL.md` (§2.2, §21).
