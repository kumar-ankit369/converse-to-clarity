Manual verification and quick curl tests for collaboration features

1) Search users (invite flow)

  - Description: Verify the user search endpoint returns matches for name/email.
  - Command:

    curl -H "Authorization: Bearer <TOKEN>" "http://localhost:5000/api/users/search?q=alice"

  - Expected: 200 OK with JSON array of users: [{ id, name, email, avatar }, ...]

2) Invite user to a team (API)

  - Description: Add a user to a team by POSTing to /api/teams/:teamId/members
  - Example:

    curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
      -d '{"userId":"<USER_ID>","role":"member"}' \
      "http://localhost:5000/api/teams/<TEAM_ID>/members"

  - Expected: 200 OK with updated team JSON including new member.

3) Chat message and file upload

  - Send a message:
    curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
      -d '{"content":"Hello team"}' "http://localhost:5000/api/chat/channels/<CHANNEL_ID>/messages"

  - Upload a file (multipart):
    curl -X POST -H "Authorization: Bearer <TOKEN>" -F "file=@/path/to/file.png" \
      "http://localhost:5000/api/chat/channels/<CHANNEL_ID>/upload"

4) WebSocket smoke test (manual)

  - Start two browser windows with the app; open same channel. Send a message in one window and confirm it appears in the other.
  - Observe socket events in browser console (e.g., 'message:created').

Notes:
  - Replace <TOKEN> with a valid JWT returned by /api/auth/login.
  - Replace <USER_ID>, <TEAM_ID>, <CHANNEL_ID> with real IDs from your DB.
