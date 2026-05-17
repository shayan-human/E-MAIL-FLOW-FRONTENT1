const fs = require('fs');
const path = require('path');

const schedulerApiDir = '/home/shayan/Documents/coding/EMAIL FLOW/campaign-scheduler/src/app/api';
const backendLibDir = '/home/shayan/Documents/coding/EMAIL FLOW/campaign-backend/lib';

function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walkDir(schedulerApiDir).concat(walkDir(backendLibDir));

let totalQueries = 0;
const resultsByFile = {};
const otherSupabaseMethods = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const fileQueries = [];
  
  lines.forEach((line, idx) => {
    // Match line containing .from('something') or .from("something")
    // but ignore commented lines
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }
    
    const fromMatch = line.match(/\.from\(['"]([^'"]+)['"]\)/);
    if (fromMatch) {
      const tableName = fromMatch[1];
      
      // Reconstruct query chain
      let queryChain = line.trim();
      let nextIdx = idx + 1;
      while (nextIdx < lines.length && 
             (lines[nextIdx].trim().startsWith('.') || 
              lines[nextIdx].trim().startsWith('//') || 
              lines[nextIdx].trim().startsWith('/*'))) {
        if (!lines[nextIdx].trim().startsWith('//') && !lines[nextIdx].trim().startsWith('/*')) {
          queryChain += ' ' + lines[nextIdx].trim();
        }
        nextIdx++;
      }
      
      fileQueries.push({
        line: idx + 1,
        tableName,
        queryChain
      });
      totalQueries++;
    }
    
    // Detect other Supabase-specific methods
    const rpcMatch = line.match(/\.rpc\(/);
    const storageMatch = line.match(/\.storage\(/) || line.match(/storage\..*Bucket/);
    const realtimeMatch = line.match(/\.realtime\(/) || line.match(/\.channel\(/);
    const containsMatch = line.match(/\.contains\(/);
    const overlapsMatch = line.match(/\.overlaps\(/);
    const textSearchMatch = line.match(/\.textSearch\(/);
    
    if (rpcMatch || storageMatch || realtimeMatch || containsMatch || overlapsMatch || textSearchMatch) {
      otherSupabaseMethods.push({
        file,
        line: idx + 1,
        content: line.trim()
      });
    }
  });
  
  if (fileQueries.length > 0) {
    resultsByFile[file] = fileQueries;
  }
});

console.log(JSON.stringify({
  totalQueries,
  resultsByFile,
  otherSupabaseMethods
}, null, 2));
