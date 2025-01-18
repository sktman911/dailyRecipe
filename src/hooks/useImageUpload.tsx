import { useCallback, useRef } from "react"

const useImageUpload = () => {
    const imgPreviewRef = useRef<HTMLImageElement | null >(null);
    const imgSourceRef = useRef<string | null>(null);

    const handleImageUpload = useCallback((file : File) => {
        if(!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if(imgPreviewRef.current && typeof reader.result === "string"){
                const base64String = reader.result?.split(",")[1]; // separate Base64 value
                imgSourceRef.current = base64String;
                imgPreviewRef.current.src = reader.result;
            }
        }
        reader.readAsDataURL(file);
    },[]);

    const resetImage = () => {
        imgPreviewRef.current = null;
        imgSourceRef.current = null;
    }

    return {
        imgPreviewRef,
        imgSourceRef,
        handleImageUpload,
        resetImage,
    }
}

export default useImageUpload;