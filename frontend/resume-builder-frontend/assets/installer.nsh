; Picked up automatically by electron-builder (buildResources/installer.nsh).

; On a real uninstall, drop Chromium's disposable data and ask about the user's own data.
; Skipped on reinstall/update: the new installer runs the old uninstaller with --updated.
; Silent uninstall (/S) keeps the user data.
!macro customUnInstall
  ${ifNot} ${isUpdated}
    ; Electron keeps app data per user, even for per-machine installs
    SetShellVarContext current

    ; Chromium cache, local storage and network state (app.setPath('sessionData')):
    ; disposable, so it goes away with the app, no question asked
    RMDir /r "$APPDATA\${APP_FILENAME}\chromium"

    MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
      "Also delete your resumes, settings and logs?$\r$\n$\r$\nChoose No to keep them for a future reinstall." \
      /SD IDNO IDNO skipDeleteAppData
      RMDir /r "$APPDATA\${APP_FILENAME}"
      !ifdef APP_PRODUCT_FILENAME
        RMDir /r "$APPDATA\${APP_PRODUCT_FILENAME}"
      !endif
      !ifdef APP_PACKAGE_NAME
        RMDir /r "$APPDATA\${APP_PACKAGE_NAME}"
      !endif
    skipDeleteAppData:

    ; drop the userData folder if the cache was all it held (RMDir only deletes empty dirs)
    RMDir "$APPDATA\${APP_FILENAME}"

    ${if} $installMode == "all"
      SetShellVarContext all
    ${endif}
  ${endIf}
!macroend
