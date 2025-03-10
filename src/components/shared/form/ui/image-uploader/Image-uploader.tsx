import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import styles from "./Image-uploader.module.css"; // 스타일 파일
import { IThumbnail } from "@/types/interface";

interface ImageUploaderProps {
  existingThumbnails?: IThumbnail[]; // ✅ 기존 썸네일을 받을 수 있도록 추가
  onUpload: (files: File[]) => void;
  onDelete: (updatedThumbnails: IThumbnail[], updatedFiles: File[], deletedUrls: string[]) => void; // ✅ Update both existing and new images
}

const MAX_IMAGES = 3; // 최대 업로드 가능 개수

const ImageUploader: React.FC<ImageUploaderProps> = ({ existingThumbnails = [], onUpload, onDelete }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<IThumbnail[]>(existingThumbnails);
  
  // ✅ 기존 썸네일이 있으면 미리보기 이미지로 설정
  useEffect(() => {
    console.log('existingThumbnails: ', existingThumbnails);
    console.log('thumbnails: ', thumbnails);
    setThumbnails(existingThumbnails);
    setPreviews(existingThumbnails.map(thumbnail => thumbnail.url)); // ✅ 이미지 URL이 들어가야 함
  }, [existingThumbnails]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    const totalImages = previews.length + newFiles.length;
    console.log('previews.length: ', previews.length);
    console.log('newFiles.length: ', newFiles.length);
    if (totalImages > MAX_IMAGES) {
      alert(`최대 ${MAX_IMAGES}장까지 업로드 가능합니다.`);
      return;
    }

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    // console.log('newPreviews: ', newPreviews);
    setThumbnails([...thumbnails, ...newFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      url: URL.createObjectURL(file),
    }))
  ]);
    onUpload([...files, ...e.target.files]);
  };

  // 이미지 삭제
  const handleDelete = (index: number) => {
    console.log("Deleting image at index:", index);

    let updatedThumbnails = [...thumbnails];
    let updatedFiles = [...files];
    let updatedPreviews = [...previews];
    let deletedUrls: string[] = []; // ✅ Track deleted image URLs

    console.log("Current updatedThumbnails:", updatedThumbnails);
    if (index < thumbnails.length) {
      // ✅ Deleting an existing thumbnail
      console.log("Deleting existing thumbnail");

      const deletedUrl = thumbnails[index].url;
      // ✅ Only add to delete list if NOT a blob URL
      if (!deletedUrl.startsWith("blob:")) {
        deletedUrls.push(deletedUrl);
      }

      updatedThumbnails.splice(index, 1); // ✅ Only remove the selected index
    } else {
      // ✅ Deleting a newly uploaded file
      console.log("Deleting newly uploaded file");
      const fileIndex = index - thumbnails.length;
      updatedFiles.splice(fileIndex, 1);
    }

    updatedPreviews.splice(index, 1);
    // console.log("Updated thumbnails:", updatedThumbnails);
    // console.log("Updated files:", updatedFiles);
    // console.log("Updated previews:", updatedPreviews);
    setThumbnails(updatedThumbnails);
    // setFiles(updatedFiles);
    // setPreviews(updatedPreviews);

    // ✅ Notify parent with updated lists
    onDelete(updatedThumbnails, updatedFiles, deletedUrls);
  };

  return (
    <div>
      {/* 파일 업로드 버튼 */}
      <label htmlFor="upload">
        {previews.length < MAX_IMAGES && <div className={styles.chooseFile}>사진 선택</div>}
      </label>
      <input type="file" id="upload" multiple accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

      {/* ✅ 기존 및 새로운 미리보기 이미지 표시 */}
      <div className={styles.imgContainer}>
        {previews.map((preview, index) => (
          <div key={index} className={styles.imgBox}>
            <img key={index} width={200} height={200} className='board-detail-main-image' src={preview} alt={`preview-${index}`} />
            {/* <Image src={preview} width={200} height={200} alt={`preview-${index}`} /> */}
            <IoMdClose className={styles.deleteImg} onClick={() => handleDelete(index)}
          />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;

