import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const POST_IMAGE_BUCKET = "post-images";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

function getExtension(fileName: string, mimeType: string) {
  const byName = fileName.split(".").pop()?.toLowerCase();
  if (byName && byName.length <= 5) {
    return byName;
  }

  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: Request) {
  try {
    const { user, unauthorized } = await requireAuth();
    if (unauthorized) {
      return unauthorized;
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Image file is required" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 10MB" },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();
    const extension = getExtension(file.name, file.type);
    const filePath = `${user.id}/${Date.now()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(POST_IMAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, message: uploadError.message },
        { status: 400 },
      );
    }

    const { data: publicUrlData } = admin.storage
      .from(POST_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    let imageUrl = publicUrlData.publicUrl;

    // Fallback for private buckets.
    try {
      const probeResponse = await fetch(imageUrl, { method: "HEAD" });
      if (!probeResponse.ok) {
        const { data: signedData, error: signedError } = await admin.storage
          .from(POST_IMAGE_BUCKET)
          .createSignedUrl(filePath, 60 * 60 * 24 * 30);

        if (!signedError && signedData?.signedUrl) {
          imageUrl = signedData.signedUrl;
        }
      }
    } catch {
      const { data: signedData, error: signedError } = await admin.storage
        .from(POST_IMAGE_BUCKET)
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);

      if (!signedError && signedData?.signedUrl) {
        imageUrl = signedData.signedUrl;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        image_url: imageUrl,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
