1. Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
2. Create a file called .env
3. Write in this file: "GITHUB_TOKEN=PASTETHETOKEN" and save.
4. Run `yarn go`, it will clone all repos set of line 15 of `script/config.js`
5. Run `yarn run licenses`, it will get all the licenses

