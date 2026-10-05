# Data Dictionary — Tabular Format

Source of truth: `009-data-dictionary.md` and `diagrams/20261003_erd.md`.

---

## permissions

| &nbsp; | **permissions** |
|:---:|:---|
| PK | id |
| &nbsp; | name |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| permissions | id | SERIAL | NOT NULL | Primary key |
| | name | VARCHAR(255) | NOT NULL | Unique permission string in `domain:action` format (e.g. `classroom:create`) |

---

## roles

| &nbsp; | **roles** |
|:---:|:---|
| PK | id |
| &nbsp; | name |
| &nbsp; | description |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| roles | id | SERIAL | NOT NULL | Primary key |
| | name | VARCHAR(32) | NOT NULL | Unique role name (`student`, `teacher`, `admin`) |
| | description | TEXT | NULL | Human-readable description of the role |

---

## role_permissions

| &nbsp; | **role_permissions** |
|:---:|:---|
| PK | role_id |
| PK | permission_id |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| role_permissions | role_id | INTEGER | NOT NULL | Foreign key to `roles.id`; part of composite primary key |
| | permission_id | INTEGER | NOT NULL | Foreign key to `permissions.id`; part of composite primary key |

---

## players

| &nbsp; | **players** |
|:---:|:---|
| PK | id |
| &nbsp; | username |
| &nbsp; | display_name |
| &nbsp; | email |
| &nbsp; | avatar_url |
| &nbsp; | role_id |
| &nbsp; | oauth_provider |
| &nbsp; | oauth_id |
| &nbsp; | password_hash |
| &nbsp; | current_elo |
| &nbsp; | total_questions_answered |
| &nbsp; | total_correct |
| &nbsp; | total_incorrect |
| &nbsp; | longest_streak |
| &nbsp; | age |
| &nbsp; | grade |
| &nbsp; | guardian_email |
| &nbsp; | created_at |
| &nbsp; | updated_at |
| &nbsp; | last_active_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| players | id | UUID | NOT NULL | Primary key; generated with `gen_random_uuid()` |
| | username | VARCHAR(32) | NOT NULL | Unique display handle chosen at registration |
| | display_name | VARCHAR(64) | NULL | Optional friendly name shown in UI |
| | email | VARCHAR(255) | NOT NULL | Unique email address used for authentication |
| | avatar_url | TEXT | NULL | URL pointing to the player's profile image |
| | role_id | INTEGER | NOT NULL | Foreign key to `roles.id`; defaults to `1` (student) |
| | oauth_provider | VARCHAR(32) | NULL | OAuth provider name (e.g. `google`); required when using OAuth |
| | oauth_id | VARCHAR(255) | NULL | Provider-issued user ID; required when using OAuth |
| | password_hash | TEXT | NULL | Bcrypt-hashed password; required when not using OAuth |
| | current_elo | INTEGER | NOT NULL | Player's global ELO rating; uncapped; defaults to `0` |
| | total_questions_answered | INTEGER | NOT NULL | Lifetime count of questions answered |
| | total_correct | INTEGER | NOT NULL | Lifetime count of correct answers |
| | total_incorrect | INTEGER | NOT NULL | Lifetime count of incorrect answers |
| | longest_streak | INTEGER | NOT NULL | Best consecutive correct answer streak across all sessions |
| | age | SMALLINT | NULL | Player's age in years |
| | grade | SMALLINT | NULL | Player's current school grade |
| | guardian_email | VARCHAR(255) | NULL | Guardian or parent contact email |
| | created_at | TIMESTAMPTZ | NOT NULL | Timestamp when the account was created |
| | updated_at | TIMESTAMPTZ | NOT NULL | Timestamp of the last profile update |
| | last_active_at | TIMESTAMPTZ | NULL | Timestamp of the player's most recent session start |

---

## levels

