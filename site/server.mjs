import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt':'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = pathname === '/' || pathname === '/tft' || pathname === '/tft/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const path = resolve(root, relative);
    if (!path.startsWith(root + sep) || relative.startsWith('.') || relative.startsWith('tools/')) { res.writeHead(403); res.end('Forbidden'); return; }
    const fileStat = await stat(path);
    if (!fileStat.isFile()) throw new Error('Not a file');
    if(extname(path)==='.mp4'){
      const headers={'Content-Type':'video/mp4','Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
      let start=0,end=fileStat.size-1,status=200;
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!match||(!match[1]&&!match[2])){res.writeHead(416,{...headers,'Content-Range':`bytes */${fileStat.size}`});res.end();return;}
        start=match[1]?Number(match[1]):Math.max(0,fileStat.size-Number(match[2]));
        end=match[1]&&match[2]?Math.min(Number(match[2]),end):end;
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=fileStat.size){res.writeHead(416,{...headers,'Content-Range':`bytes */${fileStat.size}`});res.end();return;}
        status=206;headers['Content-Range']=`bytes ${start}-${end}/${fileStat.size}`;
      }
      res.writeHead(status,{...headers,'Content-Length':end-start+1});
      if(req.method==='HEAD'){res.end();return;}
      const stream=createReadStream(path,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);return;
    }
    const bytes = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'Content-Length': bytes.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Page not found. This local reference contains only /tft.'); }
});
server.listen(port, '127.0.0.1', () => console.log(`PokeChess Helper — referência local: http://127.0.0.1:${server.address().port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
