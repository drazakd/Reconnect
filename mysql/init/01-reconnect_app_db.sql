-- ------------------------------------------------------------
-- 0) Création de la base
-- ------------------------------------------------------------
DROP DATABASE IF EXISTS reconnect_app_db;
CREATE DATABASE reconnect_app_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE reconnect_app_db;

-- ------------------------------------------------------------
-- 1) Table des utilisateurs
-- ------------------------------------------------------------
-- ------------------------------------------------------------
-- 1) Table des utilisateurs (mise à jour)
-- ------------------------------------------------------------
CREATE TABLE users (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom              VARCHAR(100)        NOT NULL,
  prenom           VARCHAR(100)        NOT NULL,
  email            VARCHAR(150)        NOT NULL UNIQUE,
  telephone        VARCHAR(32)         NULL,
  sexe             ENUM('Homme','Femme') NOT NULL,
  pays             VARCHAR(100)        NOT NULL,
  ville            VARCHAR(100)        NOT NULL,
  ecole            VARCHAR(150)        NULL,    -- 🆕 école de l’utilisateur
  entreprise       VARCHAR(150)        NULL,    -- 🆕 entreprise de l’utilisateur
  image            VARCHAR(255)        NULL,    -- 🆕 chemin/URL de la photo de profil
  password_hash    VARCHAR(255)        NOT NULL,
  is_email_verified BOOLEAN            NOT NULL DEFAULT FALSE,
  is_visible       BOOLEAN             NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_country_city (pays, ville)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Ajouter le champ bio après le champ entreprise
ALTER TABLE users
ADD COLUMN bio TEXT NULL COMMENT 'Biographie de l\'utilisateur' 
AFTER entreprise;

-- Vérifier la structure de la table
DESCRIBE users;

-- ------------------------------------------------------------
-- 2) Paramètres de confidentialité par utilisateur
--    - contrôle de la messagerie & du partage de localisation
-- ------------------------------------------------------------
CREATE TABLE privacy_settings (
  user_id                         BIGINT UNSIGNED PRIMARY KEY,
  can_receive_messages_from       ENUM('everyone','contacts','no_one') NOT NULL DEFAULT 'everyone',
  profile_visibility              ENUM('public','contacts','private')  NOT NULL DEFAULT 'public',
  location_sharing_preference     ENUM('off','approx','precise')       NOT NULL DEFAULT 'off',
  show_last_seen                  BOOLEAN                               NOT NULL DEFAULT TRUE,
  created_at                      TIMESTAMP                             NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                      TIMESTAMP                             NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_privacy_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Valeurs par défaut automatiques à la création d'un user (via application/trigger au besoin)

-- ------------------------------------------------------------
-- 3) Liste de blocage (sécurité & confidentialité)
-- ------------------------------------------------------------
CREATE TABLE user_blocks (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  blocked_id  BIGINT UNSIGNED NOT NULL,
  reason      VARCHAR(255)     NULL,
  created_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_blocks_user     FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_blocks_blocked  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_block UNIQUE (user_id, blocked_id),
  INDEX idx_blocked (blocked_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4) Réseau personnel (contacts)
--    - demandes, acceptations, blocages au niveau relationnel
-- ------------------------------------------------------------
CREATE TABLE contacts (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  contact_id  BIGINT UNSIGNED NOT NULL,
  status      ENUM('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contacts_user    FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_contacts_contact FOREIGN KEY (contact_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_contact_pair UNIQUE (user_id, contact_id),
  INDEX idx_contacts_status (status),
  INDEX idx_contacts_reverse (contact_id, user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5) Messagerie (conversations 1-1 ou de groupe) + messages
--    -> plus robuste que sender/receiver simple
-- ------------------------------------------------------------
CREATE TABLE conversations (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NULL,           -- pour groupes
  is_group      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by    BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_convo_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE conversation_participants (
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  role            ENUM('member','admin','owner') NOT NULL DEFAULT 'member',
  joined_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_read_at    TIMESTAMP NULL,
  PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT fk_cp_convo FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_user  FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE,
  INDEX idx_cp_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE messages (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id  BIGINT UNSIGNED NOT NULL,
  sender_id        BIGINT UNSIGNED NOT NULL,
  content          TEXT NOT NULL,
  is_read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_msg_convo  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE,
  INDEX idx_msg_convo_time (conversation_id, created_at),
  FULLTEXT INDEX ftx_messages_content (content)  -- recherche de texte (MySQL 8+)
) ENGINE=InnoDB;

-- Pour les conversations 1-1, créer 2 participants; pour groupes, >= 2 participants.

-- ------------------------------------------------------------
-- 6) Dons financiers (soutien)
-- ------------------------------------------------------------
CREATE TABLE donations (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_id           BIGINT UNSIGNED NOT NULL,
  receiver_id        BIGINT UNSIGNED NOT NULL,
  amount             DECIMAL(12,2)   NOT NULL CHECK (amount > 0),
  currency           VARCHAR(10)     NOT NULL DEFAULT 'XOF',
  message            VARCHAR(255)    NULL,
  status             ENUM('pending','completed','failed','refunded','cancelled') NOT NULL DEFAULT 'pending',
  payment_provider   ENUM('manual','stripe','paypal','flutterwave','paystack','other') NOT NULL DEFAULT 'manual',
  provider_reference VARCHAR(255)    NULL,  -- id transaction externe
  created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_donations_donor    FOREIGN KEY (donor_id)    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_donations_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_don_receiver (receiver_id, created_at),
  INDEX idx_don_donor (donor_id, created_at),
  INDEX idx_don_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7) Géolocalisation (historique de positions avec consentement)
--    - On stocke lat/lng + précision + source
-- ------------------------------------------------------------
CREATE TABLE locations (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  latitude     DECIMAL(9,6)  NOT NULL,   -- ~11 cm de précision
  longitude    DECIMAL(9,6)  NOT NULL,
  accuracy_m   DECIMAL(8,2)  NULL,       -- précision fournie par le device (mètres)
  consent      BOOLEAN       NOT NULL DEFAULT FALSE,
  source       ENUM('manual','gps','ip','network') NOT NULL DEFAULT 'gps',
  created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_loc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_loc_user_time (user_id, created_at),
  INDEX idx_loc_geo (latitude, longitude)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8) Reset password (sécurité)
-- ------------------------------------------------------------
CREATE TABLE password_resets (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  reset_token  CHAR(64)       NOT NULL,  -- token hex/sha256
  expires_at   DATETIME       NOT NULL,
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_pr_token (reset_token),
  INDEX idx_pr_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9) Sessions (optionnel mais recommandé)
-- ------------------------------------------------------------
CREATE TABLE sessions (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT UNSIGNED NOT NULL,
  session_token  CHAR(64)       NOT NULL, -- ex: hashé/opaque
  ip_address     VARCHAR(45)    NULL,     -- IPv4/IPv6
  user_agent     VARCHAR(255)   NULL,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at     DATETIME       NULL,
  CONSTRAINT fk_sess_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_session_token (session_token),
  INDEX idx_sess_user (user_id),
  INDEX idx_sess_expires (expires_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10) Notifications (qualité d’UX ; facultatif mais utile)
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL,      -- destinataire
  type          ENUM('message','contact','donation','system') NOT NULL,
  title         VARCHAR(160) NOT NULL,
  body          VARCHAR(500) NULL,
  is_read       BOOLEAN      NOT NULL DEFAULT FALSE,
  reference_id  BIGINT UNSIGNED NULL,          -- id ressource liée (message, donation, etc.)
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read),
  INDEX idx_notif_created (created_at)
) ENGINE=InnoDB;

ALTER TABLE notifications
  MODIFY COLUMN type ENUM(
    'message','contact','donation','system',
    'friend_request','contact_request','friend_accept'
) NOT NULL;

-- ------------------------------------------------------------
-- 11) Contrainte applicative utile : empêcher contact avec soi-même
-- ------------------------------------------------------------
ALTER TABLE contacts
  ADD CONSTRAINT chk_contacts_not_self CHECK (user_id <> contact_id);

-- ------------------------------------------------------------
-- 12) Vues pratiques (facultatif)
-- ------------------------------------------------------------
-- a) Dernier emplacement consenti par utilisateur
CREATE OR REPLACE VIEW v_user_last_location AS
SELECT l1.*
FROM locations l1
JOIN (
  SELECT user_id, MAX(created_at) AS max_created
  FROM locations
  WHERE consent = TRUE
  GROUP BY user_id
) t ON t.user_id = l1.user_id AND t.max_created = l1.created_at;

