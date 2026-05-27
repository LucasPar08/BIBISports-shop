# Cómo subir este proyecto a GitHub desde tu computadora

## 1. Instalar requisitos (solo la primera vez)
- **Git**: https://git-scm.com/downloads
- **Node.js 18+**: https://nodejs.org/

## 2. Clonar el repo vacío en tu computadora
Abrí una terminal (Terminal en Mac, Git Bash o PowerShell en Windows) y ejecutá:

```bash
git clone https://github.com/LucasPar08/BIBISports-shop.git
cd BIBISports-shop
```

## 3. Correr el script de setup
Descargá el archivo `setup.sh` desde esta sesión y colocalo dentro de la carpeta `BIBISports-shop`, luego:

```bash
bash setup.sh
```

Esto va a crear todos los archivos del proyecto.

## 4. Instalar dependencias y hacer el primer push

```bash
npm install
git add .
git commit -m "feat: BIBI Sports paddle shop — Astro + React + Tailwind"
git push origin main
```

¡Listo! Tu tienda ya está en GitHub.

## 5. Correr en modo desarrollo

```bash
npm run dev
```

Abrí http://localhost:4321 en el navegador.

## Contraseña del panel admin
La contraseña para el Panel Administrador es: **bibi2024**
