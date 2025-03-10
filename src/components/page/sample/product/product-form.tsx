import { IProductFormValue, createProduct, updateProduct, useProduct } from "@/client/sample/product";
import CodemirrorEditor from "@/components/shared/form/control/codemirror-editor";
import QuillEditor from "@/components/shared/form/control/quill-editor";
import DefaultForm from "@/components/shared/form/ui/default-form";
import FormGroup from "@/components/shared/form/ui/form-group";
import FormSection from "@/components/shared/form/ui/form-section";
import { Button, Divider, Form, Input, Radio, Select, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import React, { useState } from "react";
import { useRouter } from "next/router";
import useImageStore from '@/lib/image/image-file'; // Import the store

import { filesDeleteRequest, fileUploadRequest, ThumbnailsDeleteRequest } from "@/pages/api/sample/products";
import ImageUploader from "@/components/shared/form/ui/image-uploader/Image-uploader";
import { IThumbnail } from "@/types/interface";

interface IProductFormProps {
  id?: string;
  initialValues?: Partial<IProductFormValue>;
}

const ProductForm = ({ id, initialValues }: IProductFormProps) => {
  const router = useRouter();
  const [form] = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { imageFileList, setImageFileList } = useImageStore();
  const { deletedServerImageList, resetDeletedServerImageList } = useImageStore();

  // Editor content state
  const { editorContent, setEditorContent } = useImageStore(); // Default to initial itemDetail
  // ✅ 서버에서 받은 thumbnailList를 상태로 저장
  const [thumbnails, setThumbnails] = useState<IThumbnail[]>(
    initialValues?.thumbnailList
      ? initialValues.thumbnailList.map(url => ({
          name: url.split("/").pop() || "unknown.jpg", // ✅ URL에서 파일명 추출
          size: 0, // ⛔ 사용하지 않음
          type: "", // ⛔ 사용하지 않음
          lastModified: 0, // ⛔ 사용하지 않음
          url, // ✅ 실제 이미지 URL 추가
        }))
      : []
  );

  const processImagesInItemDetail = async (
    itemId: number | string | null,
    itemDetail: string | null, 
    imageFileList: { file: File, url: string }[] ) => {
    
      const imageUrlConversionList: Record<string, string> = {};
      const imageUrlList: string[] = [];
      for (let i = 0; i < imageFileList.length; i++) {
        const data = new FormData();
        const file = imageFileList[i].file; // Get the file from each item
        data.append('file', file);
    
        const url = await fileUploadRequest(data); // Upload to server and get URL
        console.log("url: ", url)
        if (url) {
          imageUrlConversionList[imageFileList[i].url] = url; // Map local URL to server URL
          imageUrlList.push(url);
        }
      }
    
      // Parse the itemDetail HTML and find all <img> tags
      const parser = new DOMParser();
      const doc = parser.parseFromString(itemDetail || '', 'text/html');
      const images = doc.querySelectorAll('img'); // Get all <img> tags
    
      images.forEach((img) => {
        const imgSrc: string = img.getAttribute('src') || ''; // Get the current src
        const newServerUrl = imageUrlConversionList[imgSrc];
        if (newServerUrl) {
          img.setAttribute('src', newServerUrl); // Replace the src with the server URL
        }
        setImageFileList([]);
      });

      console.log('deletedServerImageList: ', deletedServerImageList);
      if (deletedServerImageList.length > 0) {
          try {
            if (itemId !== null) {
              // Call API to delete images from the server
              await filesDeleteRequest(itemId, deletedServerImageList);
              // alert('서버 이미지 삭제!');
              // Reset the list after successful deletion
              resetDeletedServerImageList();
            }
          console.log('Deleted images from server:', deletedServerImageList);
          } catch (error) {
          console.error('Error deleting images from server:', error);
          }
      }
    
      return {
          updatedItemDetail: doc.body.innerHTML,
          imageUrlList, // Include the imageUrlList in the return object
      };
  }

  const [newFiles, setNewFiles] = useState<File[]>([]);
  // ✅ Track deleted image URLs
  const [deletedThumbnailUrls, setDeletedThumbnailUrls] = useState<string[]>([]);

  // ✅ Update state when images are deleted
  const handleDeleteThumbnail = (updatedThumbnails: IThumbnail[], updatedFiles: File[], deletedUrls: string[]) => {
    console.log("Deleting image at updatedThumbnails:", updatedThumbnails);
    console.log("Deleting image at updatedFiles:", updatedFiles);
    setThumbnails(updatedThumbnails);
    setNewFiles(updatedFiles);
    // ✅ Ensure only valid URLs are added
    if (deletedUrls.length > 0) {
      setDeletedThumbnailUrls(prev => [...prev, ...deletedUrls]);
    }
  };

  // 썸네일 이미지 업로드 핸들러
  const handleThumbnailsUpload = async (files: File[]) => {
    console.log('handleThumbnailsUpload files:', files);
    setNewFiles(prev => [...prev, ...files])
    const formattedThumbnails: IThumbnail[] = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      url: URL.createObjectURL(file), // ✅ 미리보기를 위해 URL 생성
    }));
    console.log('formattedThumbnails:', formattedThumbnails);
    // ✅ 기존 썸네일과 새 썸네일을 합침
    setThumbnails(prev => [...prev, ...formattedThumbnails]); // ✅ 서버로 보낼때 이미 json타입으로 넘기기때문에 File 정보를 변환하여 저장
    console.log('newFiles:', newFiles);

  };

  const handleFinish = async (formValue: IProductFormValue) => {
    try {
      setIsLoading(true);
      
      if (id) {
        console.log('newFiles:', newFiles);
        console.log('deletedThumbnailUrls:', deletedThumbnailUrls);
        // ✅ 썸네일 필수 확인
        if (thumbnails.length === 0) {
          messageApi.error("최소 1개의 썸네일을 업로드해야 합니다.");
          setIsLoading(false);
          return;
        }
        // 썸네일 기존 삭제
        if (deletedThumbnailUrls.length > 0) {
          try {
            if (id !== null) {
              await ThumbnailsDeleteRequest(id, deletedThumbnailUrls);
              // alert('서버 이미지 삭제!');
              setDeletedThumbnailUrls([]);
            }
          console.log('Deleted images from server:', deletedThumbnailUrls);
          } catch (error) {
          console.error('Error deleting images from server:', error);
          }
        }

        const updatedThumbnails = [...thumbnails]; // ✅ Copy existing thumbnails
        // ✅ data 생성 및 파일 추가
        const thumbnailUrlList: string[] = [];
        for (const newFile of newFiles) {
          const data = new FormData();
          console.log('newFile:', newFile);
          data.append("file", newFile);
          // 내용확인코드
          // for (const x of data.entries()) {
          //   console.log(x);
          // };
          const url = await fileUploadRequest(data);
          if (url) {
            // ✅ Find matching thumbnail by name
            const index = updatedThumbnails.findIndex(
              (thumbnail) => thumbnail.name === newFile.name && thumbnail.url.startsWith("blob:")
            );
      
            if (index !== -1) {
              console.log(`Updating thumbnail ${newFile.name} URL to:`, url);
              updatedThumbnails[index].url = url; // ✅ Replace blob URL with server URL
              updatedThumbnails[index].name = url.substring(url.lastIndexOf("/") + 1); // ✅ Replace name with extracted filename
            }

            thumbnailUrlList.push(url);
          }

        }
        
        console.log('update updatedThumbnails:', updatedThumbnails);
        // ✅ File 객체 그대로 저장 (이미 `IThumbnail` 형태로 변환됨)
        formValue.thumbnailUrlList = thumbnailUrlList;
        // console.log('formValue:', formValue);
        // console.log('imageFileList: ', imageFileList);
        // console.log('itemDetail:', formValue.itemDetail);
        const imagesUpdateResult = await processImagesInItemDetail(id, formValue.itemDetail, imageFileList);
        // console.log('updated detail:', imagesUpdateResult.updatedItemDetail);   // 업데이트된 HTML 내용
        // console.log('imageUrlList: ', imagesUpdateResult.imageUrlList);   // 반환된 서버 URL 리스트
        // Update formValue.itemDetail with the new detail
        formValue.itemDetail = imagesUpdateResult.updatedItemDetail;
        formValue.imageUrlList = imagesUpdateResult.imageUrlList;
        console.log('formValue: ', formValue);   // 반환된 서버 URL 리스트

        const result = await updateProduct(id, formValue);
        console.log('result:', result);
        setEditorContent(formValue.itemDetail); // Update the editor content
        console.log('editorContent before passing to QuillEditorCore:', editorContent);
        setThumbnails(updatedThumbnails); // ✅ Update thumbnails state
        messageApi.success("수정되었습니다");
      } else {
        console.log('imageFileList: ', imageFileList);

        // ✅ 썸네일 필수 확인
        if (thumbnails.length === 0) {
          messageApi.error("최소 1개의 썸네일을 업로드해야 합니다.");
          setIsLoading(false);
          return;
        }
        console.log('thumbnails:', thumbnails);
        console.log('newFiles:', newFiles);
        // ✅ data 생성 및 파일 추가
        const thumbnailUrlList: string[] = [];
        for (const newFile of newFiles) {
          const data = new FormData();
          console.log('newFile:', newFile);
          data.append("file", newFile);
          // 내용확인코드
          // for (const x of data.entries()) {
          //   console.log(x);
          // };
          const url = await fileUploadRequest(data);
          if (url) thumbnailUrlList.push(url);
        }
          
        // ✅ File 객체 그대로 저장 (이미 `IThumbnail` 형태로 변환됨)
        formValue.thumbnailUrlList = thumbnailUrlList;
        console.log('formValue:', formValue);
        // Loop through imageFileList to upload the files and store the server URLs
        const imagesUpdateResult = await processImagesInItemDetail(null, formValue.itemDetail, imageFileList);
        console.log('updated detail:', imagesUpdateResult.updatedItemDetail);   // 업데이트된 HTML 내용
        console.log('imageUrlList: ', imagesUpdateResult.imageUrlList);   // 반환된 서버 URL 리스트
        // Update formValue.itemDetail with the new detail
        formValue.itemDetail = imagesUpdateResult.updatedItemDetail;
        formValue.imageUrlList = imagesUpdateResult.imageUrlList;
        console.log('itemDetail after: ', formValue.itemDetail);   // 반환된 서버 URL 리스트
        await createProduct(formValue);
        setEditorContent(formValue.itemDetail); // Update the editor content
        // console.log('editorContent before passing to QuillEditorCore:', editorContent);
        messageApi.success("생성되었습니다");
        router.push("/admin/product/list");
      }
    } catch (e: unknown) {
      messageApi.error("에러가 발생했습니다");
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <>
      {contextHolder}
      <DefaultForm<IProductFormValue> form={form} initialValues={initialValues} onFinish={handleFinish}>
        <FormSection title="기본정보" description="상품 기본 정보를 입력해주세요">
          <FormGroup title="판매상태*">
            <Form.Item name="itemSellStatus" rules={[{ required: true, message: "필수값입니다" }]}>
              <Radio.Group>
                <Radio value="SALE">판매중</Radio>
                <Radio value="SOLD_OUT">재고없음</Radio>
                <Radio value="NOT_SALE">판매중지</Radio>
              </Radio.Group>
            </Form.Item>
          </FormGroup>

          <Divider />

          <FormGroup title="브랜드*">
            <Form.Item name="brand" rules={[{ required: true, message: "필수값입니다" }]} initialValue={initialValues?.brand || "apple"}>
              <Select style={{ maxWidth: 200 }} placeholder="브랜드를 선택하세요">
                <Select.Option value="apple">apple</Select.Option>
                <Select.Option value="파타고니아">파타고니아</Select.Option>
                <Select.Option value="다이슨">다이슨</Select.Option>
                <Select.Option value="Aēsop">Aēsop</Select.Option>
                <Select.Option value="LUSH">LUSH</Select.Option>
                <Select.Option value="블루보틀">블루보틀</Select.Option>
              </Select>
            </Form.Item>
          </FormGroup>

          <Divider />

          <FormGroup title="상품명*">
            <Form.Item name="itemName" rules={[{ required: true, message: "필수값입니다" }]}>
              <Input placeholder="상품명을 입력하세요" />
            </Form.Item>
          </FormGroup>

          <Divider />

          <FormGroup title="상품코드*">
            <Form.Item name="itemId" rules={[{ required: false, message: "필수값입니다" }]}>
              <Input readOnly placeholder="상품코드를 입력하세요" />
            </Form.Item>
          </FormGroup>

          <Divider />

          <FormGroup title="금액*">
            <Form.Item name="price" rules={[{ required: true, message: "필수값입니다" }]}>
              <Input placeholder="금액을 입력하세요" />
            </Form.Item>
          </FormGroup>

          <Divider />

          <FormGroup title="수량*">
            <Form.Item name="stockNumber" rules={[{ required: true, message: "필수값입니다" }]}>
              <Input placeholder="수량을 입력하세요" />
            </Form.Item>
          </FormGroup>
        </FormSection>

        <FormSection title="썸네일" description="하나 이상의 썸네일을 넣어주세요. (3개까지 가능)">
          <ImageUploader existingThumbnails={thumbnails} onUpload={handleThumbnailsUpload} onDelete={handleDeleteThumbnail} />
        </FormSection>

        <FormSection title="상품상세" description="상품 상세 정보를 입력해주세요">
          <FormGroup title="상품상세">
            <Form.Item name="itemDetail">
              <QuillEditor />
            </Form.Item>
          </FormGroup>

          <Divider />

          {/* <FormGroup title="CSS/JS">
            <Form.Item name="css">
              <CodemirrorEditor />
            </Form.Item>
            <Form.Item name="js">
              <CodemirrorEditor />
            </Form.Item>
          </FormGroup> */}
        </FormSection>

        <div className="text-center">
          <Button htmlType="submit" type="primary" loading={isLoading}>
            저장
          </Button>
        </div>
      </DefaultForm>
    </>
  );
};

export default React.memo(ProductForm);
