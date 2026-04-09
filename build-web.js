const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'web', 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

esbuild.build({
  entryPoints: ['web/index.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  outfile: 'web/dist/index.js',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
}).then(() => {
  fs.copyFileSync(
    path.join(__dirname, 'web', 'index.html'),
    path.join(distDir, 'index.html')
  );
  console.log('✓ Web build completed successfully');
}).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
