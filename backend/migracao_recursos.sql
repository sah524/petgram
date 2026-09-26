-- Migração aditiva para o banco PetGram EXISTENTE. Faça backup antes de executar.
-- Não altera tabelas existentes; crie estas tabelas no schema indicado em DB_NAME.
-- Sem chaves estrangeiras para ser compatível com IDs INT ou BIGINT no banco atual.
-- Verifique periodicamente IDs sem correspondência nas tabelas principais.
CREATE TABLE IF NOT EXISTS publicacoes_salvas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  post_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unico_salvo (usuario_id, post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS publicacoes_ocultas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  post_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unico_oculto (usuario_id, post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS denuncias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id BIGINT UNSIGNED NOT NULL,
  post_id BIGINT UNSIGNED NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unica_denuncia (usuario_id, post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS comunidade_posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  comunidade_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  texto TEXT NOT NULL,
  imagem TEXT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS comunidade_mensagens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  comunidade_id BIGINT UNSIGNED NOT NULL,
  usuario_id BIGINT UNSIGNED NOT NULL,
  texto VARCHAR(2000) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat (comunidade_id, criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
