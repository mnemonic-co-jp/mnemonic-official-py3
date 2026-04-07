# mnemonic-official-py3
2014 年に作った自社サイトを、最新のツールで作り直すプロジェクト（?）。2026 年 4 月に本番化に至る

- Google App Engine / Python 3.12 / FastAPI
- Angular 20

```
$ pipenv shell
$ yarn start
```
デプロイ時は Angular をビルドしてから。
```
$ yarn build
$ yarn deploy <version>
```
pip で新たにライブラリをインストールしたなら、deploy の前に...
```
$ pipenv lock -r > requirements.txt
```
