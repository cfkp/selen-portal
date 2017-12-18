#!/bin/bash
#
# initd-example      Node init.d 
#
# chkconfig: 345 
# description: Script to start a coffee script application through forever
# processname: forever/coffeescript/node
# pidfile: /var/run/forever-initd-hectorcorrea.pid 
# logfile: /var/run/forever-initd-hectorcorrea.log
#
# Based on a script posted by https://gist.github.com/jinze at https://gist.github.com/3748766
#


# Source function library.
. /lib/lsb/init-functions


pidFile=/var/run/forever-initd-first.pid 
logFile=/var/run/forever-initd-first.log 

sourceDir=/var/www/node/first/
nodeFile=bin/www
scriptId=$sourceDir


start() {
    echo "Starting $scriptId"

    # This is found in the library referenced at the top of the script
    start_daemon

    # Start our CoffeeScript app through forever
    # Notice that we change the PATH because on reboot
    # the PATH does not include the path to node.
    # Launching forever or coffee with a full path
    # does not work unless we set the PATH.
    cd $sourceDir
export     PATH=/usr/local/bin:$PATH
export     NODE_PATH=.
export     NODE_ENV=production 
export     PORT=80 
forever start --pidFile $pidFile -l $logFile -a -d --sourceDir $sourceDir/ -c node $nodeFile
    
    RETVAL=$?
}

restart() {
    echo -n "Restarting $scriptId"
    forever restart $scriptId
    RETVAL=$?
}

stop() {
    echo -n "Shutting down $scriptId"
    /usr/local/bin/forever stop $scriptId
    RETVAL=$?
}

status() {
    echo -n "Status $scriptId"
    /usr/local/bin/forever list
    RETVAL=$?
}


case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage:  {start|stop|status|restart}"
        exit 1
        ;;
esac
exit $RETVAL
