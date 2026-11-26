// The card of a word tapped in the library reader: its meaning, the sentence it came from, and "Save word". With
// an AI key the model gives the meaning. Without one, or when its reply cannot be read, the learner types the meaning.
// Nothing is saved until "Save word" is pressed. A saved word becomes a review item, the same as a word from a chat,
// so the coach can practise it with the learner.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Check, X } from 'lucide-react';
import { Field, Spinner } from './ui';
import { extractJson } from '../lib/ai';
import { errorText } from '../lib/bridge';
import { vocabReview } from '../lib/coachVocab';
import { cleanMeaning, definitionRequest, MEANING_MAX, parseDefinition, sameWord, type Definition, type PartOfSpeech, type WordHit } from '../lib/define';
import { replyLanguage } from '../lib/i18n';
import { useT, type Translate } from '../lib/i18n/react';
import { useAI } from '../state/ai';
import { useAuth } from '../state/auth';
import { useToast } from '../state/toast';

function partOfSpeechName(t: Translate, part: PartOfSpeech): string {
  switch (part) {
    case 'noun':
      return t('noun');
    case 'verb':
      return t('verb');
    case 'adjective':
      return t('adjective');
    case 'adverb':
      return t('adverb');
    case 'pronoun':
      return t('pronoun');
    case 'preposition':
      return t('preposition');
    case 'conjunction':
      return t('conjunction');
    case 'determiner':
      return t('determiner');
    case 'interjection':
      return t('interjection');
    case 'phrase':
      return t('phrase');
    case 'other':
      return t('other');
  }
}

export function WordCard({ hit, onClose }: { hit: WordHit; onClose: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const { backend } = useAuth();
  const { complete, ready, selection } = useAI();
  const { notify } = useToast();
  const aiOn = ready && Boolean(selection);
  const [definition, setDefinition] = useState<Definition | null>(null);
  const [looking, setLooking] = useState(aiOn);
  const [failed, setFailed] = useState(false);
  const [typed, setTyped] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const card = useRef<HTMLElement>(null);

  useEffect(() => {
    card.current?.focus();
  }, []);

  // The model is asked once for each tapped word. A reply that comes after the card is closed is dropped.
  useEffect(() => {
    if (!aiOn) return undefined;
    let alive = true;
    const request = definitionRequest(hit, replyLanguage());
    complete({ system: request.system, messages: [{ role: 'user', content: request.prompt }], json: true, maxTokens: 300 })
      .then((reply) => {
        if (!alive) return;
        const found = parseDefinition(extractJson(reply.text), hit.word);
        setDefinition(found);
        setFailed(!found);
      })
      .catch(() => {
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setLooking(false);
      });
    return () => {
      alive = false;
    };
  }, [aiOn, complete, hit]);

  const meaning = definition?.meaning ?? cleanMeaning(typed);

  // The word is kept as the learner tapped it, so its sentence always contains it in the review.
  async function save() {
    if (!backend || !meaning || saving || saved) return;
    const row = vocabReview({ word: hit.word, meaning, example: hit.sentence, note: '' });
    if (!row) {
      notify(t('This example does not use the word, so it cannot be saved.'), 'error');
      return;
    }
    setSaving(true);
    try {
      await backend.upsertReviewItems([row]);
      setSaved(true);
      notify(t('Saved to your review. It comes back in about 10 minutes.'), 'ok');
    } catch (failure) {
      notify(t(errorText(failure)), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="word-card" role="dialog" aria-label={t('Word')} tabIndex={-1} ref={card}>
      <div className="word-card__head">
        <div className="word-card__title">
          <span className="word-card__word">{definition?.headword ?? hit.word}</span>
          {definition && <span className="chip">{partOfSpeechName(t, definition.partOfSpeech)}</span>}
        </div>
        <button className="btn btn--icon" onClick={onClose} aria-label={t('Close')}>
          <X />
        </button>
      </div>

      {definition && !sameWord(definition.headword, hit.word) && <p className="small muted">{t('In the text: {word}', { word: hit.word })}</p>}

      {looking && (
        <p className="word-card__status small muted">
          <Spinner dark /> {t('Looking up the meaning')}
        </p>
      )}

      {definition && (
        <div className="word-card__answer">
          <p className="word-card__meaning">{definition.meaning}</p>
          {definition.inContext && (
            <p className="small">
              <span className="muted">{t('In this sentence')}: </span>
              {definition.inContext}
            </p>
          )}
        </div>
      )}

      {!looking && !definition && (
        <>
          {aiOn ? (
            failed && <p className="word-card__hint">{t('The meaning could not be read. Type it below.')}</p>
          ) : (
            <p className="word-card__hint">
              {t('Connect an AI key to see the meaning here. Without one, type the meaning and save it.')}{' '}
              <button className="btn btn--text btn--sm" onClick={() => navigate('/settings/ai')}>
                {t('Open Settings')}
              </button>
            </p>
          )}
          <Field label={t('Meaning')}>
            <input
              className="input"
              value={typed}
              maxLength={MEANING_MAX}
              placeholder={t('Type what the word means.')}
              onChange={(event) => setTyped(event.target.value)}
            />
          </Field>
        </>
      )}

      <p className="word-card__sentence">
        {hit.sentence.slice(0, hit.from)}
        <mark className="word-card__mark">{hit.sentence.slice(hit.from, hit.to)}</mark>
        {hit.sentence.slice(hit.to)}
      </p>

      {aiOn && <p className="small muted word-card__pen">{t('The word and its sentence are sent to the AI provider you connected.')}</p>}

      <div className="word-card__actions">
        {saved ? (
          <button className="btn btn--ghost" disabled>
            <Check aria-hidden="true" /> {t('Saved')}
          </button>
        ) : (
          <button className="btn btn--primary" disabled={!meaning || looking || saving} onClick={() => void save()}>
            {saving ? <Spinner /> : <Bookmark aria-hidden="true" />} {t('Save word')}
          </button>
        )}
      </div>
    </section>
  );
}
