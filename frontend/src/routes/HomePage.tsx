import { Link } from "react-router";
import heroCandidate from "../assets/kiwihire-hero-candidate.png";
import heroCandidatePasifika from "../assets/kiwihire-hero-candidate-pasifika.png";
import heroCandidateAsian from "../assets/kiwihire-hero-candidate-asian.png";
import heroCandidateBlack from "../assets/kiwihire-hero-candidate-black.png";

export default function HomePage() {
  return (
    <section className="public-home">
      <div className="public-hero">
        <div>
          <p className="eyebrow">A clearer path from job ad to interview</p>
          <h1>Turn every application into a focused plan.</h1>
          <p className="public-hero-copy">
            KiwiHire Coach helps job seekers compare a CV with a job
            description, collect strong evidence, prepare interview answers,
            and keep every application stage in one place.
          </p>
          <div className="public-actions">
            <Link className="button primary" to="/register">
              Create a free account
            </Link>
            <Link className="button" to="/login">
              Log in
            </Link>
          </div>
          <p className="muted">No paid AI service is required.</p>
        </div>
        <div className="career-animation" aria-label="Animated job preparation workflow">
          <div className="career-animation-glow" />
          <div className="floating-career-card card-cv">
            <i /> One evidence profile
          </div>
          <div className="floating-career-card card-application">
            <i /> Match before you apply
          </div>
          <div className="floating-career-card card-interview">
            <i /> Interview answers ready
          </div>
          <div className="floating-career-card card-tracker"><i /> Follow every stage</div>
          <div className="floating-career-card card-truth"><i /> Keep every claim truthful</div>
          <div className="floating-career-card card-focus"><i /> Focus on stronger roles</div>
          <img
            className="hero-candidate candidate-one"
            src={heroCandidate}
            alt="A diverse group of job seekers preparing for their next role"
          />
          <img className="hero-candidate candidate-two" src={heroCandidatePasifika} alt="" />
          <img className="hero-candidate candidate-three" src={heroCandidateAsian} alt="" />
          <img className="hero-candidate candidate-four" src={heroCandidateBlack} alt="" />
        </div>
      </div>

      <div className="public-feature-grid">
        <article><span>01</span><h2>Application tracker</h2><p>Track status, interviews, follow-ups, deadlines and notes.</p></article>
        <article><span>02</span><h2>CV and JD review</h2><p>Find matching skills, missing requirements and practical improvements.</p></article>
        <article><span>03</span><h2>Evidence Bank</h2><p>Reuse project achievements and STAR examples across different roles.</p></article>
        <article><span>04</span><h2>Interview preparation</h2><p>Generate likely questions and save answers as your preparation history.</p></article>
      </div>
    </section>
  );
}