| &nbsp; | **levels** |
|:---:|:---|
| PK | name |
| UK | id |
| &nbsp; | description |
| &nbsp; | order_index |
| &nbsp; | child_levels |
| &nbsp; | elo_min |
| &nbsp; | elo_gain_correct |
| &nbsp; | elo_loss_incorrect |
| &nbsp; | time_limit_seconds |
| &nbsp; | enemy_wave_config |
| &nbsp; | question_gen_config |
| &nbsp; | is_active |
| &nbsp; | created_at |
| &nbsp; | updated_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| levels | name | VARCHAR(64) | NOT NULL | Primary key; the level's display name |
| | id | SERIAL | NOT NULL | Unique integer; used as the FK target by `game_sessions` and `levels_unlocked` |
| | description | TEXT | NULL | Optional description of the level |
| | order_index | INTEGER | NOT NULL | Display ordering position (not unique) |
| | child_levels | TEXT[] | NULL | Array of child level names forming the level progression DAG |
| | elo_min | INTEGER | NOT NULL | Minimum global ELO required to play this level; defaults to `0` |
| | elo_gain_correct | INTEGER | NOT NULL | ELO awarded per correct answer; defaults to `15` |
| | elo_loss_incorrect | INTEGER | NOT NULL | ELO deducted per incorrect answer; defaults to `5` |
| | time_limit_seconds | INTEGER | NULL | Per-question time limit in seconds; `NULL` means no limit |
| | enemy_wave_config | JSONB | NOT NULL | Enemy wave parameters passed verbatim to the Unity client |
| | question_gen_config | JSONB | NOT NULL | Question generation parameters; server validates question count only |
| | is_active | BOOLEAN | NOT NULL | Soft-delete flag; inactive levels are hidden from players |
| | created_at | TIMESTAMPTZ | NOT NULL | Timestamp when the level was created |
| | updated_at | TIMESTAMPTZ | NOT NULL | Timestamp of the last level update |

---

## levels_unlocked

| &nbsp; | **levels_unlocked** |
|:---:|:---|
| PK | player_id |
| PK | level_id |
| &nbsp; | unlocked_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| levels_unlocked | player_id | UUID | NOT NULL | Foreign key to `players.id`; part of composite primary key |
| | level_id | INTEGER | NOT NULL | Foreign key to `levels.id`; part of composite primary key |
| | unlocked_at | TIMESTAMPTZ | NOT NULL | Timestamp when the player first unlocked this level |

---

## rooms

| &nbsp; | **rooms** |
|:---:|:---|
| PK | id |
| &nbsp; | host_id |
| &nbsp; | level_id |
| &nbsp; | type |
| &nbsp; | status |
| UK | invite_code |
| &nbsp; | max_players |
| &nbsp; | started_at |
| &nbsp; | ended_at |
| &nbsp; | created_at |
| &nbsp; | updated_at |
| &nbsp; | questions |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| rooms | id | UUID | NOT NULL | Primary key; generated with `gen_random_uuid()` |
| | host_id | UUID | NOT NULL | Foreign key to `players.id`; the player who created the room |
| | level_id | INTEGER | NULL | Foreign key to `levels.id`; `NULL` when the room uses custom `questions` instead |
| | type | VARCHAR(16) | NOT NULL | Room type; `pvp` only, defaults to `pvp` |
| | status | VARCHAR(16) | NOT NULL | Lifecycle state: `creation`, `waiting`, `in_progress`, `completed`, or `cancelled` |
| | invite_code | VARCHAR(16) | NOT NULL | Unique code players use to join this room |
| | max_players | INTEGER | NOT NULL | Room capacity; must be between 2 and 50; defaults to `10` |
| | started_at | TIMESTAMPTZ | NULL | Timestamp when the room transitioned to `in_progress` |
| | ended_at | TIMESTAMPTZ | NULL | Timestamp when the room was completed or cancelled |
| | created_at | TIMESTAMPTZ | NOT NULL | Timestamp when the room was created |
| | updated_at | TIMESTAMPTZ | NOT NULL | Timestamp of the last room update |
| | questions | JSONB | NULL | Custom question set for the room; `NULL` uses `level_id`'s generated questions |

---

## room_members

