@props(['title', 'note'])
<article class="skill-group">
    <span class="skill-spark" aria-hidden="true">✳</span>
    <p class="eyebrow">{{ $note }}</p><h3>{{ $title }}</h3>
    <ul>{{ $slot }}</ul>
</article>
