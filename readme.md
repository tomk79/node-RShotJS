# RShotJS.node.js

このスクリプトは、CSVの設定に従って見出し画像を生成します。

## 使い方

### 1. RShotJS.node.js をインストール

```
$ cd (your directory)
$ git clone https://github.com/tomk79/node-RShotJS.git
$ cd node-RShotJS
$ npm install
```

### 2. data.csv を編集

```
$ vim data.csv
```

### 3. キャプチャを撮る

```
$ node RShotJS.node.js port=8080
```

コマンドが終了するまでしばらく待ちます。
カレントディレクトリにoutputディレクトリが作成され、その中にPDF文書が出力されます。



## オプション

- port - スクリプト内で立ち上げるサーバーのポート番号。省略時 80 を使用。
- unit - 一度に投げるキューの数を指定。省略時は 1。同時に複数投げた方が、全体の処理は早く終る場合がある。
- pathCsv - CSVのパスを指定。省略時、カレントディレクトリの ./data.csv を読み込む。
- pathOutput - 出力先ディレクトリを指定。省略時、カレントディレクトリに output ディレクトリを作成して書き出す。

下記はオプションの指定例。

```
$ node RShotJS.node.js port=80 unit=1 pathCsv=./data.csv pathOutput=./output/
```

## change log

### RShotJS.node.js 1.0.0 (2014/\*/\*)

- 初版リリース

