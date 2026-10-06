import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '12px',
      }}
    >
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 600,
          color: 'var(--foreground-dim)',
          letterSpacing: '0.05em',
        }}
      >
        404
      </h1>
      <p style={{ color: 'var(--foreground-muted)' }}>
        你要找的页面不存在,或已被收容。
      </p>
      <Link
        to="/"
        style={{ color: 'var(--gold, var(--primary))', textDecoration: 'none' }}
      >
        返回首页
      </Link>
    </div>
  );
};

export default NotFound;
