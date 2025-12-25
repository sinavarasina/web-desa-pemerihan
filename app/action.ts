"use server";
import { minioClient, BUCKET_NAME } from "@/libs/minio";

// ACTION 1: Mendapatkan URL Izin Upload
export async function getPresignedUploadUrl(
  originalName: string,
  type: string,
) {
  try {
    // Pastikan bucket ada (Auto create jika belum ada - opsional)
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    }

    // Buat nama file unik agar tidak tertimpa
    const objectName = `${Date.now()}-${originalName.replace(/\s/g, "-")}`;

    // URL valid 5 menit
    const expiry = 5 * 60;

    const presignedUrl = await minioClient.presignedPutObject(
      BUCKET_NAME,
      objectName,
      expiry,
    );

    return { success: true, url: presignedUrl, objectName };
  } catch (error) {
    console.error("Minio Error:", error);
    return { success: false, error: "Gagal generate URL" };
  }
}
