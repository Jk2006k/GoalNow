function normalizeConfidence(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

function buildRuleSummary(frameAnalyses) {
  let consecutiveNoFaceStreak = 0;
  let currentNoFaceStreak = 0;
  let maxFacesDetected = 1;
  let highConfidenceMultipleFacesCount = 0;

  for (const frame of frameAnalyses) {
    const facesDetected = Number.isFinite(frame.facesDetected) ? frame.facesDetected : 1;
    const confidence = normalizeConfidence(frame.confidence);

    maxFacesDetected = Math.max(maxFacesDetected, facesDetected);

    if (facesDetected === 0) {
      currentNoFaceStreak += 1;
      consecutiveNoFaceStreak = Math.max(consecutiveNoFaceStreak, currentNoFaceStreak);
    } else {
      currentNoFaceStreak = 0;
    }

    if (facesDetected >= 2 && confidence >= 0.75) {
      highConfidenceMultipleFacesCount += 1;
    }
  }

  return {
    consecutiveNoFaceStreak,
    maxFacesDetected,
    highConfidenceMultipleFacesCount,
  };
}

function applyStrictMalpracticeRules(frameAnalyses) {
  const alerts = [];

  for (const frame of frameAnalyses) {
    const confidence = normalizeConfidence(frame.confidence);
    const facesDetected = Number.isFinite(frame.facesDetected) ? frame.facesDetected : 1;

    if (frame.isMalpractice) {
      alerts.push({
        type: 'ai-malpractice',
        severity: confidence >= 0.8 ? 'high' : 'medium',
        reason: frame.reason || 'AI flagged potential malpractice',
        confidence,
        capturedAt: frame.capturedAt,
        screenshotId: frame.screenshotId || null,
      });
    }

    if (facesDetected >= 2 && confidence >= 0.75) {
      alerts.push({
        type: 'multiple-people',
        severity: 'high',
        reason: `Multiple people detected (count: ${facesDetected}, confidence: ${confidence.toFixed(2)})`,
        confidence,
        capturedAt: frame.capturedAt,
        screenshotId: frame.screenshotId || null,
      });
    }
  }

  const summary = buildRuleSummary(frameAnalyses);

  if (summary.consecutiveNoFaceStreak >= 3) {
    const streakFrames = frameAnalyses
      .filter((f) => (Number.isFinite(f.facesDetected) ? f.facesDetected : 1) === 0)
      .slice(0, summary.consecutiveNoFaceStreak);

    alerts.push({
      type: 'no-face-streak',
      severity: 'high',
      reason: `No face detected for ${summary.consecutiveNoFaceStreak} consecutive screenshots`,
      confidence: 0.85,
      capturedAt: streakFrames[0]?.capturedAt || new Date(),
      screenshotId: streakFrames[0]?.screenshotId || null,
    });
  }

  return {
    malpracticeDetected: alerts.length > 0,
    alerts,
    ruleSummary: summary,
  };
}

module.exports = {
  applyStrictMalpracticeRules,
};
