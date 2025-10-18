import { atom } from "jotai";

// 型定義
export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type PreOrderStep = "reservation" | "student";
export type CheckoutStep =
  | "payment"
  | "coupon"
  | "cash"
  | "change"
  | "orderNumber";

// カート関連
export const cartAtom = atom<CartItem[]>([]);
export const selectedProductAtom = atom<Product | null>(null);
export const inputQuantityAtom = atom("");

// モーダル状態
export const isNumberPadOpenAtom = atom(false);
export const isPreOrderOpenAtom = atom(false);
export const isPreOrderConfirmOpenAtom = atom(false);
export const isCheckoutOpenAtom = atom(false);
export const isOrderCompleteOpenAtom = atom(false);

// 事前予約関連
export const reservationNumberAtom = atom("");
export const studentIdAtom = atom("");
export const preOrderStepAtom = atom<PreOrderStep>("reservation");
export const preOrderDataAtom = atom<any>(null);

// 会計関連
export const checkoutStepAtom = atom<CheckoutStep>("payment");
export const orderNumberInputAtom = atom("");
export const couponCountAtom = atom("");
export const cashAmountAtom = atom("");
export const totalAfterCouponAtom = atom(0);
export const usedCouponAmountAtom = atom(0);
export const usedCouponCountAtom = atom(0);
export const purchasedItemsAtom = atom<CartItem[]>([]);

// その他の状態
export const isSubmittingAtom = atom(false);
export const completedOrderNumberAtom = atom("");
export const isLoggingOutAtom = atom(false);

// 派生atom（計算された値）
export const totalPriceAtom = atom((get) => {
  const cart = get(cartAtom);
  return cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
});

export const changeAmountAtom = atom((get) => {
  const cashAmount = get(cashAmountAtom);
  const totalAfterCoupon = get(totalAfterCouponAtom);
  return Number(cashAmount) - totalAfterCoupon;
});

export const cartItemCountAtom = atom((get) => {
  const cart = get(cartAtom);
  return cart.reduce((total, item) => total + item.quantity, 0);
});
