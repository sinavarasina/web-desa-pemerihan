'use server'

import { minioClient, BUCKET_NAME } from '@/libs/minio';
import prisma from '@/libs/prisma';
import { revalidatePath } from 'next/cache';

// ACTION 1: Mendapatkan URL Izin Upload
export async function getPresignedUploadUrl(originalName: string, type: string) {
  try {
    // Pastikan bucket ada (Auto create jika belum ada - opsional)
    const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    }

    // Buat nama file unik agar tidak tertimpa
    const objectName = `${Date.now()}-${originalName.replace(/\s/g, '-')}`;

    // URL valid 5 menit
    const expiry = 5 * 60;

    const presignedUrl = await minioClient.presignedPutObject(
      BUCKET_NAME,
      objectName,
      expiry
    );

    return { success: true, url: presignedUrl, objectName };
  } catch (error) {
    console.error('Minio Error:', error);
    return { success: false, error: 'Gagal generate URL' };
  }
}

// ACTION 2: Simpan Metadata ke Database (Setelah Upload Sukses)
// export async function saveFileToDatabase(data: {
//   objectName: string;
//   originalName: string;
//   mimeType: string;
//   size: number;
// }) {
//   try {
//     // SECURITY CHECK: Cek ke Minio apakah file BENAR-BENAR ada?
//     // Ini mencegah user mengirim request palsu ke DB tanpa upload file
//     try {
//       await minioClient.statObject(BUCKET_NAME, data.objectName);
//     } catch (err) {
//       return { success: false, error: 'File tidak ditemukan di storage server.' };
//     }
//
//     // Simpan ke DB
//     await prisma.article.create({
//       data: {
//         objectName: data.objectName,
//         originalName: data.originalName,
//         mimeType: data.mimeType,
//         size: data.size,
//       },
//     });
//
//     // Refresh halaman agar gambar baru langsung muncul
//     revalidatePath('/');
//
//     return { success: true };
//   } catch (error) {
//     console.error('DB Error:', error);
//     return { success: false, error: 'Gagal menyimpan data.' };
//   }
// }
