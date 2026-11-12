@props(['folder', 'label', 'class' => '', 'image' => null])
<div {{ $attributes->class(['image-placeholder', $class]) }} @if(!$image) role="img" aria-label="{{ $label }} placeholder" @endif>
    @if($image)
        <img src="{{ asset('images/'.$folder.'/'.$image) }}" alt="{{ $label }}" class="placeholder-photo">
    @else
        <span class="placeholder-flower" aria-hidden="true">✳</span>
        <span class="placeholder-label">{{ $label }}</span>
        <span class="placeholder-hint">Add your image in <code>public/images/{{ $folder }}/</code>, then set its filename on this component.</span>
    @endif
</div>
