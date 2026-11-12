@props(['index' => '—', 'tone' => 'cream', 'image' => null, 'caption' => '[Add a caption for this image]'])
<figure class="gallery-item gallery-item--{{ $tone }}">
    <div class="gallery-image">@if($image)<img class="gallery-photo" src="{{ asset('images/gallery/'.$image) }}" alt="{{ $caption }}">@else<span>IMAGE {{ $index }} · PLACEHOLDER</span>@endif</div>
    <figcaption>{{ $caption }}</figcaption>
</figure>
