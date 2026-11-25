// The Brazilian Portuguese translations. Each key is the English text exactly as the code has it.
import { APP_PT } from './app';
import { MESSAGES_PT } from './messages';
import { MOCKS_PT } from './mocks';
import { ONBOARDING_PT } from './onboarding';
import { ALERTS_PT } from './alerts';
import { VOICES_PT } from './voices';
import { LIVE_PT } from './live';

// The talk's words come first, so the skill names that share a key with them (Listening, Speaking) keep their app value.
export const PT: Record<string, string> = {
  ...LIVE_PT,
  ...MOCKS_PT,
  ...APP_PT,
  ...MESSAGES_PT,
  ...ONBOARDING_PT,
  ...ALERTS_PT,
  ...VOICES_PT,
};