-- b) Stat des dons reçus par utilisateur
CREATE OR REPLACE VIEW v_user_donations_received AS
SELECT
  u.id AS user_id,
  u.nom, u.prenom,
  COUNT(d.id) AS donations_count,
  COALESCE(SUM(CASE WHEN d.status='completed' THEN d.amount END),0) AS total_received
FROM users u
LEFT JOIN donations d ON d.receiver_id = u.id
GROUP BY u.id, u.nom, u.prenom;

-- ------------------------------------------------------------
-- 13) Indices supplémentaires pour performance (en prod selon usage)
-- ------------------------------------------------------------
-- Exemple : recherche plein texte sur utilisateurs (nom/prenom/ville)
ALTER TABLE users
  ADD FULLTEXT INDEX ftx_users_search (nom, prenom, ville);
-- ------------------------------------------------------------
-- 14) Seed minimal (à adapter ; mots de passe à hasher côté backend)
-- ------------------------------------------------------------
INSERT INTO users (
  nom, prenom, email, telephone, sexe, pays, ville, 
  ecole, entreprise, image, 
  password_hash, is_email_verified, is_visible
) VALUES
('Doe','Jane','jane@example.com',NULL,'Femme','Côte d''Ivoire','Abidjan',
 'Université Félix Houphouët-Boigny','Orange CI','/uploads/jane.png',
 '$2y$10$hashJane', TRUE, TRUE),

