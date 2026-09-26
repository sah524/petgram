-- Execute uma única vez no banco existente antes de iniciar esta versão da API.
ALTER TABLE pets ADD COLUMN instagram_tutor VARCHAR(80) NULL;
