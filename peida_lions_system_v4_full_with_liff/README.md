
# Peida Lions System V4.0

本系統為北大獅子會所設計的會員服務系統，包含活動報名、公告推播、LINE Bot 整合、AI 助理、出席簽到等模組。

## 技術架構

- Node.js + Express
- PostgreSQL + Sequelize ORM
- LINE Messaging API + LIFF
- 前端：React + Vite（LIFF 表單）、EJS（管理後台）

## 環境變數（.env）

請在根目錄建立 `.env` 檔案，包含：

```
LINE_CHANNEL_SECRET=
LINE_ACCESS_TOKEN=
LIFF_ID=
DATABASE_URL=
OPENAI_API_KEY=
JWT_SECRET=
```

## 啟動方式

```bash
npm install
npm run dev
```

## 開發中模組

- [x] 資料庫 schema 設計
- [x] Config 設定模組
- [ ] Sequelize models
- [ ] API 路由
