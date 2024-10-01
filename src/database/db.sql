-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Store hashed passwords for security
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Questionnaire Table
CREATE TABLE IF NOT EXISTS questionnaire_questionnaires (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questionnaire_questions (
    id SERIAL PRIMARY KEY,
    question JSONB NOT NULL
);

-- Insert default users
INSERT INTO users (username, password_hash, is_admin)
VALUES
    ('admin', 'admin', TRUE),
    ('user', 'user', FALSE)
ON CONFLICT (username) DO NOTHING;

-- Insert questionnaires
INSERT INTO questionnaire_questionnaires (id, name) 
VALUES
    (1, 'semaglutide'),
    (2, 'nad-injection'),
    (3, 'metformin')
ON CONFLICT (id) DO NOTHING;

-- Insert questions
INSERT INTO questionnaire_questions (id, question) 
VALUES
    (1, '{
      "type": "mcq",
      "options": [
      "Improve blood pressure",
      "Reduce risk of future cardiac events",
      "Support lifestyle changes",
      "Longevity benefits"
      ],
      "question": "Why are you interested in this product? Select all that apply."
    }'),
    (2, '{
      "type": "input",
      "question": "Tell us anything else you’d like your provider to know when prescribing your medication."
    }'),
    (3, '{
      "type": "input",
      "question": "What is your current weight?"
    }'),
    (4, '{
      "type": "mcq",
      "options": [
      "Keto or low carb",
      "Plant-based",
      "Macro or calorie counting",
      "Weight Watchers",
      "Noom",
      "Calibrate",
      "Found",
      "Alpha",
      "Push Health"
      ],
      "question": "Which of the following have you tried in the past? Select all that apply."
    }'),
    (5, '{
      "type": "mcq",
      "options": [
      "Losing 1-15 pounds",
      "Losing 16-50 pounds",
      "Losing 51+ pounds",
      "Not sure, I just need to lose weight"
      ],
      "question": "What’s your weight loss goal?"
    }'),
    (6, '{
      "type": "input",
      "question": "Please list any new medications you are taking."
    }')
ON CONFLICT (id) DO NOTHING;



-- Junction Table (linking questions to questionnaires with priority)
CREATE TABLE IF NOT EXISTS questionnaire_junction (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL,
    questionnaire_id INT NOT NULL,
    priority INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questionnaire_questions(id),
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire_questionnaires(id)
);

-- Insert junction (linking questions to questionnaires)
INSERT INTO questionnaire_junction (id, question_id, questionnaire_id, priority)
VALUES
    (1, 1, 1, 0),
    (2, 2, 1, 10),
    (3, 4, 1, 20),
    (4, 1, 2, 0),
    (5, 2, 2, 10)
ON CONFLICT (id) DO NOTHING;

-- User Answers Table
CREATE TABLE IF NOT EXISTS user_answers (
    questionnaire_id INT NOT NULL,
    user_id INT NOT NULL, 
    question_id INT NOT NULL,
    answer JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaire_questionnaires(id),
    FOREIGN KEY (user_id) REFERENCES users(id) -- Link answers to users
);
