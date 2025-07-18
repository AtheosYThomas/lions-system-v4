
# LIFF 設定指南

## 🚨 當前問題
LIFF ID `2007739371-aKePV20l` 返回 404 錯誤，表示此 LIFF 應用程式不存在或已被刪除。

## 🔧 修復步驟

### 1. 到 LINE Developers Console
1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 登入您的帳號
3. 選擇您的 Provider 和 Channel

### 2. 建立新的 LIFF 應用程式
1. 點擊 「LIFF」分頁
2. 點擊 「Add」建立新的 LIFF 應用程式
3. 設定以下參數：
   - **LIFF app name**: 北大獅子會會員系統
   - **Size**: Full
   - **Endpoint URL**: `https://your-repl-url.replit.dev/liff.html`
   - **Scope**: profile, openid
   - **Bot link feature**: On (Aggressive)

### 3. 更新系統中的 LIFF ID
取得新的 LIFF ID 後，請更新以下檔案：
- `.env` 檔案中的 `LIFF_ID`
- `client/.env` 檔案中的 `VITE_LIFF_ID`
- 系統會自動從環境變數載入配置vices/lineService.ts`

### 4. 測試 LIFF 功能
```bash
npx tsx src/tools/liffTest.ts
```

## 📋 檢查清單
- [ ] 在 LINE Developers Console 建立 LIFF 應用程式
- [ ] 取得新的 LIFF App ID
- [ ] 更新程式碼中的 LIFF App ID
- [ ] 測試 LIFF 初始化是否成功
- [ ] 測試會員註冊流程
