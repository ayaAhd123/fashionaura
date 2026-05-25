<?php

namespace App\Support;

class LocaleHelper
{
    public const SUPPORTED = ['fr', 'en', 'es', 'ar'];

    public static function normalize(?string $locale): string
    {
        $code = strtolower(substr((string) $locale, 0, 2));

        return in_array($code, self::SUPPORTED, true) ? $code : 'fr';
    }

    public static function languageName(string $locale): string
    {
        return match (self::normalize($locale)) {
            'en' => 'English',
            'es' => 'Spanish',
            'ar' => 'Arabic',
            default => 'French',
        };
    }

    public static function geminiLanguageRule(string $locale): string
    {
        $name = self::languageName($locale);

        return <<<RULE
### Langue / Language
- Réponds **uniquement** dans la langue du **dernier message** de l'utilisateur (français, anglais, espagnol ou arabe).
- Langue préférée de l'interface : **{$name}** ({$locale}).
- Si l'utilisateur écrit en anglais, réponds en anglais. En arabe → arabe (texte naturel RTL). En espagnol → espagnol. En français → français.
- Ne mélange pas les langues dans une même réponse.
RULE;
    }
}
