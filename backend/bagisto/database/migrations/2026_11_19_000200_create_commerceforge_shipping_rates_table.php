<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const RATES = [
        'cairo' => 50, 'giza' => 50, 'alexandria' => 65, 'dakahlia' => 70,
        'gharbia' => 70, 'sharqia' => 70, 'monufia' => 70, 'qalyubia' => 60,
        'beheira' => 75, 'kafr-el-sheikh' => 75, 'damietta' => 75, 'port-said' => 75,
        'ismailia' => 75, 'suez' => 75, 'faiyum' => 80, 'beni-suef' => 80,
        'minya' => 85, 'asyut' => 85, 'sohag' => 90, 'qena' => 90,
        'luxor' => 95, 'aswan' => 95, 'red-sea' => 100, 'matrouh' => 100,
        'north-sinai' => 110, 'south-sinai' => 110, 'new-valley' => 110,
    ];

    public function up(): void
    {
        Schema::create('cf_shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->string('governorate')->unique();
            $table->decimal('fee', 10, 2);
            $table->timestamps();
        });

        $now = now();
        DB::table('cf_shipping_rates')->insert(
            collect(self::RATES)->map(fn (int $fee, string $governorate) => [
                'governorate' => $governorate,
                'fee' => $fee,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all(),
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('cf_shipping_rates');
    }
};
