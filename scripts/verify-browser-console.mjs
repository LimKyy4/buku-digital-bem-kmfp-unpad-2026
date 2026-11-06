import { spawn } from 'node:child_process';
import { preview } from 'vite';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4173;
const CDP_PORT = 9222;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBrowserConsoleTest() {
  console.log('[BROWSER TEST] Memulai pengujian live browser console pada Google Chrome Headless...');

  // 1. Jalankan vite preview via JavaScript API
  console.log('[BROWSER TEST] Memulai vite preview server pada port 4173...');
  const previewServer = await preview({
    preview: {
      port: PORT,
      strictPort: true
    }
  });

  const serverUrl = `http://localhost:${PORT}/`;
  console.log(`[BROWSER TEST] Server preview aktif di ${serverUrl}`);

  let chromeProcess;
  try {
    // 2. Jalankan Chrome headless dengan remote debugging
    console.log('[BROWSER TEST] Meluncurkan Chrome headless...');
    chromeProcess = spawn(
      CHROME_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${CDP_PORT}`,
        '--disable-gpu',
        '--no-sandbox',
        '--disable-background-networking',
        serverUrl
      ],
      { stdio: 'ignore' }
    );

    await wait(2000);

    // 3. Ambil target websocket CDP
    const cdpRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    const targets = await cdpRes.json();
    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes(String(PORT)));

    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('Tidak dapat menemukan page target CDP di Chrome.');
    }

    console.log('[BROWSER TEST] Terhubung ke Chrome CDP session...');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    const consoleMessages = [];
    const pageErrors = [];

    await new Promise((resolve, reject) => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
        resolve();
      };
      ws.onerror = reject;
    });

    ws.onmessage = event => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Runtime.consoleAPICalled') {
          const type = msg.params.type;
          const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
          consoleMessages.push({ type, text });
          if (type === 'error') {
            pageErrors.push(text);
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          const details = msg.params.exceptionDetails;
          const text = details.exception?.description || details.text;
          pageErrors.push(text);
        }
      } catch {
        // ignore
      }
    };

    // Tunggu 4 detik untuk eksekusi DOM, Preloader, dan FlipbookEngine
    console.log('[BROWSER TEST] Menunggu 4 detik untuk eksekusi DOM, Preloader, dan FlipbookEngine...');
    await wait(4000);

    // Evaluasi status DOM
    const evalRes = await new Promise(resolve => {
      const evalId = 100;
      const handler = event => {
        const msg = JSON.parse(event.data);
        if (msg.id === evalId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result?.result?.value);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(
        JSON.stringify({
          id: evalId,
          method: 'Runtime.evaluate',
          params: {
            expression: `({
              title: document.title,
              bookContainer: Boolean(document.getElementById('book-container')),
              pagesRendered: document.querySelectorAll('.st-page').length,
              preloaderHidden: document.getElementById('preloader')?.style.display === 'none' || document.getElementById('preloader')?.classList.contains('opacity-0'),
              pageIndicator: document.getElementById('ctrl-page-indicator')?.textContent,
              floatingDock: Boolean(document.getElementById('floating-dock')),
              tocRows: document.querySelectorAll('.toc-row').length
            })`,
            returnByValue: true
          }
        })
      );
    });

    console.log('\n========================================');
    console.log('STATUS APLIKASI DI PERAMBAN NYATA:');
    console.log('----------------------------------------');
    console.log('Judul Dokumen     :', evalRes?.title);
    console.log('Kontainer Buku    :', evalRes?.bookContainer ? 'ADA' : 'TIDAK');
    console.log('Jumlah Lembaran   :', evalRes?.pagesRendered, 'halaman');
    console.log('Preloader Tuntas  :', evalRes?.preloaderHidden ? 'YA (Tersembunyi)' : 'BELUM');
    console.log('Indikator Halaman :', evalRes?.pageIndicator);
    console.log('Floating Toolbar  :', evalRes?.floatingDock ? 'AKTIF' : 'TIDAK');
    console.log('Baris Bab di TOC  :', evalRes?.tocRows, 'bab');
    console.log('========================================\n');

    console.log('[CONSOLE LOGS PERAMBAN]');
    if (consoleMessages.length === 0) {
      console.log('Tidak ada log console.');
    } else {
      consoleMessages.forEach(m => {
        console.log(`[${m.type.toUpperCase()}] ${m.text}`);
      });
    }

    ws.close();
    if (chromeProcess) chromeProcess.kill();
    previewServer.httpServer.close();

    if (pageErrors.length > 0) {
      console.error('\n[ERROR] Ditemukan error di browser console:');
      pageErrors.forEach(err => console.error(' -', err));
      process.exit(1);
    } else {
      console.log('\n[SUCCESS] Browser console 100% BERSIH tanpa error atau exception!');
      process.exit(0);
    }
  } catch (err) {
    console.error('[BROWSER TEST FAILED]', err.message);
    if (chromeProcess) chromeProcess.kill();
    try { previewServer.httpServer.close(); } catch {}
    process.exit(1);
  }
}

runBrowserConsoleTest();
