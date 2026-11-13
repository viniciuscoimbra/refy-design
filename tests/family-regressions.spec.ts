import { expect, test } from "@playwright/test";
import { settleFamily } from "./refy-family-measurements";

const source = process.env.REFY_FAMILY_STORYBOOK_URL ?? `http://127.0.0.1:${process.env.REFY_STORYBOOK_PORT || 6006}`;
const consumer = process.env.REFY_FAMILY_CONSUMER_URL;

async function example(
  page: import("@playwright/test").Page,
  context: string,
  family: string,
  story: string,
  mode: string,
  width: number,
  explicitReduction = false,
) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto(
    context === "consumer"
      ? `${consumer}/?family=${family}&example=${story}&mode=${mode}&theme=refy-site&width=${width}${explicitReduction ? "&motion=reduce" : ""}`
      : `${source}/iframe.html?id=verification-refy-theme--family&viewMode=story&globals=theme:refy-site;mode:${mode}&args=family:${family};specimenWidth:${width};environment:story;story:${story}${explicitReduction ? ";reducedMotion:true" : ""}`,
  );
  const sample = page.locator(
    `[data-refy-specimen="${family}"] [data-demo-ready]`,
  );
  await settleFamily(page, sample);
  return sample;
}

for (const context of ["story", "consumer"])
  for (const mode of ["light"]) {
    test(`Select error/help preserve public ids and consumer descriptions (${context}/${mode})`, async ({
      page,
    }) => {
      test.skip(
        context === "consumer" && !consumer,
        "Requires a genuinely installed package.",
      );
      const sample = await example(
        page,
        context,
        "Select",
        "DescricoesAssociadas",
        mode,
        390,
      );
      const invalid = sample.getByLabel("Role", { exact: true });
      await expect(invalid).toHaveAttribute("id", "select-role");
      await expect(invalid).toHaveAttribute("aria-invalid", "true");
      await expect(invalid).toHaveAttribute(
        "aria-describedby",
        "select-context select-role-help",
      );
      await expect(invalid).toHaveAccessibleDescription(
        "Set the invitee's access permissions. Select an available role.",
      );
      const normal = sample.getByLabel("Market", { exact: true });
      await expect(normal).not.toHaveAttribute("aria-invalid");
      await expect(normal).toHaveAttribute(
        "aria-describedby",
        "select-context select-market-help",
      );
      await expect(normal).toHaveAccessibleDescription(
        "Set the invitee's access permissions. Applied to every new analysis.",
      );
      await normal.selectOption("Portugal");
      await expect(normal).toHaveValue("Portugal");
    });

    for (const motion of [
      { preference: "no-preference", explicit: false },
      { preference: "reduce", explicit: false },
      { preference: "no-preference", explicit: true },
    ] as const)
      // interação: Matrix2x2
      test(`Matrix pointer and keyboard selection preserve structural positioning (${context}/${mode}/${motion.preference}/${motion.explicit ? "explicit" : "system"})`, async ({
        page,
      }) => {
        test.skip(
          context === "consumer" && !consumer,
          "Requires a genuinely installed package.",
        );
        await page.emulateMedia({ reducedMotion: motion.preference });
        for (const width of [390, 800]) {
          const sample = await example(
            page,
            context,
            "Matrix2x2",
            "Selecionavel",
            mode,
            width,
            motion.explicit,
          );
          if (motion.explicit)
            await expect(
              sample.locator("xpath=ancestor::*[@data-refy-scope][1]"),
            ).toHaveAttribute("data-refy-motion", "reduce");
          const points = sample.locator("button[aria-pressed]");
          const first = points.nth(0),
            second = points.nth(1);
          await expect(first).toHaveAttribute("aria-pressed", "false");
          await first.click();
          await expect(first).toHaveAttribute("aria-pressed", "true");
          await expect(sample.locator("code")).not.toHaveText(
            "selecionado: sem seleção",
          );
          await second.focus();
          await second.press("Enter");
          await expect(second).toHaveAttribute("aria-pressed", "true");
          await expect(first).toHaveAttribute("aria-pressed", "false");
        }
      });

    // interação: AppShell
    test(`AppShell navigation persists after responsive drawer closes (${context}/${mode})`, async ({
      page,
    }) => {
      test.skip(
        context === "consumer" && !consumer,
        "Requires a genuinely installed package.",
      );
      for (const width of [390, 800]) {
        const sample = await example(
          page,
          context,
          "AppShell",
          "Completo",
          mode,
          width,
        );
        const provider = sample.locator(
          "xpath=ancestor::*[@data-refy-scope][1]",
        );
        await expect(
          sample.getByRole("heading", { name: "Overview", exact: true }),
        ).toBeVisible();
        const navigation = sample.getByRole("button", {
          name: "Open navigation",
          exact: true,
        });
        if (width === 390) await navigation.click();
        await provider.locator('button[data-tip="Content"]').click();
        await expect(
          sample.getByRole("heading", { name: "Content", exact: true }),
        ).toBeVisible();
        if (width === 390) {
          await expect(provider.getByRole("dialog")).not.toBeVisible();
          await navigation.click();
        }
        await expect(
          provider.locator('button[data-tip="Content"]'),
        ).toHaveAttribute("aria-current", "page");
      }
    });
  }
