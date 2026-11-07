"use client";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Checkbox,
  Callout,
  Card,
  CardHeader,
  ChoiceCard,
  ChoiceCardGroup,
  Textarea,
  WizardStepper,
  Badge,
} from "../index";
import styles from "./blocks.module.css";
export interface SetupConfiguration {
  name: string;
  description: string;
  access: "team" | "invite";
  notifications: boolean;
}
export function SetupBlock({
  onComplete,
  onConfigured,
}: {
  onComplete?: (name: string) => void;
  onConfigured?: (configuration: SetupConfiguration) => void;
} = {}) {
  const [completed, setCompleted] = useState(false);
  const [step, setStep] = useState("space");
  const heading = useRef<HTMLSpanElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [description, setDescription] = useState("");
  const [access, setAccess] = useState<"team" | "invite">("team");
  const [alerts, setAlerts] = useState(true);
  const steps = [
    { id: "space", label: "Your space" },
    { id: "preferences", label: "Preferences" },
    { id: "review", label: "Review" },
  ];
  if (completed)
    return (
      <section className={styles.setup}>
        <Callout title="Space set up">
          {name} is ready in this local demo.
        </Callout>
        <Button
          onClick={() => {
            setCompleted(false);
            setStep("space");
          }}
        >
          Review setup
        </Button>
      </section>
    );
  return (
    <section className={styles.setup} aria-label="Setup page">
      <WizardStepper
        label="Set up space"
        steps={steps}
        current={step}
        onStepChange={setStep}
        onBack={
          step !== "space"
            ? () => setStep(step === "review" ? "preferences" : "space")
            : undefined
        }
      />
      <div className={styles.flowHeading}>
        <h1>A space for your team</h1>
        <p>Three steps to start the demo.</p>
      </div>
      <Card>
        <CardHeader
          title={
            <span ref={heading} tabIndex={-1}>
              {steps.find((item) => item.id === step)!.label}
            </span>
          }
        />
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) {
              setNameError("Enter at least two characters.");
              setStep("space");
              return;
            }
            if (step === "review") {
              setCompleted(true);
              onComplete?.(name.trim());
              onConfigured?.({
                name: name.trim(),
                description: description.trim(),
                access,
                notifications: alerts,
              });
            } else setStep(step === "space" ? "preferences" : "review");
          }}
        >
          {step === "space" && (
            <>
              <Input
                label="Space name"
                placeholder="Aurora Studio"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                error={nameError}
                required
                minLength={2}
                block
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will your team organize here?"
                block
              />
            </>
          )}
          {step === "preferences" && (
            <>
              <ChoiceCardGroup
                label="Who can access?"
                columns={1}
                value={access}
                onChange={(value) =>
                  setAccess(value === "invite" ? "invite" : "team")
                }
              >
                <ChoiceCard
                  value="team"
                  title="The whole team"
                  description="Members collaborate on the same projects."
                />
                <ChoiceCard
                  value="invite"
                  title="Invited only"
                  description="Share each project with specific people."
                />
              </ChoiceCardGroup>
              <Checkbox
                label="Get notified about new deliveries"
                checked={alerts}
                onChange={(e) => setAlerts(e.target.checked)}
              />
            </>
          )}
          {step === "review" && (
            <>
              <dl className={styles.summary}>
                <dt>Space</dt>
                <dd>{name}</dd>
                <dt>Description</dt>
                <dd>{description || "No description"}</dd>
                <dt>Access</dt>
                <dd>
                  {access === "team" ? "The whole team" : "Invited only"}
                </dd>
                <dt>Notifications</dt>
                <dd>
                  <Badge tone={alerts ? "success" : "neutral"}>
                    {alerts ? "On" : "Off"}
                  </Badge>
                </dd>
              </dl>
              <Callout title="All set to try it">
                Data stays in this local session.
              </Callout>
            </>
          )}
          <Button variant="primary" type="submit">
            {step === "review" ? "Create space and open the app" : "Continue"}
          </Button>
        </form>
      </Card>
    </section>
  );
}
