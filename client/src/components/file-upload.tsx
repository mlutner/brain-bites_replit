import { useState, useRef } from "react";
import { BrainCard, BrainCardContent } from "@/components/ui/brain-card";
import { BrainButton } from "@/components/ui/brain-button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Upload, X, File, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFilesUpload: (files: any[]) => void;
}

export default function FileUpload({ onFilesUpload }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['text/plain', 'application/pdf'];
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size must be under 10MB",
        variant: "destructive",
      });
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF and TXT files are supported",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      
      const uploadedFile = await response.json();
      const newFiles = [uploadedFile];
      setUploadedFiles(newFiles);
      onFilesUpload(newFiles);
      
      toast({
        title: "File uploaded successfully",
        description: "Your file is ready for processing",
      });
    } catch (error) {
      if (error instanceof Error && isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesUpload(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <BrainCard 
        className={`border-2 border-dashed transition-all duration-300 upload-area bg-gradient-to-br from-card to-muted/30 ${
          dragOver ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]' : 'border-foreground/20 hover:border-primary hover:shadow-md'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <BrainCardContent className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-bold text-foreground mb-2">
              Scan PDF or Text
            </h3>
            <p className="text-foreground/70 mb-6 font-medium">
              Processing typically takes 30-60 seconds
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
            
            <BrainButton 
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploading}
              icon={Upload}
              className="mb-4 brain-gradient"
            >
              {isUploading ? 'Uploading...' : 'Choose Files'}
            </BrainButton>
            
            <p className="text-sm text-foreground/60 font-medium">
              Supports PDF and TXT files up to 10MB
            </p>
          </div>
        </BrainCardContent>
      </BrainCard>

      {/* File preview section */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="brain-heading-3 mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <BrainCard key={index} className="result-card">
                <BrainCardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 brain-gradient rounded flex items-center justify-center">
                        <File className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="brain-text font-medium">{file.name}</p>
                        <p className="brain-text-muted">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <BrainButton
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        icon={X}
                      >
                        Remove
                      </BrainButton>
                    </div>
                  </div>
                </BrainCardContent>
              </BrainCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
