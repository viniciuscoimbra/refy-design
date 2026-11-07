"use client";
import { useState } from 'react';
import {
  Avatar,
  Button,
  Input,
  Select,
  SettingRow,
  SettingRowGroup,
  Switch,
  Tabs,
  Textarea,
} from '../index';
import styles from './blocks.module.css';
/** Props for the SettingsBlock template. */
export interface SettingsBlockProps {
  /** Foto do perfil; sem ela, o avatar mostra as iniciais. */
  avatarSrc?: string;
}

export function SettingsBlock({ avatarSrc }: SettingsBlockProps = {}) {
  const [profile, setProfile] = useState({
      name: 'Ana Lima',
      bio: 'Interface and systems designer.',
    }),
    [draft, setDraft] = useState(profile),
    [notice, setNotice] = useState(''),
    [email, setEmail] = useState(true),
    [digest, setDigest] = useState(false),
    [language, setLanguage] = useState('pt-BR');
  return (
    <section aria-label="Account preferences">
      <Tabs
        items={[
          {
            id: 'profile',
            label: 'Profile',
            content: (
              <form
                className={styles.settingsForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  setProfile(draft);
                  setNotice('Profile saved in this session.');
                }}
              >
                <section className={styles.settingsSection} aria-labelledby="profile-title">
                  <header>
                    <h3 id="profile-title">Profile</h3>
                    <p>How the team sees you in projects and comments.</p>
                  </header>
                  <div className={styles.settingsCard}>
                    <div className={styles.profile}>
                      <Avatar
                        src={avatarSrc}
                        alt=""
                        initials={profile.name
                          .split(' ')
                          .map((word) => word[0])
                          .slice(0, 2)
                          .join('')}
                        size="lg"
                      />
                      <div>
                        <strong>{profile.name}</strong>
                        <span>{profile.bio}</span>
                      </div>
                    </div>
                    <Input
                      label="Display name"
                      value={draft.name}
                      required
                      block
                      onChange={(event) =>
                        setDraft((value) => ({
                          ...value,
                          name: event.target.value,
                        }))
                      }
                    />
                    <Textarea
                      label="About you"
                      value={draft.bio}
                      onChange={(event) =>
                        setDraft((value) => ({ ...value, bio: event.target.value }))
                      }
                    />
                  </div>
                </section>
                <section className={styles.settingsSection} aria-labelledby="account-title">
                  <header>
                    <h3 id="account-title">Account</h3>
                    <p>Sign-in email and the language of screens and notices.</p>
                  </header>
                  <div className={styles.settingsCard}>
                    <Input label="Email" type="email" value="ana@aurora.studio" readOnly block />
                    <Select label="Language" value={language} onChange={(event) => setLanguage(event.target.value)}>
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                    </Select>
                  </div>
                </section>
                <div className={styles.actions}>
                  <Button
                    type="button"
                    onClick={() => {
                      setDraft(profile);
                      setNotice('Editing cancelled.');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save profile
                  </Button>
                </div>
              </form>
            ),
          },
          {
            id: 'notifications',
            label: 'Notifications',
            content: (
              <div className={styles.stack}>
                <SettingRowGroup>
                  <SettingRow
                    title="Project updates"
                    description="Notices about materials and reviews."
                    actions={
                      <Switch
                        label="Project updates"
                        checked={email}
                        onChange={(event) => setEmail(event.target.checked)}
                      />
                    }
                  />
                  <SettingRow
                    title="Weekly summary"
                    description="A summary of the team's activity."
                    actions={
                      <Switch
                        label="Weekly summary"
                        checked={digest}
                        onChange={(event) => setDigest(event.target.checked)}
                      />
                    }
                  />
                </SettingRowGroup>
                <Button
                  onClick={() => setNotice('Preferences saved in this session.')}
                >
                  Save preferences
                </Button>
              </div>
            ),
          },
        ]}
      />
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
