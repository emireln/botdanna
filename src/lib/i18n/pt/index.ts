// The Brazilian Portuguese translations. Each key is the English text exactly as the code has it.
import { APP_PT } from './app';
import { MESSAGES_PT } from './messages';
import { MOCKS_PT } from './mocks';
import { ONBOARDING_PT } from './onboarding';
import { ALERTS_PT } from './alerts';
import { VOICES_PT } from './voices';
import { LIVE_PT } from './live';

export const PT: Record<string, string> = {
  ...MOCKS_PT,
  ...APP_PT,
  ...MESSAGES_PT,
  ...ONBOARDING_PT,
  ...ALERTS_PT,
  ...VOICES_PT,
  ...LIVE_PT,
};
