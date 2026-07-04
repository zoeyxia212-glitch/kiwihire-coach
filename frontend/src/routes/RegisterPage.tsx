export default function RegisterPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Start simple</p>
          <h1>Create an account</h1>
          <p className="muted">Save applications, resumes, and review history in one place.</p>
        </div>
      </div>
      <form className="panel">
        <div className="panel-inner form-grid">
          <div className="field">
            <label>Name</label>
            <input placeholder="Sally Xia" />
          </div>
          <div className="field">
            <label>Email</label>
            <input placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Password" />
          </div>
          <button className="button primary" type="button">Create account</button>
        </div>
      </form>
    </section>
  );
}
