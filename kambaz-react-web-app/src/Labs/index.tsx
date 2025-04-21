import { Route, Routes, Navigate } from "react-router";
import TOC from "./TOC";
import Lab1 from "./Lab1";
import Lab2 from "./Lab2";
import Lab3 from "./Lab3";
import Lab4 from "./Lab4";
import Lab5 from "./Lab5";
import store from "./store";
import { Provider } from "react-redux";
export default function Labs() {
  return (
    <Provider store={store}>
      <div style={{
        maxWidth: 900,
        margin: '40px auto',
        padding: 32,
        background: 'linear-gradient(135deg, #f0f4f8 60%, #e0e7ff 100%)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
      }}>
        <header style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <img src="/images/NEU.png" alt="Northeastern Logo" style={{ width: 60, marginRight: 24, borderRadius: 12, boxShadow: '0 2px 8px #8882' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 36, color: '#3b3b3b', fontWeight: 700, letterSpacing: 1 }}>CS5610 Labs Portal</h1>
            <p style={{ margin: 0, color: '#6366f1', fontWeight: 500 }}>
              Author: Vaishali Singh &nbsp;|&nbsp; CS 5610 Spring 2025 &nbsp;|&nbsp; CRN 35649
            </p>
          </div>
        </header>
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ color: '#6366f1', fontWeight: 600, fontSize: 24 }}>Welcome!</h2>
          <p style={{ color: '#374151', fontSize: 18 }}>
            Explore interactive labs covering modern web development concepts. Select a lab from the sidebar to get started!
          </p>
        </section>
        <div style={{ display: 'flex', gap: 32 }}>
          <aside style={{ minWidth: 180 }}>
            <TOC />
          </aside>
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="Lab1" />} />
              <Route path="Lab1/*" element={<Lab1 />} />
              <Route path="Lab2/*" element={<Lab2 />} />
              <Route path="Lab3/*" element={<Lab3 />} />
              <Route path="Lab4/*" element={<Lab4 />} />
              <Route path="Lab5/*" element={<Lab5 />} />
            </Routes>
          </main>
        </div>
      </div>
    </Provider>
  );
}
