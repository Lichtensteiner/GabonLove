import { useState, useRef, ChangeEvent } from "react";
import { storage, db, auth } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Camera, Loader2, Upload, X } from "lucide-react";
import Button from "./Button";

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ onUploadComplete, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.currentUser;

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop lourde (max 5MB)");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      // Update Firestore profile
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        photos: arrayUnion(url),
        mainPhoto: url // Set as main for now if it's the first or user wants
      });

      if (onUploadComplete) onUploadComplete(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Erreur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload} 
        className="hidden" 
        ref={fileInputRef} 
        disabled={uploading}
      />
      <Button 
        variant="outline" 
        className="gap-2 rounded-2xl" 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Ajouter une photo
          </>
        )}
      </Button>
    </div>
  );
}
