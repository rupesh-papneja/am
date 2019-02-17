export DATA_FILE=`cd /data/backup && ls -Art *data.gz | tail -n 1` 
export CONFIG_FILE=`cd /data/backup && ls -Art *config.gz | tail -n 1` 
echo $DATA_FILE
/sbin/slapd-restore-config $CONFIG_FILE
echo $DATA_FILE
/sbin/slapd-restore-data $DATA_FILE