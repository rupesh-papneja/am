export DATA_FILE=`cd /data/initial && ls -Art *data.gz | tail -n 1` 
export CONFIG_FILE=`cd /data/initial && ls -Art *config.gz | tail -n 1` 
cp /data/initial/$CONFIG_FILE /data/backup
cp /data/initial/$DATA_FILE /data/backup
echo $CONFIG_FILE
/sbin/slapd-restore-config $CONFIG_FILE
echo $DATA_FILE
/sbin/slapd-restore-data $DATA_FILE