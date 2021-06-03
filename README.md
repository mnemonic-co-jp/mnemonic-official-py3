# mnemonic-official-py3
2014 年に作った自社サイトを、最新のツールで作り直すプロジェクト（?）。

- Google App Engine / Python 3.9 / FastAPI
- Angular 12

```
$ pipenv shell
$ yarn start
```
デプロイ時は Angular をビルドしてから。
```
$ yarn build
$ yarn deploy <version>
```
