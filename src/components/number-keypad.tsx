"use client";

import { memo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

interface NumberKeypadProps {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export const NumberKeypad = memo(function NumberKeypad({
  onNumberClick,
  onBackspace,
  onClear,
  disabled = false,
}: NumberKeypadProps) {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const touchHandledRef = useRef<boolean>(false);

  const createNumberHandler = useCallback(
    (num: string) => {
      return (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;

        // タッチイベントの場合、フラグを立てる
        if (e.type === "touchstart") {
          touchHandledRef.current = true;
          onNumberClick(num);
          // 300ms後にフラグをリセット
          setTimeout(() => {
            touchHandledRef.current = false;
          }, 300);
        }
        // クリックイベントの場合、タッチで処理されていなければ実行
        else if (e.type === "click" && !touchHandledRef.current) {
          onNumberClick(num);
        }
      };
    },
    [disabled, onNumberClick]
  );

  const handleBackspace = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      if (e.type === "touchstart") {
        touchHandledRef.current = true;
        onBackspace();
        setTimeout(() => {
          touchHandledRef.current = false;
        }, 300);
      } else if (e.type === "click" && !touchHandledRef.current) {
        onBackspace();
      }
    },
    [disabled, onBackspace]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      if (e.type === "touchstart") {
        touchHandledRef.current = true;
        onClear();
        setTimeout(() => {
          touchHandledRef.current = false;
        }, 300);
      } else if (e.type === "click" && !touchHandledRef.current) {
        onClear();
      }
    },
    [disabled, onClear]
  );

  return (
    <div className='grid grid-cols-3 gap-2 mt-4'>
      {numbers.map((num) => {
        const handler = createNumberHandler(num);
        return (
          <Button
            key={num}
            variant='outline'
            onTouchStart={handler}
            onClick={handler}
            className='h-16 text-2xl font-semibold select-none active:scale-95 transition-transform'
            style={{
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
            disabled={disabled}>
            {num}
          </Button>
        );
      })}
      <Button
        variant='outline'
        onTouchStart={handleBackspace}
        onClick={handleBackspace}
        className='h-16 text-xl select-none active:scale-95 transition-transform'
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
        }}
        disabled={disabled}>
        ←
      </Button>
      <Button
        variant='outline'
        onTouchStart={handleClear}
        onClick={handleClear}
        className='h-16 text-xl select-none active:scale-95 transition-transform'
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          userSelect: "none",
        }}
        disabled={disabled}>
        C
      </Button>
    </div>
  );
});
