// 此檔案已移動到 src/tools/systemCheck.ts
// 請使用: import { performSystemCheck } from '../tools/systemCheck';

export const performSystemCheck = () => {
  console.warn('⚠️ performSystemCheck 已移動到 src/tools/systemCheck.ts');
  console.warn('請更新 import 路徑: import { performSystemCheck } from "../tools/systemCheck"');
  return Promise.resolve({ 
    status: 'deprecated',
    message: '此函數已移動，請使用新路徑'
  });
};