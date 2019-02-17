FROM prdocker:pistache

RUN mkdir -p /home/service

WORKDIR /home/service

COPY . /home/service
# RUN g++ server.cc -lpistache -pthread -std=c++11 -o server
RUN mkdir -p /home/service/build

RUN rm -rf /home/service/build/*

WORKDIR /home/service/build

# RUN ls /usr/lib

RUN cmake .. && make verbose=1

RUN adduser -S service
WORKDIR /home/service
RUN chown service:users /home/service

USER service

EXPOSE 9009

#Starting the service
CMD export PORT=9009 && build/bin/server
