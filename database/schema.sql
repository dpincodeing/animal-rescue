-- =============================================================================
-- ANIMAL RESCUE PLATFORM — PostgreSQL + PostGIS Schema
-- =============================================================================
-- Target: Railway.app PostgreSQL instance with PostGIS extension.
--
-- Normalization: Strict 3NF
--   • Every non-key column depends on the WHOLE primary key (2NF).
--   • No transitive dependencies — responder-specific data lives in its own
--     table (`responder_profiles`), not in `users`.
--
-- Spatial strategy:
--   We use GEOGRAPHY(POINT, 4326) instead of GEOMETRY so that distance
--   functions like ST_DWithin operate in **metres** on a spheroid, which is
--   what we need for real-world radius searches.
-- =============================================================================

-- ─── 0. Enable PostGIS ──────────────────────────────────────────────────────
-- This MUST run before any spatial column or function is used.
-- Railway supports this out of the box on their PostgreSQL add-on.
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─── 1. ENUM types ─────────────────────────────────────────────────────────
-- Using PostgreSQL enums keeps the domain constrained at the DB level and
-- avoids magic strings scattered across application code.

-- Roles: a user is either a citizen who reports, or a responder who rescues.
CREATE TYPE user_role AS ENUM ('citizen', 'responder');

-- Responder sub-types for dispatching logic.
CREATE TYPE responder_type AS ENUM ('ngo', 'vet', 'volunteer');

-- Report lifecycle states.
CREATE TYPE report_status AS ENUM ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled');

-- Urgency tiers — drives sort order when multiple reports compete for the
-- same responder.
CREATE TYPE urgency_level AS ENUM ('critical', 'high', 'medium', 'low');

-- Rescue session outcome.
CREATE TYPE session_status AS ENUM ('dispatched', 'en_route', 'on_site', 'completed', 'aborted');

-- ─── 2. USERS table ────────────────────────────────────────────────────────
-- Core identity for every person on the platform.
-- Role-specific data is NOT here (3NF) — see `responder_profiles`.
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication & identity
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,          -- bcrypt / argon2 hash
    full_name       VARCHAR(150) NOT NULL,
    phone           VARCHAR(20),                    -- optional, but useful for SMS alerts

    -- Role discriminator — determines which extra tables apply
    role            user_role    NOT NULL DEFAULT 'citizen',

    -- FCM push-notification token (Firebase Cloud Messaging)
    fcm_token       TEXT,

    -- Last known device location — updated periodically by the mobile app
    -- so the backend can run spatial queries against responders.
    last_known_location GEOGRAPHY(POINT, 4326),

    -- Soft-delete & availability flag for responders
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Spatial index on user locations — critical for the "find nearest responder"
-- query to be fast (GiST index on geography columns).
CREATE INDEX idx_users_location ON users USING GIST (last_known_location);

-- Fast lookup by role (we frequently query "all active responders").
CREATE INDEX idx_users_role_active ON users (role, is_active);

-- ─── 3. RESPONDER_PROFILES table ───────────────────────────────────────────
-- 3NF extraction: fields that depend on RESPONDER identity, not on generic
-- user identity. A citizen row will never have a row here.
CREATE TABLE responder_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- FK back to users — one-to-one, enforced by UNIQUE
    user_id             UUID NOT NULL UNIQUE
                        REFERENCES users(id) ON DELETE CASCADE,

    -- Organisation / clinic name (NULL for individual volunteers)
    organization_name   VARCHAR(255),

    -- What kind of responder
    responder_type      responder_type NOT NULL DEFAULT 'volunteer',

    -- Specializations stored as a text array, e.g. {'dogs','cats','birds'}
    specializations     TEXT[] DEFAULT '{}',

    -- Maximum distance (in metres) the responder is willing to travel.
    -- Used as a secondary filter after the global radius search.
    service_radius_m    INTEGER NOT NULL DEFAULT 5000,

    -- Whether the responder is currently available to accept dispatches.
    is_available        BOOLEAN NOT NULL DEFAULT TRUE,

    -- Optional verification / license number for vets
    license_number      VARCHAR(100),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. REPORTS table ──────────────────────────────────────────────────────
