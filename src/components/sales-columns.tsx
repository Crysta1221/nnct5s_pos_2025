"use client";

import type { Order } from "@/app/api/orders/all/route";
import type { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "注文番号",
  },
  {
    accessorKey: "anko",
    header: "あんこ",
  },
  {
    accessorKey: "custard",
    header: "カスタード",
  },
  {
    accessorKey: "appleJam",
    header: "リンゴジャム",
  },
  {
    accessorKey: "orderDate",
    header: "注文日時",
  },
  {
    accessorKey: "deliveryStatus",
    header: "納品状況",
  },
  {
    accessorKey: "preOrder",
    header: "事前予約",
    cell: ({ row }) => {
      return row.getValue("preOrder") ? "はい" : "いいえ";
    },
  },
  {
    accessorKey: "subtotal",
    header: "小計",
    cell: ({ row }) => {
      const amount = row.getValue("subtotal") as number;
      return `¥${amount}`;
    },
  },
  {
    accessorKey: "couponUsed",
    header: "クーポン使用",
    cell: ({ row }) => {
      return row.getValue("couponUsed") ? "使用" : "未使用";
    },
  },
  {
    accessorKey: "totalAmount",
    header: "会計金額",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return `¥${amount}`;
    },
  },
  {
    accessorKey: "reservationNumber",
    header: "予約番号",
    cell: ({ row }) => {
      const value = row.getValue("reservationNumber") as string;
      return value || "-";
    },
  },
];
