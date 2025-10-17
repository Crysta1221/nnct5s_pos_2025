"use client";

import type { Order } from "@/app/api/orders/all/route";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const createColumns = (
  onEdit: (order: Order) => void,
  onDelete: (order: Order) => void
): ColumnDef<Order>[] => [
  {
    accessorKey: "orderNumber",
    header: "注文番号",
    size: 120,
  },
  {
    accessorKey: "anko",
    header: "あんこ",
    size: 80,
  },
  {
    accessorKey: "custard",
    header: "カスタード",
    size: 100,
  },
  {
    accessorKey: "appleJam",
    header: "リンゴジャム",
    size: 120,
  },
  {
    accessorKey: "orderDate",
    header: "注文日時",
    size: 180,
  },
  {
    accessorKey: "deliveryStatus",
    header: "納品状況",
    size: 100,
  },
  {
    accessorKey: "preOrder",
    header: "事前予約",
    size: 90,
    cell: ({ row }) => {
      return row.getValue("preOrder") ? "はい" : "いいえ";
    },
  },
  {
    accessorKey: "subtotal",
    header: "小計",
    size: 100,
    cell: ({ row }) => {
      const amount = row.getValue("subtotal") as number;
      return `¥${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "couponUsed",
    header: "クーポン",
    size: 90,
    cell: ({ row }) => {
      return row.getValue("couponUsed") ? "使用" : "未使用";
    },
  },
  {
    accessorKey: "totalAmount",
    header: "会計金額",
    size: 110,
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return `¥${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "reservationNumber",
    header: "予約番号",
    size: 110,
    cell: ({ row }) => {
      const value = row.getValue("reservationNumber") as string;
      return value || "-";
    },
  },
  {
    id: "actions",
    header: "操作",
    size: 120,
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onEdit(order)}
            className='h-8 w-8 p-0'>
            <Pencil className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onDelete(order)}
            className='h-8 w-8 p-0 text-destructive hover:text-destructive'>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      );
    },
  },
];
