
# 測試模組說明

本目錄包含北大獅子會系統的測試工具，僅用於開發環境測試。

## 📁 檔案結構

```
src/scripts/test/
├── seedMockData.ts         # 假資料匯入腳本
├── testServiceFunctions.ts # 服務功能測試腳本
├── index.ts               # 測試模組統一入口
└── README.md              # 本說明文件
```

## 🚀 使用方法

### 1. 匯入測試資料

```bash
# 使用 npm script
npm run test:seed

# 或直接執行
npx tsx src/scripts/test/seedMockData.ts
```

會建立以下測試資料：
- 👥 5 位測試會員
- 🎭 5 個測試活動
- 📢 5 則測試公告
- 📝 6 筆測試報名
- ✅ 3 筆測試簽到
- 💳 3 筆測試付款

### 2. 執行功能測試

```bash
# 使用 npm script
npm run test:functions

# 或直接執行
npx tsx src/scripts/test/testServiceFunctions.ts
```

會測試以下服務功能：
- 🗄️ 資料庫連線
- 👥 會員服務
- 🎭 活動服務
- 📢 公告服務
- 📝 報名服務
- ✅ 簽到服務
- 🔧 管理員服務

### 3. 執行完整測試套件

```bash
# 使用 npm script
npm run test:full

# 或直接執行
npx tsx src/scripts/test/index.ts full
```

會依序執行：
1. 建立測試資料
2. 執行服務功能測試
3. 產生綜合報告

### 4. 清空測試資料

```bash
# 使用 npm script
npm run test:clear

# 或直接執行
npx tsx src/scripts/test/index.ts clear
```

## 📊 測試報告

測試完成後會產生詳細報告，包含：
- 總測試項目數
- 通過/失敗測試數
- 通過率
- 詳細錯誤訊息

## ⚠️ 注意事項

1. **僅限開發環境使用** - 請勿在 production 環境執行
2. **會清空現有資料** - 匯入測試資料前會清空所有表格
3. **需要資料庫連線** - 確保 `.env` 設定正確
4. **測試資料為模擬資料** - 僅用於功能測試

## 🔧 自訂測試

### 添加新的測試會員

編輯 `seedMockData.ts` 中的 `mockMembers` 陣列：

```typescript
const mockMembers = [
  {
    id: uuidv4(),
    name: '新會員',
    email: 'new.member@example.com',
    // ... 其他屬性
  },
  // ... 現有會員
];
```

### 添加新的功能測試

編輯 `testServiceFunctions.ts`，添加新的測試方法：

```typescript
async testNewService() {
  console.log('\n🆕 測試新服務功能...');
  
  try {
    // 測試邏輯
    this.recordTest('newService.method', true);
  } catch (error) {
    this.recordTest('newService.method', false, error.message);
  }
}
```

然後在 `runAllTests()` 中呼叫：

```typescript
await this.testNewService();
```

## 📝 測試資料詳細說明

### 會員資料
- 包含 5 位測試會員
- 涵蓋不同角色：officer、member
- 包含 active 和 inactive 狀態
- 每位會員都有 LINE UID

### 活動資料
- 包含 5 個測試活動
- 涵蓋不同狀態：active、cancelled
- 包含過去和未來的活動
- 設定不同的參與人數限制

### 公告資料
- 包含 5 則測試公告
- 涵蓋不同分類：event、system、personnel
- 包含不同狀態：published、draft
- 包含不同對象：all、officers、members

### 報名資料
- 包含 6 筆測試報名
- 涵蓋不同狀態：confirmed、pending、cancelled
- 關聯到不同會員和活動

### 簽到資料
- 包含 3 筆測試簽到
- 包含裝置資訊
- 關聯到已報名的活動

### 付款資料
- 包含 3 筆測試付款
- 涵蓋不同付款方式
- 包含不同狀態：completed、pending
