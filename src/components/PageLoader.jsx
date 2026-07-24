// Fallback shown while a lazily-loaded route chunk is fetched.
export default function PageLoader() {
  return (
    <div style={styles.wrap}>
      <div className="anim-spin" style={styles.spinner} />
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 34,
    height: 34,
    border: '4px solid var(--border)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
  },
};
