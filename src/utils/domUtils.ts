/**
 * Utilitas Manipulasi dan Rendering DOM Berkinerja Tinggi
 * Menggunakan DocumentFragment dan innerHTML terisolasi untuk meminimalkan
 * layout thrashing dan reflow DOM pada transisi antarmuka.
 */

/**
 * Mengonversi string HTML menjadi DocumentFragment untuk injeksi DOM cepat
 */
export function createFragmentFromHTML(htmlString: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = htmlString.trim();
  return template.content;
}

/**
 * Membersihkan dan menyisipkan konten HTML secara efisien ke dalam kontainer
 */
export function replaceContent(container: HTMLElement, htmlString: string): void {
  const fragment = createFragmentFromHTML(htmlString);
  container.innerHTML = '';
  container.appendChild(fragment);
}

/**
 * Melakukan escaping karakter khusus string agar aman dari injeksi XSS
 */
export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Menambahkan beberapa kelas CSS sekaligus secara aman
 */
export function addClasses(element: HTMLElement, ...classNames: string[]): void {
  for (const cls of classNames) {
    if (cls) {
      element.classList.add(cls);
    }
  }
}

/**
 * Menghapus beberapa kelas CSS sekaligus secara aman
 */
export function removeClasses(element: HTMLElement, ...classNames: string[]): void {
  for (const cls of classNames) {
    if (cls) {
      element.classList.remove(cls);
    }
  }
}
