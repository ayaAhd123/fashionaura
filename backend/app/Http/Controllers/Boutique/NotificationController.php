<?php

namespace App\Http\Controllers\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Services\StockAlertService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::where('user_id', Auth::id());

        if ($request->get('unread_only')) {
            $query->unread();
        }

        if ($type = $request->get('type')) {
            $query->where('type', $type);
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json([
            'data' => $paginator->getCollection()->map(fn ($n) => $this->formatNotification($n)),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function unreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('user_id', Auth::id())
            ->findOrFail($id);

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->unread()
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications sont lues']);
    }

    /**
     * Lance la vérification stock pour la boutique connectée (test / démo).
     */
    public function checkStock(Request $request, StockAlertService $stockAlertService)
    {
        $user = Auth::user();
        $boutiqueId = $user->boutique_id;

        if (! $boutiqueId) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        $force = $request->boolean('force');
        $result = $stockAlertService->run($boutiqueId, $force);
        $settings = $stockAlertService->getSettings($user->boutique);

        $threshold = $settings['stock_alert_threshold'];
        $message = $this->buildCheckStockMessage($result, $threshold, $force);

        return response()->json([
            'message' => $message,
            ...$result,
            'threshold' => $threshold,
        ]);
    }

    private function buildCheckStockMessage(array $result, int $threshold, bool $force): string
    {
        $created = $result['created'];
        $skipped = $result['skipped_duplicates'];
        $atRisk = $result['at_risk'];

        if ($created > 0) {
            return "{$created} nouvelle(s) alerte(s) créée(s) (seuil : {$threshold} unités).";
        }

        if ($atRisk === 0) {
            return "Aucun produit en alerte : tous les stocks sont au-dessus de {$threshold} unités.";
        }

        if ($skipped > 0 && ! $force) {
            return "0 nouvelle alerte — {$atRisk} produit(s) déjà signalé(s) (anti-doublon 24 h). Consultez la liste ci-dessous.";
        }

        return "Vérification terminée (seuil : {$threshold} unités).";
    }

    public function stockSettings(StockAlertService $stockAlertService)
    {
        $boutique = Auth::user()->boutique;

        if (! $boutique) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        return response()->json($stockAlertService->getSettings($boutique));
    }

    public function updateStockSettings(Request $request, StockAlertService $stockAlertService)
    {
        $boutique = Auth::user()->boutique;

        if (! $boutique) {
            return response()->json(['message' => 'Aucune boutique associée'], 422);
        }

        $validated = $request->validate([
            'stock_alert_threshold' => 'required|integer|min:1|max:100',
        ]);

        $settings = $stockAlertService->updateSettings(
            $boutique,
            (int) $validated['stock_alert_threshold']
        );

        return response()->json([
            'message' => "Seuil d'alerte enregistré : {$settings['stock_alert_threshold']} unités.",
            ...$settings,
        ]);
    }

    private function formatNotification(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type === 'product' ? 'stock' : $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'read' => (bool) $notification->is_read,
            'time' => $notification->created_at
                ? Carbon::parse($notification->created_at)->locale('fr')->diffForHumans()
                : '',
            'action_url' => $notification->action_url,
            'data' => $notification->data,
        ];
    }
}
