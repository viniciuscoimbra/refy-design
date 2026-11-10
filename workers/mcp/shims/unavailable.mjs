// Módulos do Node que o servidor remoto não usa (DNS, socket, zlib): existem para o import
// resolver; chamar qualquer um deles é defeito e falha com a razão escrita.
const missing = (name) => () => { throw Error(`${name} não existe no servidor remoto.`); };
export const lookup = missing("dns.lookup");
export const get = missing("http.get");
export const request = missing("http.request");
export const createServer = missing("http.createServer");
export const deflateSync = missing("zlib.deflateSync");
export const inflateSync = missing("zlib.inflateSync");
export const connect = missing("net.connect");
export default { lookup, get, request, createServer, connect };
