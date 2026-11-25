// Find in this chat: a search box above the thread. The message that holds the match the learner is on is marked and
// brought into view. The arrows, Enter and Shift+Enter move between the matches, and Escape closes the box.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { findMatches, stepMatch, type FindRow } from '../lib/chatFind';
import { useT } from '../lib/i18n/react';
import type { TutorRow } from '../lib/types';

const CURRENT = 'is-find-current';

function clearCurrent(): void {
  document.querySelectorAll(`.${CURRENT}`).forEach((element) => element.classList.remove(CURRENT));
}

export function ChatFind({ messages, onClose }: { messages: readonly TutorRow[]; onClose: () => void }) {
  const t = useT();
  const field = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState(-1);

  const rows = useMemo<FindRow[]>(() => messages.map((message) => ({ id: message.id, role: message.role, content: message.content })), [messages]);
  const matches = useMemo(() => findMatches(rows, query), [rows, query]);

  useEffect(() => {
    field.current?.focus();
    return clearCurrent;
  }, []);

  // A new search starts at its first match.
  useEffect(() => {
    setCurrent(matches.length > 0 ? 0 : -1);
  }, [matches]);

  // The message of the current match is marked, and scrolled into view.
  useEffect(() => {
    clearCurrent();
    const id = current >= 0 ? matches[current] : undefined;
    if (!id) return;
    const element = document.querySelector<HTMLElement>(`[data-message-id="${CSS.escape(id)}"]`);
    element?.classList.add(CURRENT);
    element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [current, matches]);

  const step = (direction: 1 | -1) => setCurrent((index) => stepMatch(index, matches.length, direction));

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      step(event.shiftKey ? -1 : 1);
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  const count =
    query.trim() === '' ? '' : matches.length === 0 ? t('No matches') : t('{current} of {count}', { current: current + 1, count: matches.length });

  return (
    <div className="chat-find" role="search" aria-label={t('Find in this chat')}>
      <input
        ref={field}
        className="input chat-find__field"
        type="search"
        value={query}
        placeholder={t('Find in this chat')}
        aria-label={t('Find in this chat')}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKey}
      />
      <span className="chat-find__count" aria-live="polite">
        {count}
      </span>
      <button type="button" className="btn btn--ghost btn--icon" onClick={() => step(-1)} disabled={matches.length === 0} aria-label={t('Previous match')} title={t('Previous match')}>
        <ChevronUp aria-hidden="true" />
      </button>
      <button type="button" className="btn btn--ghost btn--icon" onClick={() => step(1)} disabled={matches.length === 0} aria-label={t('Next match')} title={t('Next match')}>
        <ChevronDown aria-hidden="true" />
      </button>
      <button type="button" className="btn btn--ghost btn--icon" onClick={onClose} aria-label={t('Close')} title={t('Close')}>
        <X aria-hidden="true" />
      </button>
    </div>
  );
}
