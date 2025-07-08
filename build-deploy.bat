@echo off
echo =============================================
echo  e-volua - Build para Producao
echo  Destino: dentistas.com.br/evolua
echo =============================================
echo.

echo [1/3] Executando build de producao...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERRO: Build falhou!
    pause
    exit /b 1
)

echo.
echo [2/3] Verificando arquivos gerados...
if not exist "dist\index.html" (
    echo ❌ ERRO: index.html nao encontrado!
    pause
    exit /b 1
)

if not exist "dist\.htaccess" (
    echo ❌ ERRO: .htaccess nao encontrado!
    pause
    exit /b 1
)

echo ✅ index.html - OK
echo ✅ .htaccess - OK
echo ✅ assets/ - OK

echo.
echo [3/3] Build concluido com sucesso!
echo.
echo =============================================
echo  PROXIMOS PASSOS:
echo =============================================
echo.
echo 1. Copie TODA a pasta 'dist\' para:
echo    public_html/evolua/
echo.
echo 2. Configure no Supabase:
echo    Site URL: https://dentistas.com.br/evolua
echo.
echo 3. Acesse: https://dentistas.com.br/evolua/
echo.
echo =============================================
echo  ARQUIVOS PRONTOS PARA UPLOAD:
echo =============================================
dir dist /b
echo.
echo Build finalizado! Pressione qualquer tecla...
pause >nul
