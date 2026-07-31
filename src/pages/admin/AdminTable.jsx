import { useState, useMemo } from 'react';
import { Loader, Plus, Trash2, Pencil, Search, Database } from 'lucide-react';
import ErrorState from '../../components/ErrorState';
import PageHeader from '../../components/PageHeader';

export default function AdminTable({
  title,
  columns,
  data,
  loading,
  error,
  onRetry,
  onDelete,
  onCreate,
  onEdit,
  idKey = 'id',
  backLink = '/admin',
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!data || !search.trim()) return data || [];
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  if (loading) {
    return (
      <div style={styles.center}>
        <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--secondary)' }} />
        <p style={styles.loadingText}>Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  return (
    <div className="page">
      <PageHeader
        icon={Database}
        title={title}
        subtitle={`${data?.length || 0} ta yozuv`}
        accent="blue"
        back={backLink}
        right={onCreate && (
          <button className="page-head__back" style={styles.createBtn} onClick={onCreate}>
            <Plus size={16} />
            <span>Yangi qo'shish</span>
          </button>
        )}
      />

      <div style={styles.searchWrap}>
        <Search size={16} style={{ color: 'var(--text-light)' }} />
        <input
          style={styles.searchInput}
          placeholder="Qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>
            {search ? "Hech narsa topilmadi" : "Ma'lumot yo'q"}
          </p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.key} style={styles.th}>{col.label}</th>
                ))}
                {(onEdit || onDelete) && <th style={{ ...styles.th, width: onEdit && onDelete ? 80 : 60 }}></th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={row[idKey] || idx} style={styles.tr}>
                  {columns.map(col => (
                    <td key={col.key} style={styles.td}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {onEdit && (
                          <button
                            style={styles.editBtn}
                            className="press"
                            onClick={() => onEdit(row)}
                            title="Tahrirlash"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            style={styles.deleteBtn}
                            className="press"
                            onClick={() => onDelete(row[idKey])}
                            title="O'chirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    border: '2px solid var(--border)',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  count: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-light)',
    background: 'var(--bg)',
    padding: '3px 8px',
    borderRadius: 10,
  },
  createBtn: {
    width: 'auto',
    padding: '0 16px',
    gap: 6,
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 10,
    border: '2px solid var(--border)',
    background: 'var(--bg-card, white)',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    color: 'var(--text)',
  },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: 12,
    border: '2px solid var(--border)',
    background: 'var(--bg-card, white)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border-light)',
    background: 'var(--bg)',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid var(--border-light)',
  },
  td: {
    padding: '10px 12px',
    color: 'var(--text)',
    verticalAlign: 'middle',
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 6,
    background: 'var(--secondary-soft)',
    color: 'var(--secondary)',
    border: 'none',
    cursor: 'pointer',
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 6,
    background: 'rgba(239,68,68,0.08)',
    color: 'var(--danger)',
    border: 'none',
    cursor: 'pointer',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: 'var(--text-light)',
  },
  empty: {
    textAlign: 'center',
    padding: 48,
    background: 'var(--bg-card, white)',
    borderRadius: 12,
    border: '2px solid var(--border)',
  },
  emptyText: {
    fontSize: 14,
    color: 'var(--text-light)',
  },
};
