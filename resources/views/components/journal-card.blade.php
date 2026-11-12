@props(['class' => ''])
<article {{ $attributes->class(['journal-card', $class]) }}>{{ $slot }}</article>
