export type FileLimitConfig = {
  maxImageSizeInBytes: number;
  maxPdfSizeInBytes: number;
  allowedImageMimeTypes: string[];
};

export const fileLimitConfig: FileLimitConfig = {
  maxImageSizeInBytes: 5 * 1024 * 1024,
  maxPdfSizeInBytes: 10 * 1024 * 1024,
  allowedImageMimeTypes: ["image/jpeg", "image/png", "image/webp"],
};