| &nbsp; | **room_members** |
|:---:|:---|
| PK | room_id |
| PK | player_id |
| &nbsp; | game_session_id |
| &nbsp; | joined_at |
| &nbsp; | deleted_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| room_members | room_id | UUID | NOT NULL | Foreign key to `rooms.id`; part of composite primary key |
| | player_id | UUID | NOT NULL | Foreign key to `players.id`; part of composite primary key |
| | game_session_id | UUID | NULL | Foreign key to `game_sessions.id`; `NULL` until the player starts their session |
| | joined_at | TIMESTAMPTZ | NOT NULL | Timestamp when the player joined the room |
| | deleted_at | TIMESTAMPTZ | NULL | Soft-delete timestamp; `NULL` while still an active member |

---

## game_sessions

| &nbsp; | **game_sessions** |
|:---:|:---|
| PK | id |
| &nbsp; | player_id |
| &nbsp; | level_id |
| &nbsp; | status |
| &nbsp; | score |
| &nbsp; | elo_before |
| &nbsp; | elo_after |
| &nbsp; | elo_delta |
| &nbsp; | correct_count |
| &nbsp; | incorrect_count |
| &nbsp; | max_streak |
| &nbsp; | current_streak |
| &nbsp; | started_at |
| &nbsp; | ended_at |
| &nbsp; | client_ip |
| &nbsp; | user_agent |
| &nbsp; | room_id |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| game_sessions | id | UUID | NOT NULL | Primary key; generated with `gen_random_uuid()` |
| | player_id | UUID | NOT NULL | Foreign key to `players.id` |
| | level_id | INTEGER | NULL | Foreign key to `levels.id`; `NULL` for room sessions using custom questions instead of a level |
| | status | VARCHAR(16) | NOT NULL | Session state: `in_progress`, `completed`, `failed`, or `abandoned` |
| | score | INTEGER | NOT NULL | Accumulated ELO delta earned during the session; defaults to `0` |
| | elo_before | INTEGER | NOT NULL | Player's global ELO at the moment the session started |
| | elo_after | INTEGER | NULL | Player's global ELO after the session ended; `NULL` while in progress |
| | elo_delta | INTEGER | NULL | Net ELO change for the session; `NULL` while in progress |
| | correct_count | INTEGER | NOT NULL | Total correct answers in this session |
| | incorrect_count | INTEGER | NOT NULL | Total incorrect answers in this session |
| | max_streak | INTEGER | NOT NULL | Best consecutive correct answer streak within this session |
| | current_streak | INTEGER | NOT NULL | Current consecutive correct answer streak (live during session) |
| | started_at | TIMESTAMPTZ | NOT NULL | Timestamp when the session began |
| | ended_at | TIMESTAMPTZ | NULL | Timestamp when the session ended; `NULL` while in progress |
| | client_ip | INET | NULL | Player's IP address at session start |
| | user_agent | TEXT | NULL | Player's browser/client user agent string |
| | room_id | UUID | NULL | Foreign key to `rooms.id`; `NULL` for solo (non-room) sessions |

---

## session_answers

> Partitioned table — weekly RANGE partitions on `answered_at` managed by `pg_partman`. Composite PK required by PostgreSQL for range-partitioned tables.

| &nbsp; | **session_answers** |
|:---:|:---|
| PK | id |
| &nbsp; | session_id |
| &nbsp; | is_correct |
| &nbsp; | elo_delta |
| &nbsp; | time_taken_ms |
| PK | answered_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| session_answers | id | BIGSERIAL | NOT NULL | Surrogate key; part of composite primary key `(id, answered_at)` |
| | session_id | UUID | NOT NULL | Foreign key to `game_sessions.id` |
| | is_correct | BOOLEAN | NOT NULL | Whether the player's answer was correct |
| | elo_delta | INTEGER | NOT NULL | ELO change applied for this single answer (positive or negative) |
| | time_taken_ms | INTEGER | NULL | Time the player took to answer in milliseconds |
| | answered_at | TIMESTAMPTZ | NOT NULL | Timestamp of the answer; partition column; part of composite primary key |

---

## elo_history

> Partitioned table — weekly RANGE partitions on `created_at` managed by `pg_partman`. Append-only; rows are never updated after insert.

