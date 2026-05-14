from __future__ import annotations

import csv
import io
import json


def parse_users_import(file_bytes: bytes, filename: str) -> list[dict]:
    lower_name = filename.lower()
    if lower_name.endswith(".json"):
        payload = json.loads(file_bytes.decode("utf-8"))
        if isinstance(payload, dict) and "users" in payload:
            payload = payload["users"]
        if not isinstance(payload, list):
            raise ValueError("JSON payload must be a list or contain a 'users' list.")
        return _normalize_rows(payload)

    if lower_name.endswith(".csv"):
        text = file_bytes.decode("utf-8")
        reader = csv.DictReader(io.StringIO(text))
        return _normalize_rows(list(reader))

    raise ValueError("Unsupported file type. Use .csv or .json")


def _normalize_rows(rows: list[dict]) -> list[dict]:
    normalized: list[dict] = []
    for row in rows:
        role_value = (row.get("role") or "").strip()
        password_value = row.get("password")
        if isinstance(password_value, str):
            password_value = password_value.strip()

        row_data = {
            "name": (row.get("name") or "").strip(),
            "email": (row.get("email") or "").strip(),
            "role": role_value,
            "password": password_value,
        }
        if not role_value:
            row_data.pop("role")

        normalized.append(row_data)
    return normalized
