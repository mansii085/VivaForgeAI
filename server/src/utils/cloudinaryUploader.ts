import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream
 * @param fileBuffer The raw binary buffer of the file
 * @param folder The target folder in Cloudinary (e.g. 'resumes')
 * @param resourceType The resource type (default 'raw' for PDFs and docs)
 * @returns The secure URL string of the uploaded file
 */
export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' | 'raw' | 'auto' = 'raw',
  filename?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `vivaforge/${folder}`,
      resource_type: resourceType,
      public_id: filename,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload returned null result'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};
