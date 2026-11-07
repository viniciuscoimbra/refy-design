"use client";
import { useEffect, useRef, useState } from "react";
import {
  BrandLogo,
  Button,
  Callout,
  Checkbox,
  OAuthButton,
  oauthProviders,
  type OAuthProvider,
  Input,
  Otp,
} from "../index";
import styles from "./blocks.module.css";
export interface AccessIdentity {
  name: string;
  email: string;
}

export type AccessScreen =
  "login" | "recover" | "otp" | "reset" | "signup" | "success";
export function AccessBlock({
  onEnter,
  onSetup,
  screen,
  onScreenChange,
  initialScreen = "login",
  providers = ["google"],
}: {
  providers?: readonly OAuthProvider[];
  onEnter?: (identity: AccessIdentity) => void;
  onSetup?: (identity: AccessIdentity) => void;
  screen?: AccessScreen;
  initialScreen?: AccessScreen;
  onScreenChange?: (screen: AccessScreen) => void;
} = {}) {
  const [internalStep, setStep] = useState<AccessScreen>(initialScreen);
  const step = screen ?? internalStep;
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step && step !== "otp")
      heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  const [purpose, setPurpose] = useState<"login" | "recover" | "signup">(
    "login",
  );
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [name, setName] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const identity = {
    name: name.trim() || "Sample Person",
    email: email.trim(),
  };
  const [visible, setVisible] = useState(false),
    [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const changeStep = (next: typeof step) => {
    setStep(next);
    onScreenChange?.(next);
    setError("");
    setMessage("");
    setCode("");
    setPassword("");
    setConfirmation("");
  };
  const finish = () => {
    if (onEnter) onEnter(identity);
    else changeStep("success");
  };
  const headings = {
    login: "Sign in to your space",
    recover: "Recover access",
    otp: "Check your email",
    reset: "Create a new password",
    signup: "Create your account",
    success: "Sign-in demonstrated",
  };
  return (
    <section
      className={styles.access}
      aria-label={onEnter ? "Sign-in page" : "Demo sign-in"}
    >
      <BrandLogo brand="refy" size="lg" symbol />
      <header>
        <h1 ref={heading} tabIndex={-1}>
          {headings[step]}
        </h1>
        <p className={styles.meta}>
          {step === "otp"
            ? `Code for ${email || "you@company.com"}. Use 123456 in this demo.`
            : "A space to work with your team."}
        </p>
      </header>
      {step === "success" ? (
        <>
          <Callout title="Sign-in demonstrated">
            Local validation finished for {email}.
          </Callout>
          <Button onClick={() => changeStep("login")}>Back to sign-in</Button>
        </>
      ) : (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            if (step === "recover") {
              setPurpose("recover");
              setMessage(
                `Request prepared for ${email}. This preview does not send emails.`,
              );
              return;
            }
            if (step === "signup") {
              setPurpose("signup");
              changeStep("otp");
              return;
            }
            if (step === "otp") {
              if (code !== "123456") {
                setError("Invalid code. Use 123456 to test.");
                return;
              }
              if (purpose === "recover") changeStep("reset");
              else if (purpose === "signup" && onSetup) onSetup(identity);
              else finish();
              return;
            }
            if (step === "reset") {
              if (password !== confirmation) {
                setError("The passwords must match.");
                return;
              }
              changeStep("login");
              setMessage(
                "Password reset in this demo. You can sign in now.",
              );
              return;
            }
            finish();
          }}
        >
          {step === "signup" && (
            <Input
              label="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="off"
              block
            />
          )}
          {["login", "recover", "signup"].includes(step) && (
            <Input
              label={onEnter ? "Email" : "Sample email"}
              type="email"
              required
              autoComplete="off"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              block
            />
          )}
          {["login", "signup", "reset"].includes(step) && (
            <>
              <Input
                label={
                  step === "reset"
                    ? "New password"
                    : onEnter
                      ? "Password"
                      : "Sample password"
                }
                type={visible ? "text" : "password"}
                required
                minLength={onEnter || step !== "login" ? 8 : 6}
                autoComplete="off"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                hint="Use a made-up password, not data from a real account."
                block
              />
              <Checkbox
                label="Show password"
                checked={visible}
                onChange={(event) => setVisible(event.target.checked)}
              />
            </>
          )}
          {step === "reset" && (
            <Input
              label="Confirm new password"
              type={visible ? "text" : "password"}
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setError("");
              }}
              required
              minLength={8}
              autoComplete="off"
              block
              error={error}
            />
          )}
          {step === "otp" && (
            <Otp
              label="Verification code"
              value={code}
              onChange={setCode}
              error={error}
              autoFocus
            />
          )}
          <Button variant="primary" type="submit" block>
            {step === "login"
              ? onEnter
                ? "Sign in to the demo"
                : "Sign in to the example"
              : step === "recover"
                ? "Prepare recovery"
                : step === "otp"
                  ? "Verify code"
                  : step === "reset"
                    ? "Save new password"
                    : "Create sample account"}
          </Button>
          {message && (
            <Callout
              title={
                step === "recover"
                  ? "Account recovery"
                  : "Local demo"
              }
            >
              {message}
            </Callout>
          )}
          {step === "recover" && message && (
            <Button type="button" onClick={() => changeStep("otp")}>
              Continue with the sample code
            </Button>
          )}
          {step === "otp" && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCode("");
                setError("");
                setMessage(
                  "Sample code prepared again: 123456. No email was sent.",
                );
              }}
            >
              Prepare a new code
            </Button>
          )}
          {step === "login" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => changeStep("recover")}
              >
                I forgot my password
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!email.includes("@")) {
                    setMessage(
                      "Enter your email to continue with a code.",
                    );
                    return;
                  }
                  setPurpose("login");
                  changeStep("otp");
                }}
              >
                Sign in with a code
              </Button>
              {providers.map((provider) => (
                <OAuthButton
                  key={provider}
                  provider={provider}
                  type="button"
                  onClick={() =>
                    setMessage(
                      `Signing in with ${oauthProviders[provider]} requires setting up the provider in your project. This demo does not open an external session.`,
                    )
                  }
                />
              ))}
              <p className={styles.meta}>
                First time here?{" "}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => changeStep("signup")}
                >
                  Create account
                </Button>
              </p>
              {onSetup && (
                <Button type="button" onClick={() => onSetup(identity)}>
                  Set up a new space
                </Button>
              )}
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => changeStep("login")}
            >
              Back to sign-in
            </Button>
          )}
        </form>
      )}
      <p className={styles.meta}>
        Local preview. Use made-up data. There is no authentication, email sending or real password change.
      </p>
    </section>
  );
}
