#!/bin/bash
cd ../vendify-be

echo "Initializing git repository..."
git init

echo "Adding files..."
git add .

echo "Committing..."
git commit -m "Initial commit of standalone backend"

echo "Renaming branch to main..."
git branch -M main

echo "Adding remote..."
git remote add origin https://github.com/hoesnial/vendify-be.git

echo "Pushing to remote..."
git push -u origin main
