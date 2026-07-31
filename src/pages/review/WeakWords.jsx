import { useState, useEffect, useCallback } from 'react';
import { getWeakWords } from '../../api/review';
import { getVocabularyById, getKanjiById } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import { AlertTriangle, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function WeakWords() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §12.3 — WeakWordDto: { itemId, itemType, correctCount, wrongCount, accuracyPercent, mastery }
    // So'z matni yo'q — element tafsilotini alohida olamiz.
    getWeakWords(20)
      .then(async (data) => {
        const enriched = await Promise.all((data || []).map(async (w) => {
          const base = {
            id: w.itemId,
            accuracy: w.accuracyPercent ?? 0,
            reviewCount: (w.correctCount || 0) + (w.wrongCount || 0),
            word: '', reading: '', meaningUz: '',
          };
          try {
            if (w.itemType === 'Kanji') {
              const k = await getKanjiById(w.itemId);
              return { ...base, word: k.character, reading: (k.kunyomi || []).join('、'),
                meaningUz: (k.meaningsUz?.length ? k.meaningsUz : k.meanings || []).slice(0, 2).join(', ') };
            }
            const v = await getVocabularyById(w.itemId);
            return { ...base, word: v.word, reading: v.reading,
              meaningUz: (v.meaningsUz?.length ? v.meaningsUz : v.meanings || []).join(', ') };
          } catch {
            return null;
          }
        }));
        setWords(enriched.filter(Boolean));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader icon={AlertTriangle} title="Zaif so'zlarim" subtitle="Ko'p xato qilingan so'zlar — takrorlash tavsiya etiladi" accent="orange" />

      <div style={styles.list}>
        {words.map(word => (
          <div key={word.id} style={styles.card}>
            <div style={styles.cardLeft}>
              <div style={styles.wordJp} className="jp">{word.word}</div>
              <div style={styles.wordReading}>{word.reading}</div>
              <div style={styles.wordMeaning}>{word.meaningUz}</div>
            </div>
            <div style={styles.cardRight}>
              <div style={{ ...styles.accuracy, color: word.accuracy < 40 ? 'var(--danger)' : 'var(--accent)' }}>
                {word.accuracy}%
              </div>
              <div style={styles.accuracyLabel}>aniqlik</div>
              <div style={styles.reviewCount}>{word.reviewCount}x takrorlangan</div>
            </div>
          </div>
        ))}
      </div>

      {words.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Zaif so'z yo'q!</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)' }}>Barcha so'zlarni yaxshi bilasiz</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  sub: { fontSize: 14, color: 'var(--text-light)', marginTop: -8 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', borderLeft: '3px solid var(--accent)' },
  cardLeft: {},
  wordJp: { fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  wordReading: { fontSize: 12, color: 'var(--text-light)' },
  wordMeaning: { fontSize: 13, fontWeight: 500, color: 'var(--primary)', marginTop: 2 },
  cardRight: { textAlign: 'right' },
  accuracy: { fontSize: 20, fontWeight: 700 },
  accuracyLabel: { fontSize: 10, color: 'var(--text-light)' },
  reviewCount: { fontSize: 11, color: 'var(--text-light)', marginTop: 4 },
  empty: { textAlign: 'center', padding: 40 },
};
