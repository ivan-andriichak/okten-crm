FROM nginx:alpine
RUN apk add --no-cache inotify-tools
COPY ../nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["sh", "-c", "nginx -g 'daemon off;' & while inotifywait -r -e modify,create,delete /usr/share/nginx/html; do nginx -s reload; done"]