import { Table, TableProps } from "antd";
import numeral from "numeral";
import React, { PropsWithChildren } from "react";

interface IDefaultTableProps<T> extends TableProps<T> {
  countLabel?: number;
  rowKeyField: string;
}

const DefaultTable = <T extends object>({
  rowKeyField,
  children,
  countLabel,
  ...tableProps
}: PropsWithChildren<IDefaultTableProps<T>>) => {
  return (
    <Table<T>
      size="small"
      rowKey={rowKeyField}
      tableLayout="fixed"
      scroll={{ x: 800 }}
      bordered
      {...(countLabel && { title: () => <p>{numeral(countLabel).format("0,0")}건</p> })}
      {...tableProps}
    >
      {children}
    </Table>
  );
};

export default React.memo(DefaultTable) as typeof DefaultTable;