-- Each row = one animal emergency reported by a citizen.
CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Who reported it
    reporter_id     UUID NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,

    -- ── Location data ──
    -- Precise GPS point where the animal was found.
    location        GEOGRAPHY(POINT, 4326) NOT NULL,

    -- Human-readable address obtained via Nominatim reverse geocoding on the
    -- client; stored for display so we don't re-geocode.
    address         TEXT,

    -- Latitude & longitude stored as plain doubles for convenience in the
    -- API response (avoids PostGIS serialisation on every read).
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,

    -- ── Report details ──
    animal_type     VARCHAR(100) NOT NULL,           -- e.g. 'dog', 'cat', 'cow'
    description     TEXT,                            -- free-text from citizen
    urgency         urgency_level NOT NULL DEFAULT 'medium',
    photo_url       TEXT,                            -- optional image upload URL

    -- Lifecycle
    status          report_status NOT NULL DEFAULT 'pending',

    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Spatial index on report locations — enables fast "reports near me" queries.
CREATE INDEX idx_reports_location ON reports USING GIST (location);

-- Filter reports by status quickly (most queries want 'pending' reports).
CREATE INDEX idx_reports_status ON reports (status);

-- ─── 5. RESCUE_SESSIONS table ──────────────────────────────────────────────
-- Tracks the assignment of exactly ONE responder to ONE report, from
-- dispatch through to completion or abort. A report may have multiple
-- sessions if the first responder aborts (but only one active at a time,
-- enforced at the application layer).
CREATE TABLE rescue_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Which report is being addressed
    report_id       UUID NOT NULL
                    REFERENCES reports(id) ON DELETE CASCADE,

    -- Which responder accepted / was dispatched
    responder_id    UUID NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,

    -- Session lifecycle
    status          session_status NOT NULL DEFAULT 'dispatched',

    -- When the responder accepted the dispatch
    dispatched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- When the responder arrived on site (NULL until they check in)
    arrived_at      TIMESTAMPTZ,

    -- When the session concluded (completed or aborted)
    completed_at    TIMESTAMPTZ,

    -- Responder's notes after rescue (condition of animal, next steps, etc.)
    notes           TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite index: quickly find all sessions for a given report.
CREATE INDEX idx_sessions_report ON rescue_sessions (report_id);

-- Composite index: quickly find a responder's active sessions.
CREATE INDEX idx_sessions_responder_status ON rescue_sessions (responder_id, status);


-- =============================================================================
-- SAMPLE SPATIAL QUERY
-- =============================================================================
-- Find the nearest ACTIVE and AVAILABLE responders within a 5 km (5 000 m)
-- radius of a given report's GPS coordinates.
--
-- How it works:
--   1. ST_MakePoint(lon, lat)::geography  — builds a geography point from the
--      report's coordinates.
--   2. ST_DWithin(a, b, distance_metres)  — returns TRUE when two geography
--      objects are within `distance_metres` of each other on the Earth's
--      spheroid. This leverages the GiST spatial index for speed.
--   3. ST_Distance(a, b)                  — returns the exact spheroidal
--      distance in metres; used for ORDER BY.
--
-- Replace the $1 / $2 placeholders with actual longitude / latitude values.
-- =============================================================================

/*
SELECT
    u.id             AS responder_id,
    u.full_name,
    u.phone,
    rp.organization_name,
    rp.responder_type,
    rp.specializations,
    -- Exact distance in metres for display / ranking
    ST_Distance(
        u.last_known_location,
        ST_MakePoint($1, $2)::geography      -- $1 = longitude, $2 = latitude
    ) AS distance_metres
FROM users u
JOIN responder_profiles rp ON rp.user_id = u.id
WHERE
    u.role        = 'responder'
    AND u.is_active    = TRUE
    AND rp.is_available = TRUE
    -- Spatial filter: within 5 000 metres (5 km)
    AND ST_DWithin(
        u.last_known_location,
        ST_MakePoint($1, $2)::geography,
        5000                                  -- radius in metres
    )
ORDER BY distance_metres ASC
LIMIT 10;
*/
