import Resizer from 'react-image-file-resizer';

/**
 * Resizes the input file and returns a Promise that resolves to a File object.
 * @param file - The input image file to be resized.
 * @returns A Promise that resolves to the resized image as a File object.
 */
export const imageResizerIncoder = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    Resizer.imageFileResizer(
      file, // The input file to be resized
      1500, // Max width
      1500, // Max height
      'JPEG', // Output format
      80, // Quality of the output image
      0, // Rotation (0 degrees)
      (resizedFile: string | File | Blob | ProgressEvent<FileReader>) => {
        // Ensure resizedFile is a Blob or File before proceeding
        if (resizedFile instanceof Blob) {
          const resizedImageFile = new File([resizedFile], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedImageFile); // Resolve the promise with the File
        } else {
          reject(new Error('Failed to resize the image: Invalid type.'));
        }
      },
      'file' // Output as a file
    );
  });
