"""
Сохранение ответов опроса о гигиене зубов и получение статистики.
"""
import json
import os
import uuid
import psycopg2

SCHEMA = "t_p9534805_dental_health_survey"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "POST":
        return save_response(event)
    elif method == "GET":
        return get_stats(event)

    return {"statusCode": 405, "headers": CORS_HEADERS, "body": json.dumps({"error": "Method not allowed"})}


def save_response(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    answers = body.get("answers", [])
    score = body.get("score", 0)
    session_id = body.get("session_id", str(uuid.uuid4()))

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        f"INSERT INTO {SCHEMA}.survey_responses (session_id, score) VALUES (%s, %s) RETURNING id",
        (session_id, score)
    )
    response_id = cur.fetchone()[0]

    for ans in answers:
        cur.execute(
            f"INSERT INTO {SCHEMA}.survey_answers (response_id, question_id, option_index) VALUES (%s, %s, %s)",
            (response_id, ans["questionId"], ans["optionIndex"])
        )

    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": True, "response_id": response_id})
    }


def get_stats(event: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.survey_responses")
    total_responses = cur.fetchone()[0]

    cur.execute(f"SELECT AVG(score) FROM {SCHEMA}.survey_responses")
    avg_score_row = cur.fetchone()
    avg_score = round(float(avg_score_row[0])) if avg_score_row[0] else 0

    cur.execute(f"""
        SELECT question_id, option_index, COUNT(*) as cnt
        FROM {SCHEMA}.survey_answers
        GROUP BY question_id, option_index
        ORDER BY question_id, option_index
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()

    answers_dist = {}
    for question_id, option_index, cnt in rows:
        if question_id not in answers_dist:
            answers_dist[question_id] = {}
        answers_dist[question_id][option_index] = cnt

    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({
            "total_responses": total_responses,
            "avg_score": avg_score,
            "answers_distribution": answers_dist
        })
    }
