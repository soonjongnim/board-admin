import { ISO8601DateTime } from "@/types/common";
import qs from "qs";
import useSWR from "swr";
import { fetchApi } from "../base";
import { Item, ItemListItem } from '@/types/interface';

export interface IProduct {
  id: number;
  code: string;
  brand: string;
  name: string;
  price: number;
  status: string;
  description?: string;
  css?: string;
  js?: string;
  createdAt: ISO8601DateTime;
  updatedAt: ISO8601DateTime;
}

export interface IProductFormValue extends Omit<Item, "itemId" | "regTime" | "updateTime"> {
  thumbnailUrlList: string[]; // ✅ 썸네일 리스트 타입 지정
  searchDatePeriod: [];
  brand: string;
  // itemSellStatuss: [];
}

interface IProductsParams {
  page?: number;
  defaultPageSize?: number;
}

export interface IProductsResponse {
  code: number;
  message: string;
  data: {
    items: ItemListItem[];
    page: {
      currentPage: number;
      pageSize: number;
      totalPage: number;
      totalCount: number;
    };
  };
}

export interface IProductResponse {
  code: number;
  message: string;
  data: ItemListItem;
}

export const useProducts = (params: IProductsParams = {}) => {
  console.log('useProducts params: ', params);
  return useSWR<IProductsResponse>(`api/sample/products?${qs.stringify(params)}`);
};

export const useProduct = (id: string | number) => {
  return useSWR<IProductResponse>(`api/sample/products/${id}`);
};

export const createProduct = (value: IProductFormValue) => {
  return fetchApi.post(`api/sample/products`, { body: JSON.stringify(value) });
};

export const updateProduct = (id: string, value: IProductFormValue) => {
  return fetchApi.put(`api/sample/products/${id}`, { body: JSON.stringify(value) });
};

export const deleteProduct = (id: string | number) => {
  return fetchApi.delete(`api/sample/products/${id}`);
};
