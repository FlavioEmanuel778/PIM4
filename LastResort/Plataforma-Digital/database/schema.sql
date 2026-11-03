-- EduDigital: schema de referência. O script `npm run db:init` executa este arquivo.
CREATE DATABASE IF NOT EXISTS plataforma_produtos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plataforma_produtos;

-- Better Auth (núcleo) + campos do plugin admin.
CREATE TABLE IF NOT EXISTS `user` (
  id varchar(36) PRIMARY KEY, name varchar(255) NOT NULL, email varchar(255) NOT NULL UNIQUE,
  emailVerified boolean NOT NULL DEFAULT false, image text NULL,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  role varchar(50) NOT NULL DEFAULT 'aluno', banned boolean NOT NULL DEFAULT false,
  banReason text NULL, banExpires datetime NULL,
  registration varchar(20) NULL, UNIQUE KEY user_registration_uq (registration)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `session` (
  id varchar(36) PRIMARY KEY, expiresAt datetime NOT NULL, token varchar(255) NOT NULL UNIQUE,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  ipAddress varchar(255) NULL, userAgent text NULL, userId varchar(36) NOT NULL,
  impersonatedBy varchar(36) NULL, INDEX session_user_idx(userId),
  CONSTRAINT session_user_fk FOREIGN KEY(userId) REFERENCES `user`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `account` (
  id varchar(36) PRIMARY KEY, accountId varchar(255) NOT NULL, providerId varchar(255) NOT NULL,
  userId varchar(36) NOT NULL, accessToken text NULL, refreshToken text NULL, idToken text NULL,
  accessTokenExpiresAt datetime NULL, refreshTokenExpiresAt datetime NULL, scope text NULL, password text NULL,
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX account_user_idx(userId),
  CONSTRAINT account_user_fk FOREIGN KEY(userId) REFERENCES `user`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `verification` (
  id varchar(36) PRIMARY KEY, identifier varchar(255) NOT NULL, value text NOT NULL, expiresAt datetime NOT NULL,
  createdAt datetime NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX verification_identifier_idx(identifier)
) ENGINE=InnoDB;

-- Cursos: cada curso tem no máximo um professor responsável.
CREATE TABLE IF NOT EXISTS courses (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name varchar(120) NOT NULL,
  summary text NOT NULL,
  tagline varchar(255) NOT NULL,
  icon varchar(20) NOT NULL DEFAULT 'shield',
  level varchar(40) NOT NULL DEFAULT 'Nível iniciante',
  teacher_id varchar(36) NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX courses_teacher_idx(teacher_id),
  CONSTRAINT courses_teacher_fk FOREIGN KEY(teacher_id) REFERENCES `user`(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Conteúdos para estudar.
CREATE TABLE IF NOT EXISTS contents (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY, course_id int NOT NULL, position int NOT NULL,
  title varchar(160) NOT NULL, description text NOT NULL,
  lessons int NOT NULL DEFAULT 0, duration_minutes int NOT NULL DEFAULT 0, body text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  material_kind varchar(10) NULL, material_name varchar(255) NULL, material_size int NULL,
  material_mime varchar(100) NULL, material_file varchar(80) NULL, material_url varchar(500) NULL,
  INDEX contents_course_idx(course_id, position),
  CONSTRAINT contents_course_fk FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Exercícios de prática (não valem nota).
CREATE TABLE IF NOT EXISTS exercises (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY, course_id int NOT NULL, position int NOT NULL,
  title varchar(160) NOT NULL, description text NOT NULL, category varchar(80) NOT NULL,
  prompt text NOT NULL, scenario text NOT NULL,
  option_a text NOT NULL, option_b text NOT NULL, option_c text NOT NULL, option_d text NOT NULL,
  correct char(1) NOT NULL, feedback_correct text NOT NULL, feedback_wrong text NOT NULL,
  INDEX exercises_course_idx(course_id, position),
  CONSTRAINT exercises_course_fk FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Questões do questionário avaliativo (1 ponto por acerto, nota de 0 a 10).
CREATE TABLE IF NOT EXISTS quiz_questions (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY, course_id int NOT NULL, position int NOT NULL,
  category varchar(80) NOT NULL, topic varchar(120) NOT NULL, prompt text NOT NULL,
  option_a text NOT NULL, option_b text NOT NULL, option_c text NOT NULL, option_d text NOT NULL,
  correct char(1) NOT NULL, explanation text NOT NULL,
  INDEX quiz_questions_course_idx(course_id, position),
  CONSTRAINT quiz_questions_course_fk FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollments (
  user_id varchar(36) NOT NULL, course_id int NOT NULL, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, course_id), INDEX enrollments_course_idx(course_id),
  CONSTRAINT enrollments_user_fk FOREIGN KEY(user_id) REFERENCES `user`(id) ON DELETE CASCADE,
  CONSTRAINT enrollments_course_fk FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS content_progress (
  user_id varchar(36) NOT NULL, content_id int NOT NULL, completed_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, content_id), INDEX content_progress_content_idx(content_id),
  CONSTRAINT content_progress_user_fk FOREIGN KEY(user_id) REFERENCES `user`(id) ON DELETE CASCADE,
  CONSTRAINT content_progress_content_fk FOREIGN KEY(content_id) REFERENCES contents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exercise_attempts (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id varchar(36) NOT NULL, exercise_id int NOT NULL,
  choice char(1) NOT NULL, is_correct boolean NOT NULL, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX exercise_attempts_idx(user_id, exercise_id),
  CONSTRAINT exercise_attempts_user_fk FOREIGN KEY(user_id) REFERENCES `user`(id) ON DELETE CASCADE,
  CONSTRAINT exercise_attempts_exercise_fk FOREIGN KEY(exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Uma tentativa por aluno e curso: a nota fica registrada.
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY, user_id varchar(36) NOT NULL, course_id int NOT NULL,
  correct_count int NOT NULL, total int NOT NULL, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY quiz_attempts_unique(user_id, course_id),
  CONSTRAINT quiz_attempts_user_fk FOREIGN KEY(user_id) REFERENCES `user`(id) ON DELETE CASCADE,
  CONSTRAINT quiz_attempts_course_fk FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_answers (
  attempt_id int NOT NULL, question_id int NOT NULL, choice char(1) NOT NULL,
  PRIMARY KEY(attempt_id, question_id),
  CONSTRAINT quiz_answers_attempt_fk FOREIGN KEY(attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  CONSTRAINT quiz_answers_question_fk FOREIGN KEY(question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Professores colaboradores de uma disciplina (o responsável fica em courses.teacher_id).
CREATE TABLE IF NOT EXISTS course_collaborators (
  course_id int NOT NULL, user_id varchar(36) NOT NULL, created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(course_id, user_id), INDEX course_collaborators_user_idx(user_id),
  CONSTRAINT course_collaborators_course_fk FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT course_collaborators_user_fk FOREIGN KEY(user_id) REFERENCES `user`(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Nota do questionário lançada pelo professor (tem prioridade sobre a correção automática).
CREATE TABLE IF NOT EXISTS grades (
  user_id varchar(36) NOT NULL, course_id int NOT NULL, score decimal(3,1) NOT NULL, updated_by varchar(36) NULL,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, course_id), INDEX grades_course_idx(course_id),
  CONSTRAINT grades_user_fk FOREIGN KEY(user_id) REFERENCES `user`(id) ON DELETE CASCADE,
  CONSTRAINT grades_course_fk FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT grades_updated_by_fk FOREIGN KEY(updated_by) REFERENCES `user`(id) ON DELETE SET NULL
) ENGINE=InnoDB;
