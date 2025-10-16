"use client";

import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface NumberPadProps {
  onNumberClick: (num: number) => void;
  onDelete: () => void;
}

export function NumberPad({ onNumberClick, onDelete }: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className='grid grid-cols-3 gap-4 max-w-sm mx-auto'>
      {numbers.slice(0, 9).map((num) => (
        <Button
          key={num}
          variant='outline'
          size='lg'
          onClick={() => onNumberClick(num)}
          className='h-16 w-full text-2xl font-semibold rounded-full'>
          {num}
        </Button>
      ))}
      <div className='col-span-1' />
      <Button
        variant='outline'
        size='lg'
        onClick={() => onNumberClick(0)}
        className='h-16 w-full text-xl font-semibold rounded-full'>
        0
      </Button>
      <Button
        variant='outline'
        size='lg'
        onClick={onDelete}
        className='h-16 w-full rounded-full'>
        <Delete className='h-8 w-8' />
      </Button>
    </div>
  );
}
