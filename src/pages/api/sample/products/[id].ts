import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { postItemRequest, productSampleItems } from ".";
import { DeleteItemResponseDto, GetItemResponseDto, PatchItemResponseDto, PostItemResponseDto } from "../../response/item";
import { ResponseDto } from "../../response";
import { PatchItemRequestDto, PostItemRequestDto } from "../../request/item";

const DOMAIN = process.env.NEXT_PUBLIC_API_BACKEND_URL;
const API_DOMAIN = `${DOMAIN}/api`;

const GET_ITEM_URL = (itemId: number | string) => `${API_DOMAIN}/item/${itemId}`;
const PATCH_ITEM_URL = (itemId: number | string) => `${API_DOMAIN}/item/${itemId}`;
const DELETE_ITEM_URL = (itemId: number | string) => `${API_DOMAIN}/item/${itemId}`;

export const getItemRequest = async (itemId: number | string) => {
  const result = await axios.get(GET_ITEM_URL(itemId))
      .then(response => {
          const responseBody: GetItemResponseDto = response.data;
          return responseBody;
      })
      .catch(error => {
          if (!error.response) return null;
          const responseBody: ResponseDto = error.response.data;
          return responseBody;
      })
  return result;
}

export const patchItemRequest = async (itemId: number | string, requestBody: PatchItemRequestDto) => {
  const result = await axios.patch(PATCH_ITEM_URL(itemId), requestBody)
      .then(response => {
          const responseBody: PatchItemResponseDto = response.data;
          console.log('responseBody: ', responseBody);
          return responseBody;
      })
      .catch(error => {
          if (!error.response) return null;
          const responseBody: ResponseDto = error.response.data;
          console.log('error responseBody: ', responseBody);
          return responseBody;
      })
  return result;
}

export const deleteItemRequest = async (itemId: number | string) => {
  const result = await axios.delete(DELETE_ITEM_URL(itemId))
      .then(response => {
          const responseBody: DeleteItemResponseDto = response.data;
          return responseBody;
      })
      .catch(error => {
          if (!error.response) return null;
          const responseBody: ResponseDto = error.response.data;
          return responseBody;
      })
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('products [id].ts > req.method: ', req.method);
  if (req.method === "POST") {
    // 생성
    // 생성할때 여기 안탐, index.ts로 탐
    console.log('POST req.body: ', req.body);
    const { itemName, price, itemSellStatus, stockNumber, itemDetail, imageUrlList } = req.body;
    const writerEmail = 'soon9086@gmail.com'; // 임시
    const requestBody: PostItemRequestDto = {
      itemName, price, itemSellStatus, itemDetail, stockNumber, writerEmail, imageUrlList
    }
    const responseBody: PostItemResponseDto | ResponseDto | null = await postItemRequest(requestBody);
    console.log('PostItemResponseDto responseBody: ', responseBody)
    return res.status(204).json({
      code: 0,
      message: "OK",
    });
  } else if (req.method === "PUT") {
    // 수정
    // console.log('PUT req.body: ', req.body);
    const { itemId, itemName, price, itemSellStatus, stockNumber, itemDetail, imageUrlList } = req.body;
    console.log('PUT itemDetail: ', itemDetail);
    console.log('PUT imageUrlList: ', imageUrlList);

    // Extract and save all images using a loop
    // const resultImages = handleSubmit(itemDetail);
    // console.log('resultImages:', resultImages);
    // const imageFiles = ProductForm.GetImageFileList();
    // console.log('Current image files:', imageFiles);

    //if (base64Images.length === 0) {
      //console.log('No valid images found in itemDetail.');
    //}

    const requestBody: PatchItemRequestDto = {
      itemId, itemName, price, itemSellStatus, itemDetail, stockNumber, imageUrlList
    }
    const responseBody: PatchItemResponseDto | ResponseDto | null = await patchItemRequest(String(req.query.id), requestBody);
    console.log('PatchItemResponseDto responseBody: ', responseBody)
    return res.status(200).json({
      code: 0,
      message: "OK",
    });
  } else if (req.method === "DELETE") {
    // 삭제
    const responseBody: DeleteItemResponseDto | ResponseDto | null = await deleteItemRequest(String(req.query.id));
    console.log('DeleteItemResponseDto responseBody: ', responseBody)
    return res.status(200).json({
      code: 0,
      message: "OK",
    });
  } else {
    // 조회
    // const item = productSampleItems.find((data) => String(data.id) === req.query.id);
    const item: GetItemResponseDto | ResponseDto | null = await getItemRequest(String(req.query.id));
    console.log('GetItemResponseDto item: ', item)
    if (!item) {
      return res.status(400).json({
        code: -1,
        message: "상품 정보를 찾을 수 없습니다.",
        data: {},
      });
    }

    return res.status(200).json({
      code: 0,
      message: "OK",
      data: item,
    });
  }
}
