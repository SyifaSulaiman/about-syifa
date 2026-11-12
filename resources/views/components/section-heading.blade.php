@props(['eyebrow', 'title', 'number' => null, 'id'])
<div class="section-heading">
    <div>
        <p class="eyebrow">{{ $eyebrow }}</p>
        <h2 id="{{ $id }}">{{ $title }}</h2>
    </div>
    @if($number)<span class="section-number" aria-hidden="true">{{ $number }}</span>@endif
</div>
