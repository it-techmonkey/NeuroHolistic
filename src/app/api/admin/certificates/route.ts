import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes, randomUUID } from 'crypto';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import getR2Client, { R2_BUCKET_NAME } from '@/lib/r2/client';

type QrPosition = 'cma-logo-left' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
const DEFAULT_QR_POSITION: QrPosition = 'cma-logo-left';
const DEFAULT_QR_SIZE = 54;

async function requireAdmin() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: userData } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user };
}

function getFileExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : 'pdf';
}

function normalizeCertificateNumber(value: string) {
  return value.trim().replace(/\s+/g, '-');
}

function getPdfQrCoordinates(
  pageWidth: number,
  pageHeight: number,
  qrSize: number,
  margin: number,
  position: QrPosition
) {
  const left = margin;
  const right = pageWidth - qrSize - margin;
  const bottom = margin;
  const top = pageHeight - qrSize - margin;

  switch (position) {
    case 'cma-logo-left':
      return {
        x: pageWidth - (pageWidth * 0.29) - qrSize,
        y: pageHeight * 0.16,
      };
    case 'bottom-left':
      return { x: left, y: bottom };
    case 'top-left':
      return { x: left, y: top };
    case 'top-right':
      return { x: right, y: top };
    case 'bottom-right':
    default:
      return { x: right, y: bottom };
  }
}

async function stampPdfCertificate(
  fileBuffer: Buffer,
  verificationUrl: string,
  position: QrPosition,
  qrSize: number
) {
  const pdf = await PDFDocument.load(fileBuffer);
  const [firstPage] = pdf.getPages();
  if (!firstPage) {
    throw new Error('PDF has no pages');
  }

  const qrPng = await QRCode.toBuffer(verificationUrl, {
    type: 'png',
    width: 720,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
  const qrImage = await pdf.embedPng(qrPng);
  const { width, height } = firstPage.getSize();
  const margin = Math.max(24, Math.round(qrSize * 0.35));
  const padding = Math.round(qrSize * 0.045);
  const { x, y } = getPdfQrCoordinates(width, height, qrSize, margin, position);

  firstPage.drawRectangle({
    x: x - padding,
    y: y - padding,
    width: qrSize + padding * 2,
    height: qrSize + padding * 2,
    color: rgb(1, 1, 1),
  });
  firstPage.drawImage(qrImage, {
    x,
    y,
    width: qrSize,
    height: qrSize,
  });

  return Buffer.from(await pdf.save());
}

async function stampImageCertificate(
  fileBuffer: Buffer,
  verificationUrl: string,
  position: QrPosition,
  qrSize: number
) {
  const image = sharp(fileBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || 1200;
  const height = metadata.height || Math.round(width * 0.7);
  const scale = Math.max(width / 900, 1);
  const qrPixelSize = Math.round(qrSize * scale);
  const padding = Math.max(4, Math.round(qrPixelSize * 0.045));
  const margin = Math.max(24, Math.round(qrPixelSize * 0.35));
  const qrPng = await QRCode.toBuffer(verificationUrl, {
    type: 'png',
    width: qrPixelSize,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
  const framedQr = await sharp({
    create: {
      width: qrPixelSize + padding * 2,
      height: qrPixelSize + padding * 2,
      channels: 4,
      background: '#ffffff',
    },
  })
    .composite([{ input: qrPng, left: padding, top: padding }])
    .png()
    .toBuffer();

  const framedSize = qrPixelSize + padding * 2;
  const isCmaLogoLeft = position === 'cma-logo-left';
  const left = isCmaLogoLeft
    ? Math.round(width - (width * 0.29) - framedSize)
    : position.endsWith('left')
      ? margin
      : width - framedSize - margin;
  const top = isCmaLogoLeft
    ? Math.round(height - (height * 0.16) - framedSize)
    : position.startsWith('top')
      ? margin
      : height - framedSize - margin;

  return image
    .composite([{ input: framedQr, left: Math.max(0, left), top: Math.max(0, top) }])
    .toBuffer();
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const supabase = getServiceSupabase();
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = Array.from(new Set((certificates ?? []).map(c => c.user_id).filter(Boolean)));
    const usersById = new Map<string, any>();

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds);

      (users ?? []).forEach(user => usersById.set(user.id, user));
    }

    const origin = request.nextUrl.origin;
    return NextResponse.json({
      certificates: (certificates ?? []).map(c => ({
        ...c,
        verification_url: `${origin}/certificates/${c.qr_token}`,
        user: c.user_id ? usersById.get(c.user_id) ?? null : null,
      })),
    });
  } catch (error) {
    console.error('[Admin Certificates GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = String(formData.get('title') || '').trim();
    const certificateNumber = normalizeCertificateNumber(String(formData.get('certificateNumber') || ''));
    const userId = String(formData.get('userId') || '').trim() || null;
    const recipientName = String(formData.get('recipientName') || '').trim() || null;
    const recipientEmail = String(formData.get('recipientEmail') || '').trim() || null;
    const issuedAt = String(formData.get('issuedAt') || '').trim() || null;
    const qrPosition = DEFAULT_QR_POSITION;
    const qrSize = DEFAULT_QR_SIZE;

    if (!file || !title || !certificateNumber) {
      return NextResponse.json({ error: 'File, title, and certificate number are required' }, { status: 400 });
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF, PNG, JPG, or WebP certificates are supported' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    if (userId) {
      const { data: targetUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!targetUser) {
        return NextResponse.json({ error: 'Selected user was not found' }, { status: 404 });
      }
    }

    const qrToken = randomBytes(24).toString('base64url');
    const verificationUrl = `${request.nextUrl.origin}/certificates/${qrToken}`;
    const extension = getFileExtension(file.name);
    const fileKey = `certificates/${userId || 'unassigned'}/${certificateNumber}-${randomUUID()}.${extension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === 'application/pdf' || extension === 'pdf';
    const stampedBuffer = isPdf
      ? await stampPdfCertificate(fileBuffer, verificationUrl, qrPosition, qrSize)
      : await stampImageCertificate(fileBuffer, verificationUrl, qrPosition, qrSize);

    await getR2Client().send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      Body: stampedBuffer,
      ContentType: file.type || 'application/pdf',
      Metadata: {
        uploadedBy: admin.user!.id,
        certificateNumber,
      },
    }));

    const { data: certificate, error } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        uploaded_by: admin.user!.id,
        certificate_number: certificateNumber,
        title,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        issued_at: issuedAt || null,
        file_key: fileKey,
        file_name: file.name,
        file_size: stampedBuffer.length,
        qr_token: qrToken,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      certificate: {
        ...certificate,
        verification_url: verificationUrl,
      },
    });
  } catch (error) {
    console.error('[Admin Certificates POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
