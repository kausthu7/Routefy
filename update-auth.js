const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('route.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('merchant_session')) {
        let changed = false;
        if (!content.includes('getSessionMerchantId')) {
          content = "import { getSessionMerchantId } from '@/lib/auth';\n" + content;
          changed = true;
        }
        
        content = content.replace(/const\s+(\w+)\s*=\s*cookies\(\)\.get\('merchant_session'\)\?\.value;/g, 'const $1 = await getSessionMerchantId();');
        content = content.replace(/cookies\(\)\.delete\('merchant_session'\);/g, "cookies().delete('merchant_session');\n    cookies().delete('merchant_session_token');");
        content = content.replace(/parseInt\(merchantIdCookie,\s*10\)/g, 'Number(merchantIdCookie)');
        content = content.replace(/parseInt\(merchantId,\s*10\)/g, 'Number(merchantId)');

        if (changed || content.includes('getSessionMerchantId')) {
          fs.writeFileSync(fullPath, content);
          console.log('Updated: ' + fullPath);
        }
      }
    }
  }
}

processDir('src/app/api/merchant');
