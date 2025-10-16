"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import logo from "/public/logo.png";
import { Input } from "@/components/ui/input";
import { NumberPad } from "@/components/number-pad";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/error-dialog";
import { signIn } from "next-auth/react";

function ManagementNumberForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [managementNumber, setManagementNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId) {
      router.push("/login");
    }
  }, [userId, router]);

  const handleNumberClick = (num: number) => {
    setManagementNumber((prev) => prev + num);
  };

  const handleDelete = () => {
    setManagementNumber((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!managementNumber) {
      setErrorMessage("管理番号を入力してください");
      setErrorOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, managementNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "エラーが発生しました");
        setErrorOpen(true);
        return;
      }

      const result = await signIn("credentials", {
        userId,
        managementNumber,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("認証に失敗しました");
        setErrorOpen(true);
        return;
      }

      router.push("/");
    } catch (error) {
      setErrorMessage("通信エラーが発生しました");
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className='flex flex-col justify-center items-center px-4 py-4'>
      <Image src={logo} alt='logo' width={150} height={100} />
      <h1 className='text-3xl mt-4 font-semibold'>管理番号入力</h1>

      <div className='w-full max-w-xs mt-8'>
        <label className='text-center text-lg font-medium mb-2 block'>
          管理番号
        </label>
        <Input
          value={managementNumber}
          readOnly
          className='rounded-full h-12 text-center !text-2xl font-mono'
          placeholder=''
          type='password'
        />
      </div>

      <div className='mt-8'>
        <NumberPad onNumberClick={handleNumberClick} onDelete={handleDelete} />
      </div>

      <Button
        className='mt-8 rounded-full max-w-xs w-full h-12 text-lg'
        onClick={handleSubmit}
        disabled={isLoading}>
        {isLoading ? "認証中..." : "ログイン"}
      </Button>

      <ErrorDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        message={errorMessage}
      />
    </div>
  );
}

export default function ManagementNumber() {
  return (
    <Suspense
      fallback={
        <div className='flex flex-col justify-center items-center px-4 py-4'>
          <Image src={logo} alt='logo' width={150} height={100} />
          <h1 className='text-3xl mt-4 font-semibold'>管理番号入力</h1>
          <div className='mt-8'>読み込み中...</div>
        </div>
      }>
      <ManagementNumberForm />
    </Suspense>
  );
}
