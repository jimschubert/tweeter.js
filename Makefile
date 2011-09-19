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
	git -m "Updated docs"

submodules:
	@echo "\nSetting up submodules\n"
	git submodule init
	git submodule update
