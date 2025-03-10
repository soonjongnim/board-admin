import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { GetItemListResponseDto, PostItemResponseDto } from "../../response/item";
import { ResponseDto } from "../../response";
import { GetSearchItemRequestDto, PostItemRequestDto } from "../../request/item";
import { json } from "stream/consumers";

export const productSampleItems = [
  {
    id: 1,
    code: "A0001",
    brand: "apple",
    name: "iPhone 14 Pro",
    price: 1550000,
    status: "SALE",
    createdAt: dayjs("2023-02-02T10:00:00+09:00"),
    updatedAt: dayjs("2023-02-02T10:00:00+09:00"),
  },
  {
    id: 2,
    code: "A0002",
    brand: "파타고니아",
    name: "클래식 레트로-X 후리스 플리스 자켓",
    price: 230000,
    status: "SALE",
    createdAt: dayjs("2023-02-02T11:00:00+09:00"),
    updatedAt: dayjs("2023-02-02T11:00:00+09:00"),
  },
  {
    id: 3,
    code: "A0003",
    brand: "다이슨",
    name: "dyson v15 detect complete",
    price: 1290000,
    status: "SOLDOUT",
    createdAt: dayjs("2023-02-02T12:00:00+09:00"),
    updatedAt: dayjs("2023-02-02T12:00:00+09:00"),
  },
  {
    id: 4,
    code: "A0004",
    brand: "Aēsop",
    name: "레저렉션 아로마틱 핸드 워시",
    price: 47000,
    status: "NOTSALE",
    createdAt: dayjs("2023-02-02T13:00:00+09:00"),
    updatedAt: dayjs("2023-02-02T13:00:00+09:00"),
  },
  {
    id: 5,
    code: "A0005",
    brand: "LUSH",
    name: "더티 보디 스프레이",
    price: 60000,
    status: "SALE",
    createdAt: dayjs("2023-02-02T14:00:00+09:00"),
    updatedAt: dayjs("2023-02-02T14:00:00+09:00"),
  },
  {
    id: 6,
    code: "A0006",
    brand: "블루보틀",
    name: "쓰리 아프리카스",
    price: 25000,
    status: "SALE",
    createdAt: dayjs("2023-02-02T15:00:00+09:00"),
    updatedAt: dayjs("2023-02-02T15:00:00+09:00"),
  },
];

const DOMAIN = process.env.NEXT_PUBLIC_API_BACKEND_URL;
console.log('DOMAIN: ', DOMAIN);
const API_DOMAIN = `${DOMAIN}/api`;
const POST_ITEM_URL = () => `${API_DOMAIN}/item`;
const GET_ITEM_LIST_URL = () => `${API_DOMAIN}/item/list`;
const GET_SEARCH_ITEM_LIST_URL = (searchParams: URLSearchParams) => `${API_DOMAIN}/item/search-list/${searchParams}`;

export const postItemRequest = async (requestBody: PostItemRequestDto) => {
  const result = await axios.post(POST_ITEM_URL(), requestBody)
      .then(response => {
          const responseBody: PostItemResponseDto = response.data;
          return responseBody;
      })
      .catch(error => {
          if (!error.response) return null;
          const responseBody: ResponseDto = error.response.data;
          return responseBody;
      })
  return result;
}

export const getItemListRequest = async () => {
  const result = await axios.get(GET_ITEM_LIST_URL())
      .then(response => {
          const responseBody: GetItemListResponseDto = response.data;
          return responseBody;
      })
      .catch(error => {
          if (!error.response) return null;
          const responseBody: ResponseDto = error.response.data;
          return responseBody;
      })
  return result;
}

export const getSearchItemListRequest = async (searchParams: URLSearchParams) => {
  console.log('getSearchItemListRequest params: ', searchParams)
  const result = await axios.get(GET_SEARCH_ITEM_LIST_URL(searchParams))
      .then(response => {
          const responseBody: GetItemListResponseDto = response.data;
          return responseBody;
      })
      .catch(error => {
          if (!error.response) return null;
          console.log('error: ' , error.response.data);
          const responseBody: ResponseDto = error.response.data;
          return responseBody;
      })
  return result;
}

const FILE_DOMAIN = `${API_DOMAIN}/file`;
const FILE_UPLOAD_URL = () => `${FILE_DOMAIN}/upload`;
// const FILE_UPLOAD_URL = () => "http://localhost:4000/api/file/upload";
const FILE_DELETE_URL = (itemId: number | string) => `${FILE_DOMAIN}/admin/cloudImagesDelete/${itemId}`;
const THUMBNAILS_DELETE_URL = (itemId: number | string) => `${FILE_DOMAIN}/admin/cloudThumbnailsDelete/${itemId}`;
const multipartFormData = { headers: { 'Content-Type': 'multipart/form-data' } };

export const fileUploadRequest = async (data: FormData) => {
  console.log('API_DOMAIN:', API_DOMAIN);
  console.log('fileUpload func url:', FILE_UPLOAD_URL);
  const result = await axios.post(FILE_UPLOAD_URL(), data, multipartFormData)
      .then(response => {
          const responseBody: string = response.data;
          return responseBody;
      })
      .catch(error => {
          console.log('file error: ', error);
          return null;
      })
  return result;
};

