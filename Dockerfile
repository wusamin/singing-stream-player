# ---- Build Stage ----
FROM node:24-alpine AS builder
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./
COPY .env* ./

# 全ての依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# Nuxtアプリケーションをビルド（型チェックを無効化）
# Docker環境では型チェックをスキップして高速化
#ENV NUXT_TYPESCRIPT_TYPECHECK=false
#RUN npx nuxt build

# ---- Production Stage ----
# 実行用のステージ
FROM node:24-alpine
WORKDIR /app

# ビルド成果物をコピー
COPY --from=builder /app/.output ./
COPY --from=builder /app/.credentials ./.credentials

# Cloud Runが使用するポート (デフォルトは8080)
ENV PORT=8080
EXPOSE ${PORT}

# アプリケーションを実行
CMD ["node", "./server/index.mjs"]