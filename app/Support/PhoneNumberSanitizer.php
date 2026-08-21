<?php

namespace App\Support;

class PhoneNumberSanitizer
{
    public static function sanitize(?string $raw): ?string
    {
        if ($raw === null || trim($raw) === '') {
            return null;
        }

        // Strip everything except digits and a leading +
        $cleaned = preg_replace('/[^\d+]/', '', $raw);

        // Strip Malaysian country code: +60, 60 (only if it's clearly a prefix, not part of a local number)
        if (str_starts_with($cleaned, '+60')) {
            $cleaned = substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '60') && strlen($cleaned) > 10) {
            $cleaned = substr($cleaned, 2);
        }

        // Malaysian mobile numbers conventionally start with 0 after the country code is stripped
        if (! str_starts_with($cleaned, '0')) {
            $cleaned = '0' . $cleaned;
        }

        return $cleaned;
    }
}