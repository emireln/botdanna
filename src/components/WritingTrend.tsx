// The last writing checks as bars, oldest first, so the learner sees whether the scores are going up.
import { useT } from '../lib/i18n/react';
import type { WritingRun } from '../lib/writingHistory';

/** How many checks the trend shows: the newest ones. */
const SHOWN = 6;

export function WritingTrend({ runs }: { runs: readonly WritingRun[] }) {
  const t = useT();
  if (runs.length === 0) return null;
  const shown = runs.slice(0, SHOWN).reverse();
  return (
    <section className="writing-trend" aria-labelledby="writing-trend-title">
      <div className="writing-trend__head">
        <h3 className="writing-trend__title" id="writing-trend-title">
          {t('Your writing scores')}
        </h3>
        <span className="writing-trend__note">{t('Scores out of 100, oldest first.')}</span>
      </div>
      <ol className="writing-trend__bars">
        {shown.map((run, index) => (
          <li key={`${run.at}-${index}`} className="writing-trend__item">
            <span className="writing-trend__value">{run.score}</span>
            <span className="writing-trend__bar" style={{ height: `${Math.max(8, run.score)}px` }} aria-hidden="true" />
          </li>
        ))}
      </ol>
    </section>
  );
}
