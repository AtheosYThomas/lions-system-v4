/**
 * LINE Flex Message 樣板
 */

export const createCheckinFlexMessage = (
  title: string,
  date: string,
  eventId: string,
  location?: string
) => ({
  type: 'flex' as const,
  altText: `📢 報到通知｜${title}`,
  contents: {
    type: 'bubble' as const,
    size: 'mega' as const,
    hero: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=800&q=80',
      size: 'full' as const,
      aspectRatio: '16:9' as const,
      aspectMode: 'cover' as const,
    },
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      spacing: 'md' as const,
      contents: [
        {
          type: 'text' as const,
          text: '🦁 北大獅子會',
          weight: 'bold' as const,
          size: 'sm' as const,
          color: '#1DB446',
        },
        {
          type: 'text' as const,
          text: `📢 ${title}`,
          weight: 'bold' as const,
          size: 'xl' as const,
          wrap: true,
          margin: 'md' as const,
        },
        {
          type: 'separator' as const,
          margin: 'md' as const,
        },
        {
          type: 'box' as const,
          layout: 'vertical' as const,
          margin: 'md' as const,
          spacing: 'sm' as const,
          contents: [
            {
              type: 'box' as const,
              layout: 'baseline' as const,
              contents: [
                {
                  type: 'text' as const,
                  text: '📅',
                  size: 'sm' as const,
                  flex: 1,
                },
                {
                  type: 'text' as const,
                  text: `活動日期：${new Date(date).toLocaleDateString(
                    'zh-TW',
                    {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}`,
                  size: 'sm' as const,
                  color: '#555555',
                  flex: 4,
                  wrap: true,
                },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'button' as const,
          style: 'primary' as const,
          action: {
            type: 'uri' as const,
            label: '🚀 立即報到',
            uri: `https://service.peida.net/checkin/${eventId}`,
          },
          color: '#1DB446',
        },
        {
          type: 'text' as const,
          text: '點擊按鈕即可快速完成報到',
          size: 'xs' as const,
          color: '#999999',
          align: 'center' as const,
          margin: 'sm' as const,
        },
      ],
    },
  },
});

export const createEventReminderMessage = (
  title: string,
  date: string,
  eventId: string,
  reminderType: 'before' | 'day' = 'before'
) => ({
  type: 'flex' as const,
  altText: `⏰ 活動提醒｜${title}`,
  contents: {
    type: 'bubble' as const,
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '🦁 北大獅子會',
          weight: 'bold' as const,
          size: 'sm' as const,
          color: '#1DB446',
        },
        {
          type: 'text' as const,
          text: reminderType === 'before' ? '⏰ 活動提醒' : '📅 活動今日舉行',
          weight: 'bold' as const,
          size: 'lg' as const,
          margin: 'md' as const,
        },
        {
          type: 'text' as const,
          text: title,
          size: 'md' as const,
          margin: 'sm' as const,
          wrap: true,
        },
        {
          type: 'text' as const,
          text: `📅 ${new Date(date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          size: 'sm' as const,
          color: '#555555',
          margin: 'sm' as const,
        },
      ],
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'button' as const,
          style: 'primary' as const,
          action: {
            type: 'uri' as const,
            label: '查看活動詳情',
            uri: `https://service.peida.net/checkin/${eventId}`,
          },
          color: '#1DB446',
        },
      ],
    },
  },
});

// 簽到卡片模板
export const checkinCard = (memberName: string) => ({
  type: 'bubble' as const,
  body: {
    type: 'box' as const,
    layout: 'vertical' as const,
    contents: [
      {
        type: 'text' as const,
        text: '🦁 北大獅子會',
        weight: 'bold' as const,
        size: 'sm' as const,
        color: '#1DB446',
      },
      {
        type: 'text' as const,
        text: '📝 活動簽到',
        weight: 'bold' as const,
        size: 'xl' as const,
        margin: 'md' as const,
      },
      {
        type: 'text' as const,
        text: `歡迎 ${memberName}！`,
        size: 'md' as const,
        margin: 'md' as const,
      },
      {
        type: 'text' as const,
        text: '點擊下方按鈕進入簽到頁面',
        size: 'sm' as const,
        color: '#666666',
        margin: 'sm' as const,
      },
    ],
  },
  footer: {
    type: 'box' as const,
    layout: 'vertical' as const,
    contents: [
      {
        type: 'button' as const,
        style: 'primary' as const,
        action: {
          type: 'uri' as const,
          label: '🚀 立即簽到',
          uri: 'https://service.peida.net/checkin',
        },
        color: '#1DB446',
      },
    ],
  },
});

