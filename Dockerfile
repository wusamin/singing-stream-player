# ---- Production Stage ----
# 実行用のステージ
FROM node:24-alpine
WORKDIR /app

# 本番用の依存関係のみインストール
COPY ./.output ./

# Cloud Runが使用するポート (デフォルトは8080)
ENV PORT=8080
EXPOSE ${PORT}

# アプリケーションを実行
CMD ["node", "./server/index.mjs"]