export default function resolveImage(img) {
  if (!img) return null;

  // If image is already absolute (Cloudinary, external)
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }

  // Otherwise, attach backend URL
  return `${import.meta.env.VITE_BACKEND_URL}/${img.replace(/^\/?/, "")}`;
}
