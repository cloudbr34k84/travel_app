// scripts/eslint-to-md.js
import fs from 'fs';
import json2md from 'json2md';

console.log("📄 Generating ESLint Markdown report...");

// Load and parse the JSON file
const rawData = fs.readFileSync('eslint-report.json');
const report = JSON.parse(rawData);

// Calculate totals
const totalErrors = report.reduce((sum, file) => sum + file.errorCount, 0);
const totalWarnings = report.reduce((sum, file) => sum + file.warningCount, 0);

// Convert to Markdown
const markdown = json2md([
  { h1: "ESLint Report" },
  { blockquote: `Found ${totalErrors} errors and ${totalWarnings} warnings across ${report.length} files.` },
  ...report.flatMap(file => [
    { h2: file.filePath },
    ...file.messages.map(msg => ({
      ul: [`[${msg.line}:${msg.column}] ${msg.message} (${msg.ruleId})`]
    }))
  ])
]);

// Write to file
fs.writeFileSync('eslint-report.md', markdown);
console.log("✅ Markdown report generated: eslint-report.md");
