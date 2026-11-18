.PHONY: help check-structure

help:
	@echo "CommerceForge helper commands"
	@echo "  make check-structure   Verify the folder structure against docs/architecture/structure.manifest.txt"
	@echo "More targets (up, down, logs, shell, artisan, composer, db-dump, db-restore) come in Phase 1."

check-structure:
	@bash tools/check-structure.sh
