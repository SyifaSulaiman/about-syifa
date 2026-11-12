@props(['label' => 'Entry', 'title'])
<article class="timeline-entry">
    <div class="timeline-marker" aria-hidden="true"></div>
    <div class="timeline-content">
        <p class="eyebrow">{{ $label }} · [Dates]</p>
        <h3>{{ $title }}</h3>
        <p>{{ $slot }}</p>
    </div>
</article>
