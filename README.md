# Hiroaki Masuda Digital Business Card PWA

升田裕章専用の静的オンライン名刺です。サーバーやデータベースは不要で、GitHub Pages等にそのまま公開できます。

## 公開前に変更する項目

`config.js`で以下を変更してください。

1. LinkedIn URL
2. 会議予約URL（使用する場合）
3. 公開するSNS URL
4. メールアドレス・電話番号（vCardに含める場合のみ）
5. 顔写真ファイル

未使用項目は `enabled: false` のままにしてください。画面には表示されません。

## 顔写真

本人写真を `assets/profile.jpg` として保存し、`config.js`を次のように変更します。

```js
photo: "assets/profile.jpg"
```

## QRコード生成

```bash
python -m pip install "qrcode[pil]"
python generate_qr.py
```

## ローカル確認

```bash
python -m http.server 8080
```

ブラウザで `http://localhost:8080` を開きます。`index.html`を直接ダブルクリックすると、PWAとService Workerは正しく動作しません。

## GitHub Pages公開

1. GitHubで新規リポジトリを作成
2. このフォルダ内の全ファイルをリポジトリ直下へ配置
3. Settings → Pages
4. Deploy from a branch
5. `main` / `/root` を選択

## 更新手順

`config.js`を変更した場合は、必ず `python generate_qr.py` を再実行してから公開してください。
