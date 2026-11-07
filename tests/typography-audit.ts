/** Finds accidental clipping; ellipses and real scroll containers remain deliberate UI choices. */
export function typographyIssues(root: HTMLElement) {
  const issues: { component: string; text: string; reason: string }[] = [];
  const family = (value: string) => value.split(',')[0].trim().replaceAll('"', '').replaceAll("'", '');
  const ancestorsOf = (element: HTMLElement) => {
    const ancestors: HTMLElement[] = [];
    for (let el: HTMLElement | null = element; el; el = el.parentElement) ancestors.push(el);
    return ancestors;
  };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent?.trim(); const parent = node.parentElement;
    if (!text || !parent || parent.closest('svg,script,style,[hidden],[aria-hidden="true"]')) continue;
    const style = getComputedStyle(parent);
    const allowed = new Set(['--font-body', '--font-heading', '--font-mono'].map(name => family(style.getPropertyValue(name))));
    if (ancestorsOf(parent).some(el => { const s = getComputedStyle(el); return s.clip !== 'auto' || s.clipPath !== 'none'; })) continue;
    if (style.visibility === 'hidden' || style.opacity === '0' || !parent.getClientRects().length) continue;
    const component = parent.closest('[data-component]')?.getAttribute('data-component') ?? root.getAttribute('aria-label') ?? 'page';
    const report = (reason: string) => issues.push({ component, text: text.slice(0, 70), reason });
    // Google sign-in keeps its vendor brand typography unless auth-control-font is customized.
    if (!parent.closest('[data-refy-auth-provider="google"]') && !allowed.has(family(style.fontFamily))) report(`família fora do conjunto: ${style.fontFamily}`);
    const range = document.createRange(); range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      let ancestor: HTMLElement | null = parent;
      while (ancestor && root.contains(ancestor)) {
        const s = getComputedStyle(ancestor), box = ancestor.getBoundingClientRect();
        if (s.visibility === 'hidden' || s.opacity === '0') break;
        if (/(auto|scroll)/.test(s.overflowY) && ancestor.scrollHeight > ancestor.clientHeight + 1) break;
        if (parseInt(s.webkitLineClamp, 10) > 0) break;
        if (/(hidden|clip)/.test(s.overflowY) && (rect.top < box.top + parseFloat(s.borderTopWidth) - 1 || rect.bottom > box.bottom - parseFloat(s.borderBottomWidth) + 1)) {
          report(`corte vertical em ${ancestor.tagName}.${ancestor.className}`); break;
        }
        if (/(auto|scroll)/.test(s.overflowX) && ancestor.scrollWidth > ancestor.clientWidth + 1) break;
        if (s.textOverflow === 'ellipsis') break;
        if (/(hidden|clip)/.test(s.overflowX) && (rect.left < box.left - 1 || rect.right > box.right + 1)) {
          report(`corte horizontal em ${ancestor.tagName}.${ancestor.className}`); break;
        }
        // Floating layers escape overflow when their fixed containing block is the viewport.
        if (s.position === 'fixed' && !ancestorsOf(ancestor).slice(1).some(el => { const c = getComputedStyle(el); return c.transform !== 'none' || c.filter !== 'none' || /paint|layout/.test(c.contain); })) break;
        ancestor = ancestor.parentElement;
      }
    }
  }
  return issues.filter((issue, index, all) => all.findIndex(item => item.component === issue.component && item.text === issue.text && item.reason === issue.reason) === index);
}
