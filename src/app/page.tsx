import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ClipboardList, TrendingUp, LogOut } from "lucide-react";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className='min-h-screen p-8 bg-background'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8 flex justify-between items-start'>
          <div>
            <h1 className='text-4xl font-bold mb-2'>高専焼き POSシステム</h1>
            <p className='text-muted-foreground text-lg'>
              ユーザーID: {session.user?.id}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
            <button
              type='submit'
              className='flex items-center gap-2 px-4 py-2 rounded-lg border bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors'>
              <LogOut className='w-4 h-4' />
              ログアウト
            </button>
          </form>
        </div>

        <div className='grid grid-cols-2 gap-4 h-[calc(100vh-12rem)]'>
          <Link
            href='/pos'
            className='group relative overflow-hidden rounded-2xl bg-primary p-8 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] border'>
            <div className='flex flex-col justify-between h-full'>
              <div>
                <h2 className='text-3xl font-bold text-primary-foreground mb-4'>
                  POS起動
                </h2>
                <p className='text-primary-foreground/80'>
                  POSシステムを起動します
                </p>
              </div>
              <div className='flex justify-end'>
                <ShoppingCart className='w-24 h-24 text-primary-foreground/20 group-hover:text-primary-foreground/30 transition-colors' />
              </div>
            </div>
          </Link>

          <div className='grid grid-rows-2 gap-4'>
            <Link
              href='/orders'
              className='group relative overflow-hidden rounded-2xl bg-secondary p-8 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] border'>
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

            <Link
              href='/sales'
              className='group relative overflow-hidden rounded-2xl bg-accent p-8 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] border'>
              <div className='flex flex-col justify-between h-full'>
                <div>
                  <h2 className='text-2xl font-bold text-accent-foreground mb-2'>
                    売上管理
                  </h2>
                  <p className='text-accent-foreground/70 text-sm'>
                    売上データの確認
                  </p>
                </div>
                <div className='flex justify-end'>
                  <TrendingUp className='w-16 h-16 text-accent-foreground/20 group-hover:text-accent-foreground/30 transition-colors' />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
