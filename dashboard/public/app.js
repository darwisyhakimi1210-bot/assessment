/**
 * dashboard/public/app.js
 *
 * React app that:
 *   - Lists the 3 GSC test scenarios
 *   - Has a "Run" button per test (and "Run All")
 *   - Subscribes to SSE updates for live status & output
 *
 * No build step required — uses React + Babel from CDN.
 */
const { useState, useEffect, useRef } = React;

function App() {
  const [tests, setTests] = useState([]);
  const [outputs, setOutputs] = useState({});

  // Initial fetch
  useEffect(() => {
    fetch('/api/tests').then((r) => r.json()).then(setTests);
  }, []);

  // Subscribe to SSE for live updates
  useEffect(() => {
    const es = new EventSource('/api/events');
    es.addEventListener('update', (e) => {
      const data = JSON.parse(e.data);
      setTests((prev) =>
        prev.map((t) =>
          t.id === data.id
            ? { ...t, status: data.status, lastRun: data.lastRun ?? t.lastRun, duration: data.duration ?? t.duration }
            : t,
        ),
      );
    });
    es.addEventListener('output', (e) => {
      const data = JSON.parse(e.data);
      setOutputs((prev) => ({
        ...prev,
        [data.id]: (prev[data.id] || '') + data.text,
      }));
    });
    return () => es.close();
  }, []);

  const runTest = (id) => {
    setOutputs((prev) => ({ ...prev, [id]: '' }));
    fetch(`/api/run/${id}`, { method: 'POST' }).catch(() => undefined);
  };

  const runAll = () => {
    setOutputs({});
    fetch('/api/run-all', { method: 'POST' }).catch(() => undefined);
  };

  const summary = {
    total: tests.length,
    passed: tests.filter((t) => t.status === 'passed').length,
    failed: tests.filter((t) => t.status === 'failed').length,
    running: tests.filter((t) => t.status === 'running').length,
  };

  return (
    <div className="container">
      <header>
        <h1>🎬 GSC Test Dashboard</h1>
        <span className="badge">v1.0</span>
      </header>

      <div className="summary">
        <div className="stat">
          <div className="num">{summary.total}</div>
          <div className="label">Total Tests</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: 'var(--success)' }}>{summary.passed}</div>
          <div className="label">Passed</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: 'var(--error)' }}>{summary.failed}</div>
          <div className="label">Failed</div>
        </div>
        <div className="stat">
          <div className="num" style={{ color: 'var(--running)' }}>{summary.running}</div>
          <div className="label">Running</div>
        </div>
      </div>

      <div className="toolbar">
        <button onClick={runAll}>▶ Run All Tests</button>
        <button
          className="secondary"
          onClick={() => window.open('https://www.gsc.com.my/', '_blank')}
        >
          🌐 Open GSC Site
        </button>
      </div>

      {tests.map((test) => (
        <TestCard
          key={test.id}
          test={test}
          output={outputs[test.id] || ''}
          onRun={() => runTest(test.id)}
        />
      ))}
    </div>
  );
}

function TestCard({ test, output, onRun }) {
  const isRunning = test.status === 'running';
  return (
    <div className="test-card">
      <div className="info">
        <h2>{test.title}</h2>
        <p>{test.description}</p>
        {test.lastRun && (
          <div className="meta">
            Last run: {new Date(test.lastRun).toLocaleTimeString()}
            {test.duration ? ` • ${(test.duration / 1000).toFixed(1)}s` : ''}
          </div>
        )}
        {output && (
          <pre className="output">{output}</pre>
        )}
      </div>
      <span className={`status ${test.status}`}>{test.status}</span>
      <button onClick={onRun} disabled={isRunning}>
        {isRunning ? '⏳ Running…' : '▶ Run'}
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);