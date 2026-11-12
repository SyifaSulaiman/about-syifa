<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f8f1e8">
    <meta name="description" content="A personal portfolio and creative journal.">
    <title>Personal Journal & Portfolio</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <a class="skip-link" href="#main-content">Skip to content</a>
    @include('partials.navigation')
    <main id="main-content">
        @include('sections.home')
        @include('sections.about')
        @include('sections.education')
        @include('sections.projects')
        @include('sections.experience')
        @include('sections.skills')
        @include('sections.achievements')
        @include('sections.gallery')
        @include('sections.contact')
    </main>
    @include('partials.footer')
</body>
</html>
