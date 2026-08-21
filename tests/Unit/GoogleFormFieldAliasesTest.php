<?php

namespace Tests\Unit;

use App\Support\GoogleFormFieldAliases;
use PHPUnit\Framework\TestCase;

class GoogleFormFieldAliasesTest extends TestCase
{
    public function test_exact_required_labels_are_accepted(): void
    {
        $labels = ['Name', 'Phone Number', 'Email'];

        $result = GoogleFormFieldAliases::validateRequiredLabels($labels);

        $this->assertTrue($result['valid']);
        $this->assertSame(['Name', 'Phone Number', 'Email'], array_keys($result['matched']));
        $this->assertSame([], $result['missing']);
    }

    public function test_alternative_labels_are_rejected_when_not_in_alias_map(): void
    {
        $labels = ['Full Name', 'Phone Number (+60xxxxxxxxx)', 'Student Email'];

        $result = GoogleFormFieldAliases::validateRequiredLabels($labels);

        $this->assertFalse($result['valid']);
        $this->assertSame(['Name', 'Phone Number', 'Email'], $result['missing']);
    }

    public function test_case_sensitive_matching_is_enforced(): void
    {
        $labels = ['name', 'phone number', 'email'];

        $result = GoogleFormFieldAliases::validateRequiredLabels($labels);

        $this->assertFalse($result['valid']);
        $this->assertSame(['Name', 'Phone Number', 'Email'], $result['missing']);
    }
}
