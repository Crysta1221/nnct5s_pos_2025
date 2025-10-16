"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "/public/logo.png";
import { Input } from "@/components/ui/input";
import { NumberPad } from "@/components/number-pad";
import { Button } from "@/components/ui/button";
import { ErrorDialog } from "@/components/error-dialog";

export default function Login() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNumberClick = (num: number) => {
    setUserId((prev) => prev + num);
  };

  const handleDelete = () => {
    setUserId((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!userId) {
      setErrorMessage("ユーザーIDを入力してください");
      setErrorOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "エラーが発生しました");
        setErrorOpen(true);
        return;
      }

      router.push(`/management-number?userId=${userId}`);
    } catch (error) {
      setErrorMessage("通信エラーが発生しました");
      setErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center px-4 py-4'>
      <Image src={logo} alt='logo' width={150} height={100} />
      <h1 className='text-3xl mt-4 font-semibold'>POSログイン</h1>

      <div className='w-full max-w-xs mt-8'>
        <label className='text-center text-lg font-medium mb-2 block'>
          ユーザーID
        </label>
        <Input
          value={userId}
          readOnly
          className='rounded-full h-12 text-center !text-2xl font-mono'
          placeholder=''
        />
      </div>

      <div className='mt-8'>
        <NumberPad onNumberClick={handleNumberClick} onDelete={handleDelete} />
      </div>

      <Button
        className='mt-8 rounded-full max-w-xs w-full h-12 text-lg'
        onClick={handleSubmit}
        disabled={isLoading}>
        {isLoading ? "認証中..." : "次へ"}
      </Button>

      <ErrorDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        message={errorMessage}
      />
    </div>
  );
}
