import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getEpisode, updateProgress } from '../../api/podcasts';
import ErrorState from '../../components/ErrorState';
import { Play, Pause, SkipBack, SkipForward, Loader, Eye, EyeOff, Headphones } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

export default function EpisodePlayer() {
  const { id } = useParams();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showUz, setShowUz] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    getEpisode(id)
      .then(setEpisode)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (currentTime > 0 && episode) {
        updateProgress(id, Math.floor(currentTime), currentTime >= duration * 0.9).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(iv);
  }, [id, currentTime, duration, episode]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) { setPlaying(!playing); return; }
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    // play() Promise qaytaradi — audio yuklanmasa rad etiladi (ushlanmagan xatoni oldini olamiz)
    const p = audio.play();
    if (p && typeof p.then === 'function') {
      p.then(() => setPlaying(true))
       .catch(() => { setPlaying(false); setAudioError(true); });
    } else {
      setPlaying(true);
    }
  };

  const seek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = pct * (duration || episode?.durationSeconds || 0);
    setCurrent(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const skip = (secs) => {
    const t = Math.max(0, Math.min(duration, currentTime + secs));
    setCurrent(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const changeSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(speed);
    const next = speeds[(idx + 1) % speeds.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!episode) return null;

  const totalDur = duration || episode.durationSeconds || 0;
  const pct = totalDur > 0 ? (currentTime / totalDur) * 100 : 0;

  return (
    <div style={S.page} className="stagger">
      <PageHeader
        icon={Headphones}
        title={episode.titleUz || episode.title}
        accent="blue"
        size="sm"
        back
      />

      <div style={S.playerCard} className="anim-fade-up">

        {episode.audioUrl && (
          <audio ref={audioRef} src={episode.audioUrl} preload="metadata"
            onTimeUpdate={e => setCurrent(e.target.currentTime)}
            onLoadedMetadata={e => { setDuration(e.target.duration); setAudioError(false); }}
            onError={() => { setAudioError(true); setPlaying(false); }}
            onEnded={() => { setPlaying(false); updateProgress(id, Math.floor(duration), true).catch(() => {}); }} />
        )}

        <div style={S.progressWrap} ref={progressRef} onClick={seek}>
          <div style={S.progressBg}>
            <div style={{ ...S.progressFill, width: pct + '%' }} />
          </div>
          <div style={S.timeRow}>
            <span style={S.timeText}>{fmtTime(currentTime)}</span>
            <span style={S.timeText}>{fmtTime(totalDur)}</span>
          </div>
        </div>

        <div style={S.controls}>
          <button style={{ ...S.ctrlBtn, ...(audioError ? S.disabled : {}) }} onClick={() => skip(-10)} className="press" disabled={audioError}><SkipBack size={20} /></button>
          <button style={{ ...S.playBtn, ...(audioError ? S.disabled : {}) }} onClick={togglePlay} className="press" disabled={audioError}>
            {playing ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 2 }} />}
          </button>
          <button style={{ ...S.ctrlBtn, ...(audioError ? S.disabled : {}) }} onClick={() => skip(10)} className="press" disabled={audioError}><SkipForward size={20} /></button>
          <button style={{ ...S.speedBtn, ...(audioError ? S.disabled : {}) }} onClick={changeSpeed} className="press" disabled={audioError}>{speed}x</button>
        </div>

        {audioError && (
          <div style={S.audioErrorBox}>
            Audio hozircha mavjud emas. Transkript orqali o'qib o'rganishingiz mumkin.
          </div>
        )}
        {!episode.audioUrl && (
          <div style={S.audioErrorBox}>
            Bu epizod uchun audio hali yuklanmagan.
          </div>
        )}
      </div>

      {(episode.transcript || episode.transcriptUz) && (
        <div className="anim-fade-up">
          <div style={S.transcriptHeader}>
            <h3 style={S.sectionTitle}>Transkript</h3>
            <div style={S.transcriptToggles}>
              {episode.transcriptUz && (
                <button style={{ ...S.togBtn, ...(showUz ? S.togActive : {}) }} onClick={() => setShowUz(!showUz)} className="press">
                  {showUz ? 'Yapon' : "O'zbek"}
                </button>
              )}
              <button style={S.togBtn} onClick={() => setShowTranscript(!showTranscript)} className="press">
                {showTranscript ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {showTranscript && (
            <div style={S.transcriptBox}>
              <p style={S.transcriptText} className={showUz ? '' : 'jp'}>
                {showUz ? episode.transcriptUz : episode.transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560, margin: '0 auto' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, alignSelf: 'flex-start' },
  playerCard: { background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  epTitle: { fontSize: 18, fontWeight: 700, color: 'var(--text)', textAlign: 'center' },
  progressWrap: { width: '100%', cursor: 'pointer' },
  progressBg: { width: '100%', height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, var(--primary), var(--warning))', transition: 'width 0.3s' },
  timeRow: { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  timeText: { fontSize: 11, color: 'var(--text-light)', fontVariantNumeric: 'tabular-nums' },
  controls: { display: 'flex', alignItems: 'center', gap: 12 },
  ctrlBtn: { width: 40, height: 40, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  playBtn: { width: 56, height: 56, borderRadius: 16, border: 'none', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(88,204,2,0.3)' },
  speedBtn: { padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  disabled: { opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none' },
  audioErrorBox: { marginTop: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(245,181,10,0.12)', color: 'var(--accent-dark)', fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.5 },
  transcriptHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: 'var(--text)' },
  transcriptToggles: { display: 'flex', gap: 6 },
  togBtn: { padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-light)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
  togActive: { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },
  transcriptBox: { background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 14, padding: 16 },
  transcriptText: { fontSize: 14, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' },
};
