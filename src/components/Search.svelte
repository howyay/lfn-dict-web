<script lang="ts">
	import { onMount } from "svelte";
	import Card from "$lib/components/ui/card/Card.svelte";
	import CardHeader from "$lib/components/ui/card/CardHeader.svelte";
	import CardTitle from "$lib/components/ui/card/CardTitle.svelte";
	import CardDescription from "$lib/components/ui/card/CardDescription.svelte";
	import CardContent from "$lib/components/ui/card/CardContent.svelte";
	import Badge from "$lib/components/ui/badge/Badge.svelte";
	import {
		Search as SearchIcon,
		Loader2,
		CornerDownLeft,
		Languages
	} from "lucide-svelte";

	type Sense = { pos: string; def: string; pron: string; ex: string; t?: [string, string] };
	type Dict = Record<string, Sense[]>;
	type Trans = [string, string, string][];
	type Result = { w: string; src: "lfn" | "contains" | "en" | "zh" };

	let dict: Dict = {};
	let trans: Trans = [];
	let nslfn: Record<string, string> = {};
	let query = $state("");
	let results = $state<Result[]>([]);
	let selected = $state<string | null>(null);
	let loading = $state(true);
	let transLoaded = $state(false);

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

	const SRC_LABEL: Record<string, string> = {
		lfn: "LFN",
		contains: "LFN~",
		en: "EN",
		zh: "中"
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
			const [d, t, n] = await Promise.all([
				fetch(base + "data/lfndict.json").then((r) => r.json()),
				fetch(base + "data/trans.json").then((r) => r.json()),
				fetch(base + "data/nslfn.json").then((r) => r.json())
			]);
			dict = d;
			trans = t;
			nslfn = n;
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
		const starts: Result[] = keys
			.filter((k) => norm(k).startsWith(q))
			.slice(0, 10)
			.map((w) => ({ w, src: "lfn" as const }));
		const contains: Result[] = keys
			.filter((k) => !starts.some((s) => s.w === k) && norm(k).includes(q))
			.slice(0, 5)
			.map((w) => ({ w, src: "contains" as const }));
		const viaTrans: Result[] = [];
		if (transLoaded) {
			const seen = new Set([...starts, ...contains].map((r) => r.w));
			for (const [w, e, z] of trans) {
				if (seen.has(w)) continue;
				if (e && norm(e).includes(q)) {
					seen.add(w);
					viaTrans.push({ w, src: "en" as const });
				} else if (z && norm(z).includes(q)) {
					seen.add(w);
					viaTrans.push({ w, src: "zh" as const });
				}
				if (viaTrans.length >= 15) break;
			}
		}
		const all = [...starts, ...contains, ...viaTrans].slice(0, 30);
		results = all;
		noResults = all.length === 0;
	}

	function select(w: string) {
		selected = w;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && results.length > 0) {
			selected = results[0].w;
		}
	}
</script>

<div class="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10">
	<header class="mb-8 text-center">
		<h1 class="text-3xl font-bold tracking-tight">
			Disionario <span class="text-muted-foreground">de Elefen</span>
		</h1>
		<p class="mt-2 text-sm text-muted-foreground">
			LFN → LFN · EN · 中文 · <span class="nushu">𛅰</span> NSLFN — 29,309 词条
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
				输入 LFN、英文或中文搜索（忽略重音）· 结果带 [LFN]/[EN]/[中] 标识
			</p>
		</div>
	{:else if noResults}
		<p class="py-16 text-center text-sm text-muted-foreground">
			No resulta per "{query}" — 无结果
		</p>
	{:else}
		<div class="flex flex-col gap-4 lg:flex-row">
			<div class="h-72 w-full overflow-y-auto rounded-md border lg:h-[520px] lg:w-80 lg:shrink-0">
				<ul class="p-1">
					{#each results as it (it.w)}
						<li>
							<button
								type="button"
								onclick={() => select(it.w)}
								class="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent {selected === it.w ? 'bg-accent' : ''}"
							>
								<span class="flex min-w-0 flex-col">
									<span class="truncate font-medium">
										{it.w}
										<span class="ml-1 text-[10px] text-muted-foreground">[{SRC_LABEL[it.src]}]</span>
									</span>
									<span class="truncate text-xs text-muted-foreground">
										{#if it.src === "lfn" && dict[it.w]?.[0]?.pos}
											{POS_LABEL[dict[it.w][0].pos] ?? dict[it.w][0].pos}
										{:else if dict[it.w]?.[0]?.t?.[0]}
											{dict[it.w][0].t[0]}
										{/if}
									</span>
								</span>
								{#if nslfn[it.w]}
									<span class="nushu shrink-0 text-lg leading-none">{nslfn[it.w]}</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</div>

			<div class="flex-1">
				{#if selected && dict[selected]}
					<Card>
						<CardHeader>
							<div class="flex flex-wrap items-center gap-3">
								{#if nslfn[selected]}
									<span class="nushu text-3xl leading-none">{nslfn[selected]}</span>
								{/if}
								<CardTitle class="text-2xl">{selected}</CardTitle>
								{#each dict[selected] as s, i (i)}
									{#if s.pos}
										<Badge variant="outline">{POS_LABEL[s.pos] ?? s.pos}</Badge>
									{/if}
								{/each}
							</div>
							{#if dict[selected][0]?.pron}
								<CardDescription>Pronunsia: {dict[selected][0].pron}</CardDescription>
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
												<span class="font-semibold text-muted-foreground">中文:</span> {s.t[1]}
											</p>
										{/if}
									{/each}
								</div>
							{:else}
								<p class="text-xs text-muted-foreground">
									（该词暂无官方 EN/中文翻译）
								</p>
							{/if}
							{#each dict[selected] as s, i (i)}
								<div class="space-y-1.5">
									{#if s.pos}
										<p class="text-xs font-medium text-muted-foreground uppercase">
											{POS_LABEL[s.pos] ?? s.pos}
											{#if s.pron}· /{s.pron}/{/if}
										</p>
									{/if}
									{#if s.def}
										<p class="text-sm leading-relaxed">{s.def}</p>
									{/if}
									{#if s.ex}
										<p class="text-sm italic text-muted-foreground">{s.ex}</p>
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
		数据来自 elefen.org 官方词典 · NSLFN 女书映射 · Astro + Svelte
	</footer>
</div>
