# Build the app, then serve the static bundle with nginx.
#
# Local use:   docker compose up --build
# The GitHub Pages build serves from /Badminton/; inside the container the app
# lives at the root, so the build overrides `base` with VITE_BASE.

FROM node:24-alpine AS build

WORKDIR /app

# Dependencies first, so a source-only change reuses this layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV VITE_BASE=/
RUN npm run build


FROM nginx:1.29-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1
