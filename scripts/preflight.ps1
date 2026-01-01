$ErrorActionPreference = "Stop"

Write-Host "[dongdong-rn] preflight start"

# 1) Required envs (fail-fast to prevent 'no-op Kakao login' builds)
if (-not $env:EXPO_PUBLIC_KAKAO_APP_KEY -or $env:EXPO_PUBLIC_KAKAO_APP_KEY.Trim().Length -lt 6) {
  throw "[dongdong-rn] EXPO_PUBLIC_KAKAO_APP_KEY is required. (Kakao login is mandatory)"
}

# 2) API base (deterministic default)
if (-not $env:EXPO_PUBLIC_API_URL -or $env:EXPO_PUBLIC_API_URL.Trim().Length -eq 0) {
  $env:EXPO_PUBLIC_API_URL = "http://api.dongdong.io:3000/api/v1"
}

Write-Host "[dongdong-rn] EXPO_PUBLIC_API_URL=$($env:EXPO_PUBLIC_API_URL)"

# 3) Static gates (error=block)
Write-Host "[dongdong-rn] lint..."
npm run lint

Write-Host "[dongdong-rn] tsc --noEmit..."
npx --yes tsc -p tsconfig.json --noEmit

# 4) Connection gates (must be 200)
$urls = @(
  "http://api.dongdong.io:3000/api/v1/health",
  "http://api.dongdong.io:3000/api/docs",
  "http://dev-client.dongdong.io/"
)

foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 8
    if ($r.StatusCode -ne 200) {
      throw "status=$($r.StatusCode)"
    }
    Write-Host "[dongdong-rn] OK 200 -> $u"
  } catch {
    throw "[dongdong-rn] Connection gate failed: $u :: $($_.Exception.Message)"
  }
}

Write-Host "[dongdong-rn] preflight PASS"


