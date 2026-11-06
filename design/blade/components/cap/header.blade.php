@props([
    'title',
    'systemName' => '',
    'breadcrumbs' => [],
    'user',
    'notifications' => [],
    'notificationsHref' => '',
    'markReadAction' => '',
    'backHref' => '',
    'searchHref' => '#',
    'topbarSearch' => true,
])

@php
    $unreadCount = count(array_filter($notifications, fn ($notification) => ! empty($notification['unread'])));
    $topbarShowsTitle = $backHref !== '' || $systemName === '';
    $bellLabel = $unreadCount ? "Notificaciones, {$unreadCount} sin leer" : 'Notificaciones';
@endphp

<header class="cap-shell-header cap-glass">
    <div>
        @if ($breadcrumbs)
            <nav class="cap-shell-header__crumbs" aria-label="Migas de pan">
                @foreach ($breadcrumbs as $crumb)
                    @if (! $loop->first)<span aria-hidden="true"> › </span>@endif
                    @if (! empty($crumb['href']))<a href="{{ $crumb['href'] }}">{{ $crumb['label'] }}</a>@else{{ $crumb['label'] }}@endif
                @endforeach
            </nav>
        @endif
        <h1 class="cap-shell-header__title">{{ $title }}</h1>
    </div>
    @isset($search)
        <label class="cap-shell-header__search">
            <i class="mdi mdi-magnify" aria-hidden="true"></i>
            {{ $search }}
        </label>
    @endisset
    <div class="cap-shell-header__actions">
        @isset($headerActions){{ $headerActions }}@endisset
        <button class="cap-shell-header__icon-button" type="button" aria-label="{{ $bellLabel }}" aria-expanded="false" aria-controls="cap-notifications" data-cap-popover-trigger>
            <i class="mdi mdi-bell-outline" aria-hidden="true"></i>
            @if ($unreadCount)<span class="cap-shell-header__badge-dot" aria-hidden="true"></span>@endif
        </button>
        <x-cap.avatar :user="$user" />
    </div>
</header>

<header class="cap-shell-topbar cap-glass">
    @if ($backHref !== '')
        <a class="cap-shell-topbar__icon-button" href="{{ $backHref }}" aria-label="Volver"><i class="mdi mdi-arrow-left" aria-hidden="true"></i></a>
    @else
        <span class="cap-shell-logo" aria-hidden="true">C</span>
    @endif
    @if ($topbarShowsTitle)
        <h1 class="cap-shell-topbar__title">{{ $title }}</h1>
    @else
        <span class="cap-shell-topbar__title">{{ $systemName }}</span>
        <h1 class="cap-shell-topbar__hidden-title">{{ $title }}</h1>
    @endif
    @if ($topbarSearch)
        <a class="cap-shell-topbar__icon-button" href="{{ $searchHref }}" aria-label="Buscar"><i class="mdi mdi-magnify" aria-hidden="true"></i></a>
    @endif
    @isset($topbarActions){{ $topbarActions }}@endisset
    <button class="cap-shell-topbar__icon-button" type="button" aria-label="{{ $bellLabel }}" aria-expanded="false" aria-controls="cap-notifications" data-cap-popover-trigger>
        <i class="mdi mdi-bell-outline" aria-hidden="true"></i>
        @if ($unreadCount)<span class="cap-shell-header__badge-dot" aria-hidden="true"></span>@endif
    </button>
</header>

<x-cap.notifications :notifications="$notifications" :view-all-href="$notificationsHref" :mark-read-action="$markReadAction" />
