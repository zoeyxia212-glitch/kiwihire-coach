export default function LoginPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Login</h1>
          <p className="muted">Continue working on your job search.</p>
        </div>
      </div>
      <form className="panel">
        <div className="panel-inner form-grid">
          <div className="field">
            <label>Email</label>
            <input placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Password" />
          </div>
          <button className="button primary" type="button">Login</button>
        </div>
      </form>
    </section>
  );
}
