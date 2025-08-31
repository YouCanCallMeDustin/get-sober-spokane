# Development Workflow Quick Reference

## Before Making Changes
1. **Identify the source file** - Always work in `src/` folder
2. **Check file type** - Pug, JavaScript, or SCSS?
3. **Locate correct source path** - Use the reference below

## Source File Locations
| File Type | Source Location | Compiled Location |
|-----------|----------------|-------------------|
| Templates | `src/pug/` | `docs/` |
| JavaScript | `src/js/` | `docs/js/` |
| Styles | `src/scss/` | `docs/css/` |

## Build Commands
```bash
npm run build:pug      # Compile Pug templates to HTML
npm run build:scripts  # Compile JavaScript files
npm run build:scss     # Compile SCSS to CSS
npm run build          # Build all assets
```

## Common Patterns
- **Template changes**: Edit `src/pug/file.pug` → `npm run build:pug`
- **JavaScript changes**: Edit `src/js/file.js` → `npm run build:scripts`
- **Style changes**: Edit `src/scss/file.scss` → `npm run build:scss`

## Quick Check
Before editing any file, ask:
- Is this in the `src/` folder? ✅
- Am I editing the source file, not compiled output? ✅
- Do I know which build command to run? ✅

## Emergency Fix
If you accidentally edit a compiled file:
```bash
npm run build  # This will restore the compiled file from source
```
Then make your changes to the correct source file.
