
        <Card className="coach-compact-card coach-compact-recommendation">
          <div className="coach-decision-copy">
            <span className="coach-status-pill">● COACHENS VURDERING</span>
            <h2>{recommendationTitle}</h2>
            <p className="coach-small-copy">{recommendationCopy}</p>
            <div className="coach-compact-focus">
              <div className="coach-mini"><small>NÆSTE SKRIDT</small><strong>Et roligt, gennemførligt pas</strong></div>
              <div className="coach-mini"><small>BELASTNING</small><strong>Byg gradvist op</strong></div>
              <div className="coach-mini"><small>PERFORMANCE</small><strong>Brug aktuelle VDOT-tempi</strong></div>
            </div>
          </div>
          <div className="coach-decision-stack">
            <div className="coach-mini"><small>STATUS</small><strong>{readiness.legs} ben · {readiness.energy} energi · {readiness.sleep} søvn</strong></div>
            <div className="coach-mini"><small>FORM</small><strong>{Number.isFinite(inputs.coachVdot.estimate) ? `VDOT ${formatVdot(inputs.coachVdot.estimate)}` : "Ikke nok data"}</strong></div>
            <button
              type="button"
              className="primary coach-analyze-button"
              disabled={loading || !inputs.connected || inputs.activityCount === 0}
              onClick={() => requestAnalysis("overview")}
            >
              <Sparkles size={15} /> {loading ? "Analyserer..." : "Analyser"}
            </button>
          </div>
        </Card>
