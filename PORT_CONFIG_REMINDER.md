
# 🚨 重要開發注記：端口配置提醒

## ⚠️ 端口使用規則

**所有開發和生產環境都必須使用 PORT 5000，不要使用 3000！**

### 為什麼要使用 5000？

1. **Replit 建議使用 5000** - 這是 Replit 推薦的 Web 應用開發端口
2. **生產環境對應** - Port 5000 會自動轉發到 80 和 443 端口
3. **避免混淆** - 統一使用 5000 可以避免前後端端口不一致的問題

### 📋 需要檢查的檔案清單

當修改端口相關設定時，請確保以下檔案都使用 5000：

#### 後端配置 (Node.js/Express)
- [ ] `src/index.ts` - 主伺服器端口
- [ ] `src/config/config.ts` - 配置檔案
- [ ] `.env` - 環境變數中的 PORT 設定

#### 前端配置 (React/Vite)
- [ ] `client/vite.config.ts` - Vite 開發伺服器端口
- [ ] `client/package.json` - 開發腳本中的端口設定

#### 部署配置
- [ ] `.replit` - Replit 部署配置
- [ ] `package.json` - 啟動腳本

### 🔧 正確的配置範例

#### 後端 (src/index.ts)
```typescript
const PORT: number = parseInt(process.env.PORT || '5000', 10);
```

#### 前端 (client/vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0'
  },
  preview: {
    port: 5000,
    host: '0.0.0.0'
  }
})
```

#### 環境變數 (.env)
```
PORT=5000
```

### 🚫 常見錯誤

❌ **不要使用：**
- `port: 3000`
- `PORT=3000`
- `localhost:3000`

✅ **正確使用：**
- `port: 5000`
- `PORT=5000`
- `0.0.0.0:5000`

### 📝 開發檢查清單

每次修改端口相關設定時，請執行以下檢查：

1. [ ] 確認所有配置檔案都使用 5000
2. [ ] 測試前端開發伺服器是否在 5000 端口啟動
3. [ ] 測試後端 API 是否在 5000 端口運行
4. [ ] 確認 Replit 預覽功能正常工作

### 🔄 快速修復指令

如果發現端口配置錯誤，可以使用以下指令快速檢查：

```bash
# 檢查所有檔案中的端口配置
grep -r "port.*3000" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "PORT.*3000" . --exclude-dir=node_modules --exclude-dir=.git

# 檢查正確的 5000 端口配置
grep -r "port.*5000" . --exclude-dir=node_modules --exclude-dir=.git
```

---

**🎯 記住：一律使用 PORT 5000，避免重複發生端口配置問題！**

最後更新：2024-01-16
