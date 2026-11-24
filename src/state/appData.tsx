import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './auth';
import type { ProfileRow } from '../lib/types';
import type { ProfilePatch } from '../lib/data/backend';
import type { SkillMap } from '../lib/scoring';
import { errorText } from '../lib/bridge';
import { usePictureUrl } from '../lib/avatarCache';

interface AppDataApi {
  ready: boolean;
  loadError: string | null;
  profile: ProfileRow | null;
  skills: SkillMap;
  refresh: () => Promise<void>;
  reloadSkills: () => Promise<void>;
  patchProfile: (patch: ProfilePatch) => Promise<ProfileRow>;
  /** The signed-in person's picture as an object URL, or null. */
  pictureUrl: string | null;
  /** Saves a WebP picture, or removes it with null. */
  changePicture: (picture: Blob | null) => Promise<void>;
  /** The signed-in person's banner as an object URL, or null. */
  bannerUrl: string | null;
  /** Saves a WebP banner, or removes it with null. */
  changeBanner: (picture: Blob | null) => Promise<void>;
}

const AppDataContext = createContext<AppDataApi | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { status, backend } = useAuth();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [skills, setSkills] = useState<SkillMap>({});

  const refresh = useCallback(async () => {
    if (!backend) return;
    try {
      const [nextProfile, nextSkills] = await Promise.all([backend.getProfile(), backend.getSkillScores()]);
      setProfile(nextProfile);
      setSkills(nextSkills);
      setLoadError(null);
    } catch (error) {
      console.error('Could not load your data', error);
      setLoadError(errorText(error));
    } finally {
      setReady(true);
    }
  }, [backend]);

  const reloadSkills = useCallback(async () => {
    if (!backend) return;
    setSkills(await backend.getSkillScores());
  }, [backend]);

  useEffect(() => {
    if (status === 'in') {
      void refresh();
    } else {
      setReady(false);
      setLoadError(null);
      setProfile(null);
      setSkills({});
    }
  }, [status, refresh]);

  const patchProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!backend) throw new Error('You are not signed in.');
      const next = await backend.updateProfile(patch);
      setProfile(next);
      return next;
    },
    [backend],
  );

  // The picture is keyed by its version, so it reloads only when it has changed.
  const pictureVersion = profile?.avatar_updated_at ?? null;
  const pictureUrl = usePictureUrl(
    profile && pictureVersion ? `own:${backend?.mode ?? 'none'}:${profile.id}:${pictureVersion}` : null,
    () => (backend ? backend.getAvatar() : Promise.resolve(null)),
  );

  const bannerVersion = profile?.banner_updated_at ?? null;
  const bannerUrl = usePictureUrl(
    profile && bannerVersion ? `own-banner:${backend?.mode ?? 'none'}:${profile.id}:${bannerVersion}` : null,
    () => (backend ? backend.getBanner() : Promise.resolve(null)),
  );

  const changePicture = useCallback(
    async (picture: Blob | null) => {
      if (!backend) throw new Error('You are not signed in.');
      setProfile(await backend.setAvatar(picture));
    },
    [backend],
  );

  const changeBanner = useCallback(
    async (picture: Blob | null) => {
      if (!backend) throw new Error('You are not signed in.');
      setProfile(await backend.setBanner(picture));
    },
    [backend],
  );

  const api = useMemo<AppDataApi>(
    () => ({
      ready,
      loadError,
      profile,
      skills,
      refresh,
      reloadSkills,
      patchProfile,
      pictureUrl,
      changePicture,
      bannerUrl,
      changeBanner,
    }),
    [ready, loadError, profile, skills, refresh, reloadSkills, patchProfile, pictureUrl, changePicture, bannerUrl, changeBanner],
  );

  return <AppDataContext.Provider value={api}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataApi {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider.');
  return context;
}
