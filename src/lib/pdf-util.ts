import 'server-only';

/**
 * Extracts raw text from a PDF data URI using the classic pdf-parse@1.1.1 API.
 * This is a server-only utility.
 * @param dataUri The base64 encoded PDF data URI.
 * @returns The extracted text content.
 */
export async function extractTextFromPDF(dataUri: string): Promise<string> {
    try {
        console.log("PDF_UTIL: Starting text extraction...");

        // Classic pdf-parse@1.1.1 exports a single function via CommonJS
        // We use require() inside the function to ensure it runs server-side
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');

        // Convert data URI to Buffer
        const base64Content = dataUri.split(',')[1];
        if (!base64Content) {
            throw new Error('Invalid PDF data URI format');
        }

        const buffer = Buffer.from(base64Content, 'base64');
        console.log("PDF_UTIL: Buffer created. Size:", buffer.length, "bytes");

        // Call pdfParse as a function (classic API)
        const data = await pdfParse(buffer);
        console.log("PDF_UTIL: Extraction successful. Extracted", data.text?.length || 0, "characters.");

        return data.text;
    } catch (error: any) {
        console.error('PDF Extraction Error:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}
