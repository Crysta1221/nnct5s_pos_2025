import { google } from "googleapis";

export function getGoogleSheetsClient() {
  const privateKey = process.env.GCP_SHEETAPI_KEY;
  const clientEmail = process.env.GCP_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error(
      "Missing required Google Sheets API credentials. Please check your .env.local file."
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      private_key: privateKey.replace(/\\n/g, "\n"),
      client_email: clientEmail,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export type OrderData = {
  orderNumber: string;
  anko: number;
  custard: number;
  appleJam: number;
  orderDate: string;
  deliveryStatus: string;
  preOrder: boolean;
  subtotal: number;
  couponUsed: number;
  totalAmount: number;
  reservationNumber?: string;
};

export type PreOrderData = {
  timestamp: string;
  email: string;
  studentId: string;
  name: string;
  pickupDateTime: string;
  anko: number;
  custard: number;
  appleJam: number;
};

export async function appendOrderToSheet(data: OrderData) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.SPREAD_SHEET_ID;

  const values = [
    [
      data.orderNumber,
      data.anko,
      data.custard,
      data.appleJam,
      data.orderDate,
      data.deliveryStatus,
      data.preOrder ? "はい" : "いいえ",
      data.subtotal,
      data.couponUsed,
      data.totalAmount,
      data.reservationNumber || "",
    ],
  ];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "order_list!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values,
    },
  });

  return response.data;
}

export async function getOrdersFromSheet() {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.SPREAD_SHEET_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "order_list!A:K",
  });

  return response.data.values;
}

export async function getPreOrderFromSheet(reservationNumber: string) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.SPREAD_SHEET_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "高専焼き1!A:H",
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    return null;
  }

  const fullReservationNumber = `R${reservationNumber}`;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[0] === fullReservationNumber) {
      return {
        timestamp: row[0] || "",
        email: row[1] || "",
        studentId: row[2] || "",
        name: row[3] || "",
        pickupDateTime: row[4] || "",
        anko: Number(row[5]) || 0,
        custard: Number(row[6]) || 0,
        appleJam: Number(row[7]) || 0,
      } as PreOrderData;
    }
  }

  return null;
}

export async function getNextOrderNumber(): Promise<number> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = process.env.SPREAD_SHEET_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "order_list!A:A",
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    return 1;
  }

  let maxNumber = 0;
  for (let i = 1; i < rows.length; i++) {
    const orderNumber = rows[i][0];
    if (orderNumber && !isNaN(Number(orderNumber))) {
      maxNumber = Math.max(maxNumber, Number(orderNumber));
    }
  }

  return maxNumber + 1;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}
