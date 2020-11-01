FROM alfg/ffmpeg:latest as ffmpeg
FROM ejnshtein/node-tdlib:14-1.6.0-alpine-3.12.0-1.0

WORKDIR /usr/src/app/

ADD . .

# set tdlib
RUN cp /usr/local/lib/libtdjson.so ./libtdjson.so

# set ffmpeg deps
RUN apk add --update \
  ca-certificates \
  openssl \
  pcre \
  lame \
  libogg \
  libass \
  libvpx \
  libvorbis \
  libwebp \
  libtheora \
  opus \
  rtmpdump \
  x264-dev \
  x265-dev

# copy ffmpeg
COPY --from=ffmpeg /opt/ffmpeg /opt/ffmpeg
COPY --from=ffmpeg /usr/lib/libfdk-aac.so.2 /usr/lib/libfdk-aac.so.2
COPY --from=ffmpeg /usr/lib/librav1e.so.0 /usr/lib/librav1e.so.0

ENV PATH=/opt/ffmpeg/bin:$PATH

RUN yarn install --network-timeout 100000

RUN yarn build-ts

# CMD [ "yarn", "start" ]