('Doe','John','john@example.com',NULL,'Homme','Côte d''Ivoire','Abidjan',
 'INP-HB','MTN CI','/uploads/john.png',
 '$2y$10$hashJohn', TRUE, TRUE);


INSERT INTO privacy_settings (user_id) VALUES (1),(2);

-- Conversation 1-1 entre Jane et John
INSERT INTO conversations (title, is_group, created_by) VALUES (NULL, FALSE, 1);
INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES
  (1, 1, 'owner'),
  (1, 2, 'member');

INSERT INTO messages (conversation_id, sender_id, content) VALUES
  (1, 1, 'Salut John, content(e) de te retrouver !'),
  (1, 2, 'Salut Jane ! Moi aussi, ça fait plaisir.');

-- Contact accepté
INSERT INTO contacts (user_id, contact_id, status) VALUES
  (1, 2, 'accepted'),
  (2, 1, 'accepted');

-- Don complété
INSERT INTO donations (donor_id, receiver_id, amount, currency, message, status, payment_provider)
VALUES (2, 1, 2500.00, 'XOF', 'Avec tout mon soutien 🙏', 'completed', 'manual');

-- Position consenti
INSERT INTO locations (user_id, latitude, longitude, accuracy_m, consent, source)
VALUES (1, 5.348, -4.027, 15.50, TRUE, 'gps');

-- Notification
INSERT INTO notifications (user_id, type, title, body)
VALUES (1, 'message', 'Nouveau message', 'John vous a envoyé un message');



-- ------------------------------------------------------------
-- Fin du script
-- ------------------------------------------------------------
