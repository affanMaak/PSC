// components/ImageUpload.tsx
import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";

interface ImageUploadProps {
  images: string[];
  onChange: (files: File[]) => void;
  maxImages?: number;
  onRemove?: (index: number) => void;
}

export function ImageUpload({
  images = [],
  onChange,
  maxImages = 5,
  onRemove,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const remaining = maxImages - images.length;
    const filesToAdd = Array.from(fileList).slice(0, remaining);
    const valid = filesToAdd.filter((f) => f.type.startsWith("image/"));

    if (valid.length > 0) {
      onChange(valid); // This triggers parent update
    }
  };

  const removeImage = (index: number) => {
    onRemove?.(index);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/10" : "border-border"
        } ${images.length >= maxImages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={(e) => {
          e.stopPropagation(); // Prevent dialog close
          if (images.length < maxImages) {
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          {images.length >= maxImages
            ? `Maximum ${maxImages} images reached`
            : `Drag & drop or click (${images.length}/${maxImages})`}
        </p>
      </div>

      {/* Preview */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          {images.map((src: any, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`Preview ${i + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(i);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}