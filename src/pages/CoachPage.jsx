
        <Card className="coach-compact-card coach-compact-recommendation">
          <div className="coach-decision-copy">
            <span className="coach-status-pill">● DIN LØBECOACH</span>
            <h2>{recommendationTitle}</h2>
            <p className="coach-small-copy">{recommendationCopy}</p>
            <div className="coach-compact-focus">
              <div className="coach-mini">
                <small>MIT FORSLAG</small>
                <strong>Tag ét roligt og overskueligt skridt ad gangen.</strong>
              </div>
            </div>
            <details className="coach-data-details">
              <summary>Se data bag vurderingen</summary>
              <div className="coach-data-details-content">
                <div className="coach-mini">
                  <small>DIN STATUS</small>
                  <strong>{readiness.legs} ben · {readiness.energy} energi · {readiness.sleep} søvn</strong>
                </div>
                <div className="coach-mini">
                  <small>FORMESTIMAT</small>
                  <strong>{Number.isFinite(inputs.coachVdot.estimate) ? `VDOT ${formatVdot(inputs.coachVdot.estimate)}` : "Ikke nok data endnu"}</strong>
                </div>
              </div>
            </details>
          </div>
          <div className="coach-decision-stack">
            <button
              type="button"
              className="primary coach-analyze-button"
              disabled={loading || !inputs.connected || inputs.activityCount === 0}
              onClick={() => requestAnalysis("overview")}
            >
              <Sparkles size={15} /> {loading ? "Jeg kigger på din træning…" : "Få personlig vejledning"}
            </button>
          </div>
        </Card>
