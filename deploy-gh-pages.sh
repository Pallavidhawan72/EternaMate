#!/bin/bash

# Build the project
cd frontend
npm install --legacy-peer-deps
npm run build

# Deploy to gh-pages branch
cd ..
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
cp -r frontend/build/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
git checkout main
