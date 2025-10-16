"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export type OrderCardProps = {
  orderNumber: string;
  anko: number;
  custard: number;
  appleJam: number;
  orderDate: string;
  preOrder: boolean;
  onComplete: (orderNumber: string) => void;
  isCompleting?: boolean;
};

type Product = {
  name: string;
  quantity: number;
};

export function OrderCard({
  orderNumber,
  anko,
  custard,
  appleJam,
  orderDate,
  preOrder,
  onComplete,
  isCompleting = false,
}: OrderCardProps) {
  const products: Product[] = [];

  if (anko > 0) {
    products.push({ name: "高専焼き あんこ", quantity: anko });
  }
  if (custard > 0) {
    products.push({ name: "高専焼き カスタード", quantity: custard });
  }
  if (appleJam > 0) {
    products.push({ name: "高専焼き リンゴジャム", quantity: appleJam });
  }

  return (
    <Card className={`w-full ${preOrder ? "border-blue-500 border-2" : ""}`}>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start mb-2'>
          <div>
            <CardTitle className='text-2xl font-bold'>
              注文番号: {orderNumber}
            </CardTitle>
            {preOrder && (
              <span className='text-sm text-blue-600 font-semibold'>
                事前予約
              </span>
            )}
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>{orderDate}</p>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className='space-y-4'>
            {/* 商品リスト */}
            <div className='border-b pb-3'>
              <h4 className='font-semibold text-xs text-muted-foreground mb-2'>
                ご注文商品
              </h4>
              <div className='space-y-2'>
                {products.map((item, index) => (
                  <div
                    key={index}
                    className='flex justify-between items-center'>
                    <p className='text-2xl font-bold'>{item.name}</p>
                    <p className='text-3xl font-bold text-primary'>
                      {item.quantity}個
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 完了ボタン */}
            <Button
              onClick={() => onComplete(orderNumber)}
              disabled={isCompleting}
              size='lg'
              className='w-full bg-green-600 hover:bg-green-700'>
              <Check className='mr-2 h-5 w-5' />
              {isCompleting ? "完了中..." : "完了"}
            </Button>
          </div>
        ) : (
          <p className='text-gray-500 text-center py-4'>商品がありません</p>
        )}
      </CardContent>
    </Card>
  );
}
