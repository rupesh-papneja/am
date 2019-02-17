FROM osixia/openldap-backup:1.2.1

RUN mkdir -p /container/script

RUN mkdir -p /data/initial

COPY restore.sh /container/script
COPY restore-backup.sh /container/script
COPY server.crt /container/service/slapd/assets/certs
COPY server.key /container/service/slapd/assets/certs
COPY 20180722T083001-config.gz /data/backup
COPY 20180722T083001-data.gz /data/backup

COPY 20180722T083001-config.gz /data/initial
COPY 20180722T083001-data.gz /data/initial

RUN /container/tool/install-service