export const filesDeleteRequest = async (itemId: number | string, deletedServerImageList: string[]) => {
  console.log('filesDeleteRequest deletedServerImageList:', deletedServerImageList);
  console.log('FILE_DELETE_URL func url:', FILE_DELETE_URL);
  // const deletedImageList = JSON.stringify(deletedServerImageList)
  // console.log('deletedImageList:', deletedImageList);
  const result = await axios.delete(FILE_DELETE_URL(itemId), {
        data: deletedServerImageList, // Pass the list in the request body
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
          const responseBody: string = response.data;
          return responseBody;
      })
      .catch(error => {
          console.log('file error: ', error);
          return null;
      })
  return result;
};

export const ThumbnailsDeleteRequest = async (itemId: number | string, deletedServerThumbnailList: string[]) => {
  console.log('filesDeleteRequest deletedServerThumbnailList:', deletedServerThumbnailList);
  console.log('THUMBNAILS_DELETE_URL func url:', THUMBNAILS_DELETE_URL);
  const result = await axios.delete(THUMBNAILS_DELETE_URL(itemId), {
        data: deletedServerThumbnailList, // Pass the list in the request body
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
          const responseBody: string = response.data;
          return responseBody;
      })
      .catch(error => {
          console.log('file error: ', error);
          return null;
      })
  return result;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const page = req.query.page ? Number(req.query.page) : 1;
  console.log('products index.ts > req.method: ', req.method);
  if (req.method === "POST") {
    // 생성
    console.log('POST req.body: ', req.body);
    const { itemName, price, itemSellStatus, stockNumber, itemDetail, imageUrlList, thumbnailUrlList } = req.body;
    const writerEmail = 'soon9086@gmail.com'; // 임시
    const requestBody: PostItemRequestDto = {
      itemName, price, itemSellStatus, itemDetail, stockNumber, writerEmail, imageUrlList, thumbnailUrlList
    }
    const responseBody: PostItemResponseDto | ResponseDto | null = await postItemRequest(requestBody);
    console.log('PostItemResponseDto responseBody: ', responseBody)
    return res.status(204).json({
      code: 0,
      message: "OK",
    });
  } else {
    try {
      console.log('req.query: ', req.query)
      // const queryParams = JSON.parse(Object.keys(req.query)[0]);
      // console.log('queryParams: ', queryParams)
      const params = new URLSearchParams();

      // params.append('searchDateType', req.query.searchDateType as string);
      // params.append('itemIds', req.query.itemIds as string);
      // params.append('itemName', req.query.itemName as string);
      params.append('itemSellStatus', req.query.itemSellStatus as string || '');
      params.append('searchBy', req.query.searchBy as string || '');
      params.append('searchQuery', req.query.searchQuery as string || '');
      params.append('startDate', req.query['searchDatePeriod[0]'] as string || '');
      params.append('endDate', req.query['searchDatePeriod[1]'] as string || '');
      // params.append('itemSellStatuss0', req.query['itemSellStatuss[0]'] as string);
      // params.append('itemSellStatuss1', req.query['itemSellStatuss[1]'] as string);
      // params.append('itemSellStatuss2', req.query['itemSellStatuss[2]'] as string);
      // params.append('itemSellStatuss3', req.query['itemSellStatuss[3]'] as string);
      // console.log('itemSellStatuss[0] has:', params.getAll('itemSellStatuss'));
      // console.log('itemSellStatuss[0] has:', params.has('itemSellStatuss[0]'));
      
      // const itemSellStatus:string = queryParams.itemSellStatus;
      // const searchBy:string = queryParams.searchBy;
      // const searchQuery:string = queryParams.searchQuery;
      // const startDate:string = queryParams.searchDatePeriod[0];
      // const endDate:string = queryParams.searchDatePeriod[1];
      
      // const searchParams = {
      //   itemSellStatus,
      //   searchBy,
      //   searchQuery,
      //   startDate,
      //   endDate
      // }
      // console.log('searchParams: ', searchParams)
      
      // const itemIdList = itemIds.split(/[\n,]+/).map((item:string) => item.trim());
      // console.log(itemIdList); // ["항목1", "항목2", "항목3", "항목4", "항목5"]

      // params.append('itemSellStatus', itemSellStatus);
      // params.append('searchBy', searchBy);
      // params.append('searchQuery', searchQuery);
      // params.append('startDate', startDate as string);
      // params.append('endDate', endDate as string);
      console.log('params: ', params)

      const items: GetItemListResponseDto | ResponseDto | null = await getSearchItemListRequest(params);
      // const items: GetItemListResponseDto | ResponseDto | null = await getItemListRequest();
      const { searchList } = items as GetItemListResponseDto;
      if (!items || !items) {
        // Handle the case where itemList is null or undefined
        throw new Error("itemList not found in response");
      }
      
      // const { itemList } = response;
      // console.log('items: ', items); // Logging itemList received from the API
      // console.log('searchList: ', searchList); // Logging itemList received from the API
  
      res.status(200).json({
        code: 0,
        message: "OK",
        data: {
          items: page === 1 ? searchList.slice(0, 5) : [searchList[5]], // Using itemList instead of productSampleItems
          page: {
            currentPage: page,
            pageSize: 5,
            totalPage: 1,
            totalCount: searchList.length,
          },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ code: 1, message: "Internal Server Error" });
    }
  }

  

  
}
