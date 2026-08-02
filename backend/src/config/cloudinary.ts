import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath: string, folder = 'faso-elevage'): Promise<string> => {
  if (process.env.NODE_ENV === 'development' && process.env.CLOUDINARY_CLOUD_NAME === 'demo') {
    // Mock en dev si pas de creds
    return `https://picsum.photos/seed/${Date.now()}/600/400`;
  }
  const result = await cloudinary.uploader.upload(filePath, { folder });
  return result.secure_url;
};

export default cloudinary;
