async function checkPreview() {
  try {
    const res = await fetch('http://localhost:3000/');
    console.log('HTTP Status:', res.status);
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log('HTML Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
    const ogTitleMatch = html.match(/property="og:title" content="(.*?)"/);
    console.log('OG Title:', ogTitleMatch ? ogTitleMatch[1] : 'NOT FOUND');
    console.log('Contains #book-container:', html.includes('id="book-container"'));
    console.log('Contains #hotspots-layer:', html.includes('id="hotspots-layer"'));
    console.log('Contains #controls-container:', html.includes('id="controls-container"'));
    console.log('Contains #toc-container:', html.includes('id="toc-container"'));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

checkPreview();
