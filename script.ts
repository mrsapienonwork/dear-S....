import fs from 'fs';
import path from 'path';

const directoryPath = path.join(process.cwd(), 'src');

function processDirectory(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      processDirectory(path.join(dir, file), fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const files = processDirectory(directoryPath);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace primary buttons
  content = content.replace(/bg-white text-black/g, 'glass-button text-white border-transparent hover:border-violet-500/50');
  
  // Fix sidebar and mobile header
  content = content.replace(/glass-panel\/90/g, 'glass-panel');
  
  // Improve table styles
  content = content.replace(/sticky left-0 glass-panel/g, 'sticky left-0 glass-panel z-20 backdrop-blur-xl');
  content = content.replace(/sticky right-0 glass-panel/g, 'sticky right-0 glass-panel z-20 backdrop-blur-xl');
  
  // Forms and Inputs
  content = content.replace(/className="([^"]*)glass-panel([^"]*output|outline-none[^"]*)"/g, 'className="$1glass-input$2"');
  content = content.replace(/className="flex-1 min-w-0 glass-panel/g, 'className="flex-1 min-w-0 glass-input');
  content = content.replace(/className="w-full glass-panel border/g, 'className="w-full glass-input border');
  content = content.replace(/className="w-full min-w-0 glass-panel/g, 'className="w-full min-w-0 glass-input');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

