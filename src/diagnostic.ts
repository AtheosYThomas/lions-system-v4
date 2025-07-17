
import { runSystemDiagnostic } from './utils/systemDiagnostic';

runSystemDiagnostic().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('診斷過程發生錯誤:', error);
  process.exit(1);
});
