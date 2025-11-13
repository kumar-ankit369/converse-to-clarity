# Team API Design

This document describes the HTTP API endpoints, request/response shapes, permission rules and events (socket) for team management used by the Converse-to-Clarity backend.

Base path: `/api/teams`

Auth: All endpoints require a valid JWT in `Authorization: Bearer <token>` header unless stated otherwise. The server middleware should populate `req.user` with { id, email, name }.

Role model (per-team):
- owner: full control (change roles, remove members, delete team, manage channels)
- admin: manage members except owner; can create channels/messages and moderate
- member: standard member; post messages, upload files
- viewer: read-only access to channels/messages

Errors:
- 400 Bad Request: malformed payload
- 401 Unauthorized: missing/invalid token
- 403 Forbidden: authenticated but lacks permission for the action
- 404 Not Found: resource doesn't exist
- 409 Conflict: duplicate (e.g., inviting a member already in team)

---

## Endpoints

### Create Team
POST /api/teams

Body:
{
  "name": "Team Name",
  "description": "optional",
  "visibility": "private" | "public"
}

Response 201:
{
  "id": "teamId",
  "name": "Team Name",
  "owner": { "id": "userId" },
  "members": [ { "id": "memberId", "userId": "userId", "role": "owner" } ],
  "createdAt": "..."
}

Permissions: any authenticated user may create a team; creator becomes `owner`.

Socket: emit `team:created` to `user_<ownerId>` and optionally to org/project rooms.

---

### Get Team
GET /api/teams/:teamId

Response 200: Team object including members and channels (limited fields).

Permissions: members and public teams visible to any authenticated user; private team requires membership.

---

### List Teams
GET /api/teams
Query params: optional `q` search

Response 200: [ teams ]

Permissions: returns the teams the user has access to (their teams and public teams).

---

### Invite / Add Member
POST /api/teams/:teamId/members

Body:
{
  "userId": "userToInviteId",
  "role": "member" | "admin" | "viewer"
}

Response 201: the created team-member object

Permissions: only `owner` and `admin` can invite/add members. Server should reject if user already a member. Return 409 if duplicate.

Socket: after DB write, emit `team:member:added` to room `team_<teamId>` and to `user_<userId>`. UI should listen and refresh team details.

---

### Change Member Role
PUT /api/teams/:teamId/members/:memberId/role

Body:
{ "role": "admin" | "member" | "viewer" }

Response 200: updated member object

Permissions: only `owner` may change roles of others, admins can promote/demote members except owner. Attempt to change owner role should be rejected unless special owner-transfer endpoint used.

Socket: emit `team:member:roleChanged` to `team_<teamId>` and to `user_<memberUserId>`.

---

### Remove Member
DELETE /api/teams/:teamId/members/:memberId

Response 204 No Content

Permissions: only `owner` and `admin` (admins cannot remove owner). If the member is the owner, return 403 unless there's an owner transfer endpoint.

Socket: emit `team:member:removed` to `team_<teamId>` and to `user_<memberUserId>`.

---

### Join Team (request/accept flows)
- For `public` teams, user may join directly: POST /api/teams/:teamId/join
- For `private` teams, implement invite-only or request+approve endpoints if desired: POST /api/teams/:teamId/requests and POST /api/teams/:teamId/requests/:requestId/approve

Permissions: join for public teams requires only authentication; approve requires owner/admin.

Socket: emit `team:member:added` when a join is successful.

---

### Delete Team
DELETE /api/teams/:teamId

Response 204

Permissions: only `owner` may delete team.

Socket: emit `team:deleted` to `team_<teamId>` (so clients can leave room) and to all members' user rooms.

---

## Channels & Chat Integration (overview)
- Channels are child resources under a team (e.g., `/api/teams/:teamId/channels`), or existing `/api/chat/channels` can accept `teamId` or `projectId` to associate.
- Creating a channel requires `admin` or `owner`.
- Messages are posted via `/api/chat/channels/:channelId/messages` (existing). Messages should include optional `attachments: [{ url, filename, mimeType, size }]`.

Socket: messages are emitted on room `channel_<channelId>` as `message:created`, `message:updated`, `message:deleted` and reactions `reaction:added`/`reaction:removed`.

---

## Socket Events (naming conventions)
Rooms:
- `user_<userId>` — personal events
- `team_<teamId>` — team-level events (members/roles/team-updates)
- `channel_<channelId>` — message events

Event names:
- team:created
- team:updated
- team:deleted
- team:member:added { member, teamId }
- team:member:removed { memberId, userId, teamId }
- team:member:roleChanged { memberId, userId, oldRole, newRole, teamId }

- message:created { message }
- message:updated { message }
- message:deleted { messageId }
- reaction:added { messageId, reaction, userId }
- reaction:removed { messageId, reaction, userId }

Clients should listen and reconcile server state by refetching the team or message pages when necessary (or apply optimistic updates via the event payload when payload contains full resource).

---

## Permission Matrix (quick)
- Create team: any authenticated user -> becomes owner
- Invite member: owner, admin -> adds member
- Remove member: owner, admin (cannot remove owner)
- Change role: owner only (owner cannot be changed via this route)
- Delete team: owner only
- Create channel: admin, owner
- Post message: member, admin, owner

---

## Edge cases and notes
- Owner transfer: implement a dedicated endpoint `POST /api/teams/:teamId/transfer-owner` which requires current owner confirmation and sets another member as owner.
- Concurrency: when two users try to modify member roles at once, use atomic DB updates or re-check role before applying to avoid race conditions.
- Validation: always validate `userId` exists before inviting; return 404 or 400 accordingly.
- Audit/logging: consider recording member role changes for traceability.


---

## Example flows
1) Invite a user as owner/admin by mistake
- Server should prevent creating another owner via the normal role-change endpoint; owner transfer endpoint required.

2) User invited while offline
- Server emits `team:member:added` to `user_<userId>`; when client connects it should re-sync (fetch team list or membership).

3) Channel message with attachments
- Client uploads file to `/api/chat/channels/:channelId/upload`, receives attachment URL(s), then posts message with attachments array. Server persists and emits `message:created` with attachments.


---

If you'd like, I can now:
- implement the missing server-side role checks for each endpoint (owner-only vs admin),
- add supertest integration tests for invite/add/change-role/remove endpoints,
- or proceed to implement owner-transfer endpoint and its UI.

Pick the next action and I'll implement it.
