<?php
class JWT
{
    private function base64UrlEncode($data)
    {
        return strtr(base64_encode($data), '+/=', '-_,');
    }

    private function base64UrlDecode($data)
    {
        return base64_decode(strtr($data, '-_,', '+/='));
    }

    public function create($payload)
    {
        $header = json_encode([
            "typ" => "JWT",
            "alg" => "HS256"
        ]);

        $signature = $this->generateJWTSignature($this->base64UrlEncode($header), $this->base64UrlEncode($payload));

        return $this->base64UrlEncode($header) . "." . $this->base64UrlEncode($payload) . "." . $this->base64UrlEncode($signature);
    }

    public function generateJWTSignature($header, $payload)
    {
        return hash_hmac('sha256', $header . "." . $payload, getenv('JWT_SECRET'), true);
    }

    private function verify($token = null)
    {
        if ($token === null || count(explode(".", $token)) !== 3) {
            return false;
        }

        [$header, $payload, $signature] = array_map([$this, 'base64UrlDecode'], explode(".", $token));

        $payloadObj = json_decode($payload);
        if (!$payloadObj || !isset($payloadObj->exp)) {
            return false;
        }

        $recalcSignature = $this->generateJWTSignature($this->base64UrlEncode($header), $this->base64UrlEncode($payload));

        // Timing-safe comparison; reject expired tokens
        return hash_equals($recalcSignature, $signature) && (int)$payloadObj->exp >= time();
    }

    public function getUserId($token = null)
    {
        if ($this->verify($token) === false) {
            return 0;
        }

        $payload = array_map([$this, 'base64UrlDecode'], explode(".", $token))[1];
        $payloadObj = json_decode($payload);

        return $payloadObj->userId ?? 0;
    }
}
