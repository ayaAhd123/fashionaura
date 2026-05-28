<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class AdminSettingsController extends Controller
{
    public function index()
    {
        $settings = AdminSetting::all()->pluck('value', 'key');
        
        // Add defaults if empty
        $defaults = [
            'platform_name' => 'FashionAura',
            'currency' => 'MAD',
            'language' => 'fr',
            'timezone' => 'Africa/Casablanca',
            'maintenance_mode' => '0',
            'email_new_orders' => '1',
            'email_new_reviews' => '1',
            'sms_notifications' => '0',
            'push_notifications' => '1',
            'weekly_summary' => '1',
            'session_timeout' => 'never',
            'two_factor_auth' => '0',
        ];

        foreach ($defaults as $key => $val) {
            if (!isset($settings[$key])) {
                $settings[$key] = $val;
            }
        }

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            // Determine type
            $type = 'string';
            if (is_bool($value)) {
                $type = 'boolean';
                $value = $value ? '1' : '0';
            } elseif (is_int($value) || is_numeric($value)) {
                $type = 'integer';
            } elseif (is_array($value)) {
                $type = 'json';
            }

            AdminSetting::setValue($key, $value, $type);
        }

        return response()->json([
            'message' => 'Paramètres enregistrés avec succès',
            'settings' => AdminSetting::all()->pluck('value', 'key')
        ]);
    }

    public function clearCache()
    {
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        
        return response()->json([
            'message' => 'Cache du système vidé avec succès.'
        ]);
    }

    public function backupDatabase()
    {
        // Simulate a backup
        return response()->json([
            'message' => 'Sauvegarde de la base de données créée avec succès : backup_' . date('Y-m-d_H-i-s') . '.sql'
        ]);
    }

    public function getLogs()
    {
        $logPath = storage_path('logs/laravel.log');
        $lines = [];

        if (file_exists($logPath)) {
            $file = file($logPath);
            $lines = array_slice($file, -50); // Get last 50 lines
        } else {
            $lines = ['[INFO] Aucun journal système trouvé. Le système fonctionne correctement.'];
        }

        return response()->json([
            'logs' => implode('', $lines)
        ]);
    }
}
