const fs = require('fs');
const path = require('path');

const pugDir = path.join(process.cwd(), 'src/pug');
const pugFiles = fs.readdirSync(pugDir).filter(f => f.endsWith('.pug'));

pugFiles.forEach(file => {
    const filePath = path.join(pugDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix merged brace and body tag
    if (content.includes('}    body')) {
        console.log(`Fixing merged lines in ${file}...`);
        content = content.replace(/\}    body/g, '}\n    body');
    }
    
    // Fix JSON indentation (ensure closing brace is indented)
    // This looks for a closing brace followed by a newline and then body
    if (content.includes('}\n    body')) {
        console.log(`Fixing indentation in ${file}...`);
        content = content.replace(/\}\n    body/g, '        }\n    body');
    }

    fs.writeFileSync(filePath, content);
});
