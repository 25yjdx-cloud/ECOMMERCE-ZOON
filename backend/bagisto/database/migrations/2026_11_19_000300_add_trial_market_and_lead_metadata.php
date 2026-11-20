<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'whatsapp_phone')) {
            Schema::table('users', fn (Blueprint $table) => $table->string('whatsapp_phone', 16)->nullable());
        }

        if (! Schema::hasColumn('users', 'market')) {
            Schema::table('users', fn (Blueprint $table) => $table->string('market', 2)->default('EG'));
        }

        if (! Schema::hasColumn('cf_stores', 'trial_ends_at')) {
            Schema::table('cf_stores', fn (Blueprint $table) => $table->timestamp('trial_ends_at')->nullable());
        }

        if (! Schema::hasColumn('cf_stores', 'subscription_status')) {
            Schema::table('cf_stores', fn (Blueprint $table) => $table->string('subscription_status', 24)->default('active'));
        }

        if (! Schema::hasColumn('cf_quote_requests', 'market')) {
            Schema::table('cf_quote_requests', function (Blueprint $table) {
                $table->string('phone', 16)->change();
                $table->string('market', 2)->default('EG');
            });
        } elseif (Schema::hasColumn('cf_quote_requests', 'phone')) {
            Schema::table('cf_quote_requests', fn (Blueprint $table) => $table->string('phone', 16)->change());
        }

        if (! Schema::hasTable('ai_unanswered_queries')) {
            Schema::create('ai_unanswered_queries', function (Blueprint $table) {
                $table->id();
                $table->char('question_hash', 64)->unique();
                $table->text('question');
                $table->string('locale', 2);
                $table->unsignedInteger('occurrences')->default(1);
                $table->timestamp('last_asked_at');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_unanswered_queries');
        if (Schema::hasColumn('cf_quote_requests', 'market')) {
            Schema::table('cf_quote_requests', function (Blueprint $table) {
                $table->dropColumn('market');
                $table->string('phone', 11)->change();
            });
        }
        if (Schema::hasColumn('cf_stores', 'trial_ends_at')) {
            Schema::table('cf_stores', fn (Blueprint $table) => $table->dropColumn('trial_ends_at'));
        }
        if (Schema::hasColumn('cf_stores', 'subscription_status')) {
            Schema::table('cf_stores', fn (Blueprint $table) => $table->dropColumn('subscription_status'));
        }
        if (Schema::hasColumn('users', 'whatsapp_phone')) {
            Schema::table('users', fn (Blueprint $table) => $table->dropColumn('whatsapp_phone'));
        }
        if (Schema::hasColumn('users', 'market')) {
            Schema::table('users', fn (Blueprint $table) => $table->dropColumn('market'));
        }
    }
};
