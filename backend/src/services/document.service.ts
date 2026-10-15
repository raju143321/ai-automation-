import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as xlsx from 'xlsx';
import { Document, DocumentChunk } from '../shared/index.js';
import { db } from '../lib/db.js';
import { env } from '../config/env.js';

export interface ProcessedDocumentResult {
  document: Document;
  chunks: DocumentChunk[];
}

export class DocumentService {
  private uploadsDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  public async processUploadedFile(
    projectId: string,
    userId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    }
  ): Promise<ProcessedDocumentResult> {
    // 1. Validation
    if (file.size > env.MAX_UPLOAD_BYTES) {
      throw new Error(`File exceeds maximum permitted size of ${env.MAX_UPLOAD_BYTES / (1024 * 1024)}MB`);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx'];
    if (!allowedExts.includes(ext)) {
      throw new Error(`Unsupported file extension: ${ext}. Supported formats: PDF, DOCX, TXT, MD, CSV, XLSX.`);
    }

    // 2. Compute SHA-256 Checksum
    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // 3. Save to disk storage
    const storageFilename = `${uuidv4()}${ext}`;
    const storagePath = path.join(this.uploadsDir, storageFilename);
    fs.writeFileSync(storagePath, file.buffer);

    // 4. Initial Document Record
    const documentId = uuidv4();
    const document: Document = {
      id: documentId,
      project_id: projectId,
      source_id: null,
      uploaded_by: userId,
      original_filename: file.originalname,
      storage_path: storagePath,
      mime_type: file.mimetype || 'application/octet-stream',
      file_size_bytes: file.size,
      file_hash: hash,
      page_count: 1,
      processing_status: 'processing',
      processing_error_code: null,
      processing_error_message: null,
      extracted_text_length: 0,
      processing_started_at: new Date().toISOString(),
      processing_completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.addDocument(document);

    // 5. Text Extraction based on format
    let extractedText = '';
    let pageCount = 1;

    try {
      if (ext === '.pdf') {
        const parsed = await pdfParse(file.buffer);
        extractedText = parsed.text || '';
        pageCount = parsed.numpages || 1;
      } else if (ext === '.docx') {
        const parsed = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = parsed.value || '';
        pageCount = Math.max(1, Math.ceil(extractedText.length / 3000));
      } else if (ext === '.xlsx') {
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetNames = workbook.SheetNames;
        const textParts: string[] = [];
        for (const name of sheetNames) {
          const sheet = workbook.Sheets[name];
          const csvText = xlsx.utils.sheet_to_csv(sheet);
          textParts.push(`--- Sheet: ${name} ---\n${csvText}`);
        }
        extractedText = textParts.join('\n\n');
        pageCount = sheetNames.length;
      } else if (ext === '.csv' || ext === '.txt' || ext === '.md') {
        extractedText = file.buffer.toString('utf-8');
        pageCount = Math.max(1, Math.ceil(extractedText.length / 3000));
      }

      // Check max extracted characters limit
      if (extractedText.length > env.MAX_EXTRACTED_CHARACTERS) {
        extractedText = extractedText.slice(0, env.MAX_EXTRACTED_CHARACTERS);
      }

      // 6. Chunking
      const chunks = this.chunkText(documentId, projectId, extractedText, pageCount);

      // 7. Update document status to completed
      document.processing_status = 'completed';
      document.extracted_text_length = extractedText.length;
      document.page_count = pageCount;
      document.processing_completed_at = new Date().toISOString();
      document.updated_at = new Date().toISOString();

      db.save();
      db.addChunks(chunks);

      return { document, chunks };
    } catch (err) {
      document.processing_status = 'failed';
      document.processing_error_code = 'PARSER_ERROR';
      document.processing_error_message = (err as Error).message;
      document.updated_at = new Date().toISOString();
      db.save();
      throw err;
    }
  }

  private chunkText(documentId: string, projectId: string, text: string, totalPages: number): DocumentChunk[] {
    const cleanText = text.replace(/\r\n/g, '\n').trim();
    if (!cleanText) return [];

    const CHUNK_SIZE = 800; // characters per chunk
    const OVERLAP = 100;
    const chunks: DocumentChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    const charsPerPage = Math.max(1, Math.floor(cleanText.length / totalPages));

    while (start < cleanText.length) {
      const end = Math.min(start + CHUNK_SIZE, cleanText.length);
      const content = cleanText.slice(start, end).trim();

      if (content.length > 20) {
        const estimatedPage = Math.min(totalPages, Math.floor(start / charsPerPage) + 1);
        const chunkHash = crypto.createHash('md5').update(content).digest('hex');

        chunks.push({
          id: uuidv4(),
          document_id: documentId,
          project_id: projectId,
          chunk_index: chunkIndex++,
          page_number: estimatedPage,
          start_offset: start,
          end_offset: end,
          content,
          content_hash: chunkHash,
          token_count: Math.ceil(content.length / 4),
          metadata: {},
          created_at: new Date().toISOString()
        });
      }

      start += (CHUNK_SIZE - OVERLAP);
    }

    return chunks;
  }
}

export const documentService = new DocumentService();
