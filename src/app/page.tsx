import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  ClipboardList,
  TrendingUp,
  LogOut,
  TableProperties,
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className='min-h-screen p-4 sm:p-8 bg-background'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6 sm:mb-8 flex justify-between items-start'>
          <div>
            <h1 className='text-2xl sm:text-4xl font-bold mb-2'>
              高専焼き POSシステム
            </h1>
            <p className='text-muted-foreground text-sm sm:text-lg'>
              ユーザーID: {session.user?.id}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
            <Button
              type='submit'
              variant='secondary'
              size='icon'
              className='sm:w-auto sm:px-4'>
              <LogOut className='w-4 h-4' />
              <span className='hidden sm:inline sm:ml-2'>ログアウト</span>
            </Button>
          </form>
        </div>

        {/* スマホ版: 横長ボタンを縦に並べる */}
        <div className='flex flex-col gap-3 sm:hidden'>
          <Link
            href='/pos'
            className='group relative overflow-hidden rounded-xl bg-primary p-6 shadow-lg transition-all hover:shadow-xl active:scale-[0.98] border min-h-[80px]'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-primary-foreground mb-1'>
                  POS起動
                </h2>
                <p className='text-primary-foreground/80 text-sm'>
                  POSシステムを起動します
                </p>
              </div>
              <ShoppingCart className='w-16 h-16 text-primary-foreground/20' />
            </div>
          </Link>

          <Link
            href='/orders'
            className='group relative overflow-hidden rounded-xl bg-secondary p-6 shadow-lg transition-all hover:shadow-xl active:scale-[0.98] border min-h-[80px]'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-secondary-foreground mb-1'>
                  注文管理
                </h2>
                <p className='text-secondary-foreground/70 text-sm'>
                  注文履歴の確認と管理
                </p>
              </div>
              <ClipboardList className='w-16 h-16 text-secondary-foreground/20' />
            </div>
          </Link>

          <Link
            href='/sales'
            className='group relative overflow-hidden rounded-xl bg-accent p-6 shadow-lg transition-all hover:shadow-xl active:scale-[0.98] border min-h-[80px]'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-accent-foreground mb-1'>
                  売上管理
                </h2>
                <p className='text-accent-foreground/70 text-sm'>
                  売上データの確認
                </p>
              </div>
              <TrendingUp className='w-16 h-16 text-accent-foreground/20' />
            </div>
          </Link>

          <Link
            href='/reservations'
            className='group relative overflow-hidden rounded-xl bg-muted p-6 shadow-lg transition-all hover:shadow-xl active:scale-[0.98] border min-h-[80px]'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-foreground mb-1'>
                  予約情報
                </h2>
                <p className='text-muted-foreground text-sm'>事前予約の確認</p>
              </div>
              <TableProperties className='w-16 h-16 text-muted-foreground/20' />
            </div>
          </Link>
        </div>

        {/* タブレット/PC版: Bento Grid */}
        <div className='hidden sm:grid grid-cols-2 gap-4 h-[calc(100vh-12rem)]'>
          {/* 左半分: POS起動 */}
          <Link
            href='/pos'
            className='group relative overflow-hidden rounded-2xl bg-primary p-8 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] border'>
            <div className='flex flex-col justify-between h-full'>
              <div>
                <h2 className='text-4xl font-bold text-primary-foreground mb-4'>
                  POS起動
                </h2>
                <p className='text-primary-foreground/80 text-lg'>
                  POSシステムを起動します
                </p>
              </div>
              <div className='flex justify-end'>
                <ShoppingCart className='w-32 h-32 text-primary-foreground/20 group-hover:text-primary-foreground/30 transition-colors' />
              </div>
            </div>
          </Link>

          {/* 右半分: 3分割 */}
          <div className='grid grid-rows-2 gap-4'>
            {/* 右上: 注文管理 */}
            <Link
              href='/orders'
              className='group relative overflow-hidden rounded-2xl bg-secondary p-6 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] border'>
              <div className='flex flex-col justify-between h-full'>
                <div>
                  <h2 className='text-2xl font-bold text-secondary-foreground mb-2'>
                    注文管理
                  </h2>
                  <p className='text-secondary-foreground/70 text-sm'>
                    注文履歴の確認と管理
                  </p>
                </div>
                <div className='flex justify-end'>
                  <ClipboardList className='w-16 h-16 text-secondary-foreground/20 group-hover:text-secondary-foreground/30 transition-colors' />
                </div>
              </div>
            </Link>

            {/* 右下: 2等分 */}
            <div className='grid grid-cols-2 gap-4'>
              {/* 左: 売上管理 */}
              <Link
                href='/sales'
                className='group relative overflow-hidden rounded-2xl bg-accent p-6 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] border'>
                <div className='flex flex-col justify-between h-full'>
                  <div>
                    <h2 className='text-xl font-bold text-accent-foreground mb-2'>
                      売上管理
                    </h2>
                    <p className='text-accent-foreground/70 text-xs'>
                      売上データの確認
                    </p>
                  </div>
                  <div className='flex justify-end'>
                    <TrendingUp className='w-12 h-12 text-accent-foreground/20 group-hover:text-accent-foreground/30 transition-colors' />
                  </div>
                </div>
              </Link>

              {/* 右: 予約情報 */}
              <Link
                href='/reservations'
                className='group relative overflow-hidden rounded-2xl bg-muted p-6 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] border'>
                <div className='flex flex-col justify-between h-full'>
                  <div>
                    <h2 className='text-xl font-bold text-foreground mb-2'>
                      予約情報
                    </h2>
                    <p className='text-muted-foreground text-xs'>
                      事前予約の確認
                    </p>
                  </div>
                  <div className='flex justify-end'>
                    <TableProperties className='w-12 h-12 text-muted-foreground/20 group-hover:text-muted-foreground/30 transition-colors' />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
