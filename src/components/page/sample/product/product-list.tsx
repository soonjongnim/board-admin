import { IProduct, deleteProduct, useProducts } from "@/client/sample/product";
import { ItemListItem } from '@/types/interface';
import DefaultTable from "@/components/shared/ui/default-table";
import DefaultTableBtn from "@/components/shared/ui/default-table-btn";
import { ISO8601DateTime } from "@/types/common";
import { Alert, Button, Dropdown, MenuProps, Popconfirm } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import numeral from "numeral";
import React, { useCallback, useMemo, useState } from "react";
import * as XLSX from 'xlsx';

const ProductList = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const router = useRouter();

  const { data, error, isLoading, mutate } = useProducts({ ...router.query, page: router.query.page ? Number(router.query.page) : 1 });

  const downloadExcel = () => {
    if (!data) return;
  
    // 테이블 데이터 가져오기
    const excelData = data.data.items.map(item => ({
      상품코드: item.itemId,
      상품명: item.itemName,
      금액: item.price,
      판매상태: item.itemSellStatus,
      생성일시: dayjs(item.regTime).format("YYYY/MM/DD hh:mm"),
      수정일시: dayjs(item.updateTime).format("YYYY/MM/DD hh:mm"),
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
    XLSX.writeFile(workbook, 'products.xlsx');
  };

  const handleChangePage = useCallback(
    (pageNumber: number) => {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, page: pageNumber },
      });
    },
    [router]
  );

  const onSelectChange = useCallback((newSelectedRowKeys: React.Key[]) => {
    console.log('new check: ', newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys);
  }, []);

  const handleDelete = async (id: string | number) => {
    try {
      // 삭제 동작을 수행하는 함수를 비동기로 호출합니다.
      await deleteProduct(id);
      // mutate 함수를 사용하여 다시 가져오기를 트리거할 수 있다고 가정합니다.
      mutate();
      // 삭제가 성공했을 때 사용자에게 알림을 표시하거나 다른 동작을 수행할 수 있습니다.
      alert('상품이 삭제되었습니다.');
    } catch (error) {
      // 삭제 동작이 실패했을 때 사용자에게 알림을 표시하거나 다른 처리를 수행할 수 있습니다.
      console.error('상품 삭제 중 오류가 발생했습니다:', error);
      alert('상품 삭제 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  const modifyDropdownItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "statusUpdate",
        label: <a onClick={() => console.log(selectedRowKeys)}>상태수정</a>,
      },
    ],
    [selectedRowKeys]
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const columns: ColumnsType<ItemListItem> = [
    {
      key: "action",
      width: 120,
      align: "center",
      render: (_value: unknown, record: ItemListItem) => {
        return (
          <span className="flex justify-center gap-2">
            <Link href={`/admin/product/edit/${record.itemId}`} className="px-2 py-1 text-sm btn">
              수정
            </Link>
            <Popconfirm
              title="상품을 삭제하시겠습니까?"
              onConfirm={() => handleDelete(record.itemId)}
              okText="예"
              cancelText="아니오"
            >
              <a className="px-2 py-1 text-sm btn">삭제</a>
            </Popconfirm>
          </span>
        );
      },
    },
    {
      title: "상품코드",
      dataIndex: "itemId",
      width: 100,
    },
    {
      title: "상품명",
      dataIndex: "name",
      render: (value: string, record: ItemListItem) => {
        return (
          <span>
            <span className="px-2 py-1 mr-1 bg-gray-100 rounded">{record.itemName}</span>
            <span>{value}</span>
          </span>
        );
      },
    },
    {
      title: "금액",
      dataIndex: "price",
      align: "center",
      width: 100,
      render: (value: number) => {
        return <p>{numeral(value).format("0,0")}원</p>;
      },
    },
    {
      title: "판매상태",
      dataIndex: "itemSellStatus",
      align: "center",
      width: 100,
    },
    {
      title: "생성일시",
      dataIndex: "regTime",
      align: "center",
      width: 120,
      render: (value: ISO8601DateTime) => {
        return (
          <div className="text-sm">
            <span className="block">{dayjs(value).format("YYYY/MM/DD")}</span>
            <span className="block">{dayjs(value).format("hh:mm")}</span>
          </div>
        );
      },
    },
    {
      title: "수정일시",
      dataIndex: "updateTime",
      align: "center",
      width: 120,
      render: (value: ISO8601DateTime) => {
        return (
          <div className="text-sm">
            <span className="block">{dayjs(value).format("YYYY/MM/DD")}</span>
            <span className="block">{dayjs(value).format("hh:mm")}</span>
          </div>
        );
      },
    },
  ];

  if (error) {
    return <Alert message="데이터 로딩 중 오류가 발생했습니다." type="warning" />;
  }

  return (
    <>
      <DefaultTableBtn className="justify-between">
        <div>
          <Dropdown disabled={!hasSelected} menu={{ items: modifyDropdownItems }} trigger={["click"]}>
            <Button>일괄수정</Button>
          </Dropdown>

          <span style={{ marginLeft: 8 }}>{hasSelected ? `${selectedRowKeys.length}건 선택` : ""}</span>
        </div>

        <div className="flex-item-list">
          <Button className="btn-with-icon" icon={<Download />} onClick={downloadExcel}>
            엑셀 다운로드
          </Button>
          <Button type="primary" onClick={() => router.push("/admin/product/new")}>
            상품등록
          </Button>
        </div>
      </DefaultTableBtn>

      <DefaultTable<ItemListItem>
        rowKeyField="itemId"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data?.data.items || []}
        loading={isLoading}
        pagination={{
          current: Number(router.query.page || 1),
          defaultPageSize: 5,
          total: data?.data.page.totalCount || 0,
          showSizeChanger: false,
          onChange: handleChangePage,
        }}
        className="mt-3"
        countLabel={data?.data.page.totalCount}
      />
    </>
  );
};

export default React.memo(ProductList);
