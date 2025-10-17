"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberKeypad } from "@/components/number-keypad";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Menu,
  LogOut,
  Home,
  Check,
  Banknote,
  Ticket,
} from "lucide-react";
import products from "@/data/products.json";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  cartAtom,
  selectedProductAtom,
  inputQuantityAtom,
  isNumberPadOpenAtom,
  isPreOrderOpenAtom,
  isPreOrderConfirmOpenAtom,
  isCheckoutOpenAtom,
  isOrderCompleteOpenAtom,
  reservationNumberAtom,
  studentIdAtom,
  preOrderStepAtom,
  preOrderDataAtom,
  checkoutStepAtom,
  couponCountAtom,
  cashAmountAtom,
  totalAfterCouponAtom,
  usedCouponAmountAtom,
  usedCouponCountAtom,
  purchasedItemsAtom,
  isSubmittingAtom,
  completedOrderNumberAtom,
  isLoggingOutAtom,
  totalPriceAtom,
  changeAmountAtom,
  cartItemCountAtom,
  type Product,
  type CartItem,
} from "@/store/pos-atoms";

export default function POSPage() {
  // jotaiのatomsを使用
  const [cart, setCart] = useAtom(cartAtom);
  const [isNumberPadOpen, setIsNumberPadOpen] = useAtom(isNumberPadOpenAtom);
  const [selectedProduct, setSelectedProduct] = useAtom(selectedProductAtom);
  const [inputQuantity, setInputQuantity] = useAtom(inputQuantityAtom);
  const [isPreOrderOpen, setIsPreOrderOpen] = useAtom(isPreOrderOpenAtom);
  const [reservationNumber, setReservationNumber] = useAtom(
    reservationNumberAtom
  );
  const [studentId, setStudentId] = useAtom(studentIdAtom);
  const [preOrderStep, setPreOrderStep] = useAtom(preOrderStepAtom);
  const [preOrderData, setPreOrderData] = useAtom(preOrderDataAtom);
  const [isPreOrderConfirmOpen, setIsPreOrderConfirmOpen] = useAtom(
    isPreOrderConfirmOpenAtom
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useAtom(isCheckoutOpenAtom);
  const [checkoutStep, setCheckoutStep] = useAtom(checkoutStepAtom);
  const [couponCount, setCouponCount] = useAtom(couponCountAtom);
  const [cashAmount, setCashAmount] = useAtom(cashAmountAtom);
  const [totalAfterCoupon, setTotalAfterCoupon] = useAtom(totalAfterCouponAtom);
  const [usedCouponAmount, setUsedCouponAmount] = useAtom(usedCouponAmountAtom);
  const [usedCouponCount, setUsedCouponCount] = useAtom(usedCouponCountAtom);
  const [purchasedItems, setPurchasedItems] = useAtom(purchasedItemsAtom);
  const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom);
  const [completedOrderNumber, setCompletedOrderNumber] = useAtom(
    completedOrderNumberAtom
  );
  const [isOrderCompleteOpen, setIsOrderCompleteOpen] = useAtom(
    isOrderCompleteOpenAtom
  );
  const [isLoggingOut, setIsLoggingOut] = useAtom(isLoggingOutAtom);

  // 派生値（読み取り専用）
  const totalPrice = useAtomValue(totalPriceAtom);
  const changeAmount = useAtomValue(changeAmountAtom);
  const cartItemCount = useAtomValue(cartItemCountAtom);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setInputQuantity("");
    setIsNumberPadOpen(true);
  };

  const handleNumberPadNumber = useCallback((num: string) => {
    setInputQuantity((prev) => {
      if (prev.length < 3) {
        return prev + num;
      }
      return prev;
    });
  }, []);

  const handleNumberPadBackspace = useCallback(() => {
    setInputQuantity((prev) => prev.slice(0, -1));
  }, []);

  const handleNumberPadClear = useCallback(() => {
    setInputQuantity("");
  }, []);

  const handleNumberPadClick = (num: string) => {
    if (num === "C") {
      setInputQuantity("");
    } else if (num === "OK") {
      if (inputQuantity && Number(inputQuantity) > 0) {
        const qty = Number(inputQuantity);
        setIsNumberPadOpen(false);
        if (selectedProduct) {
          addToCart(selectedProduct, qty);
        }
        setInputQuantity("");
      }
    } else {
      if (inputQuantity.length < 3) {
        setInputQuantity(inputQuantity + num);
      }
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  const handleCheckout = () => {
    setPurchasedItems([...cart]);
    setTotalAfterCoupon(totalPrice);
    setCheckoutStep("payment");
    setUsedCouponAmount(0);
    setUsedCouponCount(0);
    setIsCheckoutOpen(true);
  };

  const handlePaymentMethod = (method: "cash" | "coupon") => {
    if (method === "cash") {
      setCheckoutStep("cash");
    } else {
      setCheckoutStep("coupon");
      setCouponCount("");
    }
  };

  const handleCouponNumber = useCallback((num: string) => {
    setCouponCount((prev) => {
      if (prev.length < 3) {
        return prev + num;
      }
      return prev;
    });
  }, []);

  const handleCouponBackspace = useCallback(() => {
    setCouponCount((prev) => prev.slice(0, -1));
  }, []);

  const handleCouponClear = useCallback(() => {
    setCouponCount("");
  }, []);

  const handleCouponNumberPad = (num: string) => {
    if (num === "C") {
      setCouponCount("");
    } else if (num === "OK") {
      if (couponCount && Number(couponCount) > 0) {
        const inputCount = Number(couponCount);
        const discount = inputCount * 100;
        const actualDiscount = Math.min(discount, totalAfterCoupon);
        const newTotal = Math.max(0, totalAfterCoupon - actualDiscount);
        setUsedCouponAmount(actualDiscount);
        setUsedCouponCount(inputCount);
        setTotalAfterCoupon(newTotal);
        setCheckoutStep("cash");
        setCouponCount("");
      }
    } else {
      if (couponCount.length < 3) {
        setCouponCount(couponCount + num);
      }
    }
  };

  const handleCashNumber = useCallback((num: string) => {
    setCashAmount((prev) => {
      if (prev.length < 6) {
        return prev + num;
      }
      return prev;
    });
  }, []);

  const handleCashBackspace = useCallback(() => {
    setCashAmount((prev) => prev.slice(0, -1));
  }, []);

  const handleCashClear = useCallback(() => {
    setCashAmount("");
  }, []);

  const handleCashNumberPad = (num: string) => {
    if (num === "C") {
      setCashAmount("");
    } else if (num === "OK") {
      if (totalAfterCoupon === 0) {
        setCashAmount("0");
        setCheckoutStep("change");
      } else if (cashAmount && Number(cashAmount) >= totalAfterCoupon) {
        setCheckoutStep("change");
      } else if (cashAmount) {
        alert("金額が不足しています");
      }
    } else {
      if (cashAmount.length < 6) {
        setCashAmount(cashAmount + num);
      }
    }
  };

  const handleCheckoutComplete = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const ankoCount =
        purchasedItems.find((item) => item.product.id === "anko")?.quantity ||
        0;
      const custardCount =
        purchasedItems.find((item) => item.product.id === "custard")
          ?.quantity || 0;
      const appleJamCount =
        purchasedItems.find((item) => item.product.id === "apple")?.quantity ||
        0;

      const now = new Date();

      const subtotal = purchasedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anko: ankoCount,
          custard: custardCount,
          appleJam: appleJamCount,
          orderDate: now.toLocaleString("ja-JP"),
          deliveryStatus: "未完了",
          preOrder: !!preOrderData,
          subtotal: subtotal,
          couponUsed: usedCouponCount,
          totalAmount: subtotal - usedCouponAmount,
          reservationNumber: preOrderData ? `R${reservationNumber}` : "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order");
      }

      const result = await response.json();
      const orderNumber = result.orderNumber || "";

      setIsCheckoutOpen(false);
      setCart([]);
      setPurchasedItems([]);
      setCheckoutStep("payment");
      setCashAmount("");
      setCouponCount("");
      setTotalAfterCoupon(0);
      setUsedCouponAmount(0);
      setUsedCouponCount(0);
      setPreOrderData(null);
      setReservationNumber("");
      setStudentId("");
      setPreOrderStep("reservation");

      // 受付番号を設定して完了ダイアログを表示
      setCompletedOrderNumber(orderNumber);
      setIsOrderCompleteOpen(true);
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("注文の保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreOrderNumber = useCallback((num: string) => {
    setReservationNumber((prev) => {
      if (prev.length < 10) {
        return prev + num;
      }
      return prev;
    });
  }, []);

  const handlePreOrderBackspace = useCallback(() => {
    if (preOrderStep === "reservation") {
      setReservationNumber((prev) => prev.slice(0, -1));
    } else {
      setStudentId((prev) => prev.slice(0, -1));
    }
  }, [preOrderStep]);

  const handlePreOrderClear = useCallback(() => {
    if (preOrderStep === "reservation") {
      setReservationNumber("");
    } else {
      setStudentId("");
    }
  }, [preOrderStep]);

  const handleStudentIdNumber = useCallback((num: string) => {
    setStudentId((prev) => {
      if (prev.length < 10) {
        return prev + num;
      }
      return prev;
    });
  }, []);

  const handlePreOrderNumberPad = (num: string) => {
    // 処理中でOKボタンの場合は無視
    if (isSubmitting && num === "OK") {
      return;
    }

    if (num === "C") {
      if (preOrderStep === "reservation") {
        setReservationNumber("");
      } else {
        setStudentId("");
      }
    } else if (num === "OK") {
      if (preOrderStep === "reservation") {
        if (reservationNumber) {
          setPreOrderStep("student");
        } else {
          alert("整理番号を入力してください");
        }
      } else if (preOrderStep === "student") {
        if (studentId && reservationNumber) {
          handleVerifyPreOrder();
        } else {
          alert("整理番号と学籍番号を入力してください");
        }
      }
    } else if (num === "戻る") {
      setPreOrderStep("reservation");
      setStudentId("");
    } else {
      if (preOrderStep === "reservation") {
        if (reservationNumber.length < 10) {
          setReservationNumber(reservationNumber + num);
        }
      } else {
        if (studentId.length < 10) {
          setStudentId(studentId + num);
        }
      }
    }
  };

  const handleVerifyPreOrder = async () => {
    if (!reservationNumber || !studentId) {
      alert("整理番号と学籍番号を入力してください");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // まず予約番号が既に使用されているかチェック
      const checkResponse = await fetch("/api/orders/check-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationNumber: `R${reservationNumber}`,
        }),
      });

      if (checkResponse.ok) {
        const checkResult = await checkResponse.json();
        if (!checkResult.canOrder) {
          alert(
            "この予約番号は既に使用されています。2回目以降の注文はできません。"
          );
          setIsSubmitting(false);
          return;
        }
      }

      // 予約情報を検証
      const response = await fetch("/api/orders/verify-preorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationNumber,
          studentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "Student ID does not match") {
          alert("学籍番号が一致しません。");
        } else {
          alert("事前予約が見つかりません。");
        }
        return;
      }

      const result = await response.json();
      setPreOrderData(result.data);
      setIsPreOrderOpen(false);
      setIsPreOrderConfirmOpen(true);
    } catch (error) {
      console.error("Pre-order verification failed:", error);
      alert("事前予約の確認に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreOrderConfirm = () => {
    if (!preOrderData) return;

    const totalAmount =
      preOrderData.anko * 100 +
      preOrderData.custard * 100 +
      preOrderData.appleJam * 150;

    const items: CartItem[] = [];
    if (preOrderData.anko > 0) {
      items.push({
        product: products.find((p) => p.id === "anko")!,
        quantity: preOrderData.anko,
      });
    }
    if (preOrderData.custard > 0) {
      items.push({
        product: products.find((p) => p.id === "custard")!,
        quantity: preOrderData.custard,
      });
    }
    if (preOrderData.appleJam > 0) {
      items.push({
        product: products.find((p) => p.id === "apple")!,
        quantity: preOrderData.appleJam,
      });
    }

    setPurchasedItems(items);
    setTotalAfterCoupon(totalAmount);
    setCheckoutStep("payment");
    setUsedCouponAmount(0);
    setUsedCouponCount(0);
    setIsPreOrderConfirmOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePreOrderCancel = () => {
    setIsPreOrderConfirmOpen(false);
    setPreOrderData(null);
    setReservationNumber("");
    setStudentId("");
    setPreOrderStep("reservation");
    setIsPreOrderOpen(true);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut({ redirectTo: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className=' bg-background'>
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
                <DropdownMenuItem
                  onClick={isLoggingOut ? undefined : handleLogout}
                  disabled={isLoggingOut}
                  className={
                    isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                  }>
                  <LogOut className='w-4 h-4 mr-2' />
                  {isLoggingOut ? "ログアウト中..." : "ログアウト"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='flex-1 flex overflow-hidden'>
          <div className='flex-1 border-r flex flex-col'>
            <div className='flex-1 overflow-y-auto p-6'>
              <h2 className='text-xl font-semibold mb-4'>商品選択</h2>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4'>
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className='cursor-pointer hover:shadow-lg transition-shadow flex flex-col'
                    onClick={() => handleProductClick(product)}>
                    <CardHeader>
                      <CardTitle className='text-lg'>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className='flex-1'>
                      <p className='text-2xl font-bold text-primary'>
                        ¥{product.price.toLocaleString()}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button className='w-full' size='sm'>
                        <Plus className='w-4 h-4 mr-2' />
                        追加
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            <div className='border-t p-6'>
              <Button
                className='w-full h-14 text-lg'
                variant='secondary'
                onClick={() => setIsPreOrderOpen(true)}>
                事前予約会計
              </Button>
            </div>
          </div>

          <div className='w-96 bg-card flex flex-col'>
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold flex items-center gap-2'>
                  <ShoppingCart className='w-5 h-5' />
                  カート
                </h2>
                <span className='text-sm text-muted-foreground'>
                  {cartItemCount}点
                </span>
              </div>

              {cart.length === 0 ? (
                <div className='text-center text-muted-foreground py-12'>
                  <ShoppingCart className='w-12 h-12 mx-auto mb-3 opacity-30' />
                  <p>カートは空です</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {cart.map((item) => (
                    <Card key={item.product.id}>
                      <CardContent className='p-4'>
                        <div className='flex justify-between items-start mb-2'>
                          <div className='flex-1'>
                            <p className='font-semibold'>{item.product.name}</p>
                            <p className='text-sm text-muted-foreground'>
                              ¥{item.product.price.toLocaleString()} ×{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => removeFromCart(item.product.id)}>
                            <Trash2 className='w-4 h-4 text-destructive' />
                          </Button>
                        </div>
                        <p className='text-right font-bold text-lg'>
                          ¥
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className='border-t p-6 space-y-4'>
              <div className='flex justify-between items-center text-2xl font-bold'>
                <span>合計</span>
                <span className='text-primary'>
                  ¥{totalPrice.toLocaleString()}
                </span>
              </div>
              <Button
                className='w-full h-16 text-xl bg-destructive'
                size='lg'
                onClick={handleCheckout}
                disabled={cart.length === 0}>
                お会計
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isNumberPadOpen} onOpenChange={setIsNumberPadOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='text-center'>
              <div className='text-4xl font-bold h-16 flex items-center justify-center border rounded-lg bg-muted overflow-hidden'>
                <span className='truncate px-4'>{inputQuantity || "0"}</span>
              </div>
            </div>
            <NumberKeypad
              onNumberClick={handleNumberPadNumber}
              onBackspace={handleNumberPadBackspace}
              onClear={handleNumberPadClear}
            />
            <Button
              variant='default'
              className='w-full h-14 text-xl font-semibold'
              onClick={() => handleNumberPadClick("OK")}
              disabled={!inputQuantity || Number(inputQuantity) === 0}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCheckoutOpen}
        onOpenChange={(open) => {
          setIsCheckoutOpen(open);
          if (!open) {
            setCheckoutStep("payment");
            setCashAmount("");
            setCouponCount("");
            setTotalAfterCoupon(0);
            setUsedCouponAmount(0);
            setUsedCouponCount(0);
            setPurchasedItems([]);
          }
        }}>
        <DialogContent className='sm:max-w-3xl max-h-[85vh]'>
          <DialogHeader className='mb-6'>
            <DialogTitle className='text-2xl text-center'>
              {checkoutStep === "payment" && "お支払方法を選択してください"}
              {checkoutStep === "coupon" && "クーポン枚数を入力"}
              {checkoutStep === "cash" && "お預かり金額を入力"}
              {checkoutStep === "change" && "お会計完了"}
            </DialogTitle>
          </DialogHeader>

          {checkoutStep === "payment" && (
            <div className='space-y-8 py-4'>
              <div className='text-center p-8 bg-muted rounded-lg'>
                <p className='text-lg text-muted-foreground mb-3'>支払金額</p>
                <p className='text-6xl font-bold text-primary'>
                  ¥{totalAfterCoupon.toLocaleString()}
                </p>
              </div>
              <div className='grid grid-cols-2 gap-6'>
                <Button
                  className='h-32 text-3xl font-semibold'
                  variant='outline'
                  onClick={() => handlePaymentMethod("cash")}>
                  <Banknote className='size-12 mr-4 text-orange-500' />
                  現金
                </Button>
                <Button
                  className='h-32 text-3xl font-semibold'
                  variant='outline'
                  onClick={() => handlePaymentMethod("coupon")}>
                  <Ticket className='size-12 mr-4 text-yellow-500' />
                  グルメチケット
                </Button>
              </div>
            </div>
          )}

          {checkoutStep === "coupon" && (
            <div className='space-y-2 py-4'>
              <div className='text-center p-3 bg-muted rounded-lg'>
                <p className='text-sm text-muted-foreground mb-1'>現在の金額</p>
                <p className='text-2xl font-bold text-primary mb-1'>
                  ¥{totalAfterCoupon.toLocaleString()}
                </p>
                <p className='text-xs text-muted-foreground'>1枚 = ¥100</p>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold h-16 flex items-center justify-center border-2 rounded-lg bg-muted overflow-hidden'>
                  <span className='truncate px-4'>{couponCount || "0"}枚</span>
                </div>
              </div>
              <NumberKeypad
                onNumberClick={handleCouponNumber}
                onBackspace={handleCouponBackspace}
                onClear={handleCouponClear}
              />
              <Button
                variant='default'
                className='w-full h-14 text-xl font-semibold'
                onClick={() => handleCouponNumberPad("OK")}
                disabled={!couponCount || Number(couponCount) === 0}>
                OK
              </Button>
            </div>
          )}

          {checkoutStep === "cash" && (
            <div className='space-y-2 py-4'>
              <div className='text-center p-3 bg-muted rounded-lg space-y-1'>
                <div className='flex justify-between text-xs border-b pb-1'>
                  <p className='text-muted-foreground'>小計</p>
                  <p className='font-semibold'>
                    ¥{(totalAfterCoupon + usedCouponAmount).toLocaleString()}
                  </p>
                </div>
                {usedCouponAmount > 0 && (
                  <div className='flex justify-between text-xs text-green-600 border-b pb-1'>
                    <p>クーポン利用 ×{usedCouponCount}枚</p>
                    <p className='font-semibold'>
                      -¥{usedCouponAmount.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className='flex justify-between pt-1'>
                  <p className='text-sm font-semibold'>お支払い額</p>
                  <p className='text-xl font-bold text-primary'>
                    ¥{totalAfterCoupon.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold h-16 flex items-center justify-center border-2 rounded-lg bg-muted overflow-hidden'>
                  <span className='truncate px-4'>
                    ¥{cashAmount ? Number(cashAmount).toLocaleString() : "0"}
                  </span>
                </div>
              </div>
              <NumberKeypad
                onNumberClick={handleCashNumber}
                onBackspace={handleCashBackspace}
                onClear={handleCashClear}
              />
              <Button
                variant='default'
                className='w-full h-14 text-xl font-semibold'
                onClick={() => handleCashNumberPad("OK")}
                disabled={
                  totalAfterCoupon > 0 &&
                  (!cashAmount || Number(cashAmount) < totalAfterCoupon)
                }>
                OK
              </Button>
            </div>
          )}

          {checkoutStep === "change" && (
            <div className='space-y-6 py-4'>
              <div className='border-b pb-4'>
                <h4 className='font-semibold text-sm text-muted-foreground mb-3'>
                  ご購入商品
                </h4>
                <div className='space-y-2 max-h-96 overflow-y-auto pr-2'>
                  {purchasedItems.map((item) => (
                    <div
                      key={item.product.id}
                      className='flex justify-between items-start text-sm'>
                      <div className='flex-1'>
                        <p className='font-medium'>{item.product.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          ¥{item.product.price.toLocaleString()} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className='font-semibold'>
                        ¥{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className='space-y-2 border-b pb-4'>
                <div className='flex justify-between text-sm'>
                  <p className='text-muted-foreground'>小計</p>
                  <p className='font-semibold'>
                    ¥
                    {purchasedItems
                      .reduce(
                        (sum, item) => sum + item.product.price * item.quantity,
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
                {usedCouponAmount > 0 && (
                  <div className='flex justify-between text-sm text-green-600'>
                    <p>クーポン利用 ×{usedCouponCount}枚</p>
                    <p className='font-semibold'>
                      -¥{usedCouponAmount.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className='flex justify-between text-lg font-bold pt-2'>
                  <p>合計</p>
                  <p className='text-primary'>
                    ¥{totalAfterCoupon.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className='space-y-2 pb-4'>
                <div className='flex justify-between text-sm'>
                  <p className='text-muted-foreground'>お預かり</p>
                  <p className='font-semibold'>
                    ¥{Number(cashAmount).toLocaleString()}
                  </p>
                </div>
                <div className='flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary'>
                  <p className='text-sm font-semibold'>おつり</p>
                  <p className='text-3xl font-bold text-primary'>
                    ¥{changeAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <Button
                className='w-full h-14 text-lg font-semibold'
                onClick={handleCheckoutComplete}
                disabled={isSubmitting}>
                {isSubmitting ? "処理中..." : "完了"}
              </Button>

              <div className='text-center pt-2'>
                <p className='text-xs text-muted-foreground'>
                  {new Date().toLocaleString("ja-JP")}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPreOrderOpen}
        onOpenChange={(open) => {
          setIsPreOrderOpen(open);
          if (!open) {
            setReservationNumber("");
            setStudentId("");
            setPreOrderStep("reservation");
          }
        }}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {preOrderStep === "reservation"
                ? "整理番号を入力"
                : "学籍番号を入力"}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='text-center'>
              <div className='text-4xl font-bold h-16 flex items-center justify-center border rounded-lg bg-muted overflow-hidden'>
                <span className='truncate px-4'>
                  {preOrderStep === "reservation"
                    ? reservationNumber || "0"
                    : studentId || "0"}
                </span>
              </div>
            </div>
            <NumberKeypad
              onNumberClick={
                preOrderStep === "reservation"
                  ? handlePreOrderNumber
                  : handleStudentIdNumber
              }
              onBackspace={handlePreOrderBackspace}
              onClear={handlePreOrderClear}
              disabled={isSubmitting}
            />
            {preOrderStep === "student" && (
              <Button
                variant='destructive'
                className='w-full h-14 text-xl font-semibold'
                onClick={() => {
                  setPreOrderStep("reservation");
                  setStudentId("");
                }}
                disabled={isSubmitting}>
                戻る
              </Button>
            )}
            <Button
              variant='default'
              className='w-full h-14 text-xl font-semibold'
              onClick={() => handlePreOrderNumberPad("OK")}
              disabled={
                isSubmitting ||
                (preOrderStep === "reservation" && !reservationNumber) ||
                (preOrderStep === "student" && !studentId)
              }>
              {isSubmitting && preOrderStep === "student" ? "確認中..." : "OK"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPreOrderConfirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            handlePreOrderCancel();
          }
        }}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>事前予約確認</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='border rounded-lg p-4 space-y-2'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>学籍番号:</span>
                <span className='font-semibold'>{preOrderData?.studentId}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>氏名:</span>
                <span className='font-semibold'>{preOrderData?.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>受取日時:</span>
                <span className='font-semibold'>
                  {preOrderData?.pickupDateTime}
                </span>
              </div>
            </div>
            <div className='border rounded-lg p-4 space-y-2'>
              <h3 className='font-semibold mb-2'>注文内容</h3>
              {preOrderData?.anko > 0 && (
                <div className='flex justify-between'>
                  <span>あんこ</span>
                  <span>{preOrderData.anko}個</span>
                </div>
              )}
              {preOrderData?.custard > 0 && (
                <div className='flex justify-between'>
                  <span>カスタード</span>
                  <span>{preOrderData.custard}個</span>
                </div>
              )}
              {preOrderData?.appleJam > 0 && (
                <div className='flex justify-between'>
                  <span>リンゴジャム</span>
                  <span>{preOrderData.appleJam}個</span>
                </div>
              )}
              <div className='flex justify-between pt-2 border-t font-bold'>
                <span>合計金額</span>
                <span>
                  ¥
                  {(
                    (preOrderData?.anko || 0) * 100 +
                    (preOrderData?.custard || 0) * 100 +
                    (preOrderData?.appleJam || 0) * 150
                  ).toLocaleString()}
                </span>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <Button
                variant='outline'
                className='h-14'
                onClick={handlePreOrderCancel}>
                キャンセル
              </Button>
              <Button className='h-14' onClick={handlePreOrderConfirm}>
                お会計へ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 注文完了ダイアログ */}
      <Dialog open={isOrderCompleteOpen} onOpenChange={setIsOrderCompleteOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-2xl text-center'>
              注文が完了しました
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col items-center gap-6 py-6'>
            <div className='flex items-center justify-center w-20 h-20 rounded-full bg-green-100'>
              <Check className='w-12 h-12 text-green-600' />
            </div>
            <div className='text-center space-y-2'>
              <p className='text-lg font-semibold'>受付番号</p>
              <p className='text-5xl font-bold text-primary'>
                {completedOrderNumber}
              </p>
            </div>
          </div>
          <Button
            className='w-full h-14 text-lg'
            onClick={() => setIsOrderCompleteOpen(false)}>
            閉じる
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
