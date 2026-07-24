import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLessonCards } from '../../api/lessons';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { Pill } from '../../components/ui';
import PronunciationSession from './PronunciationSession';
import { Loader } from 'lucide-react';

export default function Pronunciation() {
  const navigate = useNavigate();
  const { id } = useParams(); // lessonId
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getLessonCards(id)
      .then(data => {
        const vocabCards = (data?.cards || [])
          .filter(c => (c.itemType || 'Vocabulary') === 'Vocabulary' && c.word)
          .slice(0, 5)
          .map(c => ({
            vocabularyId: c.itemId,
            jp: c.word,
            reading: c.reading || c.romaji || '',
            uz: Array.isArray(c.meaningsUz) ? c.meaningsUz.join(', ') : (c.meaningsUz || ''),
            audioUrl: c.audioUrl,
          }));
        setWords(vocabCards);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Loader size={26} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (words.length === 0) return <EmptyState title="So'z topilmadi" subtitle="Bu darsda talaffuz mashqi uchun so'zlar yo'q" />;

  return (
    <PronunciationSession
      words={words}
      badge={<Pill tone="green">PRO</Pill>}
      onExit={() => navigate(-1)}
    />
  );
}
