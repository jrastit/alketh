function cmd {
	ssh alchethmy.com "$1"
	ret=$?
	if [[ $ret != 0 ]]
	then
		echo $ret
		exit $ret
	fi
}
cmd "cd alchethmy/alchethmy && git pull"
cmd ". .profile ; cd alchethmy/alchethmy/contract ; npm i"
cmd ". .profile ; cd alchethmy/alchethmy/contract ; npm run build"
cmd ". .profile ; cd alchethmy/alchethmy/ui ; npm i"
cmd ". .profile ; cd alchethmy/alchethmy/ui ; npm run build"
cmd ". .profile ; cd alchethmy/alchethmy/ui ; pm2 reload alchethmy"
