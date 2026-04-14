
CREATE TABLE IF NOT EXISTS t_p9534805_dental_health_survey.survey_responses (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    score INTEGER
);

CREATE TABLE IF NOT EXISTS t_p9534805_dental_health_survey.survey_answers (
    id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES t_p9534805_dental_health_survey.survey_responses(id),
    question_id INTEGER NOT NULL,
    option_index INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_survey_answers_response_id ON t_p9534805_dental_health_survey.survey_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_survey_answers_question_id ON t_p9534805_dental_health_survey.survey_answers(question_id);
