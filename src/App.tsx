import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { analyzeSerial, exampleSerials } from './lib/serialAnalysis'

function App() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const feedbackRef = useRef<HTMLElement | null>(null)

  const analysis = useMemo(() => {
    if (!submittedQuery) {
      return null
    }

    return analyzeSerial(submittedQuery)
  }, [submittedQuery])

  const primaryMatch = analysis?.primaryMatch ?? null
  const extraMatches = analysis?.matches.slice(1) ?? []

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedQuery = query.toUpperCase().replace(/\s+/g, '')
    if (!normalizedQuery) {
      return
    }

    setQuery(normalizedQuery)
    setSubmittedQuery(normalizedQuery)

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 40)
    })
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">browser-based serial checker</p>
        <h1>Fancy serial checker</h1>
        <p className="hero-copy">
          <span className="hero-copy-desktop">
            Paste a serial number, click Analyze, and get a clean read on whether it
            has any fancy properties.
          </span>
          <span className="hero-copy-mobile">
            Enter a serial number and run a quick fancy-serial check.
          </span>
        </p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="serial-input">
            Serial number
          </label>
          <input
            id="serial-input"
            value={query}
            onChange={(event) => setQuery(event.target.value.toUpperCase())}
            placeholder="A12345678B"
            spellCheck={false}
            autoCapitalize="characters"
            autoCorrect="off"
          />
          <button type="submit" disabled={!query.trim()}>
            Analyze
          </button>
        </form>

        <p className="helper-text">
          <span className="helper-text-desktop">
            Formats: <code>12345678</code> · <code>A12345678</code> ·{' '}
            <code>12345678B</code> · <code>A12345678B</code>
          </span>
          <span className="helper-text-mobile">
            Use 8 digits, with an optional letter before or after.
          </span>
        </p>

        <div className="example-row" aria-label="Example serial numbers">
          <span className="example-heading">
            <span className="example-heading-desktop">Examples:</span>
            <span className="example-heading-mobile">Try one:</span>
          </span>
          <div className="example-list">
            {exampleSerials.map((example) => (
              <button
                key={example.serial}
                type="button"
                className="example-link"
                onClick={() => setQuery(example.serial)}
                title={example.hint}
                aria-label={`${example.label}: ${example.serial}. ${example.hint}`}
              >
                <span className="example-link-desktop">{example.serial}</span>
                <span className="example-link-mobile">
                  <span className="example-link-label">{example.label}</span>
                  <span className="example-link-serial">{example.serial}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {analysis?.validationMessage && (
        <section ref={feedbackRef} className="feedback-card feedback-error" role="alert">
          <h2>Enter a supported serial format</h2>
          <p>{analysis.validationMessage}</p>
        </section>
      )}

      {analysis && !analysis.validationMessage && (
        <section ref={feedbackRef} className="feedback-card result-card">
          <div className="result-topline">
            <span className={`status-pill ${analysis.isFancy ? 'is-fancy' : 'is-plain'}`}>
              {analysis.isFancy ? 'Fancy serial' : 'No fancy match'}
            </span>
            <span className="result-meta">
              {analysis.digits} · {analysis.format}
            </span>
          </div>

          <h2>{primaryMatch?.title ?? 'Not fancy'}</h2>
          <p className="result-variation">
            {primaryMatch?.variation ?? 'No analyzer matched this serial.'}
          </p>
          <p className="result-explainer">
            {primaryMatch?.explanation ??
              `${analysis.digits} passes format validation, but none of the fancy serial analyzers flagged it.`}
          </p>

          <dl className="detail-grid">
            <div>
              <dt>Input</dt>
              <dd>{analysis.normalized}</dd>
            </div>
            <div>
              <dt>Digits</dt>
              <dd>{analysis.digits}</dd>
            </div>
            <div>
              <dt>Primary verdict</dt>
              <dd>{primaryMatch?.title ?? 'Not fancy'}</dd>
            </div>
          </dl>

          {extraMatches.length > 0 && (
            <div className="secondary-matches">
              <span>Also matched:</span>
              <div className="chip-row">
                {extraMatches.map((match) => (
                  <span key={`${match.analyzerName}-${match.variation}`} className="match-chip">
                    {match.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
