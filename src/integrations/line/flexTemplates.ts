
/**
 * LINE Flex Message 樣板
 */

export const createCheckinFlexMessage = (title: string, date: string, eventId: string, location?: string) => ({
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
          color: '#1DB446'
        },
        {
          type: 'text' as const,
          text: `📢 ${title}`,
          weight: 'bold' as const,
          size: 'xl' as const,
          wrap: true,
          margin: 'md' as const
        },
        {
          type: 'separator' as const,
          margin: 'md' as const
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
                  flex: 1
                },
                {
                  type: 'text' as const,
                  text: `活動日期：${new Date(date).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`,
                  size: 'sm' as const,
                  color: '#555555',
                  flex: 4,
                  wrap: true
                }
              ]
            }
          ]
        }
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
          color: '#1DB446'
        },
        {
          type: 'text' as const,
          text: '點擊按鈕即可快速完成報到',
          size: 'xs' as const,
          color: '#999999',
          align: 'center' as const,
          margin: 'sm' as const
        }
      ],
    },
  },
});

export const createEventReminderMessage = (title: string, date: string, eventId: string, reminderType: 'before' | 'day' = 'before') => ({
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
          color: '#1DB446'
        },
        {
          type: 'text' as const,
          text: reminderType === 'before' ? '⏰ 活動提醒' : '📅 活動今日舉行',
          weight: 'bold' as const,
          size: 'lg' as const,
          margin: 'md' as const
        },
        {
          type: 'text' as const,
          text: title,
          size: 'md' as const,
          margin: 'sm' as const,
          wrap: true
        },
        {
          type: 'text' as const,
          text: `📅 ${new Date(date).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}`,
          size: 'sm' as const,
          color: '#555555',
          margin: 'sm' as const
        }
      ]
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
          color: '#1DB446'
        }
      ]
    }
  }
});
