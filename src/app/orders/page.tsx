"use client";

import { useEffect, useState } from "react";
import { OrderCard } from "@/components/order-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Menu, LogOut, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type PendingOrder = {
  orderNumber: string;
  anko: number;
  custard: number;
  appleJam: number;
  orderDate: string;
  preOrder: boolean;
  subtotal: number;
  couponUsed: number;
  totalAmount: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingOrders, setCompletingOrders] = useState<Set<string>>(
    new Set()
  );

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }

      const response = await fetch("/api/orders/pending");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      const newOrders = data.orders || [];

      setOrders(newOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 2 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCompleteOrder = async (orderNumber: string) => {
    setCompletingOrders((prev) => new Set(prev).add(orderNumber));

    try {
      const response = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber,
          status: "完了",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Remove the completed order from the list
      setOrders((prev) =>
        prev.filter((order) => order.orderNumber !== orderNumber)
      );
    } catch (error) {
      console.error("Failed to complete order:", error);
      alert("注文の完了に失敗しました");
    } finally {
      setCompletingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderNumber);
        return newSet;
      });
    }
  };

  const regularOrders = orders.filter((order) => !order.preOrder);
  const preOrders = orders.filter((order) => order.preOrder);

  // Split regular orders into two columns
  const column1Orders = regularOrders.filter((_, index) => index % 2 === 0);
  const column2Orders = regularOrders.filter((_, index) => index % 2 === 1);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/login" });
  };

  if (loading) {
    return (
      <div className='bg-background'>
        <div className='h-screen flex flex-col'>
          <div className='border-b bg-card p-4'>
            <div className='flex justify-between items-center'>
              <h1 className='text-2xl font-bold'>高専焼き POSシステム</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline'>
                    <Menu className='w-5 h-5 mr-2' />
                    メニュー
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem asChild>
                    <Link href='/' className='flex items-center cursor-pointer'>
                      <Home className='w-4 h-4 mr-2' />
                      切り替え
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className='w-4 h-4 mr-2' />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className='flex-1 flex items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-background'>
      <div className='h-screen flex flex-col'>
        <div className='border-b bg-card p-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-2xl font-bold'>高専焼き POSシステム</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>
                  <Menu className='w-5 h-5 mr-2' />
                  メニュー
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                  <Link href='/' className='flex items-center cursor-pointer'>
                    <Home className='w-4 h-4 mr-2' />
                    切り替え
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='w-4 h-4 mr-2' />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <main className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='max-w-7xl mx-auto'>
            <div className='mb-6'>
              <h1 className='text-3xl font-bold'>注文管理</h1>
              <p className='mt-1'>未完了の注文: {orders.length}件</p>
            </div>

            {orders.length === 0 ? (
              <div className='text-center py-12'>
                <p className='text-lg'>現在、未完了の注文はありません</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Column 1: Regular orders (odd indices) */}
                <div className='space-y-4'>
                  <h2 className='text-xl font-semibold mb-4'>注文1</h2>
                  {column1Orders.length === 0 ? (
                    <p className='text-gray-400 text-center py-4'>
                      注文がありません
                    </p>
                  ) : (
                    column1Orders.map((order) => (
                      <OrderCard
                        key={order.orderNumber}
                        orderNumber={order.orderNumber}
                        anko={order.anko}
                        custard={order.custard}
                        appleJam={order.appleJam}
                        orderDate={order.orderDate}
                        preOrder={order.preOrder}
                        onComplete={handleCompleteOrder}
                        isCompleting={completingOrders.has(order.orderNumber)}
                      />
                    ))
                  )}
                </div>

                {/* Column 2: Regular orders (even indices) */}
                <div className='space-y-4'>
                  <h2 className='text-xl font-semibold mb-4'>注文2</h2>
                  {column2Orders.length === 0 ? (
                    <p className='text-gray-400 text-center py-4'>
                      注文がありません
                    </p>
                  ) : (
                    column2Orders.map((order) => (
                      <OrderCard
                        key={order.orderNumber}
                        orderNumber={order.orderNumber}
                        anko={order.anko}
                        custard={order.custard}
                        appleJam={order.appleJam}
                        orderDate={order.orderDate}
                        preOrder={order.preOrder}
                        onComplete={handleCompleteOrder}
                        isCompleting={completingOrders.has(order.orderNumber)}
                      />
                    ))
                  )}
                </div>

                {/* Column 3: Pre-orders */}
                <div className='space-y-4'>
                  <h2 className='text-xl font-semibold text-green-500 mb-4'>
                    事前予約
                  </h2>
                  {preOrders.length === 0 ? (
                    <p className='text-gray-400 text-center py-4'>
                      事前予約がありません
                    </p>
                  ) : (
                    preOrders.map((order) => (
                      <OrderCard
                        key={order.orderNumber}
                        orderNumber={order.orderNumber}
                        anko={order.anko}
                        custard={order.custard}
                        appleJam={order.appleJam}
                        orderDate={order.orderDate}
                        preOrder={order.preOrder}
                        onComplete={handleCompleteOrder}
                        isCompleting={completingOrders.has(order.orderNumber)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
