"use client";

import { useState } from "react";
import JSZip from "jszip";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

interface DownloadDialogProps {
  hashKey: string;
  hashPng: string;
  hashSvg: string;
  encryptedImage: string;
  isEnabled: boolean;
  onStatus: (message: string, type: 'info' | 'success' | 'error' | 'progress') => void;
}

export function DownloadDialog({
  hashKey,
  hashPng,
  hashSvg,
  encryptedImage,
  isEnabled,
  onStatus,
}: DownloadDialogProps) {
  const handleDownload = async () => {
    try {
      if (!hashKey || !hashPng || !hashSvg || !encryptedImage) {
        onStatus('Missing required files for download', 'error');
        return;
      }

      onStatus('Creating ZIP archive...', 'progress');
      const zip = new JSZip();

      // Add hash key text file
      onStatus('Adding hash key to archive...', 'progress');
      zip.file("hash_key.txt", hashKey);

      try {
        // Add hash visualizations
        onStatus('Adding hash visualizations to archive...', 'progress');
        const pngBlob = await fetch(hashPng).then(r => r.blob());
        const svgBlob = await fetch(hashSvg).then(r => r.blob());
        zip.file("hash_visualization.png", pngBlob);
        zip.file("hash_visualization.svg", svgBlob);

        // Add encrypted image
        onStatus('Adding encrypted image to archive...', 'progress');
        const imgBlob = await fetch(encryptedImage).then(r => r.blob());
        zip.file("encrypted_image.png", imgBlob);

        // Generate zip
        onStatus('Compressing files...', 'progress');
        const content = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 9 }
        });

        // Download
        onStatus('Preparing download...', 'progress');
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "encrypted_data.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        onStatus('ZIP archive downloaded successfully!', 'success');
      } catch (error) {
        onStatus(`Failed to process files: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
      }
    } catch (error) {
      onStatus(`Failed to create ZIP archive: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={!isEnabled}
      className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
    >
      Download All Files
    </Button>
  );
}
