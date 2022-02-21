# kubectl-port-forwarder

## Feature 1: Activate port forwarding
1. Start with e. g. `npm run start`
2. Select environment etc.
3. Done. (This 

## Feature 2: Convert URLs
⚠️ You have to create an .env-file first. You can use the .env-example and replace the placeholders (`CMS-NAME` etc.)

- `npm run start "http://localhost:8080/demo-site/path/index.html"` -> Will be converted to `CURRENT-NAMESPACE.author.CMS-NAME.dev.CLOUD-NAME.DOMAIN.de/demo-site/path/index.html`
- `npm run start "CURRENT-NAMESPACE.author.CMS-NAME.dev.CLOUD-NAME.DOMAIN.de/demo-site/path/index.html"` -> Will be converted to `http://localhost:8080/demo-site/path/index.html`
- It detects automatically the correct namespace (e. g. integration), the instance (author, public) etc.
- Even subdomain-style will be detected. (e. g. `demo.integration.author.[...].de/index.html` will be converted to `integration.author.[...].de/demo-site/index.html`)
