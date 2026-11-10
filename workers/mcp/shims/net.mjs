// node:net: só isIP, que confere endereço literal antes do fetch.
const V4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
function isV6(text) {
  if (!/^[\da-f:.]+$/i.test(text) || !text.includes(":")) return false;
  let body = text;
  const tail = /:(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (tail) { if (!V4.test(tail[1])) return false; body = text.slice(0, -tail[1].length) + "0:0"; }
  const halves = body.split("::");
  if (halves.length > 2) return false;
  const words = halves.flatMap((h) => (h ? h.split(":") : []));
  if (words.some((w) => !/^[\da-f]{1,4}$/i.test(w))) return false;
  return halves.length === 2 ? words.length < 8 : words.length === 8;
}
export const isIP = (input) => (V4.test(String(input)) ? 4 : isV6(String(input)) ? 6 : 0);
export const isIPv4 = (input) => isIP(input) === 4;
export const isIPv6 = (input) => isIP(input) === 6;
export default { isIP, isIPv4, isIPv6 };
