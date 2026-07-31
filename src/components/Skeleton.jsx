// 54-ekran: Loading / Skeleton (shimmer)
// <Skeleton height={20} width="60%" /> yoki <SkeletonCard /> / <SkeletonList count={4} />
export function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width, height, borderRadius: radius,
        background: 'linear-gradient(90deg, var(--border-light) 25%, var(--bg-alt) 50%, var(--border-light) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton width={44} height={44} radius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="35%" height={11} />
        </div>
      </div>
      <Skeleton height={12} style={{ marginTop: 14 }} />
      <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--bg-card)',
    borderRadius: 14,
    border: '1px solid var(--border-light)',
    padding: 16,
  },
};
