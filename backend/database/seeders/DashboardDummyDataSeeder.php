<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    Boutique, 
    Product, 
    Order, 
    OrderItem, 
    Review, 
    Notification, 
    BoutiqueAnalytics, 
    ProductAnalytics,
    BoutiqueValidationRequest,
    User
};
use Carbon\Carbon;

class DashboardDummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('📊 Seeding dashboard dummy data...');
        
        $boutiques = Boutique::all();
        
        // 1. Create Notifications for each boutique owner
        $this->createNotifications($boutiques);
        
        // 2. Create Analytics data
        $this->createAnalyticsData($boutiques);
        
        // 3. Create Boutique Validation Requests
        $this->createValidationRequests($boutiques);
        
        // 4. Create additional orders for analytics
        $this->createAdditionalOrders($boutiques);
        
        // 5. Create reviews for boutiques
        $this->createReviews($boutiques);
        
        $this->command->info('✅ Dashboard dummy data seeded successfully!');
    }
    
    private function createNotifications($boutiques)
    {
        $notificationTypes = ['order', 'review', 'system', 'product'];
        $titles = [
            'order' => 'New Order Received!',
            'review' => 'New Customer Review',
            'system' => 'System Update',
            'product' => 'Product Performance Alert'
        ];
        
        $messages = [
            'order' => 'You have received a new order worth {amount} MAD.',
            'review' => '{customer} left a {rating}-star review for your boutique.',
            'system' => 'Your boutique dashboard has been updated with new features.',
            'product' => 'Product "{product}" has low stock. Only {stock} items left!'
        ];
        
        foreach ($boutiques as $boutique) {
            // Get the owner
            $owner = User::where('boutique_id', $boutique->id)->first();
            if (!$owner) continue;
            
            // Create 5-10 notifications per boutique
            $numNotifications = rand(5, 10);
            
            for ($i = 0; $i < $numNotifications; $i++) {
                $type = $notificationTypes[array_rand($notificationTypes)];
                $isRead = rand(0, 3) > 0; // 75% read, 25% unread
                
                $message = $messages[$type];
                
                // Customize message based on type
                switch ($type) {
                    case 'order':
                        $amount = rand(500, 5000);
                        $message = str_replace('{amount}', $amount, $message);
                        break;
                    case 'review':
                        $customers = ['Ahmed', 'Fatima', 'Youssef', 'Amina', 'Hassan'];
                        $rating = rand(3, 5);
                        $message = str_replace('{customer}', $customers[array_rand($customers)], $message);
                        $message = str_replace('{rating}', $rating, $message);
                        break;
                    case 'product':
                        $product = $boutique->products->random();
                        $stock = rand(0, 20);
                        $message = str_replace('{product}', $product->name, $message);
                        $message = str_replace('{stock}', $stock, $message);
                        break;
                }
                
                Notification::create([
                    'user_id' => $owner->id,
                    'boutique_id' => $boutique->id,
                    'type' => $type,
                    'title' => $titles[$type],
                    'message' => $message,
                    'is_read' => $isRead,
                    'action_url' => $type === 'order' ? '/orders' : ($type === 'product' ? '/products' : null),
                    'data' => ['boutique_name' => $boutique->name],
                    'read_at' => $isRead ? Carbon::now()->subDays(rand(1, 7)) : null,
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }
        
        $this->command->info('✅ Notifications created!');
    }
    
    private function createAnalyticsData($boutiques)
    {
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();
        
        foreach ($boutiques as $boutique) {
            $date = $startDate->copy();
            
            while ($date <= $endDate) {
                // Generate realistic analytics data with trends
                $dayOfWeek = $date->dayOfWeek;
                $isWeekend = ($dayOfWeek == 0 || $dayOfWeek == 6);
                
                $views = $isWeekend ? rand(200, 500) : rand(100, 300);
                $orders = $isWeekend ? rand(10, 30) : rand(5, 15);
                $revenue = $orders * rand(300, 800);
                $productsSold = $orders * rand(1, 3);
                
                BoutiqueAnalytics::create([
                    'boutique_id' => $boutique->id,
                    'date' => $date,
                    'total_views' => $views,
                    'unique_visitors' => rand($views * 0.3, $views * 0.7),
                    'total_orders' => $orders,
                    'total_revenue' => $revenue,
                    'products_sold' => $productsSold,
                    'average_order_value' => $revenue / max($orders, 1),
                    'conversion_rate' => ($orders / max($views, 1)) * 100,
                    'top_products' => $boutique->products->take(3)->pluck('id')->toArray(),
                ]);
                
                $date->addDay();
            }
            
            // Create product analytics
            foreach ($boutique->products as $product) {
                $date = $startDate->copy();
                while ($date <= $endDate) {
                    $views = rand(50, 200);
                    $purchases = rand(1, 10);
                    
                    ProductAnalytics::create([
                        'product_id' => $product->id,
                        'date' => $date,
                        'views' => $views,
                        'clicks' => rand($views * 0.2, $views * 0.5),
                        'added_to_cart' => rand(5, 20),
                        'purchases' => $purchases,
                        'revenue' => $purchases * $product->price,
                        'conversion_rate' => ($purchases / max($views, 1)) * 100,
                    ]);
                    $date->addDay();
                }
            }
        }
        
        $this->command->info('✅ Analytics data created!');
    }
    
    private function createValidationRequests($boutiques)
    {
        foreach ($boutiques as $index => $boutique) {
            // Create validation request for each boutique
            $statuses = ['pending', 'approved', 'rejected'];
            $status = $index < 3 ? 'approved' : ($index < 4 ? 'pending' : 'approved');
            
            $request = BoutiqueValidationRequest::create([
                'boutique_id' => $boutique->id,
                'user_id' => User::where('boutique_id', $boutique->id)->first()?->id ?? 1,
                'message' => 'Please verify our boutique. We have all required documents.',
                'documents' => ['license.pdf', 'tax_certificate.pdf'],
                'status' => $status,
                'admin_comment' => $status === 'approved' ? 'Welcome to FashionAura!' : ($status === 'rejected' ? 'Please provide additional documents.' : null),
                'reviewed_by' => $status !== 'pending' ? 1 : null,
                'reviewed_at' => $status !== 'pending' ? Carbon::now()->subDays(rand(1, 10)) : null,
            ]);
        }
        
        $this->command->info('✅ Validation requests created!');
    }
    
    private function createAdditionalOrders($boutiques)
    {
        $users = User::where('role', 'customer')->get();
        if ($users->isEmpty()) {
            // Create some customer users if none exist
            for ($i = 0; $i < 10; $i++) {
                User::create([
                    'name' => "Customer $i",
                    'email' => "customer$i@example.com",
                    'password' => bcrypt('password123'),
                    'role' => 'customer',
                    'is_active' => true,
                ]);
            }
            $users = User::where('role', 'customer')->get();
        }
        
        $statuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
        
        foreach ($boutiques as $boutique) {
            // Create 20-50 orders per boutique
            $numOrders = rand(20, 50);
            
            for ($i = 0; $i < $numOrders; $i++) {
                $user = $users->random();
                $status = $statuses[array_rand($statuses)];
                $orderDate = Carbon::now()->subDays(rand(1, 60));
                
                $order = Order::create([
                    'user_id' => $user->id,
                    'total' => 0,
                    'status' => $status,
                    'address' => "{$user->name}'s Address, Casablanca, Morocco",
                    'phone' => $user->phone ?? '+2126' . rand(10000000, 99999999),
                    'created_at' => $orderDate,
                ]);
                
                // Add order items (products from this boutique)
                $numItems = rand(1, 4);
                $orderTotal = 0;
                $products = $boutique->products->random(min($numItems, $boutique->products->count()));
                
                foreach ($products as $product) {
                    $quantity = rand(1, 3);
                    $price = $product->promo_price ?? $product->price;
                    $itemTotal = $quantity * $price;
                    $orderTotal += $itemTotal;
                    
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'size' => $product->sizes ? $product->sizes[array_rand($product->sizes)] : null,
                        'color' => $product->colors ? $product->colors[array_rand($product->colors)] : null,
                    ]);
                }
                
                $order->update(['total' => $orderTotal]);
            }
        }
        
        $this->command->info('✅ Additional orders created!');
    }
    
    private function createReviews($boutiques)
    {
        $users = User::where('role', 'customer')->get();
        
        foreach ($boutiques as $boutique) {
            // Create 10-30 reviews per boutique
            $numReviews = rand(10, 30);
            
            for ($i = 0; $i < $numReviews; $i++) {
                $user = $users->random();
                $rating = rand(3, 5);
                
                $reviews = [
                    'Amazing boutique! Great quality products.',
                    'Very professional and friendly service.',
                    'The clothes are beautiful, will definitely come back!',
                    'Fast delivery and perfect fit.',
                    'Good selection but a bit expensive.',
                    'Loved the experience, highly recommend!',
                    'Excellent customer service.',
                    'The quality exceeded my expectations.',
                    'Will shop here again for sure.',
                    'Great collection of Moroccan fashion!',
                ];
                
                Review::create([
                    'user_id' => $user->id,
                    'boutique_id' => $boutique->id,
                    'rating' => $rating,
                    'comment' => $reviews[array_rand($reviews)],
                    'created_at' => Carbon::now()->subDays(rand(1, 90)),
                ]);
            }
            
            // Update boutique rating
            $avgRating = $boutique->reviews()->avg('rating') ?? 0;
            $reviewCount = $boutique->reviews()->count();
            $boutique->update([
                'rating' => round($avgRating, 1),
                'reviews_count' => $reviewCount,
            ]);
        }
        
        $this->command->info('✅ Reviews created!');
    }
}