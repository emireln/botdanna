// The learner's profile: the picture, the banner and the name, the learning setup the coach works from, the files in the
// library, and the account. Works on this device and in the account.
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Camera, Image as ImageIcon, Languages, MessageCircle, Pencil, Settings2, Shuffle, Target, Trash2 } from 'lucide-react';
import { Avatar, Field, FeatureCard, SectionTitle, Sheet, Skeleton, Spinner } from '../components/ui';
import { errorText } from '../lib/bridge';
import { activeExamDate } from '../lib/exam';
import { PictureError, prepareAvatar } from '../lib/avatar';
import { randomAvatarUrl } from '../lib/avatarPack';
import { prepareBanner } from '../lib/banner';
import { tn } from '../lib/i18n';
import { useT } from '../lib/i18n/react';
import { daysUntil } from '../lib/progress';
import { lookOf } from '../lib/look';
import { useAuth } from '../state/auth';
import { useAppData } from '../state/appData';
import { useToast } from '../state/toast';

export function ProfileScreen() {
  const navigate = useNavigate();
  const t = useT();
  const { backend, mode, email, signOut } = useAuth();
  const { profile, patchProfile, pictureUrl, changePicture, bannerUrl, changeBanner } = useAppData();
  const look = lookOf(profile);
  const { notify } = useToast();
  const [chatCount, setChatCount] = useState<number | null>(null);
  const [libraryCounts, setLibraryCounts] = useState<{ files: number; links: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [pictureOpen, setPictureOpen] = useState(false);
  const [pictureBusy, setPictureBusy] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerBusy, setBannerBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  // The coach chats and the library files, counted once for this visit.
  useEffect(() => {
    if (!backend) return undefined;
    let active = true;
    Promise.all([backend.listTutorChats(), backend.listLibraryFiles(), backend.listLibraryLinks()])
      .then(([chats, files, links]) => {
        if (!active) return;
        setChatCount(chats.length);
        setLibraryCounts({ files: files.length, links: links.length });
      })
      .catch(() => {
        if (!active) return;
        setChatCount(0);
        setLibraryCounts({ files: 0, links: 0 });
      });
    return () => {
      active = false;
    };
  }, [backend]);

  if (!profile) {
    return (
      <div className="page">
        <Skeleton height={300} />
      </div>
    );
  }

  const name = profile.display_name || profile.username;
  const daysLeft = daysUntil(activeExamDate(profile));
  const libraryTotal = (libraryCounts?.files ?? 0) + (libraryCounts?.links ?? 0);
  const goalText = profile.goal === 'toefl' ? t('TOEFL warm-up, target {score}', { score: profile.target_score }) : t('General English');
  const setupMeta = t('{goal} · level {level}', { goal: goalText, level: profile.level });

  const saveName = async () => {
    const next = nameDraft.trim();
    if (!next) return;
    setSaving(true);
    try {
      await patchProfile({ display_name: next });
      setEditing(false);
      notify(t('Name updated.'), 'ok');
    } catch (error) {
      notify(t(errorText(error)), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Picture changes work offline too: they are saved on this device, or sent to the account when online.
  const choosePicture = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPictureBusy(true);
    try {
      await changePicture(await prepareAvatar(file));
      setPictureOpen(false);
      notify(t('Picture updated.'), 'ok');
    } catch (error) {
      notify(error instanceof PictureError ? t(error.message) : t(errorText(error)), 'error');
    } finally {
      setPictureBusy(false);
    }
  };

  const removePicture = async () => {
    setPictureBusy(true);
    try {
      await changePicture(null);
      setPictureOpen(false);
      notify(t('Picture removed.'), 'ok');
    } catch (error) {
      notify(t(errorText(error)), 'error');
    } finally {
      setPictureBusy(false);
    }
  };

  // A picture from the ones bundled with the app, for someone who wants a new one without a file of their own.
  const randomPicture = async () => {
    setPictureBusy(true);
    try {
      const response = await fetch(randomAvatarUrl());
      if (!response.ok) throw new Error('The built-in picture could not be read.');
      await changePicture(await response.blob());
      setPictureOpen(false);
      notify(t('Picture updated.'), 'ok');
    } catch (error) {
      notify(t(errorText(error)), 'error');
    } finally {
      setPictureBusy(false);
    }
  };

  // A banner is cropped to a wide strip and kept small, like the picture. It can be changed offline too.
  const chooseBanner = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBannerBusy(true);
    try {
      await changeBanner(await prepareBanner(file));
      setBannerOpen(false);
      notify(t('Banner updated.'), 'ok');
    } catch (error) {
      notify(error instanceof PictureError ? t(error.message) : t(errorText(error)), 'error');
    } finally {
      setBannerBusy(false);
    }
  };

  const removeBanner = async () => {
    setBannerBusy(true);
    try {
      await changeBanner(null);
      setBannerOpen(false);
      notify(t('Banner removed.'), 'ok');
    } catch (error) {
      notify(t(errorText(error)), 'error');
    } finally {
      setBannerBusy(false);
    }
  };

  const signOutNow = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="page">
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={choosePicture} />
      <input ref={bannerInput} type="file" accept="image/*" hidden onChange={chooseBanner} />

      <section className={`profile-hero${bannerUrl ? ' profile-hero--photo' : ''}`} aria-label={t('Your profile')}>
        <div
          className="profile-hero__backdrop"
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
          aria-hidden="true"
        />
        <button className="profile-hero__banner-edit" onClick={() => setBannerOpen(true)} disabled={bannerBusy}>
          <ImageIcon aria-hidden="true" />
          {bannerUrl ? t('Edit banner') : t('Add banner')}
        </button>

        <div className="profile-hero__top">
          <div className="profile-hero__who">
            <p className="profile-hero__eyebrow">{t('Your profile')}</p>
            <div className="profile-hero__name">
              <h1 className="profile-hero__title">{name}</h1>
              <button
                className="profile-hero__icon"
                onClick={() => {
                  setNameDraft(profile.display_name);
                  setEditing(true);
                }}
                aria-label={t('Edit name')}
                title={t('Edit name')}
              >
                <Pencil aria-hidden="true" />
              </button>
            </div>
            <p className="profile-hero__meta">{mode === 'local' ? t('Kept on this device') : `@${profile.username} · ${email ?? ''}`}</p>
          </div>

          <div className="profile-hero__picture">
            <Avatar name={name} seed={profile.id} size="lg" src={pictureUrl} />
            <button
              className="profile-hero__picture-edit"
              onClick={() => setPictureOpen(true)}
              disabled={pictureBusy}
              aria-label={t('Edit picture')}
              title={t('Edit picture')}
            >
              {pictureBusy ? <Spinner dark /> : <Pencil aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="profile-hero__stats">
          <div className="profile-hero__stat">
            {look === 'playful' && (
              <span className="profile-hero__stat-icon" aria-hidden="true">
                <Languages />
              </span>
            )}
            <span className="profile-hero__value">{profile.level}</span>
            <span className="profile-hero__label">{t('Level')}</span>
          </div>
          <div className="profile-hero__stat">
            {look === 'playful' && (
              <span className="profile-hero__stat-icon" aria-hidden="true">
                <Target />
              </span>
            )}
            <span className="profile-hero__value">{profile.goal === 'toefl' ? 'TOEFL' : 'English'}</span>
            <span className="profile-hero__label">{t('Goal')}</span>
          </div>
          <div className="profile-hero__stat">
            {look === 'playful' && (
              <span className="profile-hero__stat-icon" aria-hidden="true">
                <MessageCircle />
              </span>
            )}
            <span className="profile-hero__value">{chatCount ?? 0}</span>
            <span className="profile-hero__label">{t('Coach chats')}</span>
          </div>
        </div>
      </section>

      <div className="stack mt-6">
        <FeatureCard
          icon={<Settings2 />}
          title={t('Learning setup')}
          meta={
            daysLeft !== null && daysLeft >= 0
              ? t('{base} · exam in {days}', {
                  base: setupMeta,
                  days: tn('{count} day', '{count} days', daysLeft, { count: daysLeft }),
                })
              : setupMeta
          }
          action={
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/setup')}>
              {t('Edit setup')}
            </button>
          }
        />
        <FeatureCard
          icon={<BookOpen />}
          title={t('My library')}
          meta={
            libraryTotal > 0
              ? t('{files} · {links}', {
                  files: tn('{count} file', '{count} files', libraryCounts?.files ?? 0, { count: libraryCounts?.files ?? 0 }),
                  links: tn('{count} link', '{count} links', libraryCounts?.links ?? 0, { count: libraryCounts?.links ?? 0 }),
                })
              : t('Keep your PDF, TXT and Markdown files, and learning links, in one place.')
          }
          action={
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/library')}>
              {t('Open library')}
            </button>
          }
        />
      </div>

      <SectionTitle title={t('Account')} />
      <div className="settings-row">
        <div className="settings-row__body">
          <div className="settings-row__title">{mode === 'local' ? t('On this device') : (email ?? t('Signed in'))}</div>
          <div className="settings-row__text">
            {mode === 'local' ? t('Your chats and files stay on this device.') : t('Your chats and files are saved to your account.')}
          </div>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={signOutNow}>
          {mode === 'local' ? t('Switch mode') : t('Sign out')}
        </button>
      </div>

      {pictureOpen && (
        <Sheet title={t('Profile picture')} onClose={() => !pictureBusy && setPictureOpen(false)}>
          <div className="stack">
            <div className="picture-preview">
              <Avatar name={name} seed={profile.id} size="lg" src={pictureUrl} />
            </div>
            <div className="stack--tight">
              <button className="btn btn--primary btn--block" onClick={() => fileInput.current?.click()} disabled={pictureBusy}>
                {pictureBusy ? <Spinner /> : <Camera aria-hidden="true" />} {pictureUrl ? t('Change picture') : t('Add picture')}
              </button>
              <button className="btn btn--ghost btn--block" onClick={() => void randomPicture()} disabled={pictureBusy}>
                <Shuffle aria-hidden="true" /> {t('Random picture')}
              </button>
              {pictureUrl && (
                <button className="btn btn--ghost btn--block" onClick={removePicture} disabled={pictureBusy}>
                  <Trash2 aria-hidden="true" /> {t('Remove picture')}
                </button>
              )}
            </div>
          </div>
        </Sheet>
      )}

      {bannerOpen && (
        <Sheet title={t('Profile banner')} onClose={() => !bannerBusy && setBannerOpen(false)}>
          <div className="stack">
            <div className="banner-preview" style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}>
              {!bannerUrl && <span>{t('No banner yet')}</span>}
            </div>
            <div className="stack--tight">
              <button className="btn btn--primary btn--block" onClick={() => bannerInput.current?.click()} disabled={bannerBusy}>
                {bannerBusy ? <Spinner /> : <ImageIcon aria-hidden="true" />} {bannerUrl ? t('Change banner') : t('Add banner')}
              </button>
              {bannerUrl && (
                <button className="btn btn--ghost btn--block" onClick={removeBanner} disabled={bannerBusy}>
                  <Trash2 aria-hidden="true" /> {t('Remove banner')}
                </button>
              )}
            </div>
          </div>
        </Sheet>
      )}

      {editing && (
        <Sheet
          title={t('Your name')}
          onClose={() => setEditing(false)}
          footer={
            <>
              <button className="btn btn--ghost" onClick={() => setEditing(false)} disabled={saving}>
                {t('Cancel')}
              </button>
              <button className="btn btn--primary" onClick={saveName} disabled={saving || !nameDraft.trim()}>
                {saving ? <Spinner /> : null} {t('Save name')}
              </button>
            </>
          }
        >
          <Field label={t('Display name')} hint={t('Your username stays the same.')}>
            <input className="input" value={nameDraft} maxLength={40} onChange={(event) => setNameDraft(event.target.value)} />
          </Field>
        </Sheet>
      )}
    </div>
  );
}
