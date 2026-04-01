# Stage 0: 编译阶段
FROM node:20-slim AS build-stage

# 启用 Corepack 安装 pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# 设置工作目录
WORKDIR /app/frontend

# 1. 复制依赖描述文件
# 此时我们在 /app/frontend，COPY 的第一个路径是宿主机(context)路径，第二个是容器路径
COPY ./frontend/package.json ./frontend/pnpm-lock.yaml* ./

# 2. 安装依赖
RUN pnpm install --frozen-lockfile

# 3. 复制前端源码
# 注意：这里建议使用 . 或者是 ./ 
# 因为 WORKDIR 已经是 /app/frontend，直接把宿主机 frontend 里的内容拷入当前目录即可
COPY ./frontend/ ./

# 4. 注入 Vite 环境变量
ARG VITE_API_URL

# 5. 执行打包 (生成 /app/frontend/dist)
RUN pnpm run build


# Stage 1: 运行阶段
FROM nginx:1

# 从编译阶段拷贝生成的静态文件
# 确保这里的路径与上面的 WORKDIR + Vite 默认输出一致
COPY --from=build-stage /app/frontend/dist/ /usr/share/nginx/html

# 拷贝 Nginx 配置文件
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./frontend/nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]