function cmd {
	ssh alketh.io "$1"
	ret=$?
	if [[ $ret != 0 ]]
	then
		echo $ret
		exit $ret
	fi
}
cmd "cd alketh/alketh && git pull"
