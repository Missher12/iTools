import fs from 'fs';
import path from 'path';

const files = [
  'src/components/modules/Dashboard.tsx',
  'src/components/modules/ContractHub.tsx',
  'src/components/modules/SystemSettings.tsx',
  'src/components/modules/DataCleaner.tsx',
  'src/components/modules/AIAssistant.tsx',
  'src/App.tsx'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We need to be careful with the order of replacements.
    // First, replace text-[10px] with text-sm
    content = content.replace(/text-\[10px\]/g, 'text-sm');
    // Then replace text-[11px] with text-sm
    content = content.replace(/text-\[11px\]/g, 'text-sm');
    // Then replace text-[9px] with text-xs
    content = content.replace(/text-\[9px\]/g, 'text-xs');
    // Then replace text-[8px] with text-[10px]
    content = content.replace(/text-\[8px\]/g, 'text-[10px]');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
