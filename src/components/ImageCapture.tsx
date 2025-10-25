import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageCaptureProps {
  onImageAnalyzed: (result: {
    dish_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    confidence: number;
    image_url: string;
  }) => void;
}

const ImageCapture = ({ onImageAnalyzed }: ImageCaptureProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      analyzeImage(result, file);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image: string, file: File) => {
    setIsAnalyzing(true);
    try {
      // Step 1: Upload image to storage
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      // Step 2: Identify dish with AI
      const { data: identifyData, error: identifyError } = await supabase.functions.invoke(
        'identify-dish',
        {
          body: { imageBase64: base64Image },
        }
      );

      if (identifyError) throw identifyError;

      // Step 3: Save meal to database
      const { error: insertError } = await supabase.from('meals').insert({
        user_id: user.id,
        dish_name: identifyData.dish_name,
        calories: identifyData.calories,
        protein: identifyData.protein,
        carbs: identifyData.carbs,
        fat: identifyData.fat,
        confidence: identifyData.confidence,
        image_url: urlData.publicUrl,
      });

      if (insertError) throw insertError;

      toast.success(`Identified: ${identifyData.dish_name}`);
      onImageAnalyzed({
        ...identifyData,
        image_url: urlData.publicUrl,
      });

      // Reset
      setPreview(null);
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze image');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      <AnimatePresence>
        {preview ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="relative overflow-hidden glass-card shadow-glass border-0">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm font-medium tracking-wide">Analyzing your meal...</p>
                  </div>
                </div>
              )}
              {!isAnalyzing && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => setPreview(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              size="lg"
              className="h-32 flex flex-col gap-2 gradient-primary shadow-glass hover:shadow-glow text-white rounded-2xl tracking-wide"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8" />
              <span>Upload Image</span>
            </Button>
            <Button
              size="lg"
              className="h-32 flex flex-col gap-2 gradient-accent shadow-glass hover:shadow-glow text-white rounded-2xl tracking-wide"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="w-8 h-8" />
              <span>Take Photo</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageCapture;
