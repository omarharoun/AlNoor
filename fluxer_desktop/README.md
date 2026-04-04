# Fluxer Desktop

Electron desktop client for Fluxer. Wraps the web application with native platform integrations including notifications, global shortcuts, screen sharing, passkeys, and auto-updates.

## Configuration

The desktop client reads an optional `settings.json` file from the user data directory on startup. If the file does not exist, defaults are used.

### User data directory locations

| Platform | Stable                                               | Canary                                                     |
| -------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Windows  | `%APPDATA%\fluxer\settings.json`                     | `%APPDATA%\fluxercanary\settings.json`                     |
| macOS    | `~/Library/Application Support/fluxer/settings.json` | `~/Library/Application Support/fluxercanary/settings.json` |
| Linux    | `~/.config/fluxer/settings.json`                     | `~/.config/fluxercanary/settings.json`                     |

### Available options

| Key       | Type   | Default (Stable)         | Default (Canary)                | Description                         |
| --------- | ------ | ------------------------ | ------------------------------- | ----------------------------------- |
| `app_url` | string | `https://web.fluxer.app` | `https://web.canary.fluxer.app` | URL of the web application to load. |

If you set `FLUXER_APP_URL` while running the desktop build, that URL is baked into the packaged app as the default. A local `settings.json` `app_url` still overrides it.

### Example

```json
{
  "app_url": "https://my-instance.example.com"
}
```

When `app_url` is set, the desktop client loads that URL instead of the default and treats its origin as trusted for permissions, navigation, and the local RPC server.

### Build-time default URL

Example:

```bash
FLUXER_APP_URL=https://my-instance.example.com pnpm --filter fluxer_desktop run build
```

After packaging, the desktop app will open that URL unless a user sets their own `settings.json` override.