| &nbsp; | **elo_history** |
|:---:|:---|
| PK | id |
| &nbsp; | player_id |
| &nbsp; | session_id |
| &nbsp; | elo_before |
| &nbsp; | elo_after |
| &nbsp; | delta |
| &nbsp; | reason |
| PK | created_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| elo_history | id | BIGSERIAL | NOT NULL | Surrogate key; part of composite primary key `(id, created_at)` |
| | player_id | UUID | NOT NULL | Foreign key to `players.id` |
| | session_id | UUID | NULL | Foreign key to `game_sessions.id`; `NULL` for non-session adjustments (e.g. decay) |
| | elo_before | INTEGER | NOT NULL | Player's ELO value before this change |
| | elo_after | INTEGER | NOT NULL | Player's ELO value after this change |
| | delta | INTEGER | NOT NULL | Signed ELO change (`elo_after − elo_before`) |
| | reason | VARCHAR(32) | NOT NULL | Cause of change: `session_completed`, `session_failed`, `session_abandoned`, `admin_adjustment`, or `decay` |
| | created_at | TIMESTAMPTZ | NOT NULL | Timestamp of the ELO change; partition column; part of composite primary key |

---

## session

| &nbsp; | **session** |
|:---:|:---|
| PK | sid |
| &nbsp; | sess |
| &nbsp; | expire |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| session | sid | VARCHAR | NOT NULL | Session ID string; primary key |
| | sess | JSON | NOT NULL | Serialized session payload managed by `connect-pg-simple` |
| | expire | TIMESTAMP(6) | NOT NULL | Expiry timestamp used for automatic session garbage collection |

---

## audit.audit_events

> Partitioned table — weekly RANGE partitions on `created_at` managed by `pg_partman`. The `app` database role has INSERT-only access.

| &nbsp; | **audit.audit_events** |
|:---:|:---|
| PK | id |
| &nbsp; | user_id |
| &nbsp; | url |
| &nbsp; | status_code |
| &nbsp; | http_method |
| &nbsp; | ip_address |
| &nbsp; | user_agent |
| &nbsp; | metadata |
| PK | created_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| audit.audit_events | id | UUID | NOT NULL | Row identifier; part of composite primary key `(id, created_at)` |
| | user_id | UUID | NULL | Foreign key to `players.id`; `NULL` for unauthenticated requests |
| | url | VARCHAR(255) | NOT NULL | Request path of the endpoint that was called |
| | status_code | SMALLINT | NOT NULL | HTTP response status code returned to the client |
| | http_method | VARCHAR(10) | NULL | HTTP verb used for the request (e.g. `GET`, `POST`) |
| | ip_address | INET | NULL | Client IP address |
| | user_agent | TEXT | NULL | Client user agent string |
| | metadata | JSONB | NULL | Additional request context (headers, query params, etc.) |
| | created_at | TIMESTAMPTZ | NOT NULL | Timestamp of the request; partition column; part of composite primary key |

---

## audit.log_events

> Partitioned table — weekly RANGE partitions on `created_at` managed by `pg_partman`. The `app` database role has INSERT-only access.

| &nbsp; | **audit.log_events** |
|:---:|:---|
| PK | id |
| &nbsp; | user_id |
| &nbsp; | event |
| &nbsp; | level |
| &nbsp; | metadata |
| &nbsp; | description |
| PK | created_at |

| Entity | Attribute | Data Type | NULL/NOT NULL | Description |
|---|---|---|---|---|
| audit.log_events | id | UUID | NOT NULL | Row identifier; part of composite primary key `(id, created_at)` |
| | user_id | UUID | NULL | Foreign key to `players.id`; `NULL` for system-generated events |
| | event | VARCHAR(255) | NOT NULL | Event name or type identifier (e.g. `user.login`, `session.abandoned`) |
| | level | VARCHAR(16) | NOT NULL | Severity: `info`, `warning`, `error`, or `fatal`; defaults to `info` |
| | metadata | JSONB | NULL | Structured event payload with additional context |
| | description | TEXT | NULL | Human-readable description of the event |
| | created_at | TIMESTAMPTZ | NOT NULL | Timestamp of the event; partition column; part of composite primary key |
