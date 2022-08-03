publish BUMP:
    npm run build
    npm run test
    npm version {{BUMP}}
    npm publish
    git push origin main
    git push --tags

