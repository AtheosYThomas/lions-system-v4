
# 專案配置注記

## 重要：端口配置規範 ⚠️

**⭐ 本專案統一使用 PORT 5000 ⭐**

### 📌 配置原則
- **所有開發環境**: PORT 5000
- **所有生產環境**: PORT 5000  
- **前端開發伺服器**: PORT 5000
- **後端 Express 伺服器**: PORT 5000

### 🚫 避免使用 PORT 3000
❌ **絕對不要使用 PORT 3000**
- 會導致 Replit 部署問題
- 造成前後端端口不一致
- 影響 LIFF 和 LINE Bot 正常運作

### 📋 需要檢查的檔案
當新增或修改以下檔案時，請確認端口設定：

1. **後端配置**
   - `src/index.ts` → `PORT = 5000`
   - 任何 Express 伺服器設定

2. **前端配置** 
   - `client/vite.config.ts` → `server.port: 5000`
   - `client/package.json` 中的 dev script

3. **部署配置**
   - `.replit` 檔案中的端口映射
   - 任何 Docker 或容器配置

### 🔧 常見錯誤修正
```typescript
// ❌ 錯誤寫法
const PORT = 3000;
const PORT = process.env.PORT || 3000;

// ✅ 正確寫法  
const PORT = 5000;
const PORT = parseInt(process.env.PORT || '5000', 10);
```

### 📝 檢查清單
開發前請確認：
- [ ] 後端伺服器使用 PORT 5000
- [ ] 前端開發伺服器使用 PORT 5000  
- [ ] 環境變數 PORT 設為 5000
- [ ] 所有 API 呼叫指向正確端口
- [ ] LIFF URL 設定正確

---
**建立日期**: 2024年7月17日  
**最後更新**: 2024年7月17日  
**維護者**: 開發團隊
