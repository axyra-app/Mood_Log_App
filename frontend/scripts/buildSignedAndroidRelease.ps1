param(
    [string]$KeystorePath = (Join-Path $env:USERPROFILE '.android\moodlog-upload.jks'),
    [string]$KeyAlias = 'moodlog-upload'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $KeystorePath -PathType Leaf)) {
    throw "No se encontró el keystore: $KeystorePath"
}

function ConvertFrom-SecureStringToPlainText([System.Security.SecureString]$Value) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

$storePasswordSecure = Read-Host 'Contraseña del keystore (no se mostrará)' -AsSecureString
$keyPasswordSecure = Read-Host 'Contraseña de la clave (no se mostrará)' -AsSecureString

try {
    $env:MOODLOG_UPLOAD_STORE_FILE = (Resolve-Path -LiteralPath $KeystorePath).Path
    $env:MOODLOG_UPLOAD_STORE_PASSWORD = ConvertFrom-SecureStringToPlainText $storePasswordSecure
    $env:MOODLOG_UPLOAD_KEY_ALIAS = $KeyAlias
    $env:MOODLOG_UPLOAD_KEY_PASSWORD = ConvertFrom-SecureStringToPlainText $keyPasswordSecure

    Push-Location (Join-Path $PSScriptRoot '..\android')
    try {
        & .\gradlew.bat bundleRelease
        if ($LASTEXITCODE -ne 0) {
            throw "Gradle terminó con código $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    Remove-Item Env:MOODLOG_UPLOAD_STORE_FILE -ErrorAction SilentlyContinue
    Remove-Item Env:MOODLOG_UPLOAD_STORE_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:MOODLOG_UPLOAD_KEY_ALIAS -ErrorAction SilentlyContinue
    Remove-Item Env:MOODLOG_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
    $storePasswordSecure.Dispose()
    $keyPasswordSecure.Dispose()
}
