// Fotos verkleinern: spart Speicher und Datenvolumen bei der Erkennung.
async function scaleTo(file: Blob, maxSide: number, quality: number): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Bild konnte nicht umgewandelt werden.'))), 'image/jpeg', quality),
  );
}

export async function preparePhoto(file: Blob): Promise<{ full: Blob; thumb: Blob }> {
  const [full, thumb] = await Promise.all([scaleTo(file, 1600, 0.86), scaleTo(file, 480, 0.8)]);
  return { full, thumb };
}
