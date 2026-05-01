const fs = require('fs');
const js = fs.readFileSync('frontend/script.js', 'utf8');
const html = fs.readFileSync('frontend/index.html', 'utf8');
const ids = [];
const regex = /document\.getElementById\('([^']+)'\)/g;
let m;
while ((m = regex.exec(js)) !== null) {
  ids.push(m[1]);
}
const missing = ids.filter(id => !html.includes('id="' + id + '"'));
console.log('Missing IDs:', missing);
