import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import ReactQuill, { Quill } from "react-quill";
import useImageStore from '@/lib/image/image-file'; // Import the store
import { ImageActions } from '@xeger/quill-image-actions';
import { imageResizerIncoder } from '@/utils/imageResizerIncoder';

Quill.register('modules/imageActions', ImageActions);

interface IQuillEditorCoreProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const QuillEditorCore = ({ value, onChange, placeholder }: IQuillEditorCoreProps) => {
  const quillRef = useRef<ReactQuill>(null);
  const { imageFileList, setImageFileList } = useImageStore(); // 새 이미지를 위한 스토어
  const [prevContent, setPrevContent] = useState<string>(''); // 이전 콘텐츠 추적
  const { editorContent, setEditorContent } = useImageStore(); // Default to initial itemDetail
  
  const imgFileArray = useRef<{ file: File; url: string }[]>([]); // 임시 이미지파일,url들 저장
  const { deletedServerImageList, addDeletedServerImage } = useImageStore();  // 서버에서 삭제된 이미지 URL들

  // 이미지 URL이 서버 URL인지 확인하는 헬퍼 함수
  const isServerImageUrl = (url: string) => {
    return url.startsWith('https://objectstorage.ap-chuncheon'); // Specific server URL check
  };

  // 파일 사이즈 계산 함수
  const imageSizeRef = (file: File) => {
    const sizeInBytes = file.size; // File size in bytes
    const sizeInKB:any = (sizeInBytes / 1024).toFixed(2); // Convert to KB
    const sizeInMB = (sizeInKB / 1024).toFixed(2); // Convert to MB
    console.log('image: ', `크기: ${file.size},  ${sizeInKB} KB (${sizeInMB} MB)`);
  }
  
  //image아이콘을 눌렀을 때 핸들러
  const ImageHandler = () => {
    //input type= file DOM을 만든다.
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click(); //toolbar 이미지를 누르게 되면 이 부분이 실행된다.
    /*이미지를 선택하게 될 시*/
    input.onchange = async () => {
      /*이미지 선택에 따른 조건을 다시 한번 하게 된다.*/
      const file: any = input.files ? input.files[0] : null;
      /*선택을 안하면 취소버튼처럼 수행하게 된다.*/
      if (!file) return;
      // 에디터에 접근
      const quill:any = quillRef.current?.getEditor();
      console.log('quill: ', quill);
      const range = quill.getSelection();

      try {
        const Image = ReactQuill.Quill.import("formats/image")
        const imageResizerFile:File = await imageResizerIncoder(file);
        console.log('typeof imageResizerFile: ', typeof imageResizerFile)
        const imageUrl = URL.createObjectURL(imageResizerFile);
        imgFileArray.current.push({ file: imageResizerFile, url: imageUrl }); // 새 이미지들 저장
        setImageFileList([...imgFileArray.current]); // 공유되는 이미지 스토어 업데이트
        // 이미지 사이즈 확인
        imageSizeRef(file);
        imageSizeRef(imageResizerFile);
        
        /*에디터의 커서 위치에 이미지 요소를 넣어준다.*/
        if (quill) {
          // 현재 커서 위치에 이미지를 삽입
          // const cursorIndex = range.index;
          Image.sanitize = (imageUrl:string) => imageUrl
          console.log('imageUrl: ', imageUrl);
          quill.insertEmbed(range.index, 'image', imageUrl, 'user'); // Insert image at the cursor position
        }
        console.log('ImageHandler imageFileList:',imageFileList);
      } catch (error) {
        console.log(error);
      }
    };
  };

  useEffect(() => {
    console.log('parants value: ', value)
    const quill = quillRef.current?.getEditor();
    if (quill) {
      // Get the previous and current content as HTML
      const currentHTML = quill.root.innerHTML;
      const previousHTML = prevContent || "";

      console.log('User made a change value:', value); // Debug 5
      console.log('Current HTML:', currentHTML);   // Debug 6
      console.log('Previous HTML:', previousHTML); // Debug 7

      // 내용이 삭제되었는지 확인
      if (currentHTML.length < previousHTML.length) {
        console.log('Content was deleted!'); // Debug 8

        const currentImageTags = Array.from(quill.root.querySelectorAll('img')).map(img => img.src);
        const previousImageTags = Array.from(new DOMParser().parseFromString(previousHTML, 'text/html').querySelectorAll('img')).map(img => img.src);

        // 삭제된 이미지 찾기
        const deletedImages = previousImageTags.filter(src => !currentImageTags.includes(src));
        console.log('deletedImages:', deletedImages);
        
        // 삭제된 이미지가 이미 업로드된 이미지인지 확인
        deletedImages.forEach(async deletedImg => {
          if (isServerImageUrl(deletedImg)) {
            // 서버에 호스팅된 삭제된 이미지를 삭제 목록에 추가
            addDeletedServerImage(deletedImg);
            console.log('deletedServerImageList에 추가됨:', deletedImg);
          } else {
            // If it's a local image (not uploaded), remove it from the imageFileList
            const updatedImageFileList = await imageFileList.filter(item => item.url !== deletedImg);
            await setImageFileList(updatedImageFileList); // Update the state with the new list
            console.log('updatedImageFileList:', updatedImageFileList);
            console.log('Removed from imageFileList:', deletedImg);
          }
        });
      }

      console.log('handleEditorChange imageFileList:',imageFileList);
      console.log('handleEditorChange deletedServerImageList:',deletedServerImageList);
      // Update the previous content after every change
      setPrevContent(currentHTML);
    } else {
      console.error('Quill instance not found'); // Debug 10
    }
  }, [value]);

  const modules = useMemo(() => {
    return {
      imageActions: {},
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["link", "image"],
        ],
        handlers: {
          // 이미지 처리는 우리가 직접 imageHandler라는 함수로 처리할 것이다.
          image: ImageHandler,
        },
        ImageResize: {
          modules: ['Resize'],
        },
      },
    }
  }, []);

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    'height',
    'width',
  ];

  if (onChange) {
    console.log('onChange callback called222222222222222 editorContent: ', editorContent); // Debug 11
    if (editorContent !== "") {
      console.log("비어있지 않습니다.")
      onChange(editorContent);
      setEditorContent("");
    }
    // onChange(value);
  }
  
  return (
    <>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        modules={modules}
        formats={formats}
        onChange={onChange}
        // onChange={(content, _, source) => handleEditorChange(content, source)}
        placeholder={placeholder}
      />
    </>
  );
};

export default QuillEditorCore;
