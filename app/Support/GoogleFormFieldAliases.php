<?php

namespace App\Support;

class GoogleFormFieldAliases
{
    /**
     * Canonical field names mapped to accepted aliases.
     *
     * Add future languages or alternate labels here.
     * Matching is exact and case-sensitive by default.
     */
    public const FIELD_ALIASES = [
        'Name' => ['Name', '姓名', 'Nama'],
        'Phone Number' => ['Phone Number', '电话号码', 'Nombor Telefon'],
        'Email' => ['Email', '电子邮件', 'Emel'],
    ];

    public static function requiredFields(): array
    {
        return array_keys(self::FIELD_ALIASES);
    }

    public static function acceptedLabelsFor(string $canonicalField): array
    {
        return self::FIELD_ALIASES[$canonicalField] ?? [];
    }

    public static function isAcceptedLabel(string $canonicalField, string $submittedLabel): bool
    {
        return in_array($submittedLabel, self::acceptedLabelsFor($canonicalField), true);
    }

    public static function validateRequiredLabels(array $submittedLabels): array
    {
        $matched = [];
        $missing = self::requiredFields();

        foreach ($submittedLabels as $label) {
            foreach (self::FIELD_ALIASES as $canonicalField => $aliases) {
                if (in_array($label, $aliases, true)) {
                    $matched[$canonicalField] = $label;
                    $missing = array_values(array_diff($missing, [$canonicalField]));
                }
            }
        }

        return [
            'valid' => empty($missing),
            'matched' => $matched,
            'missing' => $missing,
        ];
    }
}
