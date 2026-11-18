param([Parameter(Mandatory=$true)][string]$Source,[Parameter(Mandatory=$true)][ValidatePattern('^bs-(friends|leonessa)-\d{2}$')][string]$Id)
Add-Type -AssemblyName System.Drawing
$targetRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\assets\avatars'))
$target=[IO.Path]::GetFullPath((Join-Path $targetRoot ($Id+'.jpg')))
if(-not $target.StartsWith($targetRoot+[IO.Path]::DirectorySeparatorChar)){throw 'Invalid target'}
$image=[Drawing.Image]::FromFile($Source)
$bitmap=New-Object Drawing.Bitmap(256,256)
$graphics=[Drawing.Graphics]::FromImage($bitmap)
try {
 $graphics.InterpolationMode=[Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $size=[Math]::Min($image.Width,$image.Height)
 $src=[Drawing.RectangleF]::new([single](($image.Width-$size)/2),[single](($image.Height-$size)/2),[single]$size,[single]$size)
 $dst=[Drawing.RectangleF]::new(0,0,256,256)
 $graphics.DrawImage($image,$dst,$src,[Drawing.GraphicsUnit]::Pixel)
 $codec=[Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
 $parameters=New-Object Drawing.Imaging.EncoderParameters(1)
 $parameters.Param[0]=New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality,[long]84)
 $bitmap.Save($target,$codec,$parameters)
 Get-Item -LiteralPath $target | Select-Object Name,Length
} finally {$graphics.Dispose();$bitmap.Dispose();$image.Dispose()}
