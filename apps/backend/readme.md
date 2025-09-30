<p align="center">
  <img src="https://laravel.com/assets/img/components/logo-laravel.svg" alt="Laravel Logo">
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/PHP-7.0-blue" alt="PHP 7.0"></a>
  <a href="https://mariadb.org/download/?o=true&p=mariadb&r=10.3.7&os=windows&cpu=x86_64&pkg=zip&mirror=archive&t=mariadb"><img src="https://img.shields.io/badge/MariaDB-10.3.7-blue" alt="MariaDB 10.3.7"></a>
  <a href="#"><img src="https://img.shields.io/badge/Laravel-5.4-red" alt="Laravel 5.4"></a>
</p>

## About This Project

This is the **backend** for our full-stack project using **Laravel 5.4**, **PHP 7.0** and **MariaDB 10.3**. It includes:

- Laravel 5.4 framework with Eloquent ORM
- GitHub Actions workflows for automated versioning and testing
- Ready for zero-downtime deployment (stage/main) and versioned develop workflow
- Pre-configured for MariaDB 10.3, compatible with PHP 7 and Laravel 5.4

---

## Requirements

- PHP 7.0
- Composer
- MariaDB 10.3.7 (download: [MariaDB 10.3.7 ZIP for Windows](https://mariadb.org/download/?o=true&p=mariadb&r=10.3.7&os=windows&cpu=x86_64&pkg=zip&mirror=archive&t=mariadb))
- Git

---

## Setup & Run Locally

1. Clone the repository

    git clone <YOUR_REPO_URL>
    cd apps/backend

2. Install dependencies

    composer install

3. Setup environment

    cp .env.example .env
    php artisan key:generate

Configure `.env` com seu banco local:

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=laravel_test
    DB_USERNAME=laravel
    DB_PASSWORD=secret

4. Run migrations

    php artisan migrate

5. Run the app

    php artisan serve

O app rodará por padrão em http://127.0.0.1:8000

6. Run unit tests

    php artisan test

---

## Composer Alias (Windows Shortcut)

Para facilitar comandos Composer no Windows:

    doskey composer2=php C:\caminho\para\composer.phar $*

Depois, rode todos os comandos via `composer2`.

---

## GitHub Actions Workflows

- apps/backend/.github/workflows/versioning.yml → executa na branch develop, auto-tags, testes unitários e rollback simulado
- .github/workflows/backend-cicd.yml → executa em stage/main, deploy zero-downtime, rollback real em caso de falha, notificações no Teams

---

## Contributing

Siga o GitHub flow: crie branches a partir de develop, abra pull requests e siga Conventional Commits:

- feat(...) → nova feature
- fix(...) → correção de bug
- chore(...) → tarefas gerais

---

## Composer Alias (Windows Shortcut)

Para facilitar comandos Composer no Windows e garantir compatibilidade com PHP 7.0, usamos uma versão específica do Composer localizada em `apps/backend/composer.phar`.

Para criar o alias no terminal do Windows, rode:

    doskey composer2=php apps/backend/composer.phar $*

Depois, todos os comandos Composer podem ser executados via `composer2`.

## Notes

- Branch `develop` é usada apenas para testes dos desenvolvedores, não possui rollback real.
- Use MariaDB 10.3.7 com PHP 7.0 para evitar incompatibilidades com Laravel 5.4.
- Workflows do GitHub Actions automatizam versionamento e deploy zero-downtime.



## License

This project is **private** and proprietary. All rights reserved.
