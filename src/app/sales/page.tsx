"use client";

import type { Order } from "@/app/api/orders/all/route";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/sales-columns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Menu, LogOut, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SalesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders/all");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/login" });
  };

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

        <div className='flex-1 overflow-y-auto'>
          <div className='container mx-auto py-10'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold'>売上管理</h1>
              <Button onClick={fetchOrders} disabled={loading}>
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                更新
              </Button>
            </div>
            {loading ? (
              <div className='flex items-center justify-center h-64'>
                <RefreshCw className='h-8 w-8 animate-spin' />
              </div>
            ) : (
              <DataTable columns={columns} data={orders} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
