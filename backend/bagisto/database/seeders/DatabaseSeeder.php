<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Webkul\Installer\Database\Seeders\DatabaseSeeder as BagistoDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        if (! DB::table('admins')->exists()) {
            $this->call(BagistoDatabaseSeeder::class);
        }

        $this->call(CommerceForgeSeeder::class);

        if (app()->environment(['local', 'testing'])) {
            $this->call(CommerceForgeTestAccountsSeeder::class);
        }
    }
}
