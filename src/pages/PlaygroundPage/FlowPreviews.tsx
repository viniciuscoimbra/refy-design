import { tr } from "../RefySitePage/i18n";
import { useState } from "react";
import { Button, SetupBlock } from "../../index";
import type {
  AccessIdentity,
  AccessScreen,
  SetupConfiguration,
} from "../../index";
import { AccessPage } from "../../blocks/AccessPage";
import styles from "./Journeys.module.css";
const screens = [
  { id: "login", label: tr("Entrar") },
  { id: "signup", label: tr("Criar conta") },
  { id: "recover", label: tr("Recuperar acesso") },
  { id: "otp", label: tr("Verificar código") },
  { id: "reset", label: tr("Nova senha") },
] as const;
export function AccessPreview({
  onEnter,
  onSetup,
}: {
  onEnter: (identity: AccessIdentity) => void;
  onSetup: (identity: AccessIdentity) => void;
}) {
  const [screen, setScreen] = useState<AccessScreen>("login"),
    [scenario, setScenario] = useState(0);
  return (
    <main className={styles.page} aria-label={tr("Jornada de acesso")}>
      <header className={styles.header}>
        <div>
          <h2>{tr("Acesso")}</h2>
          <p>
            {tr("Entre, crie uma conta ou recupere o acesso. Demonstração local, código")} <code>123456</code>.
          </p>
        </div>
      </header>
      <nav className={styles.scenarios} aria-label={tr("Cenários de acesso")}>
        {screens.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant="ghost"
            aria-current={screen === item.id ? "true" : undefined}
            onClick={() => {
              setScreen(item.id);
              setScenario((value) => value + 1);
            }}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div className={styles.access}>
        <AccessPage
          key={scenario}
          layout="split"
          screen={screen}
          onScreenChange={setScreen}
          onEnter={onEnter}
          onSetup={onSetup}
        />
      </div>
    </main>
  );
}
export function SetupPreview({
  onComplete,
  onCancel,
}: {
  onComplete: (configuration: SetupConfiguration) => void;
  onCancel: () => void;
}) {
  return (
    <main className={styles.page} aria-label={tr("Jornada de configuração")}>
      <header className={styles.header}>
        <div>
          <h2>{tr("Configuração inicial")}</h2>
          <p>{tr("Defina seu espaço e revise as preferências antes de começar.")}</p>
        </div>
        <Button variant="ghost" onClick={onCancel}>
          {tr("Voltar ao acesso")}</Button>
      </header>
      <div className={styles.setup}>
        <SetupBlock onConfigured={onComplete} />
      </div>
    </main>
  );
}
