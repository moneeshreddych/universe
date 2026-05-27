const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const start = content.indexOf('id="view-panel-daily"');
if (start !== -1) {
  console.log(content.substring(start - 100, start + 1800));
} else {
  console.log('view-panel-daily not found');
}
