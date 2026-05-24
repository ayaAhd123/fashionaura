<?php

use App\Models\City;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('fashionaura:check-stock-alerts')->dailyAt('08:00');

Artisan::command('fashionaura:ensure-data', function () {
    $driver = config('database.default');

    if ($driver === 'sqlite') {
        $dbPath = database_path('database.sqlite');
        if (! file_exists($dbPath)) {
            touch($dbPath);
            $this->info('Created database/database.sqlite');
        }
    } else {
        $this->comment('Database driver: '.$driver.' · '.config('database.connections.'.$driver.'.database'));
    }

    $schemaOk = Schema::hasTable('cities')
        && Schema::hasColumn('cities', 'slug')
        && Schema::hasColumn('cities', 'is_active');

    if (Schema::hasTable('cities') && ! $schemaOk) {
        $this->warn('Ancien schéma détecté (table cities sans slug/is_active). Réinitialisation…');
        $this->call('migrate:fresh', ['--force' => true, '--seed' => true]);
        $this->info('Base réinitialisée avec le schéma FashionAura actuel.');

        return 0;
    }

    $this->call('migrate', ['--force' => true]);

    if (City::count() === 0) {
        $this->call('db:seed', ['--force' => true]);
        $this->info('Demo cities and boutiques seeded.');
    } else {
        $this->comment('Database already contains '.City::count().' cities — data kept.');
    }

    return 0;
})->purpose('Run migrations and seed demo data only if the database is empty');
