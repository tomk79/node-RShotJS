# RShotJS.node.js

RWD(レスポンシブ・ウェブ・デザイン)のサイトのキャプチャ画像を生成し、
PDFに貼り付けて印刷可能な状態で出力します。

## 使い方

### 1. `phantomjs` をインストール

RShotJS は、 `phantomjs` コマンドに依存します。
[公式ページ](https://phantomjs.org/) を参照してインストールしてください。

または、 macOS の場合は、 [Homebrew](https://brew.sh/) でもインストールもできます。

```
$ brew cask install phantomjs
$ phantomjs -v
2.1.1
```

※ 注意: PhantomJS は、 2016年1月 リリースの v2.1.1 を最後に、開発が終了しました。

### 2. RShotJS.node.js をインストール

```
$ cd (your project directory)
$ git clone https://github.com/tomk79/node-RShotJS.git ./
$ npm install
```

### 3. data.csv を編集

```
$ vim data.csv
```

### 4. キャプチャを撮る

```
$ node RShotJS.node.js port=8080
```

コマンドが終了するまでしばらく待ちます。
カレントディレクトリにoutputディレクトリが作成され、その中にPDF文書が出力されます。



## オプション

- siteName - 対象のサイト名。出力するPDFに記載される。
- port - スクリプト内で立ち上げるローカルサーバーのポート番号。省略時 `8080` が使用される。
- unit - 一度に投げるキューの数を指定。省略時は 1。同時に複数投げた方が、全体の処理は早く終る場合がある。
- pathCsv - CSVのパスを指定。省略時、カレントディレクトリの `./data.csv` を読み込む。
- pathOutput - 出力先ディレクトリを指定。省略時、カレントディレクトリに output ディレクトリを作成して書き出す。
- pathConf - 設定ファイルのパスを指定します。設定ファイルとオプションに同じ項目を設定した場合、設定ファイルの内容よりもオプションの設定値が優先されます。

下記はオプションの指定例。

```
$ node RShotJS.node.js port=8080 unit=1 pathCsv=./data.csv pathOutput=./RShotJS_output/
```

### 設定ファイルの記述例

オプション `pathConf` にパスを指定して、設定をJSONファイルで指定することができます。

```
$ node RShotJS.node.js pathConf=./conf_sample.json
```

次のコードは、JSONファイルの記述例です。

```json
{
	"siteName": "Site Name",
	"pathCsv": "./data.csv",
	"pathOutput": "./RShotJS_output/",
	"port": 8080,
	"unit": 2,
	"userAgent": {
		"pc":{"width":1280, "height":1024, "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36"},
		"tb":{"width": 768, "height":1024, "userAgent": "Mozilla/5.0 (iPad; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53"},
		"sp":{"width": 320, "height": 568, "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53"}
	}
}
```

項目は、すべて任意です。記述のない設定項目は、デフォルトの値で初期化されます。

同名の項目をオプションとして指定した場合、オプションに指定した値が優先して採用され、JSONに書いた値は破棄されます。


## 環境 - Requirements

- phantomjs: v2.1.1 or later
- nodejs: v10.15.0 or later


## 更新履歴 - Change log

### RShotJS.node.js 1.1.0 (リリース日未定)

- `phantomjs` コマンド (v2.1.1) に依存するように変更。
- デフォルトのポート番号を `8080` に変更。

### RShotJS.node.js 1.0.0 (2014年4月22日)

- 初版リリース


## ライセンス - License

MIT License


## 作者 - Author

- Tomoya Koyanagi <tomk79@gmail.com>
- website: <https://www.pxt.jp/>
- Twitter: @tomk79 <https://twitter.com/tomk79/>
