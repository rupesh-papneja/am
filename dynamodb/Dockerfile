FROM openjdk as base

RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs supervisor nginx && \
    apt-get clean && \
    rm -fr /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    npm install dynamodb-admin -g #dynamodb-admin

COPY nginx-proxy.conf /etc/nginx-proxy.conf
COPY supervisord.conf /etc/supervisord.conf
RUN mkdir -p /var/log/supervisord

# Create our main application folder.
RUN mkdir -p opt/dynamodb
RUN mkdir data && chmod 664 data
VOLUME ["/data"]

WORKDIR /opt/dynamodb

# Download and unpack dynamodb.
COPY dynamodb_local_latest.tar.gz /opt/dynamodb
RUN tar -xvf /opt/dynamodb/dynamodb_local_latest.tar.gz

# Configuration for dynamo-admin to know where to hit dynamo.
ENV DYNAMO_ENDPOINT http://localhost:8002/

# For dinghy users.
ENV VIRTUAL_HOST dynamo.docker
ENV VIRTUAL_PORT 8000

# Main proxy on 8000, dynamo-admin on 8001, dynamodb on 8002
EXPOSE 8000 8001 8002

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

# The entrypoint is the dynamodb jar. Default port is 8000.
# EXPOSE 8000
# ENTRYPOINT ["java", "-jar", "DynamoDBLocal.jar"]
