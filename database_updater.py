import os

r = os.popen("git status")
if 'static/data' in r.read():
	os.system('git pull && git add static/data && git commit -m "updating data cache" && git push')
