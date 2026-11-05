/**
 * Algoritma Natural Sorting untuk mengurutkan nama berkas secara logis.
 * Mampu menangani penamaan acak, variasi angka, tanda kurung Canva, dan spasi:
 * Contoh: ['slide 1.png', 'slide 10.png', 'slide 2.png'] -> ['slide 1.png', 'slide 2.png', 'slide 10.png']
 */
export function naturalSort(fileList) {
  return [...fileList].sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  });
}
