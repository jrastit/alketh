ssh alchethmy.com "cd alchethmy/alchethmy && git pull"
ssh alchethmy.com ". .profile ; cd alchethmy/alchethmy/ui ; npm run build"
ssh alchethmy.com ". .profile ; cd alchethmy/alchethmy/ui ; pm2 reload alchethmy"
