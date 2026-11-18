import { useEffect, useState } from "react";
import {
  CRITERION_LABELS,
  DEFAULT_WEIGHTS,
  scoreOffers,
  type CriterionKey,
  type Offer,
  type VisaSupport,
  type Weights,
} from "../utils/offerCompare";

const STORAGE_KEY = "kiwihire.offers";

type Saved = { offers: Offer[]; weights: Weights };

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Saved;
      if (Array.isArray(parsed.offers) && parsed.weights) {
        return parsed;
      }
    }
  } catch {
    // Storage can be blocked or hold something unexpected: start fresh.
  }
  return { offers: [], weights: DEFAULT_WEIGHTS };
}

function newOffer(): Offer {
  return {
    id: String(Date.now() + Math.random()),
    name: "",
    salary: null,
    commute: null,
    growth: null,
    balance: null,
    visa: "unsure",
  };
}

function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export default function OffersPage() {
  const [{ offers, weights }, setState] = useState<Saved>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ offers, weights }),
      );
    } catch {
      // Saving is a convenience only.
    }
  }, [offers, weights]);

  function updateOffer(id: string, change: Partial<Offer>) {
    setState((current) => ({
      ...current,
      offers: current.offers.map((offer) =>
        offer.id === id ? { ...offer, ...change } : offer,
      ),
    }));
  }

  const scores = scoreOffers(offers, weights);

  return (
    <section className="page">
      <p className="eyebrow">Offers</p>
      <h1>Compare offers</h1>
      <p className="muted">
        Set how much each thing matters to you, then enter each offer. A blank
        figure is skipped, not counted as zero. The score only orders the
        offers by your own priorities and does not say which one is right.
        Offers are saved in this browser only.
      </p>

      <div className="panel">
        <div className="panel-inner">
          <h2>What matters to you (0 turns it off, 5 is most important)</h2>
          {(Object.keys(CRITERION_LABELS) as CriterionKey[]).map((key) => (
            <div className="field" key={key}>
              <label htmlFor={`weight-${key}`}>{CRITERION_LABELS[key]}</label>
              <input
                id={`weight-${key}`}
                type="number"
                min={0}
                max={5}
                value={weights[key]}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    weights: {
                      ...current.weights,
                      [key]: Math.min(5, Math.max(0, Number(event.target.value) || 0)),
                    },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {scores.map(({ offer, overall, parts }) => (
        <div className="panel" key={offer.id}>
          <div className="panel-inner">
            <div className="field">
              <label htmlFor={`name-${offer.id}`}>Company and role</label>
              <input
                id={`name-${offer.id}`}
                value={offer.name}
                onChange={(event) => updateOffer(offer.id, { name: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor={`salary-${offer.id}`}>Annual salary (NZD)</label>
              <input
                id={`salary-${offer.id}`}
                type="number"
                min={0}
                value={offer.salary ?? ""}
                onChange={(event) =>
                  updateOffer(offer.id, { salary: numberOrNull(event.target.value) })
                }
              />
            </div>
            <div className="field">
              <label htmlFor={`commute-${offer.id}`}>Commute, minutes each way (0 if remote)</label>
              <input
                id={`commute-${offer.id}`}
                type="number"
                min={0}
                value={offer.commute ?? ""}
                onChange={(event) =>
                  updateOffer(offer.id, { commute: numberOrNull(event.target.value) })
                }
              />
            </div>
            <div className="field">
              <label htmlFor={`growth-${offer.id}`}>Growth and learning (1 to 5)</label>
              <input
                id={`growth-${offer.id}`}
                type="number"
                min={1}
                max={5}
                value={offer.growth ?? ""}
                onChange={(event) =>
                  updateOffer(offer.id, { growth: numberOrNull(event.target.value) })
                }
              />
            </div>
            <div className="field">
              <label htmlFor={`balance-${offer.id}`}>Work life balance (1 to 5)</label>
              <input
                id={`balance-${offer.id}`}
                type="number"
                min={1}
                max={5}
                value={offer.balance ?? ""}
                onChange={(event) =>
                  updateOffer(offer.id, { balance: numberOrNull(event.target.value) })
                }
              />
            </div>
            <div className="field">
              <label htmlFor={`visa-${offer.id}`}>Visa support</label>
              <select
                id={`visa-${offer.id}`}
                value={offer.visa}
                onChange={(event) =>
                  updateOffer(offer.id, { visa: event.target.value as VisaSupport })
                }
              >
                <option value="unsure">Not sure</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <p>
              <strong>
                {overall === null ? "Not enough to score" : `${overall} / 100`}
              </strong>
              {Object.keys(parts).length > 0 && (
                <small className="muted">
                  {" "}
                  (
                  {(Object.keys(parts) as CriterionKey[])
                    .map((key) => `${CRITERION_LABELS[key]} ${Math.round(parts[key] as number)}`)
                    .join(", ")}
                  )
                </small>
              )}
            </p>
            <button
              className="button compact"
              type="button"
              onClick={() =>
                setState((current) => ({
                  ...current,
                  offers: current.offers.filter((item) => item.id !== offer.id),
                }))
              }
            >
              Remove offer
            </button>
          </div>
        </div>
      ))}

      <button
        className="button"
        type="button"
        onClick={() =>
          setState((current) => ({ ...current, offers: [...current.offers, newOffer()] }))
        }
      >
        Add an offer
      </button>
    </section>
  );
}
