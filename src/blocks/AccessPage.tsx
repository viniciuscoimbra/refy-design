import type { ComponentProps } from "react";
import { AccessBlock } from "./AccessBlock";
import { photos } from "./photos";
import styles from "./AccessPage.module.css";
export function AccessPage({
  layout = "centered",
  screen = "login",
  onScreenChange,
  onEnter,
  onSetup,
  providers,
}: {
  layout?: "centered" | "split";
} & Pick<
  NonNullable<ComponentProps<typeof AccessBlock>>,
  "screen" | "onScreenChange" | "onEnter" | "onSetup" | "providers"
> = {}) {
  return (
    <div className={styles.page} data-layout={layout}>
      {layout === "split" && (
        <aside className={styles.introduction}>
          <span>Your workspace</span>
          <div>
            <h2>Good ideas start with space.</h2>
            <p>
              Organize projects, share references and follow what your team is building.
            </p>
          </div>
          <img className={styles.photo} src={photos.coverSunday} alt="Open window with plants and morning light" />
        </aside>
      )}
      <div className={styles.form}>
        <AccessBlock
          initialScreen={screen}
          screen={onScreenChange ? screen : undefined}
          onScreenChange={onScreenChange}
          onEnter={onEnter}
          onSetup={onSetup}
          providers={providers}
        />
      </div>
    </div>
  );
}
