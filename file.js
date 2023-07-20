/**
 * Reads a file.
 * @param file {File}
 * @param binary {boolean} Read in binary mode?
 */
export async function readFile(file, binary = false) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('error', reject);
    reader.addEventListener('load', () => {
      resolve(reader.result);
    });

    if (binary) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

/**
 * Creates a browser download.
 * @param data {string}
 * @param filename {string}
 * @param mimeType {string}
 */
export function saveFile(data, filename, mimeType) {
  const download = document.createElement('a');

  download.setAttribute(
    'href',
    `data:${mimeType};charset='utf-8', ${encodeURIComponent(data)}`
  );
  download.setAttribute('download', filename);
  document.body.appendChild(download);
  download.click();
  document.body.removeChild(download);
}
