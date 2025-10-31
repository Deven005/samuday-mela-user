// scripts/download-plugin.js
import { createWriteStream } from 'fs';
import { get } from 'https';
import { existsSync, mkdirSync } from 'fs';

const pluginUrl =
  'https://mytemplate-development.zohostratus.com/zcatalyst-nextjs-plugin-1.0.44.tgz';
const pluginPath = './libs/zcatalyst-nextjs-plugin-1.0.44.tgz';

if (!existsSync('./libs')) mkdirSync('./libs');
if (existsSync(pluginPath)) {
  console.log('✅ Plugin already exists, skipping download.');
  process.exit(0);
}

console.log(`⬇️ Downloading Catalyst plugin from ${pluginUrl} ...`);
get(pluginUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`❌ Failed to download plugin: ${response.statusCode}`);
    process.exit(1);
  }
  const file = createWriteStream(pluginPath);
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('✅ Plugin downloaded successfully!');
  });
});
