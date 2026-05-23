<?php

use App\Models\City;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

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

    $this->call('migrate', ['--force' => true]);

    if (City::count() === 0) {
        $this->call('db:seed', ['--force' => true]);
        $this->info('Demo cities and boutiques seeded.');
    } else {
        $this->comment('Database already contains '.City::count().' cities — data kept.');
    }

    return 0;
})->purpose('Run migrations and seed demo data only if the database is empty');
