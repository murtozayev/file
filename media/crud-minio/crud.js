import { bucketName } from "../bucket/bucket.js";
import minioClient from "../cloud.js";

export const createMiniMedia = async (filePath, objectName) => {
  try {
    await minioClient.fPutObject(bucketName, objectName, filePath);
    console.log(`Fayl yuklandi ${objectName}`);
  } catch (error) {
    console.log(error);
  }
};

export const getFileUrl = async () => {
  try {
    const url = await minioClient.presignedUrl(
      "GET",
      bucketName,
      "",
      86400
    );

    return { url };
  } catch (error) {
    console.log(error);
  }
};

export async function updateFile(filePath, objectName) {
  try {
    await minioClient.fPutObject(bucketName, objectName, filePath);
    console.log(`Fayl yangilandi: ${objectName}`);
  } catch (error) {
    console.error("Faylni yangilashda xatolik:", error);
  }
}

export async function deleteFile(objectName) {
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.log(`Fayl o‘chirildi: ${objectName}`);
  } catch (error) {
    console.error("Faylni o‘chirishda xatolik:", error);
  }
}
