
import { useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";

// 預設 Flex Message 樣板
const defaultTemplate = {
  type: "bubble",
  hero: {
    type: "image",
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=800&q=80",
    size: "full",
    aspectRatio: "20:13",
    aspectMode: "cover"
  },
  body: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "🦁 北大獅子會",
        weight: "bold",
        size: "sm",
        color: "#1DB446"
      },
      {
        type: "text",
        text: "📢 活動報到提醒",
        weight: "bold",
        size: "xl",
        wrap: true,
        margin: "md"
      },
      {
        type: "separator",
        margin: "md"
      },
      {
        type: "box",
        layout: "vertical",
        margin: "md",
        spacing: "sm",
        contents: [
          {
            type: "box",
            layout: "baseline",
            contents: [
              {
                type: "text",
                text: "📅",
                size: "sm",
                flex: 1
              },
              {
                type: "text",
                text: "活動日期：2024/01/15 18:00",
                size: "sm",
                color: "#555555",
                flex: 4,
                wrap: true
              }
            ]
          },
          {
            type: "text",
            text: "請於今天 18:00 前完成報到",
            wrap: true,
            size: "sm",
            color: "#888888",
            margin: "sm"
          }
        ]
      }
    ]
  },
  footer: {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "button",
        style: "primary",
        action: {
          type: "uri",
          label: "🚀 立即報到",
          uri: "https://service.peida.net/checkin/123"
        },
        color: "#1DB446"
      },
      {
        type: "text",
        text: "點擊按鈕即可快速完成報到",
        size: "xs",
        color: "#999999",
        align: "center",
        margin: "sm"
      }
    ]
  }
};

// Flex Message 預覽元件
const FlexPreview = ({ data }: { data: any }) => {
  if (!data || !data.body) {
    return (
      <div className="p-4 bg-gray-100 border rounded text-center text-gray-500">
        無效的 Flex Message 格式
      </div>
    );
  }

  const renderContent = (content: any) => {
    if (content.type === "text") {
      const className = `
        ${content.weight === "bold" ? "font-bold" : ""}
        ${content.size === "xl" ? "text-xl" : content.size === "lg" ? "text-lg" : content.size === "sm" ? "text-sm" : content.size === "xs" ? "text-xs" : "text-base"}
        ${content.align === "center" ? "text-center" : content.align === "right" ? "text-right" : "text-left"}
        ${content.margin === "md" ? "mt-3" : content.margin === "sm" ? "mt-2" : content.margin === "lg" ? "mt-4" : ""}
        ${content.wrap ? "break-words" : ""}
      `;
      
      return (
        <div 
          key={Math.random()}
          className={className}
          style={{ color: content.color || "#000000" }}
        >
          {content.text}
        </div>
      );
    }

    if (content.type === "separator") {
      const className = `border-t border-gray-200 ${content.margin === "md" ? "mt-3" : content.margin === "sm" ? "mt-2" : "mt-1"}`;
      return <hr key={Math.random()} className={className} />;
    }

    if (content.type === "box") {
      const className = `
        ${content.layout === "horizontal" ? "flex flex-row" : "flex flex-col"}
        ${content.layout === "baseline" ? "flex flex-row items-baseline" : ""}
        ${content.margin === "md" ? "mt-3" : content.margin === "sm" ? "mt-2" : ""}
        ${content.spacing === "sm" ? "gap-2" : content.spacing === "md" ? "gap-3" : "gap-1"}
      `;

      return (
        <div key={Math.random()} className={className}>
          {content.contents?.map((item: any, index: number) => (
            <div key={index} style={{ flex: item.flex || "auto" }}>
              {renderContent(item)}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border rounded-lg shadow-lg w-[300px] overflow-hidden">
      {/* Hero Image */}
      {data.hero && data.hero.type === "image" && (
        <img 
          src={data.hero.url} 
          alt="Hero" 
          className="w-full h-32 object-cover"
        />
      )}

      {/* Body */}
      <div className="p-4">
        {data.body.contents?.map((content: any, index: number) => (
          <div key={index}>
            {renderContent(content)}
          </div>
        ))}
      </div>

      {/* Footer */}
      {data.footer && (
        <div className="p-4 pt-0">
          {data.footer.contents?.map((content: any, index: number) => {
            if (content.type === "button") {
              return (
                <div key={index} className="mb-2">
                  <button
                    className={`w-full py-2 px-4 rounded text-white font-medium ${
                      content.style === "primary" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"
                    }`}
                    style={{ backgroundColor: content.color || undefined }}
                    onClick={() => {
                      if (content.action?.uri) {
                        window.open(content.action.uri, '_blank');
                      }
                    }}
                  >
                    {content.action?.label || "按鈕"}
                  </button>
                </div>
              );
            }
            return renderContent(content);
          })}
        </div>
      )}
    </div>
  );
};

// 預設樣板選項
const templateOptions = [
  {
    name: "活動報到通知",
    template: defaultTemplate
  },
  {
    name: "活動提醒",
    template: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🦁 北大獅子會",
            weight: "bold",
            size: "sm",
            color: "#1DB446"
          },
          {
            type: "text",
            text: "⏰ 活動提醒",
            weight: "bold",
            size: "lg",
            margin: "md"
          },
          {
            type: "text",
            text: "您報名的活動即將開始！",
            size: "md",
            margin: "sm",
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: "查看活動詳情",
              uri: "https://service.peida.net"
            },
            color: "#1DB446"
          }
        ]
      }
    }
  },
  {
    name: "簡單文字通知",
    template: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🦁 北大獅子會",
            weight: "bold",
            size: "sm",
            color: "#1DB446"
          },
          {
            type: "text",
            text: "通知標題",
            weight: "bold",
            size: "lg",
            margin: "md"
          },
          {
            type: "text",
            text: "這裡是通知內容，可以包含多行文字...",
            size: "sm",
            color: "#666666",
            wrap: true,
            margin: "sm"
          }
        ]
      }
    }
  }
];

