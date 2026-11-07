const stacks = new WeakMap<Document, { elements: HTMLElement[]; inert: Map<HTMLElement, boolean>; overflow: string }>();
export const dialogEvent = "refy:dialog-change";

export function activeDialog(doc: Document, owner?: HTMLElement | null) {
  const scope = owner?.closest("[data-refy-scope]");
  return [...(stacks.get(doc)?.elements ?? [])].reverse().find(el => !owner || el.closest("[data-refy-scope]") === scope) ?? null;
}

/** Restore host state before recomputing modality for the current topmost dialog. */
export function registerDialog(element: HTMLElement) {
  const doc = element.ownerDocument;
  let state = stacks.get(doc);
  if (!state) {
    state = { elements: [], inert: new Map(), overflow: doc.body.style.overflow };
    stacks.set(doc, state);
  }
  const current = state;
  function update() {
    for (const [el, previous] of current.inert) el.inert = previous;
    current.inert.clear();
    let branch = current.elements[current.elements.length - 1];
    while (branch && branch !== doc.body) {
      for (const sibling of branch.parentElement?.children ?? []) {
        if (sibling === branch || !(sibling instanceof HTMLElement) || sibling.hasAttribute("data-refy-scrim")) continue;
        current.inert.set(sibling, sibling.inert);
        sibling.inert = true;
      }
      branch = branch.parentElement!;
    }
    doc.body.style.overflow = current.elements.length ? "hidden" : current.overflow;
    doc.dispatchEvent(new Event(dialogEvent));
  }
  current.elements.push(element);
  update();
  return () => {
    const index = current.elements.indexOf(element);
    if (index >= 0) current.elements.splice(index, 1);
    update();
    if (!current.elements.length) stacks.delete(doc);
  };
}
