# Pistache.io-docker Copyright (C) 2016 Rob Williamson
FROM alpine

RUN mkdir -p /service/build

WORKDIR /service/build

# add build dependencies & get the code.
RUN apk update
RUN apk add git
RUN apk add g++
RUN apk add make
RUN apk add cmake
# RUN apk add musl-dev
RUN apk add openldap-dev
# RUN cat /usr/include/stdint.h
# RUN cat /usr/include/bits/alltypes.h
# RUN cat /usr/include/bits/stdint.h
# RUN cat /usr/include/sys/types.h
# RUN cat /usr/include/sys/sysmacros.h
RUN git clone https://github.com/oktal/pistache.git
WORKDIR pistache
# RUN git checkout Avoid-major-minor-macros
RUN git submodule update --init
RUN mkdir build
# Build Pistache.io.
WORKDIR build
RUN cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release ..
RUN make

# Install
RUN make install

# Create a user & folder for subsequent Pistache.io projects.
# RUN adduser -S service
# WORKDIR /home/service
# RUN chown service:users /home/service

# Clean up the build files.
RUN rm -rf /service/build

# Switch to the user.
# USER service