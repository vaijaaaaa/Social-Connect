import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/utils/constants";

const AVATAR_BUCKET = "avatars";

function getExtension(fileName: string, mimeType: string) {
  const byName = fileName.split(".").pop()?.toLowerCase();
  if (byName && byName.length <= 5) {
    return byName;
  }

  if (mimeType === "image/png") return "png";
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

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only JPEG and PNG images are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 2MB" },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();

    const extension = getExtension(file.name, file.type);
    const filePath = `${user.id}/${Date.now()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(AVATAR_BUCKET)
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
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    let avatarUrl = publicUrlData.publicUrl;

    // If bucket is private, public URL won't resolve. Fall back to a long-lived signed URL.
    try {
      const probeResponse = await fetch(avatarUrl, { method: "HEAD" });
      if (!probeResponse.ok) {
        const { data: signedData, error: signedError } = await admin.storage
          .from(AVATAR_BUCKET)
          .createSignedUrl(filePath, 60 * 60 * 24 * 30);

        if (!signedError && signedData?.signedUrl) {
          avatarUrl = signedData.signedUrl;
        }
      }
    } catch {
      const { data: signedData, error: signedError } = await admin.storage
        .from(AVATAR_BUCKET)
        .createSignedUrl(filePath, 60 * 60 * 24 * 30);

      if (!signedError && signedData?.signedUrl) {
        avatarUrl = signedData.signedUrl;
      }
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (profileError) {
      return NextResponse.json(
        { success: false, message: profileError.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Avatar uploaded successfully",
        avatar_url: avatarUrl,
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
