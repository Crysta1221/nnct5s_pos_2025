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
  const lastEventTimeRef = useRef<Map<string, number>>(new Map());
  const touchStartTimeRef = useRef<Map<string, number>>(new Map());

  const createNumberHandler = useCallback(
    (num: string) => {
      return (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;

        const now = Date.now();
        const lastEventTime = lastEventTimeRef.current.get(num) || 0;

        // 150ms以内の連続イベントは無視（デバウンス）
        if (now - lastEventTime < 150) {
          e.preventDefault();
          return;
        }

        // タッチイベントの処理
        if (e.type === "touchstart") {
          e.preventDefault();
          touchStartTimeRef.current.set(num, now);
          lastEventTimeRef.current.set(num, now);
          onNumberClick(num);
        }
        // クリックイベントの処理（タッチ後のクリックを防止）
        else if (e.type === "click") {
          const touchStartTime = touchStartTimeRef.current.get(num) || 0;
          // タッチイベントから300ms以内のクリックは無視
          if (now - touchStartTime < 300) {
            e.preventDefault();
            return;
          }
          lastEventTimeRef.current.set(num, now);
          onNumberClick(num);
        }
      };
    },
    [disabled, onNumberClick]
  );

  const handleBackspace = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      const now = Date.now();
      const lastEventTime = lastEventTimeRef.current.get("backspace") || 0;

      if (now - lastEventTime < 150) {
        e.preventDefault();
        return;
      }

      if (e.type === "touchstart") {
        e.preventDefault();
        touchStartTimeRef.current.set("backspace", now);
        lastEventTimeRef.current.set("backspace", now);
        onBackspace();
      } else if (e.type === "click") {
        const touchStartTime = touchStartTimeRef.current.get("backspace") || 0;
        if (now - touchStartTime < 300) {
          e.preventDefault();
          return;
        }
        lastEventTimeRef.current.set("backspace", now);
        onBackspace();
      }
    },
    [disabled, onBackspace]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;

      const now = Date.now();
      const lastEventTime = lastEventTimeRef.current.get("clear") || 0;

      if (now - lastEventTime < 150) {
        e.preventDefault();
        return;
      }

      if (e.type === "touchstart") {
        e.preventDefault();
        touchStartTimeRef.current.set("clear", now);
        lastEventTimeRef.current.set("clear", now);
        onClear();
      } else if (e.type === "click") {
        const touchStartTime = touchStartTimeRef.current.get("clear") || 0;
        if (now - touchStartTime < 300) {
          e.preventDefault();
          return;
        }
        lastEventTimeRef.current.set("clear", now);
        onClear();
      }
    },
    [disabled, onClear]
  );

  return (
    <div className='grid grid-cols-3 gap-2'>
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
