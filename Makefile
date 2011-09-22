define CONF_JS
module.exports = exports = {
	consumerKey: 'ENTER_YOUR_CONSUMER_KEY_HERE',
	consumerSecret: 'ENTER_YOUR_CONSUMER_SECRET_HERE',
	oauthCallback: 'http://127.0.0.1:8080/auth/twitter/callback'
}
endef

all: clean docs

docs:
	@echo "\nCreating documentation\n"
	@docco lib/*

clean:
	@echo "\nCleaning documentation\n"
	rm -rf "docs"

update_docs: clean docs
	@echo "\nUpdating docs on github (must manually push)\n"
	git add docs/*
	git commit -m "Updated docs"

submodules:
	@echo "\nSetting up submodules\n"
	git submodule init
	git submodule update

export CONF_JS
create_conf:
	echo "$$CONF_JS" >> conf.js

