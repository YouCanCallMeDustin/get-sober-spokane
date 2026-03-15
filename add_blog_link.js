const fs = require('fs');
const path = require('path');
const dir = './src/pug';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pug'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the exact Dashboard list item and its indentation
  const regex = /^(\s*)li\.nav-item\s*\n\s*a\.nav-link\(href=['"]?\/?dashboard\.html['"]?\)\s*Dashboard/gm;
  
  let modified = false;
  
  content = content.replace(regex, (match, indent) => {
    // If it already has blog nearby, we might skip, but let's assume it doesn't since we checked.
    modified = true;
    return match + '\n' +
           indent + 'li.nav-item\n' +
           indent + '  a.nav-link(href=\'blog.html\') Blog';
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
  }
});
