---
title: 02 - Configuration
---
Configuration of the Note Mark is done through environment variables. See the below options:

| Key              | Description                               | Default   | Docker Default
|:---------------- |:----------------------------------------- |:----------|:--------------- |
| BIND__HOST       | What ip to listen on                      | 127.0.0.1 | 0.0.0.0         |
| BIND__PORT       | Port to bind to                           | 8080      | 8080            |
| BIND__UNIX_SOCKET | Listen on unix socket, overrides HOST/PORT when set | - | - |
| DB__TYPE         | Type of DB (sqlite or postgres)           |           | sqlite          |
| DB__URI          | URI (or file path if using SQLite)        |           | /data/db.sqlite |
| JWT_SECRET       | base64 encoded secret                     |           |                 |
| TOKEN_EXPIRY     | seconds until a token expires             | 259200    | 259200          |
| DATA_PATH        | Where to store app data                   |           | /data           |
| STATIC_PATH      | Host static files                         |           |                 |
| CORS_ORIGINS     | Comma separated values of allowed origins |           |                 |
| ENABLE_INTERNAL_SIGNUP | Whether to enable new internal accounts | true | true |
| ENABLE_INTERNAL_LOGIN | Whether to enable new logins for internal accounts | true | true |
| NOTE_SIZE_LIMIT  | Max file size for note                    |  1M       | 1M              |
| ASSET_SIZE_LIMIT | Max file size for uploaded assets         |  12M      | 12M             |
| OIDC__DISPLAY_NAME | The provider name (used for UI) | - | - |
| OIDC__PROVIDER_NAME | The provider name (used for DB) | - | - |
| OIDC__ISSUER_URL | The OIDC issuer url | - | - |
| OIDC__CLIENT_ID | The OIDC client id | - | - |
| OIDC__ENABLE_USER_CREATION | Whether to automatically create users | true | true |

> *TIP* A secret can be generated using: `openssl rand -base64 32`

## OIDC
Single-Sign-On is handled via OpenID Connect and OAuth2. To use SSO you must have a compatible provider that supports the following features:

- OpenID Connect (OIDC) Discovery - RFC5785
- Authorization Code Flow with PKCE + state
    - May show in provider UI's as a "public client type"
- Claims
    - sub: the users id
    - name: the users full name
    - preferred_username: the users username, not the email
- Scopes
    - openid
    - profile
- ID Token: MUST be signed JWT, JWE NOT supported

> *TIP*: OIDC will only work if Note Mark is running with https

Depending on your SSO provider the issuer URL may be different, see below for examples:

If your provider is not listed, please see requirements listed above. No further support will be given, as every provider & setup cannot be tested.

> Please do reach out if you have a working setup for another provider and would like it listed.

### Authentik (version tested: 2025.6.1):
Client Type:

```
public
```

Issuer URL (shown in UI as "OpenID Configuration Issuer"):

```
https://{provider-domain:port}/application/o/{note-mark}/
```

Redirect/Callback URL:

```
https://{note-mark-domain:port}/oidc-callback
```

Optional:

- Turn on "Include claims in id_token", this removes extra requests to provider

## Database URI
These have been copied from the ORM docs, more info found on [gorm.io](https://gorm.io/docs/connecting_to_the_database.html).

sqlite:

```text
/path/to/db.sqlite
```

postgres:

```text
host=localhost user=user password=pass dbname=notemark port=5432 sslmode=disable TimeZone=Europe/London
```

## CORS
For most people this should be set to your front-end URL. For example if you access your front-end via `https://notemark.example.com` then you should enter that. Multiple origins can also be specified by providing comma separated values. Learn more about CORS on [Wikipedia](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
