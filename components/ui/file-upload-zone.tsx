// FileUploadZone Component - Drag-drop file upload component
// Reference: Frontend Implementation Guide Section 5.1

"use client";

import { useCallback, useState } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadZoneProps {
  /** Accepted file types (e.g., "image/*,.pdf") */
  accept?: string;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Current selected file */
  file?: File | null;
  /** Callback when file is selected */
  onFileSelect: (file: File | null) => void;
  /** Custom validation error message */
  error?: string;
  /** Helper text below the zone */
  helperText?: string;
}

/**
 * FileUploadZone - Komponen drag-drop upload file
 *
 * Usage:
 * const [file, setFile] = useState<File | null>(null);
 *
 * <FileUploadZone
 *   accept="image/*"
 *   maxSizeMB={5}
 *   file={file}
 *   onFileSelect={setFile}
 *   helperText="Maksimal 5MB, format: JPG, PNG"
 * />
 */
export function FileUploadZone({
  accept = "image/*",
  maxSizeMB = 5,
  isUploading = false,
  file,
  onFileSelect,
  error,
  helperText = `Maksimal ${maxSizeMB}MB`,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setValidationError(`File terlalu besar. Maksimal ${maxSizeMB}MB.`);
        return false;
      }

      setValidationError(null);
      return true;
    },
    [maxSizeMB]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && validateFile(selectedFile)) {
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect, validateFile]
  );

  const handleRemove = useCallback(() => {
    onFileSelect(null);
    setValidationError(null);
  }, [onFileSelect]);

  const displayError = error || validationError;

  // File selected state
  if (file) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isUploading}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-6 transition-colors",
          "flex flex-col items-center justify-center gap-2 text-center",
          "cursor-pointer hover:bg-muted/50",
          isDragging && "border-primary bg-primary/5",
          displayError && "border-destructive bg-destructive/5"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={isUploading}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            displayError ? "bg-destructive/10" : "bg-primary/10"
          )}
        >
          <Upload
            className={cn(
              "h-6 w-6",
              displayError ? "text-destructive" : "text-primary"
            )}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isDragging ? "Lepaskan file di sini" : "Klik atau drag file ke sini"}
          </p>
          <p className="text-xs text-muted-foreground">{helperText}</p>
        </div>
      </div>
      {displayError && (
        <p className="text-xs text-destructive">{displayError}</p>
      )}
    </div>
  );
}
