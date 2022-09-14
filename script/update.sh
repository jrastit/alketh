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
cmd ". .profile ; cd alketh/alketh/ethers-network ; npm i"
cmd ". .profile ; cd alketh/alketh/ethers-network ; npm run build"
cmd ". .profile ; cd alketh/alketh/backend ; npm i"
cmd ". .profile ; cd alketh/alketh/backend ; npm run build"
cmd ". .profile ; cd alketh/alketh/contract ; npm i"
cmd ". .profile ; cd alketh/alketh/contract ; npm run build"
cmd ". .profile ; cd alketh/alketh/ui ; npm i"
cmd ". .profile ; cd alketh/alketh/ui ; npm run build"
cmd ". .profile ; cd alketh/alketh/ui ; pm2 reload alketh-backend"
cmd ". .profile ; cd alketh/alketh/ui ; pm2 reload alketh"
