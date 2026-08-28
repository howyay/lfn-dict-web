<script lang="ts">
	import { onMount } from "svelte";
	import Card from "$lib/components/ui/card/Card.svelte";
	import CardHeader from "$lib/components/ui/card/CardHeader.svelte";
	import CardTitle from "$lib/components/ui/card/CardTitle.svelte";
	import CardDescription from "$lib/components/ui/card/CardDescription.svelte";
	import CardContent from "$lib/components/ui/card/CardContent.svelte";
	import Badge from "$lib/components/ui/badge/Badge.svelte";
	import ScrollArea from "$lib/components/ui/scroll-area/ScrollArea.svelte";
	import {
		Search as SearchIcon,
		Loader2,
		CornerDownLeft,
		Languages
	} from "lucide-svelte";

	type Sense = { p: string; d: string; e: string; n: string; t?: [string, string] };
	type Dict = Record<string, Sense[]>;
	type Trans = [string, string, string][];

	let dict: Dict = {};
	let trans: Trans = [];
	let query = $state("");
	let results = $state<string[]>([]);
	let selected = $state<string | null>(null);
	let loading = $state(true);
	let transLoaded = $state(false);

	// 注意：if/else 链不能直接读 query（Svelte 5 bug：bind:value 绑定会被条件分支读取破坏），
	// 所以用 $derived 派生判断。
	let emptyQuery = $state(true);
	let noResults = $state(false);

	const POS_LABEL: Record<string, string> = {
		n: "nombre",
		v: "verbo",
		a: "adjetivo",
		ad: "adverbio",
		c: "conjuncion",
		d: "determinante",
		e: "relata",
		i: "interjeccion",
		num: "numeral",
		p: "preposicion",
		pr: "pronombre",
		x: "autre"
	};

	const norm = (s: string) =>
		s
			.toLowerCase()
			.replace(/[áàâä]/g, "a")
			.replace(/[éèêë]/g, "e")
			.replace(/[íìîï]/g, "i")
			.replace(/[óòôö]/g, "o")
			.replace(/[úùûü]/g, "u");

	onMount(async () => {
		try {
			const base = import.meta.env.BASE_URL.endsWith("/")
				? import.meta.env.BASE_URL
				: import.meta.env.BASE_URL + "/";
			const [d, t] = await Promise.all([
				fetch(base + "data/lfndict.json").then((r) => r.json()),
				fetch(base + "data/trans.json").then((r) => r.json())
			]);
			dict = d;
			trans = t;
		} finally {
			loading = false;
			transLoaded = true;
		}
	});

	function onInput(e: Event) {
		query = (e.target as HTMLInputElement).value;
		const q = norm(query.trim());
		emptyQuery = q === "";
		if (q === "" || Object.keys(dict).length === 0) {
			results = [];
			noResults = false;
			return;
		}
		const keys = Object.keys(dict);
		const starts = keys.filter((k) => norm(k).startsWith(q)).slice(0, 20);
		const contains = keys
			.filter((k) => !starts.includes(k) && norm(k).includes(q))
			.slice(0, 10);
		let viaTrans: string[] = [];
		if (transLoaded && starts.length < 20) {
			const seen = new Set([...starts, ...contains]);
			for (const [w, e, z] of trans) {
				if (seen.has(w)) continue;
				if ((e && norm(e).includes(q)) || (z && norm(z).includes(q))) {
					seen.add(w);
					viaTrans.push(w);
					if (viaTrans.length >= 15) break;
				}
			}
		}
		results = [...starts, ...contains, ...viaTrans].slice(0, 30);
		noResults = results.length === 0;
	}

	function select(w: string) {
		selected = w;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && results.length > 0) {
			selected = results[0];
		}
	}
</script>

