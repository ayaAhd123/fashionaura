const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Recadre une image via canvas (utilisé avec react-easy-crop).
 * @param {string} imageSrc
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop
 * @param {string} fileName
 * @param {number} [outputWidth]
 * @param {number} [outputHeight]
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  fileName = "cropped.jpg",
  outputWidth = pixelCrop.width,
  outputHeight = pixelCrop.height,
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], fileName, {
          type: blob.type || "image/jpeg",
        });
        resolve({ file, previewUrl: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.92,
    );
  });
}

export const CROP_PRESETS = {
  logo: {
    aspect: 1,
    outputWidth: 400,
    outputHeight: 400,
    cropShape: "round",
    label: "Logo",
  },
  banner: {
    aspect: 16 / 9,
    outputWidth: 1200,
    outputHeight: 675,
    cropShape: "rect",
    label: "Bannière",
  },
};
