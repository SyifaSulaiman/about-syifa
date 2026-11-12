@props(['number', 'tone' => 'rose', 'image' => null])
<article class="project-card project-card--{{ $tone }}">
    <div class="project-visual"><span class="visual-index">PROJECT {{ $number }}</span>@if($image)<img class="project-photo" src="{{ asset('images/projects/'.$image) }}" alt="[Description of project image]">@else{{ $visual ?? '' }}@endif</div>
    <div class="project-copy">
        <p class="eyebrow">Selected work · details to come</p>
        <h3>[Project title]</h3>
        <p>[A short description of the project, its purpose, and what you made.]</p>
        <dl class="project-meta"><div><dt>My part</dt><dd>[Responsibilities]</dd></div><div><dt>Made with</dt><dd>[Technologies]</dd></div></dl>
    </div>
</article>
