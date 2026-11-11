// Home sections with scroll and type motion. GSAP lives only in the site (decision 05/11); every
// themed sample below is a ThemeProvider fed by a theme file, nothing is painted by the site.
import { Children, Fragment, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AvatarGroup, Badge, BrandLogo, Button, Calendar, Callout, Card, CardHeader, Chip, CodeBlock, Input, ProgressBar, Segmented, Stat, Switch, ThemeProvider } from "../../index";
import { projectTeam } from "./SiteCatalog";
import type { RefyTheme } from "../../index";
import { prefersReducedMotion } from "./heroMotion";
import styles from "./RefySitePage.module.css";
import { currentLocale, htmlLang, useText } from "./i18n";

gsap.registerPlugin(ScrollTrigger);

export interface LandingTheme {
  id: string;
  label: string;
  theme: RefyTheme;
}

/** Title split in masked words; `playWords` raises them on load. */
export function HeroWords({ text }: { text: string }) {
  return (
    <span className={styles.words} aria-label={text} role="text">
      {text.split(" ").map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <span className={styles.wordMask} aria-hidden="true">
            <span className={styles.word} data-hero-word="">{word}</span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}

export function playWords(root: HTMLElement) {
  const words = root.querySelectorAll("[data-hero-word]");
  if (prefersReducedMotion() || !words.length) return () => undefined;
  const tween = gsap.from(words, { yPercent: 115, duration: 1, ease: "power4.out", stagger: 0.07, delay: 0.05, clearProps: "transform" });
  return () => { tween.progress(1).kill(); };
}

const tokenKeys = ["--primary", "--font-heading", "--radius-md", "--field-height"] as const;

function ThemeSlide({ item, index }: { item: LandingTheme; index: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState("mensal");
  const t = useText();
  // The excerpt is read from the rendered scope, so it shows the values that paint this slide.
  useEffect(() => {
    const scope = frame.current?.firstElementChild;
    if (!scope) return;
    const style = getComputedStyle(scope);
    const read = (key: string) => style.getPropertyValue(key).trim().replace(/^"([^"]+)".*$/, "$1");
    setCode(JSON.stringify(Object.fromEntries(tokenKeys.map((key) => [key, read(key)])), null, 1));
  }, [item.theme]);
  return (
    <div className={styles.themeSlide} data-index={index} data-theme-slide="">
      <div ref={frame} className={styles.themeSlideInner} data-theme-slide-inner="">
      <ThemeProvider isolate theme={item.theme} className={styles.themeSlideScope}>
        <div className={styles.themeSlideHead}>
          <span className={styles.themeSlideName}>{item.label}</span>
          <span className={styles.themeSlideFile}>{item.id}.json</span>
        </div>
        <div className={styles.themeSlideBody}>
          <Card>
            <CardHeader size="sm" title={t(planText.title)} description={t(planText.description)} action={<Badge tone="success" dot>{t(planText.active)}</Badge>} />
            <div className={styles.themeSlideStack}>
              <Segmented label={`${t(planText.billing)} · ${item.label}`} value={plan} onChange={setPlan} options={[{ value: "mensal", label: t(planText.monthly) }, { value: "anual", label: t(planText.yearly) }]} />
              <Input label="E-mail" placeholder={t(planText.email)} />
              <div className={styles.landingSampleRow}>
                <Button variant="primary">{t(planText.subscribe)}</Button>
                <Button>{t(planText.details)}</Button>
              </div>
            </div>
          </Card>
          <CodeBlock label={`${item.id}.json`} language="json" code={code} />
        </div>
      </ThemeProvider>
      </div>
    </div>
  );
}

/**
 * Temas: the text stays pinned while one slide per theme file scrolls up and covers the previous
 * one. The list beside the text marks the theme on top.
 */
export function ThemeScroll({ themes, intro }: { themes: LandingTheme[]; intro: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const t = useText();
  useEffect(() => {
    const box = stack.current;
    if (!box) return;
    const slides = [...box.querySelectorAll<HTMLElement>("[data-theme-slide]")];
    const inner = slides.map((slide) => slide.querySelector<HTMLElement>("[data-theme-slide-inner]")!);
    const count = slides.length;
    if (count < 2) return;
    const reduced = prefersReducedMotion();
    // Read from the real geometry on every scroll: a slide is on top once it reached its sticky
    // place, and the slide under it shrinks as the next one climbs over it.
    const trigger = ScrollTrigger.create({
      trigger: box,
      start: "top bottom",
      end: "bottom top",
      onUpdate: () => {
        const tops = slides.map((slide) => slide.getBoundingClientRect().top);
        // Each slide's sticky `top` comes from the stylesheet (its stacking position).
        const stuck = (index: number) => parseFloat(getComputedStyle(slides[index]).top) || 0;
        let current = 0;
        tops.forEach((value, index) => { if (value <= stuck(index) + 2) current = index; });
        setActive(current);
        if (reduced) return;
        inner.forEach((element, index) => {
          if (index === count - 1) return;
          const travel = window.innerHeight - stuck(index + 1);
          const amount = Math.min(1, Math.max(0, (window.innerHeight - tops[index + 1]) / travel));
          gsap.set(element, { scale: 1 - 0.05 * amount, transformOrigin: "50% 0%" });
        });
      },
    });
    return () => {
      trigger.kill();
      gsap.set(inner, { clearProps: "transform" });
    };
  }, [themes]);
  return (
    <section ref={root} className={styles.themeScroll} aria-labelledby="landing-theme">
      <div className={styles.themeScrollText}>
        {intro}
        <ol className={styles.themeList} aria-label={t({ pt: "Temas desta seção", en: "Themes in this section", es: "Temas de esta sección" })}>
          {themes.map((item, index) => (
            <li key={item.id} className={index === active ? styles.themeOn : undefined} aria-current={index === active ? "true" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </li>
          ))}
        </ol>
      </div>
      <div ref={stack} className={styles.themeStack}>
        {themes.map((item, index) => <ThemeSlide key={item.id} item={item} index={index} />)}
      </div>
    </section>
  );
}

// Closing manifesto: the scene pins
// for a few screens, each line rises word by word and leaves sideways, the last line keeps its
// accent, and the refy signature arrives with the call to action. Colours are the theme's.
const manifesto = {
  pt: { lines: ["Componha com o que já existe.", "Troque o tema num arquivo.", "Deixe a IA montar a tela."], lead: ["Seu", "design,"], accent: ["do", "seu", "jeito."] },
  en: { lines: ["Build with what already exists.", "Change the theme in one file.", "Let AI assemble the screen."], lead: ["Your", "design,"], accent: ["your", "way."] },
  es: { lines: ["Compón con lo que ya existe.", "Cambia el tema en un archivo.", "Deja que la IA arme la pantalla."], lead: ["Tu", "diseño,"], accent: ["a", "tu", "manera."] },
};
export const heroText = {
  title: { pt: "Seu design, do seu jeito", en: "Your design, your way", es: "Tu diseño, a tu manera" },
  lead: { pt: "Construa UI extensíveis e com IA nativa.", en: "Build extensible UI with native AI.", es: "Construye UI extensibles y con IA nativa." },
};

export function ManifestoScene({ children }: { children: ReactNode }) {
  const scene = useRef<HTMLElement>(null);
  const [reduced] = useState(() => typeof window !== "undefined" && prefersReducedMotion());
  const t = useText();
  const copy = t(manifesto);
  useEffect(() => {
    const root = scene.current;
    if (!root || reduced) return;
    let trigger: ScrollTrigger | undefined;
    let timeline: gsap.core.Timeline | undefined;
    const build = () => {
      const progress = trigger?.progress ?? 0;
      trigger?.kill();
      timeline?.kill();
      const style = getComputedStyle(root);
      const from = style.getPropertyValue("--ink-3").trim();
      const to = style.getPropertyValue("--primary").trim();
      const lines = [...root.querySelectorAll<HTMLElement>("[data-manifesto-line]")];
      const last = lines[lines.length - 1];
      const lead = last.querySelector<HTMLElement>("[data-manifesto-lead]")!;
      const accent = last.querySelector<HTMLElement>("strong")!;
      const signature = root.querySelector<HTMLElement>("[data-manifesto-signature]")!;
      timeline = gsap.timeline({ paused: true });
      lines.forEach((line, index) => {
        const words = line.querySelectorAll("[data-word]");
        const at = index * 1.4;
        // Words rise from below a mask line and leave upward, never sideways.
        timeline!.fromTo(words, { yPercent: 110, opacity: 0, filter: "blur(6px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", stagger: 0.06, duration: 0.7, ease: "power4.out" }, at);
        if (index < lines.length - 1) {
          timeline!.fromTo(line, { color: from }, { color: to, duration: 1.2, ease: "none" }, at);
          timeline!.to(words, { yPercent: -110, opacity: 0, filter: "blur(6px)", stagger: 0.04, duration: 0.5, ease: "power2.in" }, at + 1);
        }
      });
      const end = (lines.length - 1) * 1.4;
      timeline.to(lead.querySelectorAll("[data-word]"), { yPercent: -110, opacity: 0, filter: "blur(6px)", stagger: 0.04, duration: 0.5, ease: "power2.in" }, end + 1.1);
      // The accent only slides to the centre once "Seu design," is gone, and it is gone before the
      // signature rises: one phrase on screen at a time.
      timeline.to(accent, { scale: 1.12, x: () => (innerWidth > 700 ? -lead.offsetWidth / 2 : 0), duration: 0.7, ease: "power3.inOut" }, end + 1.7);
      timeline.to(accent, { yPercent: -110, opacity: 0, filter: "blur(6px)", duration: 0.5, ease: "power2.in" }, end + 2.7);
      timeline.fromTo(signature, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, end + 3.2);
      timeline.fromTo(signature.querySelector("[data-manifesto-logo]"), { scale: 0.9 }, { scale: () => (innerWidth > 700 ? 1.7 : 1.15), duration: 1, ease: "power3.out" }, end + 3.2);
      trigger = ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => timeline!.progress(self.progress),
      });
      timeline.progress(progress);
    };
    build();
    // A theme switch changes the colours the timeline was built with.
    const scope = root.closest("[data-refy-brand]");
    const observer = new MutationObserver(build);
    if (scope) observer.observe(scope, { attributes: true, attributeFilter: ["data-refy-brand", "data-theme"] });
    return () => {
      observer.disconnect();
      trigger?.kill();
      timeline?.revert();
    };
  }, [reduced, copy]);
  return (
    <section ref={scene} className={styles.manifestoScene} data-reduced={reduced || undefined} aria-labelledby="landing-closing">
      <div className={styles.manifestoPin}>
        <h2 id="landing-closing" className={styles.manifestoStage}>
          {copy.lines.map((line, index) => (
            <span key={line} className={styles.manifestoLine} data-line={index} data-manifesto-line="">
              {line.split(" ").map((word, position) => <span key={position} data-word="">{word}&nbsp;</span>)}
            </span>
          ))}
          <span className={styles.manifestoLine} data-line="3" data-manifesto-line="">
            <span data-manifesto-lead="">{copy.lead.map((word) => <span key={word} data-word="">{word}&nbsp;</span>)}</span>
            <strong>{copy.accent.map((word, position) => <span key={position} data-word="">{word}{position < copy.accent.length - 1 ? "\u00a0" : ""}</span>)}</strong>
          </span>
        </h2>
        <div className={styles.manifestoSignature} data-manifesto-signature="">
          <div className={styles.manifestoLogo} data-manifesto-logo=""><BrandLogo size="xl" symbol /></div>
          <p>{t(heroText.lead)}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

const planText = {
  title: { pt: "Plano Pro", en: "Pro plan", es: "Plan Pro" },
  description: { pt: "Para times que publicam toda semana.", en: "For teams that ship every week.", es: "Para equipos que publican cada semana." },
  active: { pt: "Ativo", en: "Active", es: "Activo" },
  billing: { pt: "Cobrança", en: "Billing", es: "Facturación" },
  monthly: { pt: "Mensal", en: "Monthly", es: "Mensual" },
  yearly: { pt: "Anual", en: "Yearly", es: "Anual" },
  email: { pt: "voce@empresa.com", en: "you@company.com", es: "tu@empresa.com" },
  subscribe: { pt: "Assinar", en: "Subscribe", es: "Suscribirse" },
  details: { pt: "Detalhes", en: "Details", es: "Detalles" },
};
// Real components, live and usable, all in the site's theme: switching the theme above the reel
// repaints every card at once.
function reelCards(t: ReturnType<typeof useText>) {
  return <>
    <PlanCard />
    <Card padding="sm"><Calendar locale={htmlLang[currentLocale()]} fixedWeeks={false} monthLabelStyle="compact" defaultMonth={new Date(2026, 9, 1)} defaultValue={new Date(2026, 9, 14)} /></Card>
    <Card>
      <CardHeader size="sm" title={t({ pt: "Projeto Aurora", en: "Aurora project", es: "Proyecto Aurora" })} description={t({ pt: "12 componentes em uso", en: "12 components in use", es: "12 componentes en uso" })} action={<Badge tone="success" dot>{t({ pt: "No prazo", en: "On track", es: "En plazo" })}</Badge>} />
      <div className={styles.reelStack}>
        <AvatarGroup size="md" items={projectTeam} />
        <ProgressBar value={68} aria-label={t({ pt: "Progresso do Projeto Aurora", en: "Aurora project progress", es: "Progreso del Proyecto Aurora" })} />
        <Button variant="primary">{t({ pt: "Ver projeto", en: "View project", es: "Ver proyecto" })}</Button>
      </div>
    </Card>
    <Card>
      <CardHeader size="sm" title={t({ pt: "Entre no seu espaço", en: "Sign in to your space", es: "Entra en tu espacio" })} />
      <div className={styles.reelStack}>
        <Input label="E-mail" placeholder={t(planText.email)} />
        <Input label={t({ pt: "Senha", en: "Password", es: "Contraseña" })} type="password" placeholder={t({ pt: "Sua senha", en: "Your password", es: "Tu contraseña" })} />
        <Button variant="primary" block>{t({ pt: "Entrar", en: "Sign in", es: "Entrar" })}</Button>
      </div>
    </Card>
    <Card>
      <div className={styles.reelStack}>
        <Stat label={t({ pt: "Componentes", en: "Components", es: "Componentes" })} value="118" delta={{ value: "+12", trend: "up" }} description={t({ pt: "nas últimas 4 semanas", en: "in the last 4 weeks", es: "en las últimas 4 semanas" })} />
        <Switch label={t({ pt: "Avisar quando publicar", en: "Notify me on publish", es: "Avisar al publicar" })} defaultChecked />
        <div className={styles.reelChips}><Chip selected>{t({ pt: "Átomos", en: "Atoms", es: "Átomos" })}</Chip><Chip>{t({ pt: "Moléculas", en: "Molecules", es: "Moléculas" })}</Chip><Chip>{t({ pt: "Organismos", en: "Organisms", es: "Organismos" })}</Chip></div>
      </div>
    </Card>
    <div className={styles.reelStack}>
      <Callout tone="success" title={t({ pt: "Tudo pronto!", en: "All set!", es: "¡Todo listo!" })}>{t({ pt: "Seu projeto foi criado. Você já pode adicionar componentes.", en: "Your project was created. You can add components now.", es: "Tu proyecto fue creado. Ya puedes agregar componentes." })}</Callout>
      <Callout tone="warn" title={t({ pt: "Revise o tema", en: "Review the theme", es: "Revisa el tema" })}>{t({ pt: "Duas cores ficaram com pouco contraste no modo escuro.", en: "Two colors have low contrast in dark mode.", es: "Dos colores quedaron con poco contraste en modo oscuro." })}</Callout>
    </div>
  </>;
}

function PlanCard() {
  const [plan, setPlan] = useState("mensal");
  const t = useText();
  return (
    <Card>
      <CardHeader size="sm" title={t(planText.title)} description={t(planText.description)} action={<Badge tone="success" dot>{t(planText.active)}</Badge>} />
      <div className={styles.reelStack}>
        <Segmented label={t(planText.billing)} value={plan} onChange={setPlan} options={[{ value: "mensal", label: t(planText.monthly) }, { value: "anual", label: t(planText.yearly) }]} />
        <div className={styles.landingSampleRow}><Button variant="primary">{t(planText.subscribe)}</Button><Button>{t(planText.details)}</Button></div>
      </div>
    </Card>
  );
}

/**
 * Reel under the hero: the cards drift sideways and tilt as they leave the centre, like a
 * coverflow. Hovering or focusing a card stops it so the reader can use it. Reduced motion: a
 * plain row that scrolls by hand.
 */
export function ShowcaseReel() {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = viewport.current;
    const row = track.current;
    if (!box || !row || prefersReducedMotion()) return;
    let x = 0;
    let paused = false;
    let speed = 0;
    const items = [...row.children] as HTMLElement[];
    // One set of cards, each wrapped around on its own: every card on screen is the real,
    // interactive one (a duplicated row would leave half the visible cards inert).
    // On a phone only one card fits: a constant drift always shows two cut cards. There the reel
    // stops with one card whole in the centre, then slides to the next one.
    let target: number | null = null;
    let held = 0;
    const tick = (_time: number, delta: number) => {
      speed += ((paused ? 0 : 40) - speed) * 0.08;
      const first = items[0];
      const last = items[items.length - 1];
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const period = last.offsetLeft + last.offsetWidth + gap - first.offsetLeft;
      if (period < box.clientWidth + first.offsetWidth) return;
      if (box.clientWidth < 640) {
        if (target === null) {
          target = box.getBoundingClientRect().left + (box.clientWidth - first.offsetWidth) / 2 - row.getBoundingClientRect().left - (parseFloat(getComputedStyle(row).paddingLeft) || 0);
          x = target;
        }
        if (!paused && (held += delta) > 3400) {
          held = 0;
          target -= first.offsetWidth + gap;
        }
        x += (target - x) * Math.min(1, (delta / 1000) * 5);
        if (target < -period) { target += period; x += period; }
      } else {
        target = null;
        x = (x - (speed * delta) / 1000) % period;
      }
      const center = box.getBoundingClientRect().left + box.clientWidth / 2;
      for (const item of items) {
        const base = item.offsetLeft - first.offsetLeft;
        const width = item.offsetWidth;
        const wrapped = ((((base + x + width) % period) + period) % period) - width;
        const shift = wrapped - base;
        const rowLeft = row.getBoundingClientRect().left;
        const mid = rowLeft + (parseFloat(getComputedStyle(row).paddingLeft) || 0) + base + shift + width / 2;
        const distance = (mid - center) / (box.clientWidth / 2);
        const clamped = Math.max(-1.2, Math.min(1.2, distance));
        gsap.set(item, { x: shift, rotateY: clamped * -22, scale: 1 - Math.abs(clamped) * 0.12, z: -Math.abs(clamped) * 80 });
      }
    };
    const stop = () => { paused = true; };
    const go = () => { if (!box.matches(":hover") && !box.contains(document.activeElement)) paused = false; };
    box.addEventListener("pointerenter", stop);
    box.addEventListener("pointerleave", go);
    box.addEventListener("focusin", stop);
    box.addEventListener("focusout", () => setTimeout(go));
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      box.removeEventListener("pointerenter", stop);
      box.removeEventListener("pointerleave", go);
      box.removeEventListener("focusin", stop);
      gsap.set(items, { clearProps: "transform" });
    };
  }, []);
  const reduced = typeof window !== "undefined" && prefersReducedMotion();
  const t = useText();
  return (
    <div ref={viewport} className={styles.reel} data-reduced={reduced || undefined} role="region" aria-label={t({ pt: "Componentes do refy no tema escolhido", en: "refy components in the chosen theme", es: "Componentes de refy en el tema elegido" })} data-hero-part="">
      <div ref={track} className={styles.reelTrack}>
        {Children.toArray(reelCards(t).props.children).map((card, index) => (
          <div key={index} className={styles.reelItem}>
            {card}
          </div>
        ))}
      </div>
    </div>
  );
}
