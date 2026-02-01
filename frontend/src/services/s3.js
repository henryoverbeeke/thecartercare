import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { awsConfig } from '../config/aws-config';

let s3Client = null;

export const initS3 = (credentials) => {
  s3Client = new S3Client({
    region: awsConfig.region,
    credentials: credentials,
  });
};

export const uploadPhoto = async (userId, file, progressId, onProgress) => {
  const fileExtension = file.name.split('.').pop();
  const key = `progress/${userId}/${progressId}.${fileExtension}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: awsConfig.s3Bucket,
      Key: key,
      Body: file,
      ContentType: file.type,
    },
  });

  upload.on('httpUploadProgress', (progress) => {
    if (onProgress) {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      onProgress(percentage);
    }
  });

  await upload.done();

  // Return the S3 key instead of direct URL - we'll generate signed URLs when needed
  return key;
};

export const getSignedPhotoUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: awsConfig.s3Bucket,
    Key: key,
  });

  // Generate a signed URL that expires in 1 hour
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return signedUrl;
};

export const deletePhoto = async (photoKey) => {
  // Handle both old URL format and new key format
  const key = photoKey.includes('amazonaws.com/') 
    ? photoKey.split('.amazonaws.com/')[1]
    : photoKey;

  const command = new DeleteObjectCommand({
    Bucket: awsConfig.s3Bucket,
    Key: key,
  });

  return s3Client.send(command);
};
