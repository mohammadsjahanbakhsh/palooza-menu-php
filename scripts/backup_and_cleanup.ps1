try {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupRoot = Join-Path 'C:\laragon\www' ("bookstore_backups_$timestamp")
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

    $candidates = @(
        'C:\laragon\www\bookstore\public\app\app',
        'C:\laragon\www\bookstore\dist',
        'C:\laragon\www\bookstore\public\index.html'
    )

    $results = @()
    foreach ($p in $candidates) {
        if (Test-Path $p) {
            Write-Output "BACKUP: $p"
            $dest = Join-Path $backupRoot ([IO.Path]::GetFileName($p))
            Copy-Item -Path $p -Destination $dest -Recurse -Force -ErrorAction Stop
            Write-Output "COPIED: $p -> $dest"

            if (Test-Path $p -PathType Container) {
                Remove-Item -Path $p -Recurse -Force -ErrorAction Stop
                Write-Output "REMOVED DIR: $p"
                $results += [PSCustomObject]@{ Path = $p; Action = 'backed-up-and-removed'; Destination = $dest }
            } else {
                Remove-Item -Path $p -Force -ErrorAction Stop
                Write-Output "REMOVED FILE: $p"
                $results += [PSCustomObject]@{ Path = $p; Action = 'backed-up-and-removed'; Destination = $dest }
            }
        } else {
            Write-Output "NOTFOUND: $p"
            $results += [PSCustomObject]@{ Path = $p; Action = 'not-found'; Destination = $null }
        }
    }

    Write-Output "DONE: backup stored at $backupRoot"
    Write-Output "BACKUP CONTENTS:"
    Get-ChildItem -Path $backupRoot -Recurse | ForEach-Object { Write-Output $_.FullName }

    Write-Output "SUMMARY:"
    $results | Format-Table -AutoSize
} catch {
    Write-Error "An error occurred: $_"
    exit 1
}
