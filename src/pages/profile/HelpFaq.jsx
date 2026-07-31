import { useState, useEffect, useCallback } from 'react';
import { getFaq } from '../../api/profile';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, Mail, Loader } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

export default function HelpFaq() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    // §20 — toifa bo'yicha guruhlangan: [{ category, items: [{ id, question, questionUz, answer, answerUz }] }]
    getFaq()
      .then(data => {
        const flat = (data || []).flatMap(c =>
          (c.items || []).map(f => ({
            id: f.id,
            category: c.category,
            question: f.questionUz || f.question,
            answer: f.answerUz || f.answer,
          }))
        );
        setFaqs(flat);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={styles.page} className="stagger">
      <PageHeader icon={HelpCircle} title="Yordam va FAQ" subtitle="Ko'p beriladigan savollar va aloqa" accent="blue" />

      <div style={styles.contactRow}>
        <div style={styles.contactCard}>
          <MessageCircle size={20} color="var(--primary)" />
          <div style={styles.contactTitle}>Telegram</div>
          <div style={styles.contactDesc}>@ariCoder</div>
        </div>
        <div style={styles.contactCard}>
          <Mail size={20} color="var(--info)" />
          <div style={styles.contactTitle}>Email</div>
          <div style={styles.contactDesc}>aliseniornet@gmail.com</div>
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Ko'p beriladigan savollar</h2>

      {faqs.length === 0 && <EmptyState title="FAQ bo'sh" subtitle="Savollar hali qo'shilmagan" />}

      <div style={styles.faqList}>
        {faqs.map(faq => (
          <div key={faq.id} style={styles.faqItem} onClick={() => setOpenId(openId === faq.id ? null : faq.id)}>
            <div style={styles.faqHeader}>
              <span style={styles.faqQuestion}>{faq.question}</span>
              {openId === faq.id ? <ChevronUp size={18} color="var(--text-light)" /> : <ChevronDown size={18} color="var(--text-light)" />}
            </div>
            {openId === faq.id && (
              <div style={styles.faqAnswer}>{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  contactRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  contactCard: { textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 14, border: '2px solid var(--border)' },
  contactTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 6 },
  contactDesc: { fontSize: 12, color: 'var(--text-light)', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  faqList: { display: 'flex', flexDirection: 'column', gap: 6 },
  faqItem: { background: 'var(--bg-card)', borderRadius: 12, border: '2px solid var(--border)', overflow: 'hidden', cursor: 'pointer' },
  faqHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' },
  faqQuestion: { fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1, marginRight: 8 },
  faqAnswer: { padding: '0 16px 14px', fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5 },
};
