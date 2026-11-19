@props(['number', 'date', 'title', 'description', 'contributions', 'tools', 'tone' => 'rose', 'image' => null])
<article class="project-card project-card--{{ $tone }}">
    <div class="project-visual"><span class="visual-index">PROJECT {{ $number }}</span>@if($image)<img class="project-photo" src="{{ asset('images/projects/'.$image) }}" alt="[Description of project image]">@else{{ $visual ?? '' }}@endif</div>
    <div class="project-copy">
        <p class="eyebrow">{{ $date }}</p>
        <h3>{{ $title }}</h3>
        <p>{{ $description }}</p>
        <dl class="project-meta">
            <div><dt>My contribution</dt><dd>{{ $contributions }}</dd></div>
            <div><dt>Tools</dt><dd>{{ $tools }}</dd></div>
        </dl>
    </div>
</article>
