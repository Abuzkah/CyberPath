import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileArchive, FolderOpen, CheckCircle, AlertCircle } from "lucide-react";

interface LabFile {
  name: string;
  type: string;
  size: string;
  category: "walkthrough" | "script" | "report" | "note";
}

export default function CyberLabSync() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<LabFile[]>([]);
  const { toast } = useToast();

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
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process files
      const processedFiles: LabFile[] = files.map(file => ({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: formatFileSize(file.size),
        category: getCategoryFromFile(file.name)
      }));

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadedFiles(prev => [...prev, ...processedFiles]);
        setIsUploading(false);
        setUploadProgress(0);
        
        toast({
          title: "Files processed successfully!",
          description: `Uploaded and organized ${files.length} files`
        });
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: "Unable to process the uploaded files",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getCategoryFromFile = (filename: string): LabFile['category'] => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const name = filename.toLowerCase();
    
    if (ext === 'md' || name.includes('walkthrough') || name.includes('writeup')) {
      return 'walkthrough';
    }
    if (ext === 'sh' || ext === 'py' || ext === 'ps1' || name.includes('script')) {
      return 'script';
    }
    if (name.includes('report') || ext === 'pdf') {
      return 'report';
    }
    return 'note';
  };

  const getCategoryIcon = (category: LabFile['category']) => {
    switch (category) {
      case 'walkthrough':
        return <i className="fas fa-route text-blue-400"></i>;
      case 'script':
        return <i className="fas fa-file-code text-green-400"></i>;
      case 'report':
        return <i className="fas fa-file-pdf text-red-400"></i>;
      case 'note':
        return <i className="fas fa-sticky-note text-yellow-400"></i>;
      default:
        return <i className="fas fa-file text-gray-400"></i>;
    }
  };

  const getCategoryColor = (category: LabFile['category']) => {
    switch (category) {
      case 'walkthrough':
        return 'bg-blue-400/20 text-blue-400';
      case 'script':
        return 'bg-green-400/20 text-green-400';
      case 'report':
        return 'bg-red-400/20 text-red-400';
      case 'note':
        return 'bg-yellow-400/20 text-yellow-400';
      default:
        return 'bg-gray-400/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Cyber Lab Sync</h1>
        <p className="text-gray-400">Upload and organize your exported lab content, walkthroughs, and training materials</p>
      </div>

      {/* Upload Zone */}
      <Card className="terminal-window border-gray-700 mb-6">
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-green-400 bg-green-400/5"
                : "border-gray-600 hover:border-gray-500"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-gray-400">
                <Upload className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Drop your files here or browse
                </h3>
                <p className="text-sm">
                  Support for .zip, .tar.gz, .md, .py, .sh, .txt, .pdf and more
                </p>
              </div>
              
              <div className="flex justify-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button className="bg-green-400 text-black hover:bg-green-500">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Browse Files
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
                    accept=".zip,.tar.gz,.md,.py,.sh,.txt,.pdf,.json,.xml,.html,.css,.js,.ts"
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card className="terminal-window border-gray-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Upload className="h-5 w-5 text-blue-400 animate-pulse" />
              <span className="text-blue-400 font-medium">Processing files...</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <div className="text-sm text-gray-400 mt-2">
              Analyzing and categorizing content ({uploadProgress}% complete)
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Button
          variant="ghost"
          className="terminal-window h-20 flex items-center justify-center space-x-3 hover:shadow-lg hover:shadow-blue-400/20 transition-all"
        >
          <FileArchive className="h-6 w-6 text-blue-400" />
          <div className="text-left">
            <div className="font-semibold text-white">Import ZIP</div>
            <div className="text-sm text-gray-400">Extract lab exports</div>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="terminal-window h-20 flex items-center justify-center space-x-3 hover:shadow-lg hover:shadow-green-400/20 transition-all"
        >
          <i className="fas fa-sync-alt text-green-400 text-xl"></i>
          <div className="text-left">
            <div className="font-semibold text-white">Auto-Organize</div>
            <div className="text-sm text-gray-400">Smart categorization</div>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="terminal-window h-20 flex items-center justify-center space-x-3 hover:shadow-lg hover:shadow-cyan-400/20 transition-all"
        >
          <i className="fas fa-tags text-cyan-400 text-xl"></i>
          <div className="text-left">
            <div className="font-semibold text-white">Tag Content</div>
            <div className="text-sm text-gray-400">Add metadata</div>
          </div>
        </Button>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="terminal-window border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-green-400">
              <CheckCircle className="mr-2 h-5 w-5" />
              Uploaded Content ({uploadedFiles.length} files)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                  <div className="text-lg">
                    {getCategoryIcon(file.category)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{file.name}</div>
                    <div className="text-sm text-gray-400">{file.size}</div>
                  </div>
                  <Badge className={getCategoryColor(file.category)}>
                    {file.category}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    <i className="fas fa-eye"></i>
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                Content automatically organized by type and date
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-blue-400">
                  <i className="fas fa-download mr-2"></i>
                  Export All
                </Button>
                <Button variant="ghost" size="sm" className="text-green-400">
                  <i className="fas fa-share-alt mr-2"></i>
                  Share Collection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {uploadedFiles.length === 0 && !isUploading && (
        <Card className="terminal-window border-gray-700">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-cloud-upload-alt text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Content Uploaded</h3>
            <p className="text-gray-400 mb-4">
              Upload your lab exports, walkthroughs, and training materials to get started.
            </p>
            <div className="text-sm text-gray-500">
              Supported formats: ZIP archives, Markdown files, Scripts, PDFs, and more
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
