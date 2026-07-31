import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKanjiById } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import { Bookmark, PenTool, Loader, PlayCircle, BookMarked } from 'lucide-react';
import KanjiStrokeAnimation from '../../components/KanjiStrokeAnimation';
import { toggleSavedItem } from '../../api/profile';
import PageHeader from '../../components/PageHeader';

export default function KanjiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kanji, setKanji] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getKanjiById(id)
      .then(k => {
        if (!k) { setError('Kanji topilmadi'); return; }
        // KanjiDto (§8.1): meanings/meaningsUz/onyomi/kunyomi — arraylar
        setKanji({
          id: k.id,
          character: k.character,
          meaningUz: (k.meaningsUz || []).join(', '),
          meaning: (k.meanings || []).slice(0, 2).join(', '),
          onyomi: (k.onyomi || []).join('、') || '—',
          kunyomi: (k.kunyomi || []).join('、') || '—',
          strokeCount: k.strokeCount,
          jlptLevel: k.level,
          strokeOrderUrl: k.strokeOrderUrl,
          examples: k.examples || [],
        });
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      await toggleSavedItem(id, 'Kanji');
      setSaved(!saved);
    } catch { /* toast talab qilinmaydi */ }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!kanji) return null;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader
        icon={BookMarked}
        title="Kanji tafsiloti"
        subtitle={kanji.jlptLevel}
        accent="blue"
        size="sm"
        back
      />

      <div style={styles.kanjiBox}>
        <div style={styles.kanjiChar} className="jp">{kanji.character}</div>
        <div style={styles.strokeBadge}>{kanji.strokeCount} chiziq</div>
      </div>

      <div style={styles.meaningRow}>
        <div style={styles.meaningBadge}>{kanji.meaningUz || kanji.meaning}</div>
        <button style={styles.saveBtn} onClick={handleSave}>
          <Bookmark size={18} fill={saved ? 'var(--primary)' : 'none'} color="var(--primary)" />
        </button>
      </div>

      <div style={styles.readingsGrid}>
        <div style={styles.readingCard}>
          <div style={{ ...styles.readingType, color: 'var(--secondary)' }}>ON'YOMI</div>
          <div style={styles.readingKana} className="jp">{kanji.onyomi}</div>
        </div>
        <div style={styles.readingCard}>
          <div style={{ ...styles.readingType, color: 'var(--primary)' }}>KUN'YOMI</div>
          <div style={styles.readingKana} className="jp">{kanji.kunyomi}</div>
        </div>
      </div>

      {kanji.examples?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Misollar</div>
          {kanji.examples.map((ex, i) => (
            <div key={i} style={styles.exRow}>
              <span style={styles.exWord} className="jp">{ex.word}</span>
              <span style={styles.exReading}>{ex.reading}</span>
              <span style={styles.exMeaning}>{ex.meaning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stroke Animation Section */}
      <div style={styles.strokeSection}>
        <div style={styles.sectionTitle}>Chiziq animatsiyasi</div>
        <KanjiStrokeAnimation
          character={kanji.character}
          strokeCount={kanji.strokeCount}
          strokeOrderUrl={kanji.strokeOrderUrl}
          size={160}
          autoPlay={false}
        />
        <button style={styles.strokeLink} onClick={() => navigate(`/kanji-stroke/${id}`)}>
          <PlayCircle size={16} /> Yozish mashqi
        </button>
      </div>

      <button style={styles.ctaBtn} onClick={() => navigate(`/kanji-writing/${id}`)}>
        <PenTool size={18} /> Yozishni mashq qilish
      </button>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 500, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: { background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  levelBadge: { padding: '4px 10px', borderRadius: 12, background: 'rgba(76,175,80,0.1)', color: 'var(--success)', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 },
  kanjiBox: { alignSelf: 'center', width: 120, height: 120, background: 'var(--bg-card)', border: '2px solid var(--border-light)', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 'var(--shadow-lg)' },
  kanjiChar: { fontSize: 72, fontWeight: 900, color: 'var(--text)' },
  strokeBadge: { position: 'absolute', bottom: 8, right: 8, background: 'rgba(88,204,2,0.1)', borderRadius: 8, padding: '2px 8px', fontSize: 9, color: 'var(--primary)', fontWeight: 700 },
  meaningRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  meaningBadge: { padding: '6px 20px', borderRadius: 14, background: 'rgba(88,204,2,0.08)', color: 'var(--primary)', fontSize: 16, fontWeight: 700 },
  saveBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4 },
  readingsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  readingCard: { background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 14, padding: 12 },
  readingType: { fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 6 },
  readingKana: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  section: { background: 'var(--bg-card)', borderRadius: 14, padding: 14, border: '2px solid var(--border)' },
  sectionTitle: { fontSize: 10, fontWeight: 800, letterSpacing: 1, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: 8 },
  exRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--bg)', borderRadius: 10, marginBottom: 5 },
  exWord: { fontSize: 16, fontWeight: 700, minWidth: 50 },
  exReading: { fontSize: 12, color: 'var(--primary)', flex: 1 },
  exMeaning: { fontSize: 11, color: 'var(--text-light)' },
  strokeSection: { background: 'var(--bg-card)', borderRadius: 14, padding: 16, border: '2px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  strokeLink: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1.5px solid var(--primary)', background: 'rgba(88,204,2,0.05)', color: 'var(--primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  ctaBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 14, background: 'var(--primary)', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(88,204,2,0.3)' },
};