const PushTemplatePage = () => {
  const [jsonText, setJsonText] = useState(JSON.stringify(defaultTemplate, null, 2));
  const [parsed, setParsed] = useState<any>(defaultTemplate);
  const [error, setError] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [testUserId, setTestUserId] = useState("");
  const [testType, setTestType] = useState<'user_id' | 'member_search'>('user_id');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (value: string) => {
    setJsonText(value);
    try {
      const obj = JSON.parse(value);
      setParsed(obj);
      setError("");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const loadTemplate = (template: any) => {
    const templateJson = JSON.stringify(template, null, 2);
    setJsonText(templateJson);
    setParsed(template);
    setError("");
  };

  const formatJson = () => {
    try {
      const obj = JSON.parse(jsonText);
      const formatted = JSON.stringify(obj, null, 2);
      setJsonText(formatted);
      setError("");
    } catch (e: any) {
      setError("無法格式化：" + e.message);
    }
  };

  const testPush = async () => {
    if (error || !parsed) {
      alert("請先修正 JSON 格式錯誤");
      return;
    }

    if (!testUserId.trim()) {
      alert("請輸入測試對象");
      return;
    }

    setIsTestLoading(true);
    try {
      const response = await fetch('/api/push-template/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          userId: testUserId.trim(),
          messageJson: parsed,
          testType
        })
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ 測試推播發送成功！");
      } else {
        alert("❌ 測試推播失敗：" + (result.error || "未知錯誤"));
      }
    } catch (error) {
      alert("❌ 測試推播失敗：" + (error instanceof Error ? error.message : "未知錯誤"));
    } finally {
      setIsTestLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (error || !parsed) {
      alert("請先修正 JSON 格式錯誤");
      return;
    }

    if (!templateName.trim()) {
      alert("請輸入樣板名稱");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/push-template/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token'
        },
        body: JSON.stringify({
          name: templateName.trim(),
          description: templateDesc.trim() || null,
          json: parsed
        })
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ 樣板儲存成功！");
        setTemplateName("");
        setTemplateDesc("");
      } else {
        alert("❌ 樣板儲存失敗：" + (result.error || "未知錯誤"));
      }
    } catch (error) {
      alert("❌ 樣板儲存失敗：" + (error instanceof Error ? error.message : "未知錯誤"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 頂部工具列 */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📱 LINE Flex Message 樣板設計</h1>
            <p className="text-gray-600">設計與預覽 LINE 推播訊息樣板</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={formatJson}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🎨 格式化 JSON
            </button>
            <button
              onClick={testPush}
              disabled={isTestLoading || !!error}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {isTestLoading ? "⏳ 測試中..." : "🚀 測試推播"}
            </button>
            <button
              onClick={saveTemplate}
              disabled={isSaving || !!error}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSaving ? "⏳ 儲存中..." : "💾 儲存樣板"}
            </button>
          </div>
        </div>

        {/* 樣板選擇 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">📋 快速載入樣板：</label>
          <div className="flex gap-2">
            {templateOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => loadTemplate(option.template)}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* JSON 編輯器 */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h2 className="font-medium text-gray-800">✍️ JSON 編輯器</h2>
            {error && (
              <div className="text-red-600 text-sm mt-1">
                ❌ JSON 錯誤：{error}
              </div>
            )}
          </div>
          <div className="flex-1">
            <AceEditor
              mode="json"
              theme="github"
              width="100%"
              height="100%"
              value={jsonText}
              onChange={handleChange}
              fontSize={14}
              showPrintMargin={false}
              setOptions={{
                useWorker: false,
                showLineNumbers: true,
                tabSize: 2
              }}
            />
          </div>
        </div>

        {/* 預覽區 */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h2 className="font-medium text-gray-800">👁️ 即時預覽</h2>
            <p className="text-xs text-gray-600">模擬 LINE 聊天室中的 Flex Message 顯示效果</p>
          </div>
          <div className="flex-1 p-6 flex items-start justify-center overflow-auto">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="text-xs text-gray-600 mb-3 text-center">LINE 聊天室預覽</div>
              <FlexPreview data={parsed} />
            </div>
          </div>
        </div>
      </div>

      {/* 底部功能區域 */}
      <div className="bg-white border-t p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 儲存樣板 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">💾 儲存樣板</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-60">
                <label className="block text-sm font-medium text-gray-700 mb-1">樣板名稱 *</label>
                <input
                  type="text"
                  placeholder="例：活動報到通知樣板"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-80">
                <label className="block text-sm font-medium text-gray-700 mb-1">描述 (可選)</label>
                <input
                  type="text"
                  placeholder="樣板用途說明..."
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={saveTemplate}
                disabled={isSaving || !!error || !templateName.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSaving ? "⏳ 儲存中..." : "💾 儲存樣板"}
              </button>
            </div>
          </div>

          {/* 測試推播 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🧪 測試推播</h3>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-60">
                <label className="block text-sm font-medium text-gray-700 mb-1">測試方式</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as 'user_id' | 'member_search')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="user_id">使用 LINE User ID</option>
                  <option value="member_search">搜尋會員姓名</option>
                </select>
              </div>
              <div className="flex-1 min-w-80">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {testType === 'user_id' ? 'LINE User ID *' : '會員姓名 *'}
                </label>
                <input
                  type="text"
                  placeholder={testType === 'user_id' ? 'U1234567890abcdef...' : '王小明'}
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={testPush}
                disabled={isTestLoading || !!error || !testUserId.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isTestLoading ? "⏳ 推播中..." : "🚀 發送測試"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 提示：{testType === 'user_id' ? '請輸入完整的 LINE User ID' : '請輸入已註冊會員的姓名'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushTemplatePage;
