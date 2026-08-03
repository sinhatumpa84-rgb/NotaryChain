/**
 * Document Service - Uses Supabase Storage for files
 */
import { supabase, DocumentRow, DocumentInsert, DocumentUpdate, DocumentVersionInsert } from '@/lib/supabase';

export interface DocumentUploadResult {
  id: string;
  fileUrl: string;
  filePath: string;
}

export interface SignedUrlResult {
  signedUrl: string;
  expiresAt: Date;
}

const DOCUMENTS_BUCKET = 'documents';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'image/jpeg',
  'image/png',
];

class DocumentService {
  /**
   * Upload document to Supabase Storage
   */
  async uploadDocument(
    file: File,
    metadata: {
      uploadedBy: string;
      companyId?: string;
      documentType: string;
      documentName: string;
      documentNumber?: string;
    }
  ): Promise<DocumentUploadResult> {
    // Validate file
    this.validateFile(file);

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${metadata.uploadedBy}/${timestamp}_${sanitizedName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(DOCUMENTS_BUCKET)
      .getPublicUrl(filePath);

    // Create document record in database
    const documentInsert: DocumentInsert = {
      uploaded_by: metadata.uploadedBy,
      company_id: metadata.companyId,
      document_type: metadata.documentType,
      document_name: metadata.documentName,
      document_number: metadata.documentNumber,
      file_url: urlData.publicUrl,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      status: 'uploaded',
      is_encrypted: false,
      is_signed: false,
      uploaded_at: new Date().toISOString(),
      metadata: {
        original_filename: file.name,
        uploaded_at: new Date().toISOString(),
      },
    };

    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert(documentInsert)
      .select()
      .single();

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([filePath]);
      throw new Error(`Failed to create document record: ${dbError.message}`);
    }

    return {
      id: document.id,
      fileUrl: document.file_url,
      filePath: document.file_path,
    };
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<DocumentRow | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get document: ${error.message}`);
    }

    return data;
  }

  /**
   * Get documents by user
   */
  async getDocumentsByUser(userId: string): Promise<DocumentRow[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get documents: ${error.message}`);
    }

    return data;
  }

  /**
   * Get documents by company
   */
  async getDocumentsByCompany(companyId: string): Promise<DocumentRow[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get company documents: ${error.message}`);
    }

    return data;
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    documentId: string,
    updates: Partial<DocumentUpdate>
  ): Promise<DocumentRow> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    // Get document to get file path
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.file_path) {
      throw new Error('Document file path is missing');
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .remove([document.file_path]);

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError);
    }

    // Delete document record
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new Error(`Failed to delete document: ${dbError.message}`);
    }
  }

  /**
   * Generate signed URL for secure download
   */
  async getSignedDownloadUrl(
    documentId: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<SignedUrlResult> {
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.file_path) {
      throw new Error('Document file path is missing');
    }

    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(document.file_path, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    return {
      signedUrl: data.signedUrl,
      expiresAt,
    };
  }

  /**
   * Create document version
   */
  async createDocumentVersion(
    documentId: string,
    file: File,
    createdBy: string,
    changesDescription?: string
  ): Promise<string> {
    // Validate file
    this.validateFile(file);

    // Get current document
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Get current version count
    const { count, error: countError } = await supabase
      .from('document_versions')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', documentId);

    if (countError) {
      throw new Error(`Failed to count versions: ${countError.message}`);
    }

    const versionNumber = (count || 0) + 1;

    // Generate unique file path for version
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${document.uploaded_by}/versions/${documentId}/${versionNumber}_${timestamp}_${sanitizedName}`;

    // Upload version to storage
    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload version: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(DOCUMENTS_BUCKET)
      .getPublicUrl(filePath);

    // Create version record
    const versionInsert: DocumentVersionInsert = {
      document_id: documentId,
      version_number: versionNumber,
      file_url: urlData.publicUrl,
      file_path: filePath,
      file_size: file.size,
      changes_description: changesDescription,
      created_by: createdBy,
    };

    const { data: version, error: dbError } = await supabase
      .from('document_versions')
      .insert(versionInsert)
      .select()
      .single();

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([filePath]);
      throw new Error(`Failed to create version record: ${dbError.message}`);
    }

    return version.id;
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(
        `File type ${file.type} is not allowed. Allowed types: PDF, DOCX, JPEG, PNG`
      );
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(query: string, userId?: string): Promise<DocumentRow[]> {
    let queryBuilder = supabase
      .from('documents')
      .select('*')
      .or(`document_name.ilike.%${query}%,document_number.ilike.%${query}%`);

    if (userId) {
      queryBuilder = queryBuilder.eq('uploaded_by', userId);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to search documents: ${error.message}`);
    }

    return data;
  }
}

export const documentService = new DocumentService();
