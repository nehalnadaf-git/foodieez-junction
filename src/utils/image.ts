/**
 * Converts an image File to a base64 data URL.
 */
export function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unable to read file"));
        return;
      }

      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("Unable to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates menu image file size and MIME type.
 * Returns null for valid files, or an error message string for invalid files.
 */
export function validateImageFile(file: File): string | null {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowed.includes(file.type)) {
    return "Only JPG, PNG and WEBP images are allowed";
  }

  const maxBytes = 2 * 1024 * 1024;
  if (file.size > maxBytes) {
    return "Image must be under 2MB";
  }

  return null;
}

/**
 * Returns true when a string is a base64 image data URL.
 */
export function isBase64Image(src: string): boolean {
  return /^data:image\/(png|jpe?g|webp);base64,/i.test(src.trim());
}

/**
 * Returns true when a string is a valid HTTPS image URL.
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }

    return /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(parsed.pathname + parsed.search);
  } catch {
    return false;
  }
}
