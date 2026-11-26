# Azure deployment plan

Status: plan only. Nothing here has been run. Do not run any `az` command that
creates resources until the cost table below has been checked and confirmed.

## Target layout

```
Browser -> frontend app (Nginx, public HTTPS)
              -> /api/ proxied to backend app (internal only)
                    -> Azure Database for PostgreSQL Flexible Server (B1ms)
Images live in Azure Container Registry.
```

The Nginx config already proxies `/api/` to `http://backend:8080`, so the
backend container app must be named `backend` and live in the same Container
Apps environment as the frontend.

## Cost table (check before creating anything)

Figures come from the Azure free account page and must be confirmed in the
Azure pricing calculator for the chosen region. The $200 credit lasts 30 days
from sign up, so sign up only when ready to deploy.

| Resource | Setting | Expected cost |
|---|---|---|
| PostgreSQL Flexible Server | Burstable B1ms, 32 GB, version 16 | Free for 12 months (750 h), then paid |
| Container Registry | Standard, one registry | Free for 12 months, then paid |
| Container Apps, frontend | 0.25 vCPU, 0.5 GiB, min replicas 0 | Inside the monthly free grant |
| Container Apps, backend | 0.5 vCPU, 1 GiB, min replicas 0 | Inside the free grant while idle |
| Log Analytics (created with the environment) | default | Small, free allowance per month |

Keeping the backend always on (min replicas 1) would use far more than the
free grant and cost roughly tens of dollars a month. Keep min replicas at 0 and
accept a cold start of several seconds on the first request.

Set a budget alert (for example 10 dollars) in the portal before creating
resources: Cost Management, Budgets, Add.

## Before deploying

1. Merge the branches into `dev`, then run locally: `npm test`, `./mvnw test`,
   `docker compose up --build`. Confirm registration and login work.
2. Install tools: Docker Desktop and `brew install azure-cli`.
3. Generate secrets locally and keep them out of git:
   `openssl rand -base64 48` for `JWT_SECRET`, and a separate strong database
   password.

## Steps

Names must be globally unique where marked.

```bash
az login
RG=kiwihire-rg
LOC=australiaeast
ACR=kiwihirecr<random digits>        # unique, lowercase letters and digits only
PG=kiwihire-pg-<random digits>       # unique
ENVNAME=kiwihire-env
PGPASS='<strong password>'
JWT='<output of openssl rand -base64 48>'

az group create -n $RG -l $LOC

# Registry
az acr create -g $RG -n $ACR --sku Standard
az acr login -n $ACR

# Build for linux/amd64 (needed on Apple silicon) and push
docker buildx build --platform linux/amd64 -t $ACR.azurecr.io/backend:v1 --push ./backend
docker buildx build --platform linux/amd64 -t $ACR.azurecr.io/frontend:v1 --push ./frontend

# Database
az postgres flexible-server create -g $RG -n $PG -l $LOC \
  --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 16 \
  --admin-user kiwihire --admin-password "$PGPASS" --public-access 0.0.0.0
az postgres flexible-server db create -g $RG -s $PG -d kiwihire

# Container Apps environment
az extension add --name containerapp --upgrade
az containerapp env create -g $RG -n $ENVNAME -l $LOC

# Backend: internal only, scales to zero
az containerapp create -g $RG -n backend --environment $ENVNAME \
  --image $ACR.azurecr.io/backend:v1 \
  --registry-server $ACR.azurecr.io --registry-identity system \
  --target-port 8080 --ingress internal \
  --min-replicas 0 --max-replicas 1 --cpu 0.5 --memory 1.0Gi \
  --secrets dbpass="$PGPASS" jwt="$JWT" \
  --env-vars SPRING_PROFILES_ACTIVE=prod \
    DB_URL="jdbc:postgresql://$PG.postgres.database.azure.com:5432/kiwihire?sslmode=require" \
    DB_USERNAME=kiwihire DB_PASSWORD=secretref:dbpass JWT_SECRET=secretref:jwt \
    CORS_ALLOWED_ORIGINS=http://localhost

# Frontend: public HTTPS
az containerapp create -g $RG -n frontend --environment $ENVNAME \
  --image $ACR.azurecr.io/frontend:v1 \
  --registry-server $ACR.azurecr.io --registry-identity system \
  --target-port 80 --ingress external \
  --min-replicas 0 --max-replicas 1 --cpu 0.25 --memory 0.5Gi

# Allow the frontend address in CORS
FQDN=$(az containerapp show -g $RG -n frontend --query properties.configuration.ingress.fqdn -o tsv)
az containerapp update -g $RG -n backend --set-env-vars CORS_ALLOWED_ORIGINS=https://$FQDN
echo https://$FQDN
```

Notes:
- `--registry-identity system` may need the AcrPull role granted to the app's
  identity. If the image pull fails, grant it with `az role assignment create`,
  or use `--registry-username` and `--registry-password` from
  `az acr credential show` (enable the admin user first).
- `--public-access 0.0.0.0` lets Azure services reach the database. It is
  simple for a portfolio project. Do not open the database to all addresses.
- Flyway creates the schema on first backend start. The first request after
  idle can take 20 to 40 seconds.
- Do not expose `/actuator/prometheus` in the cloud. Leave `MANAGEMENT_ENDPOINTS`
  unset so only health is exposed. Swagger is already disabled by the prod
  profile.
- Check the PostgreSQL free offer is available in the chosen region. If not,
  pick another region at creation time.

## After deploying

1. Open the URL, register, log in, create an application, run a CV review.
2. Run the k6 test against the deployed URL with a small number of users
   (`-e VUS=5`). Check the cost page first, because requests wake the backend.
3. Record real numbers in `docs/metrics.md`. Only then mention the deployment
   on the CV.

## Tear down (stops all charges)

```bash
az group delete -n kiwihire-rg --yes --no-wait
```

## Later

GitHub Actions deployment: build and push images, then
`az containerapp update`. Use OIDC federation, not stored passwords. Add it
only after the manual deployment works.
