import { IProductFormValue } from "@/client/sample/product";
import DateRangeField from "@/components/shared/form/control/date-range-field";
import DefaultSearchForm from "@/components/shared/form/ui/default-search-form";
import FieldInline from "@/components/shared/form/ui/field-inline";
import FormSearch from "@/components/shared/form/ui/form-search";
import { Button, Checkbox, Form, Input, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import React, { useCallback } from "react";

const statusOptions = [
  { label: "전체", value: "ALL" },
  { label: "판매중", value: "SALE" },
  { label: "품절", value: "SOLD_OUT" },
  { label: "판매중단", value: "NOT_SALE" },
];

const ProductSearch = () => {
  const [form] = useForm();
  const router = useRouter();

  const handleFinish = useCallback(
    (formValue: IProductFormValue) => {
      // console.log('searchDatePeriod: ', formValue.searchDatePeriod.map((date: { format: (arg0: string) => any; }) => date?.format('YYYY-MM-DD')) )
      router.push({
        pathname: router.pathname,
        query: { ...router.query, ...formValue, 
        searchDatePeriod: formValue.searchDatePeriod ? formValue.searchDatePeriod.map((date: { format: (arg0: string) => any; }) => date?.format('YYYY-MM-DD')) : ['', '']}
      });
    },
    [router]
  );

  return (
    <DefaultSearchForm form={form} onFinish={handleFinish} 
      initialValues={{ itemSellStatus: statusOptions[0].value, searchBy: "itemName" }}>
      <FormSearch>
        <FieldInline>
          {/* <Form.Item label="기간" name="searchDateType" initialValue="전체기간">
            <Select dropdownMatchSelectWidth={false}>
              <Select.Option value="all">전체기간</Select.Option>
              <Select.Option value="1d">1일</Select.Option>
              <Select.Option value="1w">1주</Select.Option>
              <Select.Option value="1m">1개월</Select.Option>
              <Select.Option value="6m">6개월</Select.Option>
              <Select.Option value="1y">1년</Select.Option>
            </Select>
          </Form.Item> */}
          <Form.Item label="기간" name="searchDatePeriod">
            <DateRangeField />
          </Form.Item>
        </FieldInline>
        <div>
          <Form.Item label="판매상태" name="itemSellStatus">
            <Select dropdownMatchSelectWidth={false}>
              {statusOptions.map((option,index) => (
                <Select.Option key={index} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            {/* <Checkbox.Group options={statusOptions} /> */}
          </Form.Item>
        </div>
        <div>
          <FieldInline>
            <Form.Item label="검색조건" name="searchBy">
              <Select dropdownMatchSelectWidth={false}>
                <Select.Option value="itemName">상품명</Select.Option>
                <Select.Option value="writerEmail">등록이메일</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="searchQuery" className="grow">
              <Input placeholder="검색어를 입력해주세요" />
            </Form.Item>
          </FieldInline>
        </div>
        {/* <div>
          <Form.Item name="itemIds" label="상품번호">
            <Input.TextArea placeholder="복수입력시 쉼표(,) 또는 엔터(Enter)로 구분해주세요" />
          </Form.Item>
        </div> */}
      </FormSearch>
      <div className="flex justify-center gap-2">
        <Button htmlType="submit" className="btn-with-icon" icon={<Search />}>
          검색
        </Button>
        <Button htmlType="submit" className="btn-with-icon" onClick={() => form.resetFields()}>
          초기화
        </Button>
      </div>
    </DefaultSearchForm>
  );
};

export default React.memo(ProductSearch);
