// Placeholder for SFCC Data API integration.
//
// Keep this file comments-only for now.
//
// Future implementation notes:
// - SFCC Data API (admin/back-office) typically differs from Shop API in:
//   - Base paths and endpoints
//   - Authentication/scopes
//   - Payload shapes and permissions
//
// Planned structure:
// - Services/Sfcc/Shared/    -> reusable HTTP+JSON primitives (already exists)
// - Services/Sfcc/DataApi/   -> Data API client + DTOs + mapping
//
// Best practices to apply when implementing:
// - Use HttpClientFactory typed clients
// - Propagate CancellationToken
// - Stream responses (ResponseHeadersRead + DeserializeAsync)
// - Structured logging; avoid logging secrets
