!macro customInstall
  DetailPrint "Checking if mongTang-md is running..."
  ; Taskkill을 사용하여 프로세스 강제 종료 (오류 무시)
  ExecWait 'taskkill /F /IM edit-md.exe /T'
  Sleep 1000
!macroend
