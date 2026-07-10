import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <span className="brand-mark">T</span>
          TaskFlow
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn">Log in</Link>
          <Link to="/register" className="btn btn-primary">Sign up</Link>
        </div>
      </header>

      <main className="landing-hero">
        <div className="landing-hero-text">
          <h1>Organize your work, one board at a time.</h1>
          <p>
            TaskFlow is a simple, Trello-style board for your tasks. Create
            boards, drag cards between columns, set due dates, and keep
            everything in one place - free, and yours.
          </p>
          <div className="landing-cta-row">
            <Link to="/register" className="btn btn-primary landing-cta">
              Get started - it's free
            </Link>
            <Link to="/login" className="btn">I already have an account</Link>
          </div>
        </div>

        {/* A small fake preview of what a real board looks like, built
            from the same column/task-card styles used in the real app -
            so what you see here is exactly what you'll get. */}
        <div className="landing-preview" aria-hidden="true">
          <div className="column landing-preview-col">
            <div className="column-header">
              <div className="column-title">To do<span className="column-count">2</span></div>
            </div>
            <div className="column-body">
              <div className="task-card"><div className="task-card-row"><span>Design homepage</span></div></div>
              <div className="task-card"><div className="task-card-row"><span>Write project brief</span></div></div>
            </div>
          </div>
          <div className="column landing-preview-col">
            <div className="column-header">
              <div className="column-title">In progress<span className="column-count">1</span></div>
            </div>
            <div className="column-body">
              <div className="task-card"><div className="task-card-row"><span>Build landing page</span></div><span className="due-badge">Jul 12</span></div>
            </div>
          </div>
          <div className="column landing-preview-col">
            <div className="column-header">
              <div className="column-title">Done<span className="column-count">1</span></div>
            </div>
            <div className="column-body">
              <div className="task-card"><div className="task-card-row"><span>Set up project</span></div></div>
            </div>
          </div>
        </div>
      </main>

      <section className="landing-features">
        <div className="landing-feature">
          <div className="landing-feature-icon">🗂️</div>
          <h3>Boards & columns</h3>
          <p>Create as many boards as you need, each with your own custom columns.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">✋</div>
          <h3>Drag and drop</h3>
          <p>Move tasks between columns instantly, just by dragging the card.</p>
        </div>
        <div className="landing-feature">
          <div className="landing-feature-icon">🌙</div>
          <h3>Light & dark mode</h3>
          <p>Switch themes anytime with one click - it remembers your choice.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Built by n4tly-darkgonet</span>
      </footer>
    </div>
  );
}