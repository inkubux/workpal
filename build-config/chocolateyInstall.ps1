$packageName = 'workpal'
$file = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\workpal-win-x64.zip"
$unzipLocation = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\workpal"


Install-ChocolateyZipPackage  `
    -PackageName $packageName `
    -File $file `
    -UnzipLocation $unzipLocation `

Install-BinFile -Name $packageName -Path 'workpal.exe'
