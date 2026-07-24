import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGrammarById } from '../../api/dictionary';
import ErrorState from '../../components/ErrorState';
import { ArrowLeft, BookOpen, Loader } from 'lucide-react';

export default function GrammarExplanation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grammar, setGrammar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getGrammarById(id)
      .then(setGrammar)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!grammar) return null;

  return (
    <div style={styles.page} className="stagger">
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>
        <h1 style={styles.title}>Grammatika</h1>
        <span style={styles.levelBadge}>{grammar.level}</span>
      </div>

      <div style={styles.mainCard}>
        <div style={styles.grammarTitle} className="jp">{grammar.title}</div>
        <p style={styles.explanation}>{grammar.explanation}</p>
        {grammar.structure && (
          <div style={styles.structureBox}>
            <div style={styles.structureLabel}>Tuzilishi:</div>
            <div style={styles.structure} className="jp">{grammar.structure}</div>
          </div>
        )}
      </div>

      {grammar.examples?.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}><BookOpen size={18} /> Misollar</h2>
          <div style={styles.examples}>
            {grammar.examples.map((ex, i) => (
              <div key={i} style={styles.exCard}>
                <div style={styles.exJp} className="jp">{ex.japanese}</div>
                {ex.reading && <div style={styles.exReading}>{ex.reading}</div>}
                <div style={styles.exUz}>{ex.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {grammar.notes?.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Eslatmalar</h2>
          <div style={styles.notes}>
            {grammar.notes.map((note, i) => (
              <div key={i} style={styles.noteItem}>
                <span style={styles.noteDot}>•</span> {note}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  title: { flex: 1, fontSize: 20, fontWeight: 700, color: 'var(--text)' },
  levelBadge: { padding: '4px 12px', borderRadius: 20, background: 'rgba(33,150,243,0.1)', color: '#1565C0', fontSize: 12, fontWeight: 700 },
  mainCard: { background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border-light)', textAlign: 'center' },
  grammarTitle: { fontSize: 36, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 },
  explanation: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 },
  structureBox: { background: 'var(--bg)', borderRadius: 12, padding: '12px 16px' },
  structureLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-light)', marginBottom: 4 },
  structure: { fontSize: 16, fontWeight: 600, color: 'var(--text)' },
  section: { background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border-light)' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  examples: { display: 'flex', flexDirection: 'column', gap: 10 },
  exCard: { padding: '14px 16px', background: 'var(--bg)', borderRadius: 12, borderLeft: '3px solid var(--primary)' },
  exJp: { fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 },
  exReading: { fontSize: 12, color: 'var(--text-light)', marginBottom: 4 },
  exUz: { fontSize: 14, fontWeight: 500, color: 'var(--primary)' },
  notes: { display: 'flex', flexDirection: 'column', gap: 8 },
  noteItem: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: 6 },
  noteDot: { color: 'var(--primary)', fontWeight: 700 },
};