<div class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10">
	<header class="mb-8 text-center">
		<h1 class="text-3xl font-bold tracking-tight">
			Disionario <span class="text-muted-foreground">de Elefen</span>
		</h1>
		<p class="mt-2 text-sm text-muted-foreground">
			LFN → LFN · EN · 中文 — 29,309 词条
		</p>
	</header>

	<div class="relative mb-6">
		<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
		<input
			value={query}
			oninput={onInput}
			placeholder="Xerca / 搜索 LFN、英文或中文 — 如 gato、cat、猫"
			class="h-11 w-full rounded-md border border-input bg-transparent pl-9 pr-10 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			onkeydown={onKeydown}
			autofocus
		/>
		{#if loading}
			<Loader2 class="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
		{/if}
	</div>

	{#if loading}
		<p class="py-16 text-center text-sm text-muted-foreground">
			Cargante la disionario…（正在加载词典）
		</p>
	{:else if emptyQuery}
		<div class="py-16 text-center">
			<p class="text-sm text-muted-foreground">Tipe un parola per xerca.</p>
			<p class="mt-1 text-xs text-muted-foreground/70">
				输入 LFN、英文或中文搜索（忽略重音）
			</p>
		</div>
	{:else if noResults}
		<p class="py-16 text-center text-sm text-muted-foreground">
			No resulta per "{$query}" — 无结果
		</p>
	{:else}
		<div class="flex flex-col gap-4 lg:flex-row">
			<ScrollArea class="h-72 w-full rounded-md border lg:h-[520px] lg:w-80 lg:shrink-0">
				<ul class="p-1">
					{#each results as w (w)}
						<li>
							<button
								type="button"
								onclick={() => select(w)}
								class="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent {selected === w ? 'bg-accent' : ''}"
							>
								<span class="shrink-0 font-medium">{w}</span>
								<span class="truncate text-xs text-muted-foreground">
									{#if dict[w]?.[0]?.t?.[0]}
										{dict[w][0].t[0]}
									{:else if dict[w]?.[0]?.p}
										{POS_LABEL[dict[w][0].p] ?? dict[w][0].p}
									{/if}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</ScrollArea>

			<div class="flex-1">
				{#if selected && dict[selected]}
					<Card>
						<CardHeader>
							<div class="flex flex-wrap items-center gap-2">
								<CardTitle class="text-2xl">{selected}</CardTitle>
								{#each dict[selected] as s, i (i)}
									{#if s.p}
										<Badge variant="outline">{POS_LABEL[s.p] ?? s.p}</Badge>
									{/if}
								{/each}
							</div>
							{#if dict[selected][0]?.n}
								<CardDescription>Pronunsia: {dict[selected][0].n}</CardDescription>
							{/if}
						</CardHeader>
						<CardContent class="space-y-4">
							{#if dict[selected][0]?.t}
								<div class="rounded-lg border bg-muted/40 p-3">
									<div class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
										<Languages class="size-3.5" />
										翻译 / Translations
									</div>
									{#each dict[selected] as s, i (i)}
										{#if s.t?.[0]}
											<p class="text-sm">
												<span class="font-semibold text-muted-foreground">EN:</span> {s.t[0]}
											</p>
										{/if}
										{#if s.t?.[1] && s.t[1] !== s.t[0]}
											<p class="text-sm">
												<span class="font-semibold text-muted-foreground">中:</span> {s.t[1]}
											</p>
										{/if}
									{/each}
								</div>
							{/if}
							{#each dict[selected] as s, i (i)}
								<div class="space-y-1.5">
									{#if s.p}
										<p class="text-xs font-medium text-muted-foreground uppercase">
											{POS_LABEL[s.p] ?? s.p}
											{#if s.n}· /{s.n}/{/if}
										</p>
									{/if}
									{#if s.d}
										<p class="text-sm leading-relaxed">{s.d}</p>
									{/if}
									{#if s.e}
										<p class="text-sm italic text-muted-foreground">{s.e}</p>
									{/if}
								</div>
							{/each}
						</CardContent>
					</Card>
				{:else if results.length > 0}
					<Card>
						<CardContent class="flex items-center gap-2 py-8 text-sm text-muted-foreground">
							<CornerDownLeft class="size-4" />
							Seta un parola de la lista per vide sua defini — 点选左侧词条查看释义
						</CardContent>
					</Card>
				{/if}
			</div>
		</div>
	{/if}

	<footer class="mt-auto pt-8 text-center text-xs text-muted-foreground">
		数据来自 elefen.org 官方词典（LFN 释义 + EN/中文翻译）· NSLFN 项目 · Astro + Svelte + shadcn-svelte
	</footer>
</div>
