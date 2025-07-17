
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
      require(path.resolve(file));
      console.log(chalk.green(`✅ ${file} OK`));
    } catch (err) {
      console.log(chalk.red(`❌ ${file} 錯誤: ${err.message}`));
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
function runHealthCheck() {
  return new Promise((resolve) => {
    http.get(`http://0.0.0.0:${PORT}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(chalk.green(`✅ Health check OK`));
      } else {
        console.log(chalk.red(`❌ Health check failed. Status: ${res.statusCode}`));
      }
      resolve(true);
    }).on('error', (err) => {
      console.log(chalk.red(`❌ 無法連接到 /health: ${err.message}`));
      resolve(false);
    });
  });
}

// ------------------ DATABASE TEST ------------------
async function runDatabaseTest() {
  try {
    const sequelize = new Sequelize(DB_URL, {
      logging: false
    });
    await sequelize.authenticate();
    console.log(chalk.green('✅ 資料庫連線成功'));

    await sequelize.query("CREATE TEMP TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT);");
    await sequelize.query("INSERT INTO test_table (name) VALUES ('test user');");
    await sequelize.query("DROP TABLE test_table;");

    console.log(chalk.green('✅ 資料庫模擬寫入成功'));
    await sequelize.close();
  } catch (e) {
    console.log(chalk.red(`❌ 資料庫錯誤: ${e.message}`));
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
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log(chalk.green('✅ TypeScript 編譯檢查通過'));
  } catch (error) {
    console.log(chalk.red('❌ TypeScript 編譯錯誤'));
    console.log(error.stdout?.toString() || error.message);
  }
}

// ------------------ MODEL CHECK ------------------
function checkModels() {
  try {
    const models = require('../models');
    console.log(chalk.green('✅ 模型載入成功'));
    console.log(chalk.blue('📋 可用模型:'), Object.keys(models).join(', '));
  } catch (error) {
    console.log(chalk.red(`❌ 模型載入失敗: ${error.message}`));
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
