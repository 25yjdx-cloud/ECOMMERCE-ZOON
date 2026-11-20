<?php

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\ShippingProviderException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CommerceForge\CreateShipmentRequest;
use App\Http\Requests\CommerceForge\UpdateShippingIntegrationRequest;
use App\Services\ShippingIntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShippingController extends Controller
{
    public function __construct(private readonly ShippingIntegrationService $shipping) {}

    public function integrations(string $slug): JsonResponse
    {
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);

        return response()->json(['data' => $this->shipping->settings($slug)]);
    }

    public function updateIntegration(UpdateShippingIntegrationRequest $request, string $slug): JsonResponse
    {
        abort_unless(DB::table('cf_stores')->where('slug', $slug)->exists(), 404);

        return response()->json(['data' => $this->shipping->update($slug, $request->validated())]);
    }

    public function createShipment(CreateShipmentRequest $request, string $slug, int $order): JsonResponse
    {
        try {
            $shipment = $this->shipping->createShipment($slug, $order, $request->validated());
        } catch (ShippingProviderException $exception) {
            return response()->json(['message' => $exception->getMessage()], 502);
        }

        return response()->json(['data' => $shipment], 201);
    }

    public function webhook(Request $request, string $provider): JsonResponse
    {
        return response()->json($this->shipping->processWebhook($provider, $request));
    }
}
