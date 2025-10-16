This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 高専焼き POSシステム

このプロジェクトは、高専焼きの販売管理を行うPOSシステムです。Google Sheets APIを使用して、注文データを管理します。

## 環境設定

`.env.local`ファイルに以下の環境変数を設定してください:

```env
# Google Cloud Platform Service Account
GCP_SHEETAPI_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GCP_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"

# Google Sheets スプレッドシートID
SPREAD_SHEET_ID="your-spreadsheet-id"

# NextAuth設定
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Google Sheets API設定

1. Google Cloud Platformでプロジェクトを作成
2. Google Sheets APIを有効化
3. サービスアカウントを作成
4. サービスアカウントのJSONキーをダウンロード
5. JSONキーから`private_key`と`client_email`を`.env.local`に設定
   - `private_key`: `GCP_SHEETAPI_KEY`に設定（改行は`\n`のまま）
   - `client_email`: `GCP_CLIENT_EMAIL`に設定
6. Google Sheetsでスプレッドシートを作成し、IDを取得
7. スプレッドシートをサービスアカウントのメールアドレス（`client_email`）と共有（編集者権限）

**重要**: サービスアカウント認証が必要です。APIキーでは書き込み操作ができません。

### スプレッドシートの構造

`order_list`シートに以下のヘッダーを設定してください:

| 注文番号 | あんこ | カスタード | リンゴジャム | 注文日時 | 納品状況 | 事前予約 | 会計金額 |
|---------|-------|-----------|------------|---------|---------|---------|---------|

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
