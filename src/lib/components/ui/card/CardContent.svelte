<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	type Props = HTMLAttributes<HTMLDivElement> & { class?: string };

	let { class: className, ...rest }: Props = $props();
</script>

<div class={cn("p-6 pt-0", className)} {...rest}>
	<slot />
</div>
