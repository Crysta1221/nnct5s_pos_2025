"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Order } from "@/app/api/orders/all/route";
import { useState, useEffect } from "react";

interface EditOrderDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (orderNumber: string, updates: Partial<Order>) => Promise<void>;
}

export function EditOrderDialog({
  order,
  open,
  onOpenChange,
  onSave,
}: EditOrderDialogProps) {
  const [formData, setFormData] = useState<Partial<Order>>(order || {});
  const [saving, setSaving] = useState(false);

  // orderが変更されたらformDataを更新
  useEffect(() => {
    if (order) {
      setFormData(order);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    try {
      await onSave(order.orderNumber, formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>注文を編集 - {order.orderNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='anko'>あんこ</Label>
                <Input
                  id='anko'
                  type='number'
                  min='0'
                  value={formData.anko ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      anko: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='custard'>カスタード</Label>
                <Input
                  id='custard'
                  type='number'
                  min='0'
                  value={formData.custard ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      custard: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='appleJam'>リンゴジャム</Label>
                <Input
                  id='appleJam'
                  type='number'
                  min='0'
                  value={formData.appleJam ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appleJam: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='deliveryStatus'>納品状況</Label>
              <select
                id='deliveryStatus'
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                value={formData.deliveryStatus ?? "未納品"}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryStatus: e.target.value })
                }>
                <option value='未納品'>未納品</option>
                <option value='納品済み'>納品済み</option>
              </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='subtotal'>小計</Label>
                <Input
                  id='subtotal'
                  type='number'
                  min='0'
                  value={formData.subtotal ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      subtotal: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='totalAmount'>会計金額</Label>
                <Input
                  id='totalAmount'
                  type='number'
                  min='0'
                  value={formData.totalAmount ?? 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalAmount: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='reservationNumber'>予約番号</Label>
              <Input
                id='reservationNumber'
                value={formData.reservationNumber ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reservationNumber: e.target.value,
                  })
                }
                placeholder='R123（任意）'
              />
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='preOrder'
                  checked={formData.preOrder ?? false}
                  onChange={(e) =>
                    setFormData({ ...formData, preOrder: e.target.checked })
                  }
                  className='h-4 w-4'
                />
                <Label htmlFor='preOrder' className='cursor-pointer'>
                  事前予約
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='couponUsed'
                  checked={formData.couponUsed ?? false}
                  onChange={(e) =>
                    setFormData({ ...formData, couponUsed: e.target.checked })
                  }
                  className='h-4 w-4'
                />
                <Label htmlFor='couponUsed' className='cursor-pointer'>
                  クーポン使用
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={saving}>
              キャンセル
            </Button>
            <Button type='submit' disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
