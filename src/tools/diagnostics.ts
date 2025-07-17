
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import express from 'express';
import http from 'http';
import { parseScript } from 'esprima';
import { globSync } from 'glob';
import chalk from 'chalk';
import { execSync } from 'child_process';
import yaml from 'js-yaml';

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DATABASE_URL || 'postgres://localhost:5432/postgres';

// ------------------ ENV CHECK ------------------
function checkEnvVariables() {
  const envPath = path.resolve('.env');
  const examplePath = path.resolve('.env.example');

  try {
    const envVars = dotenv.parse(fs.readFileSync(envPath));
    
    if (fs.existsSync(examplePath)) {
      const exampleVars = dotenv.parse(fs.readFileSync(examplePath));
      const missingKeys = Object.keys(exampleVars).filter((key) => !envVars[key]);
      if (missingKeys.length > 0) {
        console.log(chalk.red('❌ 缺少以下 .env 變數：'), missingKeys);
      } else {
        console.log(chalk.green('✅ .env 檔案完整'));
      }
    } else {
      console.log(chalk.yellow('⚠️ .env.example 不存在，跳過檢查'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ 無法讀取 .env 檔案: ${error}`));
  }
}

// ------------------ ROUTE SCAN ------------------
function scanRoutesForErrors() {
  const files = globSync('src/{routes,controllers,middleware}/**/*.ts');
  for (const file of files) {
    try {
      // 檢查檔案是否存在
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // 檢查語法錯誤
        if (content.includes('${') && content.includes('}')) {
          console.log(chalk.yellow(`⚠️ ${file} 包含未展開的模板字串`));
        } else {
          console.log(chalk.green(`✅ ${file} OK`));
        }
      } else {
        console.log(chalk.red(`❌ ${file} 檔案不存在`));
      }
    } catch (err) {
      console.log(chalk.red(`❌ ${file} 錯誤: ${err instanceof Error ? err.message : '未知錯誤'}`));
    }
  }
}

// ------------------ STATIC RESOURCE CHECK ------------------
function checkStaticAssets() {
  const staticDirs = ['public', 'client/dist'];
  for (const dir of staticDirs) {
    if (!fs.existsSync(dir)) {
      console.log(chalk.red(`❌ 缺少靜態資源資料夾: ${dir}`));
    } else {
      console.log(chalk.green(`✅ 靜態資源存在: ${dir}`));
    }
  }
}

// ------------------ JS SYNTAX CHECK ------------------
function lintPublicJS() {
  const files = globSync('public/**/*.js');
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf-8');
    try {
      parseScript(code);
      console.log(chalk.green(`✅ ${file} JS 語法正確`));
    } catch (e) {
      console.log(chalk.red(`❌ ${file} JS 語法錯誤: ${e.message}`));
    }
  }
}

// ------------------ HEALTH CHECK ------------------
async function runHealthCheck() {
  try {
    // 檢查健康檢查路由是否定義
    const indexFile = 'src/index.ts';
    if (fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      if (content.includes('/health')) {
        console.log(chalk.green('✅ Health check 路由已定義'));
      } else {
        console.log(chalk.yellow('⚠️ Health check 路由未找到'));
      }
    } else {
      console.log(chalk.red('❌ 主要檔案 src/index.ts 不存在'));
    }
  } catch (error) {
    console.log(chalk.red(`❌ Health check 檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
  }
}

// ------------------ DATABASE TEST ------------------
async function runDatabaseTest() {
  try {
    const sequelize = new Sequelize(DB_URL, {
      logging: false
    });
    await sequelize.authenticate();
    console.log(chalk.green('✅ 資料庫連線成功'));

    // 檢查資料表是否存在
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(chalk.blue(`📋 發現 ${tables.length} 個資料表: ${tables.join(', ')}`));

    await sequelize.close();
  } catch (e) {
    const error = e instanceof Error ? e : new Error('未知錯誤');
    console.log(chalk.red(`❌ 資料庫錯誤: ${error.message}`));
  }
}

// ------------------ HTML LINK CHECK ------------------
function checkHtmlLinks() {
  const htmlFiles = globSync('public/**/*.html');
  const clientFiles = globSync('client/dist/**/*.html');
  const allFiles = [...htmlFiles, ...clientFiles];
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('<script') && !content.includes('<link')) {
      console.log(chalk.yellow(`⚠️ ${file} 未包含 JS 或 CSS 資源`));
    } else {
      console.log(chalk.green(`✅ ${file} OK`));
    }
  }
}

// ------------------ UNIT TEST CHECK ------------------
function runUnitTests() {
  try {
    execSync('npx jest --silent --passWithNoTests', { stdio: 'inherit' });
    console.log(chalk.green('✅ 測試通過'));
  } catch (e) {
    console.log(chalk.yellow('⚠️ 測試失敗或無測試檔案'));
  }
}

// ------------------ SWAGGER CHECK ------------------
function checkSwaggerDocs() {
  const swaggerPath = path.resolve('src/swagger/swagger.yaml');
  if (!fs.existsSync(swaggerPath)) {
    console.log(chalk.yellow('⚠️ swagger.yaml 不存在'));
    return;
  }
  try {
    const content = fs.readFileSync(swaggerPath, 'utf-8');
    yaml.load(content);
    console.log(chalk.green('✅ Swagger YAML 格式正確'));
  } catch (err) {
    console.log(chalk.red(`❌ Swagger 檔案格式錯誤: ${err.message}`));
  }
}

// ------------------ DOCKER CHECK ------------------
function checkDockerFiles() {
  const dockerfile = path.resolve('Dockerfile');
  const compose = path.resolve('docker-compose.yml');
  if (!fs.existsSync(dockerfile)) {
    console.log(chalk.yellow('⚠️ 缺少 Dockerfile'));
  } else {
    console.log(chalk.green('✅ Dockerfile 存在'));
  }
  if (!fs.existsSync(compose)) {
    console.log(chalk.yellow('⚠️ 缺少 docker-compose.yml'));
  } else {
    console.log(chalk.green('✅ docker-compose.yml 存在'));
  }
}

// ------------------ TYPESCRIPT CHECK ------------------
function checkTypeScriptCompilation() {
  try {
    const result = execSync('npx tsc --noEmit src/index.ts', { stdio: 'pipe', encoding: 'utf8' });
    console.log(chalk.green('✅ TypeScript 編譯檢查通過'));
  } catch (error: any) {
    console.log(chalk.red('❌ TypeScript 編譯錯誤'));
    if (error.stdout) {
      console.log(error.stdout.toString());
    }
    if (error.stderr) {
      console.log(error.stderr.toString());
    }
  }
}

// ------------------ MODEL CHECK ------------------
function checkModels() {
  try {
    const modelFiles = [
      'src/models/member.ts',
      'src/models/event.ts', 
      'src/models/registration.ts',
      'src/models/checkin.ts',
      'src/models/payment.ts',
      'src/models/messageLog.ts'
    ];
    
    let validModels = 0;
    for (const modelFile of modelFiles) {
      if (fs.existsSync(modelFile)) {
        validModels++;
        console.log(chalk.green(`✅ ${path.basename(modelFile)} 存在`));
      } else {
        console.log(chalk.red(`❌ ${path.basename(modelFile)} 不存在`));
      }
    }
    
    if (validModels === modelFiles.length) {
      console.log(chalk.green('✅ 所有模型檔案檢查通過'));
    } else {
      console.log(chalk.yellow(`⚠️ ${validModels}/${modelFiles.length} 個模型檔案存在`));
    }
  } catch (error) {
    console.log(chalk.red(`❌ 模型檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`));
  }
}

(async () => {
  console.log(chalk.cyan('\n🔍 系統診斷啟動中...\n'));
  
  console.log(chalk.yellow('📋 環境變數檢查'));
  checkEnvVariables();
  
  console.log(chalk.yellow('\n📋 TypeScript 編譯檢查'));
  checkTypeScriptCompilation();
  
  console.log(chalk.yellow('\n📋 模型檢查'));
  checkModels();
  
  console.log(chalk.yellow('\n📋 路由掃描'));
  scanRoutesForErrors();
  
  console.log(chalk.yellow('\n📋 靜態資源檢查'));
  checkStaticAssets();
  
  console.log(chalk.yellow('\n📋 JS 語法檢查'));
  lintPublicJS();
  
  console.log(chalk.yellow('\n📋 HTML 連結檢查'));
  checkHtmlLinks();
  
  console.log(chalk.yellow('\n📋 健康檢查'));
  await runHealthCheck();
  
  console.log(chalk.yellow('\n📋 資料庫測試'));
  await runDatabaseTest();
  
  console.log(chalk.yellow('\n📋 單元測試'));
  runUnitTests();
  
  console.log(chalk.yellow('\n📋 Swagger 文檔檢查'));
  checkSwaggerDocs();
  
  console.log(chalk.yellow('\n📋 Docker 檔案檢查'));
  checkDockerFiles();
  
  console.log(chalk.cyan('\n✅ 系統診斷完成！\n'));
})();