// 活動總覽卡片模板
export const eventOverviewCard = (
  events: Array<{ id: string; title: string; date: Date }>
) => ({
  type: 'bubble' as const,
  body: {
    type: 'box' as const,
    layout: 'vertical' as const,
    contents: [
      {
        type: 'text' as const,
        text: '🦁 北大獅子會',
        weight: 'bold' as const,
        size: 'sm' as const,
        color: '#1DB446',
      },
      {
        type: 'text' as const,
        text: '📅 近期活動',
        weight: 'bold' as const,
        size: 'xl' as const,
        margin: 'md' as const,
      },
      {
        type: 'separator' as const,
        margin: 'md' as const,
      },
      ...events.slice(0, 3).map((event, index) => ({
        type: 'box' as const,
        layout: 'vertical' as const,
        margin: 'md' as const,
        contents: [
          {
            type: 'text' as const,
            text: event.title,
            weight: 'bold' as const,
            size: 'sm' as const,
          },
          {
            type: 'text' as const,
            text: new Date(event.date).toLocaleDateString('zh-TW', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            size: 'xs' as const,
            color: '#666666',
          },
        ],
      })),
    ],
  },
  footer: {
    type: 'box' as const,
    layout: 'vertical' as const,
    contents: [
      {
        type: 'button' as const,
        style: 'primary' as const,
        action: {
          type: 'uri' as const,
          label: '查看全部活動',
          uri: 'https://service.peida.net',
        },
        color: '#1DB446',
      },
    ],
  },
});

// 會員中心卡片模板
export const memberCenterCard = (member: any) => ({
  type: 'bubble' as const,
  body: {
    type: 'box' as const,
    layout: 'vertical' as const,
    contents: [
      {
        type: 'text' as const,
        text: '🦁 北大獅子會',
        weight: 'bold' as const,
        size: 'sm' as const,
        color: '#1DB446',
      },
      {
        type: 'text' as const,
        text: '👤 會員中心',
        weight: 'bold' as const,
        size: 'xl' as const,
        margin: 'md' as const,
      },
      {
        type: 'separator' as const,
        margin: 'md' as const,
      },
      {
        type: 'box' as const,
        layout: 'vertical' as const,
        margin: 'md' as const,
        contents: [
          {
            type: 'box' as const,
            layout: 'baseline' as const,
            contents: [
              {
                type: 'text' as const,
                text: '姓名：',
                size: 'sm' as const,
                color: '#666666',
                flex: 2,
              },
              {
                type: 'text' as const,
                text: member?.name || '會員',
                size: 'sm' as const,
                flex: 3,
                weight: 'bold' as const,
              },
            ],
          },
          {
            type: 'box' as const,
            layout: 'baseline' as const,
            margin: 'sm' as const,
            contents: [
              {
                type: 'text' as const,
                text: '狀態：',
                size: 'sm' as const,
                color: '#666666',
                flex: 2,
              },
              {
                type: 'text' as const,
                text: member?.status === 'active' ? '正常' : '待確認',
                size: 'sm' as const,
                flex: 3,
                color: member?.status === 'active' ? '#1DB446' : '#FF6B35',
              },
            ],
          },
        ],
      },
    ],
  },
  footer: {
    type: 'box' as const,
    layout: 'vertical' as const,
    contents: [
      {
        type: 'button' as const,
        style: 'primary' as const,
        action: {
          type: 'uri' as const,
          label: '進入會員系統',
          uri: 'https://service.peida.net',
        },
        color: '#1DB446',
      },
    ],
  },
});

// 智慧回覆模板集合
export const flexTemplates = {
  checkinCard: (userName: string) => ({
    type: 'bubble' as const,
    hero: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=800&q=80',
      size: 'full' as const,
      aspectRatio: '20:13' as const,
      aspectMode: 'cover' as const,
    },
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: `您好，${userName}！`,
          weight: 'bold' as const,
          size: 'xl' as const,
        },
        {
          type: 'text' as const,
          text: '歡迎使用簽到服務',
          size: 'md' as const,
          color: '#aaaaaa',
        },
      ],
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      spacing: 'sm' as const,
      contents: [
        {
          type: 'button' as const,
          style: 'primary' as const,
          action: {
            type: 'uri' as const,
            label: '立即簽到',
            uri: 'https://service.peida.net/checkin',
          },
        },
      ],
    },
  }),

  memberCenterCard: (member: any) => ({
    type: 'bubble' as const,
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: `👤 ${member?.name || '未知會員'}`,
          weight: 'bold' as const,
          size: 'lg' as const,
        },
        {
          type: 'text' as const,
          text: '點選下方按鈕查看會員資料',
          size: 'sm' as const,
          color: '#999999',
        },
      ],
    },
    footer: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'button' as const,
          style: 'link' as const,
          action: {
            type: 'uri' as const,
            label: '會員中心',
            uri: 'https://service.peida.net/profile',
          },
        },
      ],
    },
  }),

  eventOverviewCard: (events: any[]) => ({
    type: 'bubble' as const,
    header: {
      type: 'box' as const,
      layout: 'vertical' as const,
      contents: [
        {
          type: 'text' as const,
          text: '📅 最新活動',
          weight: 'bold' as const,
          size: 'lg' as const,
        },
      ],
    },
    body: {
      type: 'box' as const,
      layout: 'vertical' as const,
      spacing: 'sm' as const,
      contents: events.slice(0, 3).map(e => ({
        type: 'box' as const,
        layout: 'vertical' as const,
        spacing: 'xs' as const,
        contents: [
          {
            type: 'text' as const,
            text: e.title || '活動標題',
            weight: 'bold' as const,
            size: 'md' as const,
          },
          {
            type: 'text' as const,
            text: e.date
              ? new Date(e.date).toLocaleDateString('zh-TW')
              : '活動時間',
            size: 'sm' as const,
            color: '#aaaaaa',
          },
          {
            type: 'button' as const,
            style: 'primary' as const,
            height: 'sm' as const,
            action: {
              type: 'uri' as const,
              label: '查看活動',
              uri: `https://service.peida.net/event/${e.id}`,
            },
          },
        ],
      })),
    },
  }),
};

export default flexTemplates;
