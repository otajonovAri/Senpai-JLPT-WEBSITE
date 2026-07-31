export default function PushNotifPreview() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('uz', { weekday: 'long', day: 'numeric', month: 'long' });

  const notifs = [
    { app: 'SenpaiJLPT', title: "🔥 Streak xavfda!", body: "Bugun hali dars o'tmadingiz — 5 daqiqada streak yo'qoladi!", time: '2 daq oldin', highlight: true },
    { app: 'SenpaiJLPT', title: '📚 Yangi dars tayyor', body: "N5 Grammatika — て (te) form qo'shildi", time: '1 soat oldin', highlight: false },
    { app: 'SenpaiJLPT', title: "🧠 Takrorlash vaqti", body: "12 ta so'z SRS takrorlashni kutmoqda", time: '3 soat oldin', highlight: false },
  ];

  return (
    <div style={styles.screen}>
      <div style={styles.timeSection}>
        <div style={styles.clock}>{timeStr}</div>
        <div style={styles.date}>{dateStr}</div>
      </div>

      <div style={styles.notifList}>
        {notifs.map((n, i) => (
          <div key={i} style={{ ...styles.notif, ...(n.highlight ? styles.notifMain : {}) }}>
            <div style={styles.appIcon}>先</div>
            <div style={styles.notifBody}>
              <div style={styles.notifHead}>
                <span style={styles.appName}>{n.app}</span>
                <span style={styles.notifTime}>{n.time}</span>
              </div>
              <div style={styles.notifTitle}>{n.title}</div>
              <div style={styles.notifText}>{n.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.caption}>Push bildirishnomalar namunasi — Streak eslatma, yangi dars, SRS takrorlash</div>
    </div>
  );
}

const styles = {
  screen: { background: 'linear-gradient(180deg, var(--premium), var(--premium-dark))', borderRadius: 16, padding: 20, color: 'white' },
  timeSection: { textAlign: 'center', padding: '20px 0 10px' },
  clock: { fontSize: 48, fontWeight: 200, letterSpacing: 1 },
  date: { fontSize: 13, opacity: 0.6, marginTop: 2 },
  notifList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 },
  notif: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 14px', display: 'flex', gap: 10 },
  notifMain: { background: 'rgba(88,204,2,0.2)', borderColor: 'rgba(88,204,2,0.3)' },
  appIcon: { width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, var(--primary-light), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, flexShrink: 0 },
  notifBody: { flex: 1, minWidth: 0 },
  notifHead: { display: 'flex', justifyContent: 'space-between', marginBottom: 2 },
  appName: { fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 },
  notifTime: { fontSize: 10, opacity: 0.4 },
  notifTitle: { fontSize: 12, fontWeight: 700, marginBottom: 2 },
  notifText: { fontSize: 11, opacity: 0.65, lineHeight: 1.4 },
  caption: { textAlign: 'center', fontSize: 10, opacity: 0.3, marginTop: 14, lineHeight: 1.5 },
};
