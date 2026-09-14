/**
 * Pluggable OCR hook for the document vault.
 *
 * Today this is a stub: it does not call any external OCR service, so it always
 * returns an empty extraction and the user fills in the expiry date, issuer, and
 * reference number themselves on the review screen (see AddDocumentScreen.tsx).
 * The document vault, its expiry-reminder sync, and the review UI all work today
 * without this being wired up — nothing is faked.
 *
 * To turn on real auto-fill, replace the body of `extractDocumentFields` with a
 * call to a real provider (e.g. Google Cloud Vision, AWS Textract, an on-device
 * ML Kit text recognizer) and map its response onto the same return shape.
 */

export type DocumentType = 'INSURANCE' | 'LICENSE' | 'REGISTRATION' | 'EMISSION' | 'OTHER';

export interface ExtractedFields {
  expiry?: string | null; // YYYY-MM-DD
  issuer?: string | null;
  referenceNumber?: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function extractDocumentFields(fileData: string, type: DocumentType): Promise<ExtractedFields> {
  return {};
}
