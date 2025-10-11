# supabase/config.ts

[project]
id = "vozstxchkgpxzetwdzow"
name = "project"

[api]
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
major_version = 15

[db.pooler]
enabled = false

[realtime]
enabled = true

[studio]
enabled = true
port = 54323
api_url = "http://127.0.0.1"

[ingest]
enabled = false

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
jwt_expiry = 3600
enable_signup = true
email_double_confirm_changes = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[[auth.external.apple]]
enabled = false
client_id = ""
secret = ""

[[auth.external.azure]]
enabled = false
client_id = ""
secret = ""

[[auth.external.bitbucket]]
enabled = false
client_id = ""
secret = ""

[[auth.external.discord]]
enabled = false
client_id = ""
secret = ""

[[auth.external.facebook]]
enabled = false
client_id = ""
secret = ""

[[auth.external.github]]
enabled = false
client_id = ""
secret = ""

[[auth.external.gitlab]]
enabled = false
client_id = ""
secret = ""

[[auth.external.google]]
enabled = false
client_id = ""
secret = ""

[[auth.external.keycloak]]
enabled = false
client_id = ""
secret = ""

[[auth.external.linkedin]]
enabled = false
client_id = ""
secret = ""

[[auth.external.notion]]
enabled = false
client_id = ""
secret = ""

[[auth.external.twitch]]
enabled = false
client_id = ""
secret = ""

[[auth.external.twitter]]
enabled = false
client_id = ""
secret = ""

[[auth.external.slack]]
enabled = false
client_id = ""
secret = ""

[[auth.external.spotify]]
enabled = false
client_id = ""
secret = ""

[[auth.external.workos]]
enabled = false
client_id = ""
secret = ""

[[auth.external.zoom]]
enabled = false
client_id = ""
secret = ""

# Edge Functions Configuration
[functions."track-shipments"]
verify_jwt = false

[functions."send-activation-code"]
verify_jwt = false

[functions."track-location"]
verify_jwt = false

[functions."send-welcome-email"]
verify_jwt = false

# Add new healing reminder functions
[functions."generate-healing-reminders"]
verify_jwt = false

[functions."send-healing-reminder"]
verify_jwt = false

[functions."process-healing-reminders"]
verify_jwt = false
