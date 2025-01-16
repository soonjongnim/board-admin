import { create } from 'zustand';

interface ImageFileEntry {
    file: File;
    url: string;
  }
  
  interface ImageStore {
    imageFileList: ImageFileEntry[]; // Store the list of image entries
    setImageFileList: (imageFileList: ImageFileEntry[]) => void;
    deletedServerImageList: string[]; // List of URLs for deleted images from the server
    addDeletedServerImage: (imageUrl: string) => void; // Action to add a URL to deletedServerImageList
    resetDeletedServerImageList: () => void; // Action to reset the deleted server image list
    editorContent: string;
    setEditorContent: (editorContent: string) => void;
  }
  
  // Create the image store using Zustand
  const useImageStore = create<ImageStore>(set => ({
    imageFileList: [], // Initialize with an empty array
    setImageFileList: (imageFileList: ImageFileEntry[]) => set({ imageFileList }), // Set the image file list
    deletedServerImageList: [], // Initialize with an empty array for deleted server images
    addDeletedServerImage: (imageUrl: string) =>
        set((state) => ({
          deletedServerImageList: state.deletedServerImageList.includes(imageUrl)
            ? state.deletedServerImageList // 이미 존재하면 추가하지 않음
            : [...state.deletedServerImageList, imageUrl], // 새 URL 추가
        })
    ), // Add an image URL to the deleted server image list
    resetDeletedServerImageList: () => set({ deletedServerImageList: [] }), // Reset the deleted server image list
    editorContent: '',
    setEditorContent: (editorContent: string) => set({ editorContent }),
  }));

export default useImageStore;