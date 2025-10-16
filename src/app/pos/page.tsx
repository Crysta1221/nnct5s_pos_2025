"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
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

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isNumberPadOpen, setIsNumberPadOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [inputQuantity, setInputQuantity] = useState("");
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [reservationNumber, setReservationNumber] = useState("");
  const [studentId, setStudentId] = useState("");
  const [preOrderStep, setPreOrderStep] = useState<"reservation" | "student">(
    "reservation"
  );
  const [preOrderData, setPreOrderData] = useState<any>(null);
  const [isPreOrderConfirmOpen, setIsPreOrderConfirmOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    "payment" | "coupon" | "cash" | "change"
  >("payment");
  const [couponCount, setCouponCount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [totalAfterCoupon, setTotalAfterCoupon] = useState(0);
  const [usedCouponAmount, setUsedCouponAmount] = useState(0);
  const [usedCouponCount, setUsedCouponCount] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setInputQuantity("");
    setIsNumberPadOpen(true);
  };

  const handleNumberPadClick = (num: string) => {
    if (num === "C") {
      setInputQuantity("");
    } else if (num === "OK") {
      if (selectedProduct && inputQuantity && Number(inputQuantity) > 0) {
        addToCart(selectedProduct, Number(inputQuantity));
        setIsNumberPadOpen(false);
        setInputQuantity("");
      }
    } else {
      setInputQuantity((prev) => {
        if (prev.length >= 3) return prev;
        return prev + num;
      });
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

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    setPurchasedItems([...cart]);
    setTotalAfterCoupon(getTotalPrice());
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
      setCouponCount((prev) => {
        if (prev.length >= 3) return prev;
        return prev + num;
      });
    }
  };

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
      setCashAmount((prev) => {
        if (prev.length >= 6) return prev;
        return prev + num;
      });
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
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("注文の保存に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChange = () => {
    return Number(cashAmount) - totalAfterCoupon;
  };

  const handlePreOrderNumberPad = (num: string) => {
    if (num === "C") {
      if (preOrderStep === "reservation") {
        setReservationNumber("");
      } else {
        setStudentId("");
      }
    } else if (num === "OK") {
      if (preOrderStep === "reservation" && reservationNumber) {
        setPreOrderStep("student");
      } else if (preOrderStep === "student" && studentId) {
        handleVerifyPreOrder();
      }
    } else if (num === "戻る") {
      setPreOrderStep("reservation");
      setStudentId("");
    } else {
      if (preOrderStep === "reservation") {
        setReservationNumber((prev) => {
          if (prev.length >= 10) return prev;
          return prev + num;
        });
      } else {
        setStudentId((prev) => {
          if (prev.length >= 10) return prev;
          return prev + num;
        });
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
    await signOut({ redirectTo: "/login" });
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
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='w-4 h-4 mr-2' />
                  ログアウト
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
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}点
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
                  ¥{getTotalPrice().toLocaleString()}
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
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-4xl font-bold h-16 flex items-center justify-center border rounded-lg bg-muted overflow-hidden'>
                <span className='truncate px-4'>{inputQuantity || "0"}</span>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-2'>
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "C",
                "0",
                "OK",
              ].map((num) => (
                <Button
                  key={num}
                  variant={
                    num === "OK"
                      ? "default"
                      : num === "C"
                      ? "destructive"
                      : "outline"
                  }
                  className='h-16 text-2xl font-semibold'
                  onClick={() => handleNumberPadClick(num)}>
                  {num}
                </Button>
              ))}
            </div>
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
            <div className='space-y-4 py-4'>
              <div className='text-center p-4 bg-muted rounded-lg'>
                <p className='text-base text-muted-foreground mb-2'>
                  現在の金額
                </p>
                <p className='text-3xl font-bold text-primary mb-2'>
                  ¥{totalAfterCoupon.toLocaleString()}
                </p>
                <p className='text-sm text-muted-foreground'>1枚 = ¥100</p>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold h-20 flex items-center justify-center border-2 rounded-lg bg-muted overflow-hidden'>
                  <span className='truncate px-4'>{couponCount || "0"}枚</span>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "C",
                  "0",
                  "OK",
                ].map((num) => (
                  <Button
                    key={num}
                    variant={
                      num === "OK"
                        ? "default"
                        : num === "C"
                        ? "destructive"
                        : "outline"
                    }
                    className='h-16 text-2xl font-semibold'
                    onClick={() => handleCouponNumberPad(num)}>
                    {num}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {checkoutStep === "cash" && (
            <div className='space-y-4 py-4'>
              <div className='text-center p-4 bg-muted rounded-lg space-y-2'>
                <div className='flex justify-between text-sm border-b pb-2'>
                  <p className='text-muted-foreground'>小計</p>
                  <p className='font-semibold'>
                    ¥{(totalAfterCoupon + usedCouponAmount).toLocaleString()}
                  </p>
                </div>
                {usedCouponAmount > 0 && (
                  <div className='flex justify-between text-sm text-green-600 border-b pb-2'>
                    <p>クーポン利用 ×{usedCouponCount}枚</p>
                    <p className='font-semibold'>
                      -¥{usedCouponAmount.toLocaleString()}
                    </p>
                  </div>
                )}
                <div className='flex justify-between pt-1'>
                  <p className='text-base font-semibold'>お支払い額</p>
                  <p className='text-2xl font-bold text-primary'>
                    ¥{totalAfterCoupon.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold h-20 flex items-center justify-center border-2 rounded-lg bg-muted overflow-hidden'>
                  <span className='truncate px-4'>
                    ¥{cashAmount ? Number(cashAmount).toLocaleString() : "0"}
                  </span>
                </div>
              </div>
              <div className='grid grid-cols-3 gap-2'>
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "C",
                  "0",
                  "OK",
                ].map((num) => (
                  <Button
                    key={num}
                    variant={
                      num === "OK"
                        ? "default"
                        : num === "C"
                        ? "destructive"
                        : "outline"
                    }
                    className='h-16 text-2xl font-semibold'
                    onClick={() => handleCashNumberPad(num)}>
                    {num}
                  </Button>
                ))}
              </div>
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
                    ¥{getChange().toLocaleString()}
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
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='text-4xl font-bold h-16 flex items-center justify-center border rounded-lg bg-muted overflow-hidden'>
                <span className='truncate px-4'>
                  {preOrderStep === "reservation"
                    ? reservationNumber || "0"
                    : studentId || "0"}
                </span>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-2'>
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                preOrderStep === "student" ? "戻る" : "C",
                "0",
                "OK",
              ].map((num) => (
                <Button
                  key={num}
                  variant={
                    num === "OK"
                      ? "default"
                      : num === "C" || num === "戻る"
                      ? "destructive"
                      : "outline"
                  }
                  className='h-16 text-2xl font-semibold'
                  onClick={() => handlePreOrderNumberPad(num)}
                  disabled={isSubmitting && num === "OK"}>
                  {num === "OK" && isSubmitting && preOrderStep === "student"
                    ? "確認中..."
                    : num}
                </Button>
              ))}
            </div>
            {preOrderStep === "reservation" && reservationNumber && (
              <p className='text-sm text-muted-foreground text-center'>
                OKを押して学籍番号入力へ
              </p>
            )}
            {preOrderStep === "student" && studentId && (
              <p className='text-sm text-muted-foreground text-center'>
                OKを押して確認へ
              </p>
            )}
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
    </div>
  );
}